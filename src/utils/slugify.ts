export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\u0600-\u06FF]/g, (match) => {
      const arabicToLatin: { [key: string]: string } = {
        'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'a',
        'ب': 'b', 'ت': 't', 'ث': 'th',
        'ج': 'j', 'ح': 'h', 'خ': 'kh',
        'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
        'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd',
        'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh',
        'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l',
        'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w',
        'ي': 'y', 'ى': 'a', 'ة': 'h', 'ئ': 'e',
        'ء': 'a', 'ؤ': 'o'
      };
      return arabicToLatin[match] || match;
    })
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function generateUniqueSlug(
  baseSlug: string,
  supabase: any,
  currentPostId?: string
): Promise<string> {
  let slug = slugify(baseSlug);
  let counter = 1;

  while (true) {
    const query = supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug);

    if (currentPostId) {
      query.neq('id', currentPostId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error checking slug uniqueness:', error);
      return slug;
    }

    if (!data) {
      return slug;
    }

    slug = `${slugify(baseSlug)}-${counter}`;
    counter++;
  }
}
