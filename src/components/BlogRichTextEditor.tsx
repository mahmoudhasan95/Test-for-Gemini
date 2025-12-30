import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Heading1, Heading2, Heading3,
  Undo, Redo, Image as ImageIcon, Link as LinkIcon, Minus, Code, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, Quote, Sparkles, RemoveFormatting, Type, FileText, Languages
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { HtmlEmbed } from './HtmlEmbed';
import { PullQuote } from './extensions/PullQuote';
import { Footnote } from './extensions/Footnote';
import { ImageWithCaption } from './extensions/ImageWithCaption';

interface BlogRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  isRTL?: boolean;
}

export function BlogRichTextEditor({ content, onChange, placeholder, isRTL = false }: BlogRichTextEditorProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageData, setImageData] = useState({ file: null as File | null, alt: '', caption: '' });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        blockquote: true,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      CharacterCount,
      Highlight.configure({
        multicolor: false,
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
      HtmlEmbed,
      PullQuote,
      Footnote,
      ImageWithCaption,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] p-4 editor-content',
        dir: isRTL ? 'rtl' : 'ltr',
      },
    },
  });

  const handleImageUpload = async () => {
    setShowImageDialog(true);
  };

  const handleImageDialogSubmit = async () => {
    if (!imageData.file) return;

    if (imageData.file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    try {
      setIsUploadingImage(true);

      const { data, error } = await supabase.functions.invoke('r2-blog-upload', {
        body: {
          filename: imageData.file.name,
          contentType: imageData.file.type,
          uploadType: 'content_image',
        },
      });

      if (error) throw error;

      const uploadResponse = await fetch(data.presignedUrl, {
        method: 'PUT',
        body: imageData.file,
        headers: {
          'Content-Type': imageData.file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      if (editor) {
        if (imageData.caption || imageData.alt) {
          editor.chain().focus().setImageWithCaption({
            src: data.publicUrl,
            alt: imageData.alt,
            caption: imageData.caption,
          }).run();
        } else {
          editor.chain().focus().setImage({ src: data.publicUrl, alt: imageData.alt }).run();
        }
      }

      setShowImageDialog(false);
      setImageData({ file: null, alt: '', caption: '' });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSetLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }
      editor
        .chain()
        .focus()
        .setLink({ href: formattedUrl })
        .command(({ tr, state }) => {
          const { selection } = state;
          tr.setSelection(state.selection);
          tr.removeStoredMark(state.schema.marks.link);
          return true;
        })
        .run();
    }
  };

  const handleInsertEmbed = () => {
    const embedCode = window.prompt('Paste HTML embed code (YouTube, Twitter, Facebook, SoundCloud, etc):');
    if (embedCode && editor) {
      editor.chain().focus().insertContent({
        type: 'htmlEmbed',
        attrs: {
          embedCode: embedCode,
        },
      }).run();
    }
  };

  const handleInsertFootnote = () => {
    const text = window.prompt('Enter footnote text:');
    if (text && editor) {
      editor.chain().focus().setFootnote(text).run();
    }
  };

  const handleToggleDirection = () => {
    if (!editor) return;
    const currentDir = editor.getAttributes('paragraph').dir || (isRTL ? 'rtl' : 'ltr');
    const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
    editor.chain().focus().updateAttributes('paragraph', { dir: newDir }).run();
  };

  if (!editor) {
    return null;
  }

  const wordCount = editor?.storage.characterCount?.words() || 0;
  const charCount = editor?.storage.characterCount?.characters() || 0;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 bg-gray-50">
        {/* Text Formatting Section */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('paragraph') ? 'bg-gray-300' : ''}`}
          title="Paragraph (Ctrl+Alt+0)"
        >
          <Type className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-300' : ''}`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          className="p-2 rounded hover:bg-gray-200"
          title="Clear Formatting (Ctrl+Shift+X)"
        >
          <RemoveFormatting className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Headings Section */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''}`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Text Alignment Section */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''}`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''}`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''}`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-300' : ''}`}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Quotes Section */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-300' : ''}`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().togglePullQuote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('pullQuote') ? 'bg-gray-300' : ''}`}
          title="Pull Quote"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Lists Section */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
          title="Bullet List (Ctrl+Shift+8)"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
          title="Numbered List (Ctrl+Shift+7)"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Links and Code Section */}
        <button
          type="button"
          onClick={handleSetLink}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-300' : ''}`}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('code') ? 'bg-gray-300' : ''}`}
          title="Inline Code (Ctrl+E)"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Media Section */}
        <button
          type="button"
          onClick={handleImageUpload}
          disabled={isUploadingImage}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
          title="Upload Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* Advanced Section */}
        <button
          type="button"
          onClick={handleInsertFootnote}
          className="p-2 rounded hover:bg-gray-200"
          title="Insert Footnote"
        >
          <FileText className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-gray-200"
          title="Horizontal Line"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleInsertEmbed}
          className="p-2 rounded hover:bg-gray-200"
          title="Embed HTML (YouTube, Twitter, etc)"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleToggleDirection}
          className="p-2 rounded hover:bg-gray-200"
          title="Toggle Text Direction (RTL/LTR)"
        >
          <Languages className="w-4 h-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* History Section */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>
      <EditorContent editor={editor} />

      {/* Word Count Display */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t border-gray-300 bg-gray-50">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        {isUploadingImage && (
          <span className="text-blue-600">Uploading image...</span>
        )}
      </div>

      {/* Image Upload Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Upload Image</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image File *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageData((prev) => ({ ...prev, file }));
                    }
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alt Text (for accessibility)
                </label>
                <input
                  type="text"
                  value={imageData.alt}
                  onChange={(e) => setImageData((prev) => ({ ...prev, alt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                  placeholder="Describe the image"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  value={imageData.caption}
                  onChange={(e) => setImageData((prev) => ({ ...prev, caption: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-accent focus:border-transparent"
                  placeholder="Image caption"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowImageDialog(false);
                  setImageData({ file: null, alt: '', caption: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImageDialogSubmit}
                disabled={!imageData.file || isUploadingImage}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isUploadingImage ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
