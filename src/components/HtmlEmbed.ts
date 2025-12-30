import { Node, mergeAttributes } from '@tiptap/core';

export interface HtmlEmbedOptions {
  HTMLAttributes: Record<string, any>;
}

export const HtmlEmbed = Node.create<HtmlEmbedOptions>({
  name: 'htmlEmbed',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      embedCode: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-embed-code'),
        renderHTML: (attributes) => {
          if (!attributes.embedCode) {
            return {};
          }
          return {
            'data-embed-code': attributes.embedCode,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-html-embed]',
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-html-embed': '',
        'data-embed-code': node.attrs.embedCode,
        class: 'html-embed-wrapper my-6',
      }),
      [
        'div',
        {
          class: 'html-embed-content',
        },
      ],
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.classList.add('html-embed-wrapper', 'not-prose');
      dom.setAttribute('data-html-embed', '');
      dom.setAttribute('data-embed-code', node.attrs.embedCode || '');

      const container = document.createElement('div');
      container.classList.add('html-embed-content');

      if (node.attrs.embedCode) {
        container.innerHTML = node.attrs.embedCode;

        setTimeout(() => {
          const scripts = container.querySelectorAll('script');
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
      } else {
        container.innerHTML = '<p class="text-gray-400 text-center py-8">Click to add embed code</p>';
      }

      dom.appendChild(container);

      return {
        dom,
      };
    };
  },
});
