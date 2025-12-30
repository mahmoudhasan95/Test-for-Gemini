import { Node, mergeAttributes } from '@tiptap/core';

export interface FootnoteOptions {
  HTMLAttributes: Record<string, any>;
}

export const Footnote = Node.create<FootnoteOptions>({
  name: 'footnote',

  group: 'inline',

  inline: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      text: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-footnote-text'),
        renderHTML: (attributes) => {
          if (!attributes.text) {
            return {};
          }
          return {
            'data-footnote-text': attributes.text,
          };
        },
      },
      number: {
        default: 1,
        parseHTML: (element) => parseInt(element.getAttribute('data-footnote-number') || '1'),
        renderHTML: (attributes) => {
          return {
            'data-footnote-number': attributes.number,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'sup[data-footnote]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'sup',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-footnote': '',
        class: 'footnote-ref',
      }),
      ['a', { href: `#fn-${node.attrs.number}`, class: 'footnote-link' }, `[${node.attrs.number}]`],
    ];
  },

  addCommands() {
    return {
      setFootnote:
        (text: string) =>
        ({ commands, state }) => {
          const footnotes = state.doc.descendants((node) => {
            return node.type.name === 'footnote';
          });
          const nextNumber = footnotes ? footnotes + 1 : 1;

          return commands.insertContent({
            type: this.name,
            attrs: {
              text,
              number: nextNumber,
            },
          });
        },
    };
  },
});
