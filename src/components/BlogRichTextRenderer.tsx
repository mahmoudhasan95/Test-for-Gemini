import { useEffect, useRef } from 'react';

interface BlogRichTextRendererProps {
  content: string;
  isRTL?: boolean;
}

export function BlogRichTextRenderer({ content, isRTL = false }: BlogRichTextRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const embedWrappers = contentRef.current.querySelectorAll('[data-html-embed]');
    embedWrappers.forEach((wrapper) => {
      const embedCode = wrapper.getAttribute('data-embed-code');
      const embedContent = wrapper.querySelector('.html-embed-content');

      if (embedCode && embedContent) {
        embedContent.innerHTML = embedCode;

        setTimeout(() => {
          const scripts = embedContent.querySelectorAll('script');
          scripts.forEach((oldScript) => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach((attr) => {
              newScript.setAttribute(attr.name, attr.value);
            });
            if (oldScript.textContent) {
              newScript.textContent = oldScript.textContent;
            }
            oldScript.parentNode?.replaceChild(newScript, oldScript);
          });
        }, 100);
      }
    });

    const footnotes = contentRef.current.querySelectorAll('[data-footnote]');
    if (footnotes.length > 0) {
      const footnotesData: { number: number; text: string }[] = [];

      footnotes.forEach((footnote) => {
        const number = footnote.getAttribute('data-footnote-number');
        const text = footnote.getAttribute('data-footnote-text');
        if (number && text) {
          footnotesData.push({ number: parseInt(number), text });
        }
      });

      if (footnotesData.length > 0) {
        const existingSection = contentRef.current.querySelector('.footnotes-section');
        if (existingSection) {
          existingSection.remove();
        }

        const footnotesSection = document.createElement('div');
        footnotesSection.className = 'footnotes-section';
        footnotesSection.innerHTML = `
          <div class="footnotes-title">${isRTL ? 'المراجع' : 'References'}</div>
          ${footnotesData
            .sort((a, b) => a.number - b.number)
            .map(
              (fn) => `
            <div id="fn-${fn.number}" class="footnote-item">
              <span class="footnote-number">[${fn.number}]</span>
              ${fn.text}
            </div>
          `
            )
            .join('')}
        `;
        contentRef.current.appendChild(footnotesSection);
      }
    }

    const scripts = contentRef.current.querySelectorAll('script:not(.html-embed-content script)');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      if (oldScript.textContent) {
        newScript.textContent = oldScript.textContent;
      }
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [content, isRTL]);

  return (
    <div
      ref={contentRef}
      className={`prose prose-lg max-w-none ${isRTL ? 'prose-rtl' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        wordBreak: 'break-word',
      }}
    />
  );
}
