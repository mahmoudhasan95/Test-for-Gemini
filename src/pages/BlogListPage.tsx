import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BlogPost, Category } from '../utils/blogHelpers';
import { BlogCard } from '../components/BlogCard';
import { Search } from 'lucide-react';

const POSTS_PER_PAGE = 10;

export function BlogListPage() {
  const { lang } = useParams<{ lang: 'en' | 'ar' }>();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const isArabic = lang === 'ar';

  useEffect(() => {
    loadCategories();
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [lang, searchParams]);

  useEffect(() => {
    loadPosts();
  }, [lang, selectedCategory]);

  useEffect(() => {
    filterPosts();
  }, [posts, searchQuery]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('blog_posts')
        .select(`
          id, slug, title_en, title_ar, excerpt_en, excerpt_ar,
          featured_image_url, category_id, category_en, category_ar,
          author_id, published_date, published, created_at,
          authors (id, slug, name_en, name_ar),
          blog_categories (id, name_en, name_ar)
        `, { count: 'exact' })
        .eq('published', true);

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error, count } = await query.order('published_date', { ascending: false });

      if (error) throw error;

      const languageFilteredPosts = (data || []).filter((post: BlogPost) => {
        if (isArabic) {
          return post.title_ar !== null;
        } else {
          return post.title_en !== null;
        }
      });

      setPosts(languageFilteredPosts);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('id, name_en, name_ar, display_order')
        .order('name_en');

      if (!error && data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filterPosts = () => {
    let filtered = [...posts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((post) => {
        const title = isArabic ? post.title_ar : post.title_en;
        const excerpt = isArabic ? post.excerpt_ar : post.excerpt_en;
        return (
          title?.toLowerCase().includes(query) ||
          excerpt?.toLowerCase().includes(query)
        );
      });
    }

    setFilteredPosts(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <div className={`min-h-screen py-12 ${isArabic ? 'lang-ar' : 'lang-en'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`mb-12 ${isArabic ? 'text-right' : ''}`}>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isArabic ? 'المدونة' : 'Blog'}
          </h1>
          <p className="text-lg text-gray-600">
            {isArabic
              ? 'اكتشف أحدث المقالات والأبحاث والتأملات'
              : 'Discover the latest articles, research, and reflections'}
          </p>
        </div>

        <div className={`mb-8 flex flex-col sm:flex-row gap-4 ${isArabic ? 'sm:flex-row-reverse' : ''}`}>
          <div className="relative flex-1">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isArabic ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? 'البحث في المدونة...' : 'Search blog...'}
              className={`w-full ${isArabic ? 'pr-10 text-right' : 'pl-10'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent`}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent ${isArabic ? 'text-right' : ''}`}
          >
            <option value="all">
              {isArabic ? 'جميع الفئات' : 'All Categories'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {isArabic ? category.name_ar : category.name_en}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-300"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : paginatedPosts.length === 0 ? (
          <div className={`text-center py-20 ${isArabic ? 'text-right' : ''}`}>
            <p className="text-lg text-gray-600">
              {isArabic
                ? 'لا توجد مقالات بعد. سنبدأ قريبًا بنشر المحتوى.'
                : 'No English posts available yet. Stay tuned for upcoming content from international contributors.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedPosts.map((post) => (
                <BlogCard key={post.id} post={post} lang={lang as 'en' | 'ar'} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isArabic ? 'السابق' : 'Previous'}
                </button>

                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === i + 1
                          ? 'bg-primary-accent text-white font-bold'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isArabic ? 'التالي' : 'Next'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
