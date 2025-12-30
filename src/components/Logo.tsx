import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';

export function Logo() {
  const { lang } = useLanguage();

  return (
    <Link to={`/${lang}`} className="flex items-center gap-3 group">
      {lang === 'ar' ? (
        <div className="flex items-center gap-2 sm:gap-3">
          <svg
            width="30"
            height="30"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform group-hover:scale-105 sm:w-9 sm:h-9"
          >
            <rect x="3" y="14" width="3" height="8" rx="1.5" fill="#ffffff" className="animate-pulse" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
            <rect x="8" y="10" width="3" height="16" rx="1.5" fill="#ffffff" className="animate-pulse" style={{ animationDelay: '150ms', animationDuration: '1.5s' }} />
            <rect x="13" y="6" width="3" height="24" rx="1.5" fill="#ffffff" className="animate-pulse" style={{ animationDelay: '300ms', animationDuration: '1.5s' }} />
            <rect x="18" y="4" width="3" height="28" rx="1.5" fill="#ffffff" className="animate-pulse" style={{ animationDelay: '450ms', animationDuration: '1.5s' }} />
            <rect x="23" y="8" width="3" height="20" rx="1.5" fill="#ffffff" className="animate-pulse" style={{ animationDelay: '600ms', animationDuration: '1.5s' }} />
            <rect x="28" y="12" width="3" height="12" rx="1.5" fill="#ffffff" className="animate-pulse" style={{ animationDelay: '750ms', animationDuration: '1.5s' }} />
          </svg>
          <div className="relative text-3xl sm:text-4xl md:text-5xl font-bold logo-kufic-ar">
            <span className="absolute inset-0" style={{ color: '#006070' }}>
              مَسْمَع
            </span>
            <span className="relative text-white group-hover:text-primary-accent transition-colors">
              مسمع
            </span>
          </div>
        </div>
      ) : (
        <>
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform group-hover:scale-105"
          >
            <rect x="4" y="12" width="3" height="8" rx="1.5" fill="#ffffff" className="animate-pulse" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
            <rect x="9" y="8" width="3" height="16" rx="1.5" fill="#ffffff" className="animate-pulse" style={{ animationDelay: '150ms', animationDuration: '1.5s' }} />
            <rect x="14" y="4" width="3" height="24" rx="1.5" fill="#ffffff" className="animate-pulse" style={{ animationDelay: '300ms', animationDuration: '1.5s' }} />
            <rect x="19" y="10" width="3" height="12" rx="1.5" fill="#ffffff" className="animate-pulse" style={{ animationDelay: '450ms', animationDuration: '1.5s' }} />
            <rect x="24" y="14" width="3" height="4" rx="1.5" fill="#ffffff" className="animate-pulse" style={{ animationDelay: '600ms', animationDuration: '1.5s' }} />
          </svg>
          <span className="text-3xl md:text-4xl font-bold text-white group-hover:text-primary-accent transition-colors logo-kufic-en">
            {t('siteName', lang)}
          </span>
        </>
      )}
    </Link>
  );
}
