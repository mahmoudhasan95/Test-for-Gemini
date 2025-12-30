import { useState, useEffect } from 'react';
import { X, Eye, Edit3, Upload } from 'lucide-react';
import { supabase, AudioEntry } from '../lib/supabase';
import { COUNTRIES } from '../utils/countries';
import { formatDate } from '../utils/translations';
import { WaveformPlayer } from './WaveformPlayer';
import { useAuth } from '../contexts/AuthContext';

type AudioEntryFormProps = {
  entry?: AudioEntry | null;
  onClose: () => void;
  onSave: () => void;
};

export function AudioEntryForm({ entry, onClose, onSave }: AudioEntryFormProps) {
  const { user } = useAuth();
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    title_ar: '',
    description_ar: '',
    audio_url: '',
    licence: '',
    category: '',
    category_ar: '',
    location: '',
    location_ar: '',
    date: new Date().toISOString().split('T')[0],
    date_precision: 'full' as 'unknown' | 'year' | 'full',
    year: null as number | null,
    featured: false,
    notes: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagsAr, setTagsAr] = useState<string[]>([]);
  const [tagInputAr, setTagInputAr] = useState('');

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title,
        description: entry.description,
        title_ar: entry.title_ar || '',
        description_ar: entry.description_ar || '',
        audio_url: entry.audio_url,
        licence: entry.licence || '',
        category: entry.category,
        category_ar: entry.category_ar || '',
        location: entry.location || '',
        location_ar: entry.location_ar || '',
        date: entry.date || new Date().toISOString().split('T')[0],
        date_precision: entry.date_precision || 'full',
        year: entry.year || null,
        featured: entry.featured,
        notes: entry.notes || '',
      });
      setTags(entry.tags || []);
      setTagsAr(entry.tags_ar || []);
    }
  }, [entry]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setError('Please select an audio file');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  }

  async function deleteFileFromR2(fileUrl: string) {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/r2-upload`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileUrl }),
        }
      );

      if (!response.ok) {
        console.error('Failed to delete old file from R2');
      }
    } catch (error) {
      console.error('Error deleting old file from R2:', error);
    }
  }

  async function uploadToR2(file: File): Promise<string> {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/r2-upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const { presignedUrl, publicUrl } = await response.json();

      setUploadProgress(30);

      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to R2');
      }

      setUploadProgress(100);
      return publicUrl;
    } finally {
      setIsUploading(false);
    }
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  }

  function removeTag(tagToRemove: string) {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  }

  function handleTagArKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && tagInputAr.trim()) {
      e.preventDefault();
      const newTag = tagInputAr.trim();
      if (!tagsAr.includes(newTag)) {
        setTagsAr([...tagsAr, newTag]);
      }
      setTagInputAr('');
    }
  }

  function removeTagAr(tagToRemove: string) {
    setTagsAr(tagsAr.filter((tag) => tag !== tagToRemove));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let audioUrl = formData.audio_url;

      if (selectedFile) {
        if (entry?.audio_url) {
          await deleteFileFromR2(entry.audio_url);
        }
        audioUrl = await uploadToR2(selectedFile);
      } else if (!entry && !audioUrl) {
        throw new Error('Please upload an audio file');
      }

      const dataToSave = {
        title: formData.title,
        description: formData.description,
        title_ar: formData.title_ar,
        description_ar: formData.description_ar,
        audio_url: audioUrl,
        licence: formData.licence,
        category: formData.category,
        category_ar: formData.category_ar,
        location: formData.location,
        location_ar: formData.location_ar,
        tags: tags,
        tags_ar: tagsAr,
        date_precision: formData.date_precision,
        date: formData.date_precision === 'full' ? formData.date : null,
        year: formData.date_precision === 'year' ? formData.year : null,
        featured: formData.featured,
        notes: formData.notes,
      };

      if (entry) {
        const { error: updateError } = await supabase
          .from('audio_entries2')
          .update(dataToSave)
          .eq('id', entry.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('audio_entries2')
          .insert([{ ...dataToSave, uploaded_by: user?.id }]);

        if (insertError) throw insertError;
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  const previewEntry: AudioEntry = {
    id: entry?.id || 'preview',
    title: formData.title || 'Untitled',
    description: formData.description,
    title_ar: formData.title_ar,
    description_ar: formData.description_ar,
    audio_url: formData.audio_url,
    licence: formData.licence,
    category: formData.category,
    category_ar: formData.category_ar,
    location: formData.location,
    location_ar: formData.location_ar,
    tags: tags,
    tags_ar: tagsAr,
    date: formData.date_precision === 'full' ? formData.date : null,
    date_precision: formData.date_precision,
    year: formData.date_precision === 'year' ? formData.year : null,
    featured: formData.featured,
    display_order: entry?.display_order || null,
    notes: formData.notes,
    created_at: entry?.created_at || new Date().toISOString(),
    updated_at: entry?.updated_at || new Date().toISOString(),
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-gray-900">
            {entry ? 'Edit Entry' : 'New Entry'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsPreview(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                !isPreview
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setIsPreview(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isPreview
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {error}
            </div>
          )}

          {isPreview ? (
            <div>
              <div className="mb-4 p-3 bg-cyan-50 border border-cyan-200 text-accent-deep text-sm rounded">
                Preview of how your audio entry will appear in both languages.
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">English Version</h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {previewEntry.audio_url && (
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100">
                        <WaveformPlayer
                          audioUrl={previewEntry.audio_url}
                          height={60}
                          showPlayButton={true}
                          compact={false}
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h4 className="text-xl font-medium text-gray-900 mb-2">
                        {previewEntry.title || 'Untitled'}
                      </h4>
                      {previewEntry.description && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                          {previewEntry.description}
                        </p>
                      )}
                      {previewEntry.licence && (
                        <div className="mb-3 text-xs">
                          <span className="font-medium text-gray-700">Licence: </span>
                          <span className="text-gray-600">{previewEntry.licence}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mb-3">
                        {previewEntry.category && (
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            {previewEntry.category}
                          </span>
                        )}
                        {previewEntry.location && (
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            {previewEntry.location}
                          </span>
                        )}
                        <span>
                          {formatDate(previewEntry.date_precision, previewEntry.date, previewEntry.year, 'en')}
                        </span>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Arabic Version</h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" dir="rtl">
                    {previewEntry.audio_url && (
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100">
                        <WaveformPlayer
                          audioUrl={previewEntry.audio_url}
                          height={60}
                          showPlayButton={true}
                          compact={false}
                        />
                      </div>
                    )}
                    <div className="p-5" style={{ fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}>
                      <h4 className="text-xl font-medium text-gray-900 mb-2">
                        {previewEntry.title_ar || previewEntry.title || 'بدون عنوان'}
                      </h4>
                      {(previewEntry.description_ar || previewEntry.description) && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                          {previewEntry.description_ar || previewEntry.description}
                        </p>
                      )}
                      {previewEntry.licence && (
                        <div className="mb-3 text-xs">
                          <span className="font-medium text-gray-700">الرخصة: </span>
                          <span className="text-gray-600">{previewEntry.licence}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mb-3">
                        {(previewEntry.category_ar || previewEntry.category) && (
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            {previewEntry.category_ar || previewEntry.category}
                          </span>
                        )}
                        {(previewEntry.location_ar || previewEntry.location) && (
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            {previewEntry.location_ar || previewEntry.location}
                          </span>
                        )}
                        <span>
                          {formatDate(previewEntry.date_precision, previewEntry.date, previewEntry.year, 'ar')}
                        </span>
                      </div>
                      {tagsAr.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tagsAr.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title (English) *
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="title_ar" className="block text-sm font-medium text-gray-700 mb-2">
                      Title (Arabic)
                    </label>
                    <input
                      id="title_ar"
                      name="title_ar"
                      type="text"
                      value={formData.title_ar}
                      onChange={handleChange}
                      dir="rtl"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none font-arabic"
                      style={{ fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="audio_file"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Upload Audio File *
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          selectedFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          <Upload className={`w-8 h-8 mx-auto mb-2 ${selectedFile ? 'text-green-600' : 'text-gray-400'}`} />
                          {selectedFile ? (
                            <div>
                              <p className="text-sm font-medium text-green-600">{selectedFile.name}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          ) : entry?.audio_url ? (
                            <div>
                              <p className="text-sm text-gray-600">Current file uploaded</p>
                              <p className="text-xs text-gray-500 mt-1">Choose a new file to replace</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-gray-600">Click to select audio file</p>
                              <p className="text-xs text-gray-500 mt-1">Supports MP3, WAV, OGG, and other audio formats</p>
                            </div>
                          )}
                        </div>
                        <input
                          id="audio_file"
                          type="file"
                          accept="audio/*"
                          onChange={handleFileChange}
                          className="hidden"
                          required={!entry && !formData.audio_url}
                        />
                      </label>
                    </div>
                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Uploading...</span>
                          <span className="text-gray-900 font-medium">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Description (English)
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description_ar"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Description (Arabic)
                    </label>
                    <textarea
                      id="description_ar"
                      name="description_ar"
                      value={formData.description_ar}
                      onChange={handleChange}
                      rows={4}
                      dir="rtl"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none resize-none"
                      style={{ fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="licence" className="block text-sm font-medium text-gray-700 mb-2">
                    Licence & Credit
                  </label>
                  <input
                    id="licence"
                    name="licence"
                    type="text"
                    value={formData.licence}
                    onChange={handleChange}
                    placeholder="e.g., CC BY-SA 4.0, Attribution required"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category (English)
                    </label>
                    <input
                      id="category"
                      name="category"
                      type="text"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="e.g., podcast, interview, lecture"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="category_ar" className="block text-sm font-medium text-gray-700 mb-2">
                      Category (Arabic)
                    </label>
                    <input
                      id="category_ar"
                      name="category_ar"
                      type="text"
                      value={formData.category_ar}
                      onChange={handleChange}
                      dir="rtl"
                      placeholder="مثال: بودكاست، مقابلة، محاضرة"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none"
                      style={{ fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location (English)
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Syria"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="location_ar" className="block text-sm font-medium text-gray-700 mb-2">
                      Location (Arabic)
                    </label>
                    <input
                      id="location_ar"
                      name="location_ar"
                      type="text"
                      value={formData.location_ar}
                      onChange={handleChange}
                      dir="rtl"
                      placeholder="مثال: سوريا"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none"
                      style={{ fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="date_precision" className="block text-sm font-medium text-gray-700 mb-2">
                    Date Information
                  </label>
                  <select
                    id="date_precision"
                    name="date_precision"
                    value={formData.date_precision}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none mb-3"
                  >
                    <option value="unknown">Unknown Date (تاريخ غير معروف)</option>
                    <option value="year">Year Only (السنة فقط)</option>
                    <option value="full">Full Date (التاريخ الكامل)</option>
                  </select>

                  {formData.date_precision === 'year' && (
                    <input
                      id="year"
                      name="year"
                      type="number"
                      placeholder="e.g., 1995"
                      value={formData.year || ''}
                      onChange={handleChange}
                      min="1900"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none"
                    />
                  )}

                  {formData.date_precision === 'full' && (
                    <input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (English)
                    </label>
                    <div className="space-y-2">
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <input
                        id="tags"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Type a tag and press Enter"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Type a tag and press Enter to add</p>
                  </div>

                  <div>
                    <label htmlFor="tags_ar" className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (Arabic)
                    </label>
                    <div className="space-y-2">
                      {tagsAr.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tagsAr.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                              style={{ fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTagAr(tag)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <input
                        id="tags_ar"
                        type="text"
                        value={tagInputAr}
                        onChange={(e) => setTagInputAr(e.target.value)}
                        onKeyDown={handleTagArKeyDown}
                        dir="rtl"
                        placeholder="اكتب وسمًا واضغط إدخال"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none"
                        style={{ fontFamily: 'IBM Plex Sans Arabic, sans-serif' }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500" style={{ fontFamily: 'IBM Plex Sans Arabic, sans-serif' }} dir="rtl">اكتب وسمًا واضغط إدخال للإضافة</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="featured"
                    name="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-400"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    Featured (Pin to homepage)
                  </label>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Notes (Admin Only)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Private notes for internal use only (not visible on website)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none resize-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    These notes are only visible to admins and will not appear on the public website.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : entry ? 'Update' : 'Publish'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
