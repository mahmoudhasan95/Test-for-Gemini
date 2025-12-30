import { Language } from '../contexts/LanguageContext';

type Translations = {
  [key: string]: {
    en: string;
    ar: string;
  };
};

const translations: Translations = {
  siteName: {
    en: 'Masmaa',
    ar: 'مَسْمَع',
  },
  siteDescription: {
    en: 'An anthropological platform exploring the world through sound',
    ar: 'منصة أنثروبولوجية للإصغاء إلى الأصوات',
  },
  siteTitle: {
    en: 'Masmaa | An anthropological platform exploring the world through sound',
    ar: 'مَسْمَع | منصة أنثروبولوجية للإصغاء إلى الأصوات',
  },
  recentlyAdded: {
    en: 'Recently Added',
    ar: 'المضافة حديثًا',
  },
  searchPlaceholder: {
    en: 'Search audio archive...',
    ar: 'البحث في الأرشيف الصوتي...',
  },
  search: {
    en: 'Search',
    ar: 'بحث',
  },
  browseAll: {
    en: 'Browse All',
    ar: 'تصفح الكل',
  },
  noFeaturedEntries: {
    en: 'No featured entries yet.',
    ar: 'لا توجد إدخالات مميزة بعد.',
  },
  browseArchive: {
    en: 'Browse archive',
    ar: 'تصفح الأرشيف',
  },
  loading: {
    en: 'Loading...',
    ar: 'جاري التحميل...',
  },
  searchArchive: {
    en: 'Search archive...',
    ar: 'البحث في الأرشيف...',
  },
  allCategories: {
    en: 'All Categories',
    ar: 'جميع الفئات',
  },
  newest: {
    en: 'Newest',
    ar: 'الأحدث',
  },
  oldest: {
    en: 'Oldest',
    ar: 'الأقدم',
  },
  featuredFirst: {
    en: 'Featured First',
    ar: 'المميزة أولاً',
  },
  entries: {
    en: 'entries',
    ar: 'إدخالات',
  },
  entry: {
    en: 'entry',
    ar: 'إدخال',
  },
  noEntriesFound: {
    en: 'No entries found. Try adjusting your filters.',
    ar: 'لم يتم العثور على إدخالات. حاول تعديل المرشحات.',
  },
  previous: {
    en: 'Previous',
    ar: 'السابق',
  },
  next: {
    en: 'Next',
    ar: 'التالي',
  },
  page: {
    en: 'Page',
    ar: 'صفحة',
  },
  of: {
    en: 'of',
    ar: 'من',
  },
  unknownDate: {
    en: 'Unknown Date',
    ar: 'تاريخ غير معروف',
  },
  navHome: {
    en: 'Home',
    ar: 'الرئيسية',
  },
  navArchive: {
    en: 'Sound Archive',
    ar: 'الأرشيف الصوتي',
  },
  navAbout: {
    en: 'About',
    ar: 'عن المنصة',
  },
  navContact: {
    en: 'Contact Us',
    ar: 'اتصل بنا',
  },
  heroTitle: {
    en: 'Understanding life through sound',
    ar: 'منصّة أنثروبولوجية لفهم الحياة عبر الصوت',
  },
  heroSubtitle: {
    en: 'Explore our curated collection of sounds that tell stories from around the world',
    ar: 'استكشف مجموعتنا المنتقاة من الأصوات التي تروي قصصًا من جميع أنحاء العالم',
  },
  exploreArchive: {
    en: 'Explore Sound Archive',
    ar: 'تصفح الأرشيف الصوتي',
  },
  footerDescription: {
    en: 'An anthropological platform exploring the world through sound',
    ar: 'منصة أنثروبولوجية للإصغاء إلى الأصوات',
  },
  footerQuickLinks: {
    en: 'Quick Links',
    ar: 'روابط سريعة',
  },
  footerCopyright: {
    en: '© 2024 Masmaa. All rights reserved.',
    ar: '© 2024 مَسْمَع. جميع الحقوق محفوظة.',
  },
  aboutTitle: {
    en: 'About Masmaa',
    ar: 'عن مَسْمَع',
  },
  aboutMission: {
    en: 'Our Mission',
    ar: 'مهمتنا',
  },
  aboutMissionText: {
    en: 'Masmaa is dedicated to preserving and sharing the sonic heritage of communities around the world. Through sound, we document life, culture, and history in ways that transcend language barriers.',
    ar: 'مَسْمَع مكرّس للحفاظ على التراث الصوتي للمجتمعات حول العالم ومشاركته. من خلال الصوت، نوثّق الحياة والثقافة والتاريخ بطرق تتجاوز حواجز اللغة.',
  },
  aboutVision: {
    en: 'Our Vision',
    ar: 'رؤيتنا',
  },
  aboutVisionText: {
    en: 'We envision a world where sound archives serve as windows into diverse cultures, enabling deeper understanding and appreciation of our shared human experience.',
    ar: 'نتصور عالمًا تكون فيه الأرشيفات الصوتية نوافذ على ثقافات متنوعة، مما يتيح فهمًا وتقديرًا أعمق لتجربتنا الإنسانية المشتركة.',
  },
  contactTitle: {
    en: 'Contact Us',
    ar: 'اتصل بنا',
  },
  contactIntro: {
    en: 'Have a question or want to contribute to our archive? We\'d love to hear from you.',
    ar: 'لديك سؤال أو ترغب في المساهمة في أرشيفنا؟ نود أن نسمع منك.',
  },
  contactName: {
    en: 'Name',
    ar: 'الاسم',
  },
  contactEmail: {
    en: 'Email',
    ar: 'البريد الإلكتروني',
  },
  contactSubject: {
    en: 'Subject',
    ar: 'الموضوع',
  },
  contactMessage: {
    en: 'Message',
    ar: 'الرسالة',
  },
  contactSubmit: {
    en: 'Send Message',
    ar: 'إرسال الرسالة',
  },
  contactSuccess: {
    en: 'Thank you! Your message has been sent successfully.',
    ar: 'شكرًا لك! تم إرسال رسالتك بنجاح.',
  },
  contactError: {
    en: 'Sorry, there was an error sending your message. Please try again.',
    ar: 'عذرًا، حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى.',
  },
  contactRequired: {
    en: 'This field is required',
    ar: 'هذا الحقل مطلوب',
  },
  contactInvalidEmail: {
    en: 'Please enter a valid email address',
    ar: 'يرجى إدخال عنوان بريد إلكتروني صالح',
  },
  privacyTitle: {
    en: 'Privacy Policy',
    ar: 'سياسة الخصوصية',
  },
  privacyLastUpdated: {
    en: 'Last updated',
    ar: 'آخر تحديث',
  },
  privacyIntro: {
    en: 'This Privacy Policy describes how Masmaa collects, uses, and protects your personal information.',
    ar: 'تصف سياسة الخصوصية هذه كيفية جمع مَسْمَع لمعلوماتك الشخصية واستخدامها وحمايتها.',
  },
  disclaimerTitle: {
    en: 'Disclaimer',
    ar: 'إخلاء المسؤولية',
  },
  disclaimerIntro: {
    en: 'The information provided on Masmaa is for general informational purposes only.',
    ar: 'المعلومات المقدمة على مَسْمَع هي لأغراض المعلومات العامة فقط.',
  },
  privacyPolicy: {
    en: 'Privacy Policy',
    ar: 'سياسة الخصوصية',
  },
  disclaimer: {
    en: 'Disclaimer',
    ar: 'إخلاء المسؤولية',
  },
  navBlog: {
    en: 'Blog',
    ar: 'المدونة',
  },
  blogTitle: {
    en: 'Blog',
    ar: 'المدونة',
  },
  readMore: {
    en: 'Read More',
    ar: 'اقرأ المزيد',
  },
  postedOn: {
    en: 'Posted on',
    ar: 'نُشر في',
  },
  by: {
    en: 'by',
    ar: 'بواسطة',
  },
  category: {
    en: 'Category',
    ar: 'الفئة',
  },
  searchBlog: {
    en: 'Search blog...',
    ar: 'البحث في المدونة...',
  },
  allPosts: {
    en: 'All Posts',
    ar: 'جميع المقالات',
  },
  backToBlog: {
    en: 'Back to Blog',
    ar: 'العودة للمدونة',
  },
  aboutAuthor: {
    en: 'About the Author',
    ar: 'عن الكاتب',
  },
  minuteRead: {
    en: 'min read',
    ar: 'دقيقة قراءة',
  },
  draft: {
    en: 'Draft',
    ar: 'مسودة',
  },
  published: {
    en: 'Published',
    ar: 'منشور',
  },
};

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] || key;
}

export function formatDate(
  datePrecision: 'unknown' | 'year' | 'full',
  date: string | null,
  year: number | null,
  lang: Language
): string {
  if (datePrecision === 'unknown') {
    return t('unknownDate', lang);
  }

  if (datePrecision === 'year' && year) {
    return year.toString();
  }

  if (datePrecision === 'full' && date) {
    const dateObj = new Date(date);
    if (lang === 'ar') {
      return dateObj.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return t('unknownDate', lang);
}
