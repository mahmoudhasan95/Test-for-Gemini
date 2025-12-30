import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Author, BlogPost } from '../utils/blogHelpers';
import { BlogCard } from '../components/BlogCard';

export function AuthorProfilePage() {
  const { lang, slug } = useParams<{ lang: 'en' | 'ar'; slug: string }>();
  const [author, setAuthor] = useState<Author | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isArabic = lang === 'ar';

  useEffect(() => {
    loadAuthorAndPosts();
  }, [slug, lang]);

  useEffect(() => {
    if (author) {
      const authorName = isArabic ? author.name_ar : author.name_en;
      document.title = `${authorName} | Masmaa`;
    }
    return () => {
      document.title = 'Masmaa';
    };
  }, [author, isArabic]);

  const loadAuthorAndPosts = async () => {
    if (!slug) return;

    setIsLoading(true);
    setNotFound(false);

    try {
      const { data: authorData, error: authorError } = await supabase
        .from('authors')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (authorError) throw authorError;

      if (!authorData) {
        setNotFound(true);
        return;
      }

      setAuthor(authorData);

      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select('*, authors(*), blog_categories(*)')
        .eq('author_id', authorData.id)
        .eq('published', true)
        .order('published_date', { ascending: false });

      if (postsError) throw postsError;

      const languageFilteredPosts = (postsData || []).filter((post: BlogPost) => {
        if (isArabic) {
          return post.title_ar !== null;
        }
        return post.title_en !== null;
      });

      setPosts(languageFilteredPosts);
    } catch (error) {
      console.error('Error loading author:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (notFound) {
    return <Navigate to={`/${lang}/blog`} replace />;
  }

  if (isLoading || !author) {
    return (
      <div className={`min-h-screen py-12 ${isArabic ? 'lang-ar' : 'lang-en'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">{isArabic ? 'جاري التحميل...' : 'Loading...'}</div>
          </div>
        </div>
      </div>
    );
  }

  const authorName = isArabic ? author.name_ar : author.name_en;
  const authorBio = isArabic ? author.bio_ar : author.bio_en;

  return (
    <div className={`min-h-screen py-12 ${isArabic ? 'lang-ar' : 'lang-en'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="bg-white border border-gray-200 mb-12">
          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

            <div className="p-12 md:p-16">
              <div className="max-w-3xl mx-auto">
                <div className="flex flex-col items-center space-y-8">
                  <div className="relative">
                    {author.profile_image_url ? (
                      <div className="relative w-48 h-48">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-transparent opacity-50 rounded-full"></div>
                        <img
                          src={author.profile_image_url}
                          alt={authorName}
                          className="w-full h-full object-cover rounded-full border-2 border-gray-200"
                        />
                      </div>
                    ) : (
                      <div className="w-48 h-48 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center">
                        <span className="text-5xl font-light text-gray-400">
                          {authorName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="text-center space-y-4 w-full">
                    <h1 className={`text-3xl md:text-4xl font-light tracking-wide text-gray-900 ${isArabic ? 'font-arabic' : ''}`}>
                      {authorName}
                    </h1>

                    <div className="flex items-center justify-center gap-3 py-2">
                      <div className="h-px w-12 bg-gray-300"></div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-0.5 bg-gray-300 opacity-40"
                            style={{ height: `${Math.sin(i * 0.8) * 8 + 12}px` }}
                          ></div>
                        ))}
                      </div>
                      <div className="h-px w-12 bg-gray-300"></div>
                    </div>

                    {authorBio && (
                      <p className={`text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto ${isArabic ? 'font-arabic' : ''}`}>
                        {authorBio}
                      </p>
                    )}

                    {author.email && (
                      <div className="pt-4">
                        <a
                          href={`mailto:${author.email}`}
                          className={`inline-flex items-center gap-2 px-8 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 transition-colors ${isArabic ? 'flex-row-reverse' : ''}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className={`text-sm tracking-wide uppercase ${isArabic ? 'font-arabic normal-case' : ''}`}>
                            {isArabic ? 'تواصل معي' : 'Contact'}
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-20 bg-gradient-to-b from-white to-gray-50 flex items-center justify-center border-t border-gray-200">
              <div className="flex gap-1">
                {[...Array(18)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 bg-gray-300 opacity-30"
                    style={{ height: `${Math.sin(i * 0.4) * 12 + 20}px` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={`mb-8 ${isArabic ? 'text-right' : ''}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isArabic ? 'مقالات الكاتب' : 'Posts by this Author'}
          </h2>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} lang={lang as 'en' | 'ar'} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">
                {isArabic ? 'لا توجد مقالات بعد' : 'No posts yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
