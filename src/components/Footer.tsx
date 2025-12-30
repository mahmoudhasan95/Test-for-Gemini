import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';

export function Footer() {
  const { lang, isRTL } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-black border-t border-gray-800 ${isRTL ? 'lang-ar' : 'lang-en'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-lg font-extrabold text-white mb-4" style={{ fontFamily: 'Almarai, sans-serif' }}>
              {t('siteName', lang)}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {t('footerDescription', lang)}
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary-accent transition-all duration-300 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook size={22} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary-accent transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram size={22} />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary-accent transition-all duration-300 hover:scale-110"
                aria-label="X (formerly Twitter)"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary-accent transition-all duration-300 hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube size={22} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-white mb-4" style={{ fontFamily: 'Almarai, sans-serif' }}>
              {t('footerQuickLinks', lang)}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to={`/${lang}`}
                  className="text-gray-400 hover:text-primary-accent text-sm transition-colors"
                >
                  {t('navHome', lang)}
                </Link>
              </li>
              <li>
                <Link
                  to={`/${lang}/archive`}
                  className="text-gray-400 hover:text-primary-accent text-sm transition-colors"
                >
                  {t('navArchive', lang)}
                </Link>
              </li>
              <li>
                <Link
                  to={`/${lang}/blog`}
                  className="text-gray-400 hover:text-primary-accent text-sm transition-colors"
                >
                  {t('navBlog', lang)}
                </Link>
              </li>
              <li>
                <Link
                  to={`/${lang}/about`}
                  className="text-gray-400 hover:text-primary-accent text-sm transition-colors"
                >
                  {t('navAbout', lang)}
                </Link>
              </li>
              <li>
                <Link
                  to={`/${lang}/contact-us`}
                  className="text-gray-400 hover:text-primary-accent text-sm transition-colors"
                >
                  {t('navContact', lang)}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-white mb-4" style={{ fontFamily: 'Almarai, sans-serif' }}>
              {lang === 'en' ? 'Legal' : 'قانوني'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to={`/${lang}/privacy-policy`}
                  className="text-gray-400 hover:text-primary-accent text-sm transition-colors"
                >
                  {t('privacyPolicy', lang)}
                </Link>
              </li>
              <li>
                <Link
                  to={`/${lang}/disclaimer`}
                  className="text-gray-400 hover:text-primary-accent text-sm transition-colors"
                >
                  {t('disclaimer', lang)}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-white mb-4" style={{ fontFamily: 'Almarai, sans-serif' }}>
              {lang === 'en' ? 'Support' : 'الدعم'}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {lang === 'en'
                ? 'Help us preserve and share valuable audio content.'
                : 'ساعدنا في الحفاظ على المحتوى الصوتي القيم ومشاركته.'}
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400 text-sm">
            {lang === 'en'
              ? `© ${currentYear} ${t('siteName', lang)}. All rights reserved under Creative Commons license.`
              : `© ${currentYear} ${t('siteName', lang)}. جميع الحقوق محفوظة تحت رخصة المشاع الإبداعي.`
            }
          </p>
        </div>
      </div>
    </footer>
  );
}
