export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function generateExcerpt(htmlContent: string, maxLength: number = 150): string {
  const plainText = stripHtmlTags(htmlContent);

  if (plainText.length <= maxLength) {
    return plainText;
  }

  const truncated = plainText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }

  return truncated + '...';
}

export function calculateReadingTime(htmlContent: string): number {
  const plainText = stripHtmlTags(htmlContent);
  const words = plainText.trim().split(/\s+/).length;
  const wordsPerMinute = 200;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
}

export function formatDate(date: string, lang: 'en' | 'ar'): string {
  const dateObj = new Date(date);

  if (lang === 'ar') {
    return dateObj.toLocaleDateString('ar-EG-u-nu-arab', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getCategoryColor(categoryName: string): string {
  const colorMap: { [key: string]: string } = {
    'Anthropology': 'bg-cyan-100 text-primary-accent',
    'أنثروبولوجيا': 'bg-cyan-100 text-primary-accent',
    'Field Notes': 'bg-green-100 text-green-700',
    'ملاحظات ميدانية': 'bg-green-100 text-green-700',
    'Research': 'bg-amber-100 text-amber-700',
    'بحث': 'bg-amber-100 text-amber-700',
    'Interviews': 'bg-rose-100 text-rose-700',
    'مقابلات': 'bg-rose-100 text-rose-700',
    'Reflections': 'bg-slate-100 text-slate-700',
    'تأملات': 'bg-slate-100 text-slate-700'
  };
  return colorMap[categoryName] || 'bg-gray-100 text-gray-700';
}

export const CATEGORY_COLORS: { [key: string]: string } = {
  'Anthropology': 'bg-cyan-100 text-primary-accent',
  'أنثروبولوجيا': 'bg-cyan-100 text-primary-accent',
  'Field Notes': 'bg-green-100 text-green-700',
  'ملاحظات ميدانية': 'bg-green-100 text-green-700',
  'Research': 'bg-amber-100 text-amber-700',
  'بحث': 'bg-amber-100 text-amber-700',
  'Interviews': 'bg-rose-100 text-rose-700',
  'مقابلات': 'bg-rose-100 text-rose-700',
  'Reflections': 'bg-slate-100 text-slate-700',
  'تأملات': 'bg-slate-100 text-slate-700'
};

export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  created_at: string;
}

export interface Author {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  bio_en: string | null;
  bio_ar: string | null;
  profile_image_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title_en: string | null;
  title_ar: string | null;
  content_en: string | null;
  content_ar: string | null;
  excerpt_en: string | null;
  excerpt_ar: string | null;
  featured_image_url: string | null;
  category_id: string | null;
  category_en: string;
  category_ar: string;
  author_id: string | null;
  published_date: string;
  published: boolean;
  admin_notes?: string | null;
  word_count_en?: number;
  word_count_ar?: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  authors?: Author;
  blog_categories?: Category;
}
