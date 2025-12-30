import { Node, mergeAttributes } from '@tiptap/core';

export interface PullQuoteOptions {
  HTMLAttributes: Record<string, any>;
}

export const PullQuote = Node.create<PullQuoteOptions>({
  name: 'pullQuote',

  group: 'block',

  content: 'inline*',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-pull-quote]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-pull-quote': '',
        class: 'pull-quote',
      }),
      ['p', { class: 'pull-quote-content' }, 0],
    ];
  },

  addCommands() {
    return {
      setPullQuote:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name);
        },
      togglePullQuote:
        () =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph');
        },
    };
  },
});
