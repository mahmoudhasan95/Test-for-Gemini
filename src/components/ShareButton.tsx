import { useState } from 'react';
import { Share2, Facebook, Linkedin, Link2, Check, Instagram } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title: string;
  lang: 'en' | 'ar';
}

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export function ShareButton({ url, title, lang }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const isArabic = lang === 'ar';

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: isArabic ? 'إكس' : 'X',
      icon: XIcon,
      url: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
      color: 'hover:bg-gray-100 hover:text-gray-900'
    },
    {
      name: isArabic ? 'فيسبوك' : 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      color: 'hover:bg-blue-50 hover:text-blue-700'
    },
    {
      name: isArabic ? 'إنستغرام' : 'Instagram',
      icon: Instagram,
      url: `https://www.instagram.com/`,
      color: 'hover:bg-pink-50 hover:text-pink-600'
    },
    {
      name: isArabic ? 'لينكد إن' : 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      color: 'hover:bg-blue-50 hover:text-blue-800'
    },
    {
      name: isArabic ? 'واتساب' : 'WhatsApp',
      icon: WhatsAppIcon,
      url: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
      color: 'hover:bg-green-50 hover:text-green-600'
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-accent to-accent-hover text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${
          isArabic ? 'flex-row-reverse' : ''
        }`}
      >
        <Share2 className="w-4 h-4 transition-transform group-hover:rotate-12" />
        <span className="font-medium">
          {isArabic ? 'مشاركة' : 'Share'}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute z-50 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 space-y-2 ${
              isArabic ? 'left-0' : 'right-0'
            } animate-in fade-in slide-in-from-top-2 duration-200`}
          >
            <div className={`text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 ${isArabic ? 'text-right' : 'text-left'}`}>
              {isArabic ? 'مشاركة عبر' : 'Share via'}
            </div>

            {shareLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleShare(link.url)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${link.color} ${
                  isArabic ? 'flex-row-reverse text-right' : 'text-left'
                }`}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{link.name}</span>
              </button>
            ))}

            <div className={`pt-2 border-t border-gray-100 ${isArabic ? 'text-right' : 'text-left'}`}>
              <button
                onClick={handleCopyLink}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                  copied ? 'bg-green-50 text-green-600' : 'text-gray-700'
                } ${isArabic ? 'flex-row-reverse' : ''}`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">
                      {isArabic ? 'تم النسخ!' : 'Copied!'}
                    </span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">
                      {isArabic ? 'نسخ الرابط' : 'Copy link'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
