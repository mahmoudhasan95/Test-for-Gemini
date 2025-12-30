import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Facebook, Linkedin, Link2, Check, Instagram } from 'lucide-react';
import { AudioEntry } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { formatDate } from '../utils/translations';
import { WaveformPlayer } from './WaveformPlayer';

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

type AudioCardProps = {
  entry: AudioEntry;
  showLink?: boolean;
};

export function AudioCard({ entry, showLink = true }: AudioCardProps) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isArabic = lang === 'ar';
  const title = lang === 'ar' && entry.title_ar ? entry.title_ar : entry.title;
  const description = lang === 'ar' && entry.description_ar ? entry.description_ar : entry.description;
  const category = lang === 'ar' && entry.category_ar ? entry.category_ar : entry.category;
  const location = lang === 'ar' && entry.location_ar ? entry.location_ar : entry.location;
  const tags = lang === 'ar' && entry.tags_ar?.length ? entry.tags_ar : entry.tags;

  const shareUrl = `${window.location.origin}/${lang}/audio/${entry.id}`;
  const encodedShareUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: isArabic ? 'إكس' : 'X',
      icon: XIcon,
      url: `https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedTitle}`,
      color: 'hover:bg-gray-100 hover:text-gray-900'
    },
    {
      name: isArabic ? 'فيسبوك' : 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`,
      color: 'hover:bg-blue-50 hover:text-blue-700'
    },
    {
      name: isArabic ? 'إنستغرام' : 'Instagram',
      icon: Instagram,
      url: `https://www.instagram.com/`,
      color: 'hover:bg-pink-50 hover:text-pink-600'
    },
    {
      name: isArabic ? 'لينكد إن' : 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`,
      color: 'hover:bg-blue-50 hover:text-blue-800'
    },
    {
      name: isArabic ? 'واتساب' : 'WhatsApp',
      icon: WhatsAppIcon,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedShareUrl}`,
      color: 'hover:bg-green-50 hover:text-green-600'
    }
  ];

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareOpen(!isShareOpen);
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying link:', err);
    }
  };

  const handleShare = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank', 'width=600,height=400');
    setIsShareOpen(false);
  };

  const handleCardClick = () => {
    if (showLink) {
      navigate(`/${lang}/audio/${entry.id}`);
    }
  };

  const handleLocationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/${lang}/archive?location=${encodeURIComponent(location || '')}`);
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    navigate(`/${lang}/archive?tag=${encodeURIComponent(tag)}`);
  };

  if (showLink) {
    return (
      <div
        onClick={handleCardClick}
        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative"
      >
        <button
          onClick={handleShareClick}
          className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-sm transition-all hover:scale-110"
          title={lang === 'ar' ? 'مشاركة' : 'Share'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-600">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {isShareOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.stopPropagation();
                setIsShareOpen(false);
              }}
            />
            <div
              className={`absolute z-50 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 space-y-2 top-10 right-2 animate-in fade-in slide-in-from-top-2 duration-200`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 ${isArabic ? 'text-right' : 'text-left'}`}>
                {isArabic ? 'مشاركة عبر' : 'Share via'}
              </div>

              {shareLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={(e) => handleShare(link.url, e)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${link.color} ${
                    isArabic ? 'flex-row-reverse text-right' : 'text-left'
                  }`}
                >
                  <link.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{link.name}</span>
                </button>
              ))}

              <div className={`pt-2 border-t border-gray-100 ${isArabic ? 'text-right' : 'text-left'}`}>
                <button
                  onClick={handleCopyLink}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                    copied ? 'bg-green-50 text-green-600' : 'text-gray-700'
                  } ${isArabic ? 'flex-row-reverse' : ''}`}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">
                        {isArabic ? 'تم النسخ!' : 'Copied!'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">
                        {isArabic ? 'نسخ الرابط' : 'Copy link'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <WaveformPlayer
            audioUrl={entry.audio_url}
            height={70}
            showPlayButton={true}
          />
        </div>

        <div className="px-5 pb-5 pt-5 hover:bg-gray-50 transition-colors">
          <h3 className="text-xl font-medium text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>

          {description && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-3">
              {description}
            </p>
          )}

          {entry.licence && (
            <div className="mb-3 text-xs">
              <span className="font-medium text-gray-700">
                {lang === 'ar' ? 'الرخصة: ' : 'Licence: '}
              </span>
              <span className="text-gray-600">{entry.licence}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mb-3">
            {category && (
              <span className="px-2 py-1 bg-gray-100 rounded">
                {category}
              </span>
            )}
            {location && (
              <button
                onClick={handleLocationClick}
                className="px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors inline-flex items-center gap-1.5"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                </svg>
                {location}
              </button>
            )}
            <span className="inline-flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {formatDate(entry.date_precision, entry.date, entry.year, lang)}
            </span>
          </div>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={(e) => handleTagClick(e, tag)}
                  className="px-2 py-1 bg-cyan-50 text-primary-accent text-xs rounded-full hover:bg-cyan-100 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow relative">
      <button
        onClick={handleShareClick}
        className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-sm transition-all hover:scale-110"
        title={lang === 'ar' ? 'مشاركة' : 'Share'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-600">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isShareOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setIsShareOpen(false);
            }}
          />
          <div
            className={`absolute z-50 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 space-y-2 top-10 right-2 animate-in fade-in slide-in-from-top-2 duration-200`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 ${isArabic ? 'text-right' : 'text-left'}`}>
              {isArabic ? 'مشاركة عبر' : 'Share via'}
            </div>

            {shareLinks.map((link) => (
              <button
                key={link.name}
                onClick={(e) => handleShare(link.url, e)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${link.color} ${
                  isArabic ? 'flex-row-reverse text-right' : 'text-left'
                }`}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{link.name}</span>
              </button>
            ))}

            <div className={`pt-2 border-t border-gray-100 ${isArabic ? 'text-right' : 'text-left'}`}>
              <button
                onClick={handleCopyLink}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                  copied ? 'bg-green-50 text-green-600' : 'text-gray-700'
                } ${isArabic ? 'flex-row-reverse' : ''}`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">
                      {isArabic ? 'تم النسخ!' : 'Copied!'}
                    </span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">
                      {isArabic ? 'نسخ الرابط' : 'Copy link'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <WaveformPlayer
          audioUrl={entry.audio_url}
          height={70}
          showPlayButton={true}
        />
      </div>

      <div className="px-5 pb-5 pt-5">
        <h3 className="text-xl font-medium text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>

        {description && (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-3">
            {description}
          </p>
        )}

        {entry.licence && (
          <div className="mb-3 text-xs">
            <span className="font-medium text-gray-700">
              {lang === 'ar' ? 'الرخصة: ' : 'Licence: '}
            </span>
            <span className="text-gray-600">{entry.licence}</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mb-3">
          {category && (
            <span className="px-2 py-1 bg-gray-100 rounded">
              {category}
            </span>
          )}
          {location && (
            <button
              onClick={handleLocationClick}
              className="px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors inline-flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
              </svg>
              {location}
            </button>
          )}
          <span className="inline-flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {formatDate(entry.date_precision, entry.date, entry.year, lang)}
          </span>
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => handleTagClick(e, tag)}
                className="px-2 py-1 bg-cyan-50 text-primary-accent text-xs rounded-full hover:bg-cyan-100 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
