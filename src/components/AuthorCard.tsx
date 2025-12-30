import { Link } from 'react-router-dom';
import { Author } from '../utils/blogHelpers';

interface AuthorCardProps {
  author: Author;
  lang: 'en' | 'ar';
}

export function AuthorCard({ author, lang }: AuthorCardProps) {
  const name = lang === 'ar' ? author.name_ar : author.name_en;
  const bio = lang === 'ar' ? author.bio_ar : author.bio_en;

  return (
    <div className={`bg-white border border-gray-200 p-8 ${lang === 'ar' ? 'text-right' : ''}`}>
      <div className="relative mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gray-200"></div>
          <h3 className={`text-xs tracking-wider uppercase text-gray-500 ${lang === 'ar' ? 'font-arabic normal-case' : ''}`}>
            {lang === 'ar' ? 'عن الكاتب' : 'About the Author'}
          </h3>
          <div className="h-px flex-1 bg-gray-200"></div>
        </div>
      </div>

      <div className={`flex gap-6 items-start ${lang === 'ar' ? 'flex-row-reverse' : ''}`}>
        {author.profile_image_url ? (
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-transparent opacity-50 rounded-full"></div>
            <img
              src={author.profile_image_url}
              alt={name}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-light text-gray-400">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 space-y-3">
          <Link to={`/${lang}/authors/${author.slug}`}>
            <h4 className={`text-xl font-light tracking-wide text-gray-900 hover:text-gray-600 transition-colors ${lang === 'ar' ? 'font-arabic' : ''}`}>
              {name}
            </h4>
          </Link>
          <div className="flex gap-1 py-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-0.5 bg-gray-300 opacity-30"
                style={{ height: `${Math.sin(i * 0.6) * 6 + 10}px` }}
              ></div>
            ))}
          </div>
          {bio && (
            <p className={`text-gray-600 text-sm leading-relaxed ${lang === 'ar' ? 'font-arabic' : ''}`}>
              {bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
