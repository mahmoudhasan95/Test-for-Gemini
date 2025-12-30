import { useState, useEffect } from 'react';
import { X, Upload, Trash2, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BlogPost, Author, Category, generateExcerpt } from '../utils/blogHelpers';
import { generateUniqueSlug } from '../utils/slugify';
import { BlogRichTextEditor } from './BlogRichTextEditor';

interface BlogPostFormProps {
  post?: BlogPost | null;
  onClose: () => void;
  onSave: () => void;
  onPreview?: (post: Partial<BlogPost>) => void;
}

export function BlogPostForm({ post, onClose, onSave, onPreview }: BlogPostFormProps) {
  const [activeTab, setActiveTab] = useState<'en' | 'ar'>('en');
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    slug: '',
    title_en: '',
    title_ar: '',
    content_en: '',
    content_ar: '',
    featured_image_url: '',
    category_id: '',
    author_id: '',
    published_date: new Date().toISOString().split('T')[0],
    published: false,
    admin_notes: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAuthors();
    loadCategories();
    if (post) {
      setFormData({
        slug: post.slug,
        title_en: post.title_en || '',
        title_ar: post.title_ar || '',
        content_en: post.content_en || '',
        content_ar: post.content_ar || '',
        featured_image_url: post.featured_image_url || '',
        category_id: post.category_id || '',
        author_id: post.author_id || '',
        published_date: post.published_date.split('T')[0],
        published: post.published,
        admin_notes: (post as any).admin_notes || '',
      });
    }
  }, [post]);

  const loadAuthors = async () => {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('name_en');

    if (!error && data) {
      setAuthors(data);
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name_en');

    if (!error && data) {
      setCategories(data);
      if (data.length > 0 && !formData.category_id && !post) {
        setFormData((prev) => ({ ...prev, category_id: data[0].id }));
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Featured image must be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      const { data, error: uploadError } = await supabase.functions.invoke('r2-blog-upload', {
        body: {
          filename: file.name,
          contentType: file.type,
          uploadType: 'featured_image',
        },
      });

      if (uploadError) throw uploadError;

      const uploadResponse = await fetch(data.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      setFormData((prev) => ({ ...prev, featured_image_url: data.publicUrl }));
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title_en?.trim() && !formData.title_ar?.trim()) {
      setError('At least one title (English or Arabic) is required');
      return;
    }

    if (!formData.slug) {
      setError('Slug is required');
      return;
    }

    try {
      setIsSaving(true);

      const cleanContentEn = formData.content_en?.trim() || '';
      const cleanContentAr = formData.content_ar?.trim() || '';

      const excerptEn = cleanContentEn ? generateExcerpt(cleanContentEn) : null;
      const excerptAr = cleanContentAr ? generateExcerpt(cleanContentAr) : null;

      const wordCountEn = cleanContentEn
        ? cleanContentEn.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
        : 0;
      const wordCountAr = cleanContentAr
        ? cleanContentAr.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
        : 0;

      const selectedCategory = categories.find((c) => c.id === formData.category_id);
      if (!selectedCategory) {
        setError('Please select a valid category');
        return;
      }

      const postData = {
        slug: formData.slug,
        title_en: formData.title_en?.trim() || null,
        title_ar: formData.title_ar?.trim() || null,
        content_en: formData.content_en?.trim() || null,
        content_ar: formData.content_ar?.trim() || null,
        excerpt_en: excerptEn,
        excerpt_ar: excerptAr,
        featured_image_url: formData.featured_image_url || null,
        category_id: formData.category_id,
        category_en: selectedCategory.name_en,
        category_ar: selectedCategory.name_ar,
        author_id: formData.author_id || null,
        published_date: formData.published_date,
        published: formData.published,
        admin_notes: formData.admin_notes || null,
        word_count_en: wordCountEn,
        word_count_ar: wordCountAr,
        updated_at: new Date().toISOString(),
      };

      if (post) {
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id);

        if (updateError) throw updateError;
      } else {
        const { data: session } = await supabase.auth.getSession();
        const { error: insertError } = await supabase.from('blog_posts').insert({
          ...postData,
          created_by: session.session?.user?.id || null,
        });

        if (insertError) throw insertError;
      }

      onSave();
      onClose();
    } catch (err: any) {
      console.error('Error saving blog post:', err);
      setError('Failed to save blog post. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSlug = async () => {
    const baseTitle = formData.title_en || formData.title_ar;
    if (!baseTitle) return;

    const slug = await generateUniqueSlug(baseTitle, supabase, post?.id);
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handlePreview = () => {
    if (onPreview) {
      const excerptEn = formData.content_en ? generateExcerpt(formData.content_en) : null;
      const excerptAr = formData.content_ar ? generateExcerpt(formData.content_ar) : null;

      const author = authors.find((a) => a.id === formData.author_id);
      const category = categories.find((c) => c.id === formData.category_id);

      onPreview({
        slug: formData.slug,
        title_en: formData.title_en || null,
        title_ar: formData.title_ar || null,
        content_en: formData.content_en || null,
        content_ar: formData.content_ar || null,
        excerpt_en: excerptEn,
        excerpt_ar: excerptAr,
        featured_image_url: formData.featured_image_url || null,
        category_id: formData.category_id || null,
        category_en: category?.name_en || '',
        category_ar: category?.name_ar || '',
        published_date: formData.published_date,
        published: formData.published,
        authors: author,
        blog_categories: category,
      } as BlogPost);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {post ? 'Edit Blog Post' : 'Create Blog Post'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Language Selection:</strong> Only fill in the languages you want to publish.
                {!formData.title_en?.trim() && !formData.title_ar?.trim() && (
                  <span className="text-red-600 font-semibold"> At least one language is required.</span>
                )}
                {formData.title_en?.trim() && !formData.title_ar?.trim() && (
                  <span> This post will only appear in the English blog.</span>
                )}
                {!formData.title_en?.trim() && formData.title_ar?.trim() && (
                  <span> This post will only appear in the Arabic blog.</span>
                )}
                {formData.title_en?.trim() && formData.title_ar?.trim() && (
                  <span className="text-green-700"> This post will appear in both language blogs.</span>
                )}
              </p>
            </div>

            <div className="flex gap-2 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('en')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'en'
                    ? 'text-primary-accent border-b-2 border-primary-accent'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                English Content
                {formData.title_en?.trim() && <span className="ml-2 text-green-600">✓</span>}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ar')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'ar'
                    ? 'text-primary-accent border-b-2 border-primary-accent'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Arabic Content
                {formData.title_ar?.trim() && <span className="ml-2 text-green-600">✓</span>}
              </button>
            </div>
          </div>

          {activeTab === 'en' ? (
            <div className="space-y-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (English)
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title_en: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                  placeholder="Enter post title in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content (English)
                </label>
                <BlogRichTextEditor
                  key="editor-en"
                  content={formData.content_en}
                  onChange={(content) => setFormData((prev) => ({ ...prev, content_en: content }))}
                  placeholder="Start writing your post in English..."
                  isRTL={false}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (Arabic)
                </label>
                <input
                  type="text"
                  value={formData.title_ar}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title_ar: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                  dir="rtl"
                  placeholder="أدخل عنوان المقال بالعربية"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content (Arabic)
                </label>
                <BlogRichTextEditor
                  key="editor-ar"
                  content={formData.content_ar}
                  onChange={(content) => setFormData((prev) => ({ ...prev, content_ar: content }))}
                  placeholder="ابدأ بكتابة المقال بالعربية..."
                  isRTL={true}
                />
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Post Settings</h3>

            <div className="admin-notes-field p-4">
              <label className="block text-sm admin-notes-label mb-2">
                Admin Notes (Not visible on public site)
              </label>
              <textarea
                value={formData.admin_notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, admin_notes: e.target.value }))}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                rows={3}
                placeholder="Internal notes for editors and admins only..."
              />
              <p className="text-xs text-amber-700 mt-1">
                These notes are for internal use only and will never be displayed on the public website.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              {formData.featured_image_url ? (
                <div className="relative inline-block">
                  <img
                    src={formData.featured_image_url}
                    alt="Featured"
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, featured_image_url: '' }))}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (URL) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGenerateSlug}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name_en} / {category.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <select
                  value={formData.author_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, author_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                >
                  <option value="">No author</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name_en} / {author.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Published Date *
                </label>
                <input
                  type="date"
                  value={formData.published_date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, published_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
                  className="w-4 h-4 text-primary-accent border-gray-300 rounded focus:ring-primary-accent"
                />
                <span className="text-sm font-medium text-gray-700">
                  Publish immediately
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-between gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={handlePreview}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-primary-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : formData.published ? 'Publish' : 'Save Draft'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
