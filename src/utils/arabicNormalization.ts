export function normalizeArabicAlef(text: string): string {
  if (!text) return text;

  return text
    .replace(/أ/g, 'ا')
    .replace(/إ/g, 'ا')
    .replace(/آ/g, 'ا');
}
