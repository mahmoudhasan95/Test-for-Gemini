import { useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Author } from '../utils/blogHelpers';

interface AuthorFormProps {
  author?: Author | null;
  onClose: () => void;
  onSave: () => void;
}

export function AuthorForm({ author, onClose, onSave }: AuthorFormProps) {
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    bio_en: '',
    bio_ar: '',
    email: '',
    profile_image_url: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (author) {
      setFormData({
        name_en: author.name_en,
        name_ar: author.name_ar,
        bio_en: author.bio_en || '',
        bio_ar: author.bio_ar || '',
        email: author.email || '',
        profile_image_url: author.profile_image_url || '',
      });
    }
  }, [author]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Profile photo must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      const { data, error: uploadError } = await supabase.functions.invoke('r2-blog-upload', {
        body: {
          filename: file.name,
          contentType: file.type,
          uploadType: 'author_profile',
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

      setFormData((prev) => ({ ...prev, profile_image_url: data.publicUrl }));
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profile_image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name_en || !formData.name_ar) {
      setError('Name in both English and Arabic is required');
      return;
    }

    try {
      setIsSaving(true);

      if (author) {
        const { error: updateError } = await supabase
          .from('authors')
          .update({
            name_en: formData.name_en,
            name_ar: formData.name_ar,
            bio_en: formData.bio_en || null,
            bio_ar: formData.bio_ar || null,
            email: formData.email || null,
            profile_image_url: formData.profile_image_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', author.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('authors').insert({
          name_en: formData.name_en,
          name_ar: formData.name_ar,
          bio_en: formData.bio_en || null,
          bio_ar: formData.bio_ar || null,
          email: formData.email || null,
          profile_image_url: formData.profile_image_url || null,
        });

        if (insertError) throw insertError;
      }

      onSave();
      onClose();
    } catch (err: any) {
      console.error('Error saving author:', err);
      setError('Failed to save author. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {author ? 'Edit Author' : 'Add Author'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              {formData.profile_image_url ? (
                <div className="relative">
                  <img
                    src={formData.profile_image_url}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 200x200px, max 5MB
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (English) *
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData((prev) => ({ ...prev, name_en: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name (Arabic) *
              </label>
              <input
                type="text"
                value={formData.name_ar}
                onChange={(e) => setFormData((prev) => ({ ...prev, name_ar: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                dir="rtl"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio (English)
            </label>
            <textarea
              value={formData.bio_en}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio_en: e.target.value }))}
              rows={3}
              maxLength={300}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
              placeholder="Short biography (max 300 characters)"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio_en.length}/300 characters
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio (Arabic)
            </label>
            <textarea
              value={formData.bio_ar}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio_ar: e.target.value }))}
              rows={3}
              maxLength={300}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
              dir="rtl"
              placeholder="سيرة ذاتية قصيرة (بحد أقصى 300 حرف)"
            />
            <p className="text-xs text-gray-500 mt-1" dir="rtl">
              {formData.bio_ar.length}/300 حرف
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
              placeholder="author@example.com"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
              {isSaving ? 'Saving...' : 'Save Author'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
