import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { InfoCardView } from './InfoCardView';

/**
 * InfoCard tiptap node — inserts a coloured callout (Note / Important / Tip /
 * Expert Insight / Best Practice / Key Takeaway) directly inside the rich
 * text block. Body is editable inline (inline*). Visual styling is applied
 * via `data-info-card` attribute and global CSS (see src/index.css).
 */
export type InfoCardKind =
  | 'note'
  | 'important'
  | 'tip'
  | 'expert-insight'
  | 'best-practice'
  | 'key-takeaway';

export const INFO_CARD_KINDS: { id: InfoCardKind; label: string; placeholder: string }[] = [
  { id: 'note', label: 'Note', placeholder: 'Add a note learners should keep in mind…' },
  { id: 'important', label: 'Important', placeholder: 'Highlight a critical warning or caveat…' },
  { id: 'tip', label: 'Tip', placeholder: 'Share a helpful tip or shortcut…' },
  { id: 'expert-insight', label: 'Expert Insight', placeholder: 'Add commentary from a subject-matter expert…' },
  { id: 'best-practice', label: 'Best Practice', placeholder: 'Describe the recommended way to do this…' },
  { id: 'key-takeaway', label: 'Key Takeaway', placeholder: 'Summarise the key point to remember…' },
];

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    infoCard: {
      insertInfoCard: (kind: InfoCardKind) => ReturnType;
    };
  }
}

export const InfoCardNode = Node.create({
  name: 'infoCard',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      kind: {
        default: 'note',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-info-card') || 'note',
        renderHTML: (attrs) => ({ 'data-info-card': attrs.kind }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-info-card]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { class: 'rte-info-card' }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InfoCardView);
  },

  addCommands() {
    return {
      insertInfoCard:
        (kind: InfoCardKind) =>
        ({ chain }) => {
          const preset = INFO_CARD_KINDS.find((k) => k.id === kind) ?? INFO_CARD_KINDS[0];
          return chain()
            .focus()
            .insertContent({
              type: this.name,
              attrs: { kind },
              content: [{ type: 'text', text: preset.placeholder }],
            })
            .run();
        },
    };
  },
});
