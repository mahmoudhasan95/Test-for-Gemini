import { Link } from 'react-router-dom';
import { BlogPost, CATEGORY_COLORS, formatDate } from '../utils/blogHelpers';
import { ArrowRight } from 'lucide-react';

interface BlogCardProps {
  post: BlogPost;
  lang: 'en' | 'ar';
}

export function BlogCard({ post, lang }: BlogCardProps) {
  const title = lang === 'ar' ? post.title_ar : post.title_en;
  const excerpt = lang === 'ar' ? post.excerpt_ar : post.excerpt_en;
  const category = lang === 'ar' ? post.category_ar : post.category_en;
  const authorName = post.authors
    ? lang === 'ar'
      ? post.authors.name_ar
      : post.authors.name_en
    : null;

  if (!title) return null;

  return (
    <Link
      to={`/${lang}/blog/${post.slug}`}
      className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
    >
      <div className="relative h-48 overflow-hidden bg-gray-200">
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
            <span className="text-4xl text-white opacity-50">
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className={`p-5 ${lang === 'ar' ? 'text-right' : ''}`}>
        <h3
          className={`text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-accent transition-colors ${
            lang === 'ar' ? 'font-almarai' : ''
          }`}
        >
          {title}
        </h3>

        {excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{excerpt}</p>
        )}

        <div className={`flex items-center justify-between text-sm text-gray-500 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-2 ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            {authorName && <span className="font-medium">{authorName}</span>}
            {authorName && <span>•</span>}
            <span>{formatDate(post.published_date, lang)}</span>
          </div>

          <span className={`flex items-center gap-1 text-primary-accent font-bold group-hover:gap-2 transition-all ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
            {lang === 'ar' ? 'اقرأ المزيد' : 'Read More'}
            <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          </span>
        </div>
      </div>
    </Link>
  );
}
