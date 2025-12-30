import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase, AudioEntry } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { t, formatDate } from '../utils/translations';
import { WaveformPlayer } from '../components/WaveformPlayer';

export function AudioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang, isRTL } = useLanguage();
  const [entry, setEntry] = useState<AudioEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEntry(id);
    }
  }, [id]);

  async function loadEntry(entryId: string) {
    try {
      const { data, error } = await supabase
        .from('audio_entries2')
        .select('*')
        .eq('id', entryId)
        .maybeSingle();

      if (error) throw error;
      setEntry(data);
    } catch (error) {
      console.error('Error loading entry:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${isRTL ? 'lang-ar' : 'lang-en'}`}>
        <div className="text-gray-500">{t('loading', lang)}</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className={`min-h-screen bg-gray-50 ${isRTL ? 'lang-ar' : 'lang-en'}`}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Link
            to={`/${lang}/archive`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {lang === 'ar' ? 'العودة إلى الأرشيف' : 'Back to Archive'}
          </Link>
          <div className="text-center text-gray-500">{lang === 'ar' ? 'لم يتم العثور على الإدخال.' : 'Entry not found.'}</div>
        </div>
      </div>
    );
  }

  const title = lang === 'ar' && entry.title_ar ? entry.title_ar : entry.title;
  const description = lang === 'ar' && entry.description_ar ? entry.description_ar : entry.description;
  const category = lang === 'ar' && entry.category_ar ? entry.category_ar : entry.category;
  const location = lang === 'ar' && entry.location_ar ? entry.location_ar : entry.location;
  const tags = lang === 'ar' && entry.tags_ar?.length ? entry.tags_ar : entry.tags;

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'lang-ar' : 'lang-en'}`}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to={`/${lang}/archive`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === 'ar' ? 'العودة إلى الأرشيف' : 'Back to Archive'}
        </Link>

        <article className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <WaveformPlayer
              audioUrl={entry.audio_url}
              height={100}
              showPlayButton={true}
            />
          </div>

          <div className="px-8 pb-8 pt-6">
            <h1 className="text-3xl font-medium text-gray-900 mb-4">
              {title}
            </h1>

            {description && (
              <div className="prose prose-gray max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            )}

            {entry.licence && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">{lang === 'ar' ? 'الرخصة: ' : 'Licence: '}</span>
                  <span className="text-gray-600">{entry.licence}</span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
              {category && (
                <div className="text-sm">
                  <span className="text-gray-500">{lang === 'ar' ? 'الفئة:' : 'Category:'}</span>{' '}
                  <span className="text-gray-900">{category}</span>
                </div>
              )}

              {location && (
                <div className="text-sm">
                  <span className="text-gray-500">{lang === 'ar' ? 'الموقع:' : 'Location:'}</span>{' '}
                  <Link
                    to={`/${lang}/archive?location=${encodeURIComponent(location)}`}
                    className="text-green-700 hover:text-green-900 hover:underline transition-colors"
                  >
                    {location}
                  </Link>
                </div>
              )}

              <div className="text-sm">
                <span className="text-gray-500">{lang === 'ar' ? 'التاريخ:' : 'Date:'}</span>{' '}
                <span className="text-gray-900">
                  {formatDate(entry.date_precision, entry.date, entry.year, lang)}
                </span>
              </div>

              {tags && tags.length > 0 && (
                <div className="w-full mt-2">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Link
                        key={index}
                        to={`/${lang}/archive?tag=${encodeURIComponent(tag)}`}
                        className="px-3 py-1 bg-cyan-50 text-primary-accent text-xs rounded-full hover:bg-cyan-100 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
