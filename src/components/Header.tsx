import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translations';
import { Logo } from './Logo';

export function Header() {
  const { lang, setLang, isRTL } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    const currentPath = location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/(en|ar)/, '');
    navigate(`/${newLang}${pathWithoutLang || ''}`);
    setLang(newLang);
    setMobileMenuOpen(false);
  };

  const isActivePath = (path: string) => {
    return location.pathname === `/${lang}${path}` ||
           (path === '' && location.pathname === `/${lang}`);
  };

  const navLinks = [
    { path: '', label: t('navHome', lang) },
    { path: '/archive', label: t('navArchive', lang) },
    { path: '/blog', label: t('navBlog', lang) },
    { path: '/about', label: t('navAbout', lang) },
    { path: '/contact-us', label: t('navContact', lang) },
  ];

  return (
    <header className="bg-black shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Logo />

          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={`/${lang}${link.path}`}
                className={`text-base font-bold transition-colors nav-link-underline ${
                  isActivePath(link.path)
                    ? 'text-primary-accent'
                    : 'text-white hover:text-primary-accent'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 text-sm font-bold text-white hover:text-primary-accent border border-white rounded-md hover:border-primary-accent transition-colors"
            >
              {lang === 'en' ? 'AR' : 'EN'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-primary-accent"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={`md:hidden border-t border-gray-800 bg-black ${isRTL ? 'lang-ar' : 'lang-en'}`}>
          <nav className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={`/${lang}${link.path}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-bold transition-colors ${
                  isActivePath(link.path)
                    ? 'bg-gray-900 text-primary-accent'
                    : 'text-white hover:bg-gray-900 hover:text-primary-accent'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
