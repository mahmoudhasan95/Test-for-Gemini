import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';
import { supabase } from '../lib/supabase';
import { BlogPost } from '../utils/blogHelpers';
import { BlogCard } from '../components/BlogCard';
import { SectionHeader } from '../components/SectionHeader';

interface CategoryGroup {
  categoryId: string;
  categoryNameEn: string;
  categoryNameAr: string;
  posts: BlogPost[];
  isEditorsChoice?: boolean;
}

export function HomePage() {
  const { lang, isRTL } = useLanguage();
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPostsByCategory();
  }, [lang]);

  const loadPostsByCategory = async () => {
    setIsLoading(true);
    try {
      const { data: editorsChoiceCategory } = await supabase
        .from('blog_categories')
        .select('id')
        .eq('name_en', 'Editors\' Choice')
        .maybeSingle();

      const editorsChoiceCategoryId = editorsChoiceCategory?.id;

      const { data: editorsPicks, error: picksError } = await supabase
        .from('editors_picks')
        .select(`
          *,
          blog_posts (
            id, slug, title_en, title_ar, excerpt_en, excerpt_ar,
            featured_image_url, category_id, category_en, category_ar,
            author_id, published_date, published, created_at,
            authors (id, slug, name_en, name_ar),
            blog_categories (id, name_en, name_ar)
          )
        `)
        .order('display_order', { ascending: true });

      if (picksError) throw picksError;

      const activeEditorsPicks = (editorsPicks || [])
        .filter(pick => {
          const now = new Date();
          const start = new Date(pick.scheduled_start);
          const end = pick.scheduled_end ? new Date(pick.scheduled_end) : null;
          return start <= now && (!end || end > now) && pick.blog_posts?.published;
        })
        .map(pick => pick.blog_posts)
        .filter(post => post !== null) as BlogPost[];

      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select(`
          id, slug, title_en, title_ar, excerpt_en, excerpt_ar,
          featured_image_url, category_id, category_en, category_ar,
          author_id, published_date, published, created_at,
          authors (id, slug, name_en, name_ar),
          blog_categories (id, name_en, name_ar)
        `)
        .eq('published', true)
        .order('published_date', { ascending: false });

      if (error) throw error;

      const languageFilteredPosts = (posts || []).filter((post: BlogPost) => {
        if (lang === 'ar') {
          return post.title_ar !== null;
        }
        return post.title_en !== null;
      });

      const languageFilteredEditorsPicks = activeEditorsPicks.filter((post: BlogPost) => {
        if (lang === 'ar') {
          return post.title_ar !== null;
        }
        return post.title_en !== null;
      });

      const grouped = languageFilteredPosts.reduce((acc: { [key: string]: CategoryGroup }, post: BlogPost) => {
        const categoryId = post.blog_categories?.id || 'uncategorized';
        const categoryNameEn = post.blog_categories?.name_en || 'Uncategorized';
        const categoryNameAr = post.blog_categories?.name_ar || 'غير مصنف';

        if (categoryId === editorsChoiceCategoryId) {
          return acc;
        }

        if (!acc[categoryId]) {
          acc[categoryId] = {
            categoryId,
            categoryNameEn,
            categoryNameAr,
            posts: [],
            isEditorsChoice: false
          };
        }

        acc[categoryId].posts.push(post);
        return acc;
      }, {});

      const groupedArray = Object.values(grouped).filter(group => group.posts.length > 0);

      if (languageFilteredEditorsPicks.length > 0 && editorsChoiceCategoryId) {
        groupedArray.push({
          categoryId: editorsChoiceCategoryId,
          categoryNameEn: 'Editors\' Choice',
          categoryNameAr: 'اختيار المحررين',
          posts: languageFilteredEditorsPicks,
          isEditorsChoice: true
        });
      }

      const { data: categoriesData } = await supabase
        .from('blog_categories')
        .select('id, display_order')
        .order('display_order', { ascending: true, nullsFirst: false });

      const categoryOrderMap = new Map(
        (categoriesData || []).map((cat, index) => [cat.id, cat.display_order ?? index])
      );

      groupedArray.sort((a, b) => {
        const orderA = categoryOrderMap.get(a.categoryId) ?? 999;
        const orderB = categoryOrderMap.get(b.categoryId) ?? 999;
        return orderA - orderB;
      });

      setCategoryGroups(groupedArray);
    } catch (error) {
      console.error('Error loading posts by category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-gray-50 ${isRTL ? 'lang-ar' : 'lang-en'}`}>
      <div className="max-w-5xl mx-auto px-4 py-20 sm:py-32">
        <div className="text-center animate-fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            {t('siteName', lang)}
          </h1>

          <div className="mb-8">
            <p className="text-2xl sm:text-3xl lg:text-4xl text-gray-700 font-medium mb-4">
              {t('heroTitle', lang)}
            </p>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('heroSubtitle', lang)}
            </p>
          </div>

          <div className="mt-12">
            <Link
              to={`/${lang}/archive`}
              className="inline-block px-8 py-4 bg-primary-accent text-white text-lg font-bold rounded-lg hover:bg-accent-hover transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {t('exploreArchive', lang)}
            </Link>
          </div>
        </div>
      </div>

      {/* Articles by Category Section */}
      {isLoading ? (
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
          </div>
        </div>
      ) : (
        categoryGroups.map((group) => (
          <div
            key={group.categoryId}
            className={`max-w-7xl mx-auto px-4 pb-20 ${
              group.isEditorsChoice ? 'bg-gradient-to-br from-amber-50 to-orange-50 py-12 rounded-2xl mb-8' : ''
            }`}
          >
            {group.isEditorsChoice && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-300" />
                <div className="flex items-center gap-2 px-4 py-1 bg-amber-100 rounded-full border-2 border-amber-300">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                    {lang === 'ar' ? 'اختيار المحررين' : 'Editors\' Choice'}
                  </span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-300" />
              </div>
            )}

            <SectionHeader
              title={lang === 'ar' ? group.categoryNameAr : group.categoryNameEn}
              viewAllText={lang === 'ar' ? 'عرض الكل' : 'View All'}
              viewAllLink={`/${lang}/blog?category=${group.categoryId}`}
              className={`mb-8 rounded-lg ${group.isEditorsChoice ? 'hidden' : ''}`}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.posts.slice(0, 3).map((post) => (
                <BlogCard key={post.id} post={post} lang={lang} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
