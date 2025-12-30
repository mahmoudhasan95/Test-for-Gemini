import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BlogPost, CATEGORY_COLORS, formatDate } from '../utils/blogHelpers';
import { BlogRichTextRenderer } from '../components/BlogRichTextRenderer';
import { AuthorCard } from '../components/AuthorCard';
import { ShareButton } from '../components/ShareButton';

export function BlogPostPage() {
  const { lang, slug } = useParams<{ lang: 'en' | 'ar'; slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isArabic = lang === 'ar';

  useEffect(() => {
    loadPost();
  }, [slug]);

  useEffect(() => {
    if (post) {
      const title = isArabic ? post.title_ar : post.title_en;
      if (title) {
        document.title = title;
      }
    }
    return () => {
      document.title = 'Masmaa';
    };
  }, [post, isArabic]);

  const loadPost = async () => {
    if (!slug) return;

    setIsLoading(true);
    setNotFound(false);

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, authors(*)')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNotFound(true);
        return;
      }

      setPost(data);
    } catch (error) {
      console.error('Error loading blog post:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-gray-300 rounded-lg"></div>
            <div className="h-12 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return <Navigate to={`/${lang}/blog`} replace />;
  }

  const title = isArabic ? post.title_ar : post.title_en;
  const content = isArabic ? post.content_ar : post.content_en;
  const category = isArabic ? post.category_ar : post.category_en;

  const hasOtherLanguage = isArabic ? !!post.title_en : !!post.title_ar;
  const otherLang = isArabic ? 'en' : 'ar';

  if (!title || !content) {
    return (
      <div className={`min-h-screen py-12 ${isArabic ? 'lang-ar' : 'lang-en'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {isArabic
              ? 'هذا المقال غير متوفر بالعربية'
              : 'This post is not available in English'}
          </h1>
          {hasOtherLanguage && (
            <Link
              to={`/${otherLang}/blog/${post.slug}`}
              className="inline-block text-primary-accent hover:text-accent-hover underline"
            >
              {isArabic
                ? 'View in English'
                : 'عرض بالعربية'}
            </Link>
          )}
          <div className="mt-8">
            <Link
              to={`/${lang}/blog`}
              className="text-primary-accent hover:text-accent-hover"
            >
              {isArabic ? 'العودة للمدونة' : 'Back to Blog'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 ${isArabic ? 'lang-ar' : 'lang-en'}`}>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={`/${lang}/blog`}
          className={`inline-flex items-center gap-2 text-primary-accent hover:text-accent-hover font-bold mb-8 ${isArabic ? 'flex-row-reverse' : ''}`}
        >
          {isArabic ? (
            <>
              <span>العودة للمدونة</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Blog</span>
            </>
          )}
        </Link>

        {post.featured_image_url && (
          <img
            src={post.featured_image_url}
            alt={title}
            className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
          />
        )}

        <div className={`mb-8 ${isArabic ? 'text-right' : ''}`}>
          {category && (
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {category}
            </span>
          )}

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h1>

          <div className={`flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 ${isArabic ? 'flex-row-reverse justify-end' : ''}`}>
            <span>{formatDate(post.published_date, lang as 'en' | 'ar')}</span>
            {post.authors && (
              <>
                <span>•</span>
                <Link
                  to={`/${lang}/authors/${post.authors.slug}`}
                  className="font-medium hover:text-primary-accent transition-colors"
                >
                  {isArabic ? post.authors.name_ar : post.authors.name_en}
                </Link>
              </>
            )}
          </div>

          <div className={`flex ${isArabic ? 'justify-end' : 'justify-start'}`}>
            <ShareButton
              url={`${window.location.origin}/${lang}/blog/${post.slug}`}
              title={title}
              lang={lang as 'en' | 'ar'}
            />
          </div>
        </div>

        <div className={isArabic ? 'lang-ar' : 'lang-en'}>
          <BlogRichTextRenderer content={content} isRTL={isArabic} />
        </div>

        {post.authors && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <AuthorCard author={post.authors} lang={lang as 'en' | 'ar'} />
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            to={`/${lang}/blog`}
            className={`inline-flex items-center gap-2 text-primary-accent hover:text-accent-hover font-bold ${isArabic ? 'flex-row-reverse' : ''}`}
          >
            {isArabic ? (
              <>
                <span>العودة للمدونة</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Blog</span>
              </>
            )}
          </Link>
        </div>
      </article>
    </div>
  );
}
