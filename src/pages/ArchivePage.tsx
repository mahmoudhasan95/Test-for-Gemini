import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { supabase, AudioEntry } from '../lib/supabase';
import { AudioCard } from '../components/AudioCard';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';
import { normalizeArabicAlef } from '../utils/arabicNormalization';

const ITEMS_PER_PAGE = 6;
const SEARCH_DEBOUNCE_MS = 500;

export function ArchivePage() {
  const { lang, isRTL } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [entries, setEntries] = useState<AudioEntry[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const tagFilter = searchParams.get('tag') || '';
  const locationFilter = searchParams.get('location') || '';
  const sortBy = searchParams.get('sort') || 'newest';

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    loadEntries();
  }, [debouncedSearch, categoryFilter, tagFilter, locationFilter, sortBy, currentPage, lang]);

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('audio_entries2')
        .select('category')
        .not('category', 'is', null)
        .not('category', 'eq', '');

      if (error) throw error;

      const uniqueCategories = Array.from(
        new Set(data?.map((item) => item.category) || [])
      ).sort();

      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async function loadEntries() {
    setLoading(true);
    try {
      let baseQuery = supabase.from('audio_entries2').select(`
        id, title, title_ar, description, description_ar,
        audio_url, licence, category, category_ar,
        location, location_ar, tags, tags_ar,
        date, date_precision, year, featured
      `, { count: 'exact' });

      if (categoryFilter) {
        baseQuery = baseQuery.eq('category', categoryFilter);
      }

      if (debouncedSearch) {
        const searchPattern = `%${debouncedSearch}%`;
        const searchConditions = [];

        if (lang === 'ar') {
          searchConditions.push(`title_ar.ilike.${searchPattern}`);
          searchConditions.push(`description_ar.ilike.${searchPattern}`);
          searchConditions.push(`category_ar.ilike.${searchPattern}`);
          searchConditions.push(`location_ar.ilike.${searchPattern}`);
        } else {
          searchConditions.push(`title.ilike.${searchPattern}`);
          searchConditions.push(`description.ilike.${searchPattern}`);
          searchConditions.push(`category.ilike.${searchPattern}`);
          searchConditions.push(`location.ilike.${searchPattern}`);
        }

        baseQuery = baseQuery.or(searchConditions.join(','));
      }

      if (tagFilter) {
        const tagWords = tagFilter
          .split(/[،,\s]+/)
          .map(w => w.trim())
          .filter(w => w.length >= 2);

        if (tagWords.length > 0) {
          const tagField = lang === 'ar' ? 'tags_ar' : 'tags';
          const tagConditions = tagWords.map(word =>
            `${tagField}.cs.{"${word}"}`
          );
          baseQuery = baseQuery.or(tagConditions.join(','));
        }
      }

      if (locationFilter) {
        const locationWords = locationFilter
          .split(/[,\s]+/)
          .map(w => w.trim())
          .filter(w => w.length >= 3);

        if (locationWords.length > 0) {
          const locationField = lang === 'ar' ? 'location_ar' : 'location';
          const locationConditions = locationWords.map(word =>
            `${locationField}.ilike.%${word}%`
          );
          baseQuery = baseQuery.or(locationConditions.join(','));
        }
      }

      if (sortBy === 'featured') {
        baseQuery = baseQuery.order('featured', { ascending: false });
        baseQuery = baseQuery.order('created_at', { ascending: false });
      } else {
        const orderColumn = sortBy === 'oldest' ? 'date' : 'created_at';
        const ascending = sortBy === 'oldest';
        baseQuery = baseQuery.order(orderColumn, { ascending, nullsFirst: false });
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      baseQuery = baseQuery.range(from, to);

      const { data, error, count } = await baseQuery;

      if (error) throw error;

      setEntries(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  }

  function updateFilter(key: string, value: string) {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'lang-ar' : 'lang-en'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="relative mb-4">
            <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              type="text"
              placeholder={t('searchArchive', lang)}
              value={searchQuery}
              onChange={(e) => updateFilter('search', e.target.value)}
              className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none`}
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="text-gray-400 w-5 h-5" />

            <select
              value={categoryFilter}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm"
            >
              <option value="">{t('allCategories', lang)}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none text-sm"
            >
              <option value="newest">{t('newest', lang)}</option>
              <option value="oldest">{t('oldest', lang)}</option>
              <option value="featured">{t('featuredFirst', lang)}</option>
            </select>

            {tagFilter && (
              <div className="flex items-center gap-2 px-3 py-2 bg-cyan-50 text-primary-accent text-sm rounded-lg">
                <span>{lang === 'ar' ? 'وسم:' : 'Tag:'} {tagFilter}</span>
                <button
                  onClick={() => updateFilter('tag', '')}
                  className="hover:text-accent-deep font-bold"
                >
                  ×
                </button>
              </div>
            )}

            {locationFilter && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg">
                <span>{lang === 'ar' ? 'الموقع:' : 'Location:'} {locationFilter}</span>
                <button
                  onClick={() => updateFilter('location', '')}
                  className="hover:text-green-900 font-bold"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">{t('loading', lang)}</div>
        ) : entries.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {entries.map((entry) => (
                <AudioCard key={entry.id} entry={entry} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  {t('previous', lang)}
                </button>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  {t('next', lang)}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 py-12">
            {t('noEntriesFound', lang)}
          </div>
        )}
      </div>
    </div>
  );
}
