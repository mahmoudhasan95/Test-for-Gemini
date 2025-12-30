import { Node, mergeAttributes } from '@tiptap/core';

export interface ImageWithCaptionOptions {
  HTMLAttributes: Record<string, any>;
}

export const ImageWithCaption = Node.create<ImageWithCaptionOptions>({
  name: 'imageWithCaption',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => {
          const img = element.querySelector('img');
          return img?.getAttribute('src');
        },
        renderHTML: (attributes) => {
          if (!attributes.src) {
            return {};
          }
          return {};
        },
      },
      alt: {
        default: '',
        parseHTML: (element) => {
          const img = element.querySelector('img');
          return img?.getAttribute('alt') || '';
        },
        renderHTML: (attributes) => {
          return {};
        },
      },
      caption: {
        default: '',
        parseHTML: (element) => {
          const caption = element.querySelector('figcaption');
          return caption?.textContent || '';
        },
        renderHTML: (attributes) => {
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-image-with-caption]',
      },
    ];
  },

  renderHTML({ node }) {
    const elements: any[] = [
      'figure',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-image-with-caption': '',
        class: 'image-with-caption',
      }),
      [
        'img',
        {
          src: node.attrs.src,
          alt: node.attrs.alt || '',
          class: 'max-w-full h-auto rounded-lg',
        },
      ],
    ];

    if (node.attrs.caption) {
      elements.push(['figcaption', { class: 'image-caption' }, node.attrs.caption]);
    }

    return elements;
  },

  addCommands() {
    return {
      setImageWithCaption:
        (options: { src: string; alt?: string; caption?: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
