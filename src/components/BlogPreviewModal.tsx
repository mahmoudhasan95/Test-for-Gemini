import { useState } from 'react';
import { X } from 'lucide-react';
import { BlogPost, CATEGORY_COLORS, formatDate, calculateReadingTime } from '../utils/blogHelpers';
import { BlogRichTextRenderer } from './BlogRichTextRenderer';
import { AuthorCard } from './AuthorCard';

interface BlogPreviewModalProps {
  post: Partial<BlogPost>;
  onClose: () => void;
}

export function BlogPreviewModal({ post, onClose }: BlogPreviewModalProps) {
  const [previewLang, setPreviewLang] = useState<'en' | 'ar'>('en');

  const hasEnglish = !!post.title_en;
  const hasArabic = !!post.title_ar;

  const title = previewLang === 'ar' ? post.title_ar : post.title_en;
  const content = previewLang === 'ar' ? post.content_ar : post.content_en;
  const category = previewLang === 'ar' ? post.category_ar : post.category_en;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
            <div className="flex gap-2">
              {hasEnglish && (
                <button
                  onClick={() => setPreviewLang('en')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    previewLang === 'en'
                      ? 'bg-primary-accent text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  English
                </button>
              )}
              {hasArabic && (
                <button
                  onClick={() => setPreviewLang('ar')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    previewLang === 'ar'
                      ? 'bg-primary-accent text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Arabic
                </button>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <article className="p-6 md:p-8">
          {!title || !content ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {previewLang === 'en'
                  ? 'This post is not available in English'
                  : 'هذا المقال غير متوفر بالعربية'}
              </p>
            </div>
          ) : (
            <>
              {post.featured_image_url && (
                <img
                  src={post.featured_image_url}
                  alt={title || ''}
                  className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
                />
              )}

              <div className={`mb-6 ${previewLang === 'ar' ? 'text-right' : ''}`}>
                {category && (
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                      CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category}
                  </span>
                )}

                <h1
                  className={`text-3xl md:text-4xl font-bold text-gray-900 mb-4 ${
                    previewLang === 'ar' ? 'font-arabic' : ''
                  }`}
                >
                  {title}
                </h1>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {post.published_date && (
                    <span>
                      {formatDate(post.published_date, previewLang)}
                    </span>
                  )}
                  {content && (
                    <span>
                      {calculateReadingTime(content)} {previewLang === 'ar' ? 'دقيقة قراءة' : 'min read'}
                    </span>
                  )}
                </div>
              </div>

              <div className={previewLang === 'ar' ? 'lang-ar' : 'lang-en'}>
                <BlogRichTextRenderer content={content || ''} isRTL={previewLang === 'ar'} />
              </div>

              {post.authors && (
                <div className="mt-12">
                  <AuthorCard author={post.authors} lang={previewLang} />
                </div>
              )}
            </>
          )}
        </article>
      </div>
    </div>
  );
}
