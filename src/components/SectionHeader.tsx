import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SectionHeaderProps {
  title: string;
  viewAllText?: string;
  viewAllLink?: string;
  className?: string;
}

export function SectionHeader({
  title,
  viewAllText,
  viewAllLink,
  className = ''
}: SectionHeaderProps) {
  const { lang } = useLanguage();
  const isRTL = lang === 'ar';

  return (
    <div className={`bg-gray-900 text-white px-6 py-4 flex items-center justify-between ${className}`}>
      <h2 className="text-xl md:text-2xl font-bold">
        {title}
      </h2>

      {viewAllText && viewAllLink && (
        <Link
          to={viewAllLink}
          className="flex items-center gap-2 text-sm md:text-base hover:text-primary-accent transition-colors group"
        >
          <span>{viewAllText}</span>
          {isRTL ? (
            <ChevronLeft className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
          ) : (
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          )}
        </Link>
      )}
    </div>
  );
}
