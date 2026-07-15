import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { InfoCardView } from './InfoCardView';
import { getInfoCardPreset, INFO_CARD_PRESETS, type InfoCardKind } from './infoCardPresets';

export type { InfoCardKind };
export const INFO_CARD_KINDS = INFO_CARD_PRESETS.map((p) => ({
  id: p.id,
  label: p.label,
  placeholder: p.placeholder,
}));

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    infoCard: {
      insertInfoCard: (kind: InfoCardKind) => ReturnType;
    };
  }
}

/**
 * InfoCard tiptap node. renderHTML emits inline-styled markup identical to
 * the React NodeView so the sanitized preview looks pixel-identical to the
 * editor. `style` must be allowed by src/lib/sanitize.ts.
 */
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

  renderHTML({ HTMLAttributes, node }) {
    const preset = getInfoCardPreset(node.attrs.kind);
    const wrapperStyle = `margin:12px 0`;
    const cardStyle = [
      'position:relative',
      'display:flex',
      'gap:16px',
      'align-items:flex-start',
      'border-radius:18px',
      'padding:16px 20px',
      `border:1px solid ${preset.border}`,
      `background:linear-gradient(135deg, ${preset.bg} 0%, hsl(0 0% 100% / 0.35) 100%), ${preset.bg}`,
      'box-shadow:0 1px 2px rgba(15,23,42,0.04),0 10px 28px -18px rgba(15,23,42,0.18)',
    ].join(';');
    const foldWrap = `position:absolute;top:0;right:0;width:40px;height:40px;border-top-right-radius:17px;overflow:hidden;pointer-events:none`;
    const foldUnder = `position:absolute;inset:0;clip-path:polygon(0 0,100% 0,100% 100%);background:radial-gradient(120% 120% at 100% 0%, transparent 55%, ${preset.accent} 100%);opacity:0.14;transform:translate(-2px,2px);filter:blur(2px)`;
    const foldFace = `position:absolute;inset:0;clip-path:polygon(0 0,100% 0,100% 100%);background-image:linear-gradient(215deg, ${preset.fold} 0%, hsl(0 0% 100% / 0.9) 100%)`;
    const foldCrease = `position:absolute;inset:0;clip-path:polygon(0 0,100% 0,100% 100%);background:linear-gradient(225deg, transparent calc(50% - 0.75px), ${preset.accent} 50%, transparent calc(50% + 0.75px));opacity:0.35`;
    const medStyle = [
      'flex-shrink:0',
      'width:40px',
      'height:40px',
      'border-radius:9999px',
      `background:${preset.iconSvg} center/20px 20px no-repeat, linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(0 0% 100% / 0.85) 100%)`,
      `box-shadow:inset 0 0 0 1px ${preset.border}, 0 1px 2px rgba(15,23,42,0.06), 0 4px 10px -6px ${preset.accent}`,
    ].join(';');
    const mainStyle = `min-width:0;flex:1`;
    const labelStyle = `font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:${preset.accent};line-height:1`;
    const bodyStyle = `margin-top:6px;font-size:14px;line-height:1.55;color:hsl(var(--foreground) / 0.9);word-break:break-word;overflow-wrap:anywhere`;

    return [
      'div',
      mergeAttributes(HTMLAttributes, { class: 'rte-info-card', style: wrapperStyle }),
      [
        'div',
        { class: 'rte-info-card__card', style: cardStyle },
        [
          'div',
          { class: 'rte-info-card__fold', 'aria-hidden': 'true', style: foldWrap },
          ['div', { style: foldUnder }],
          ['div', { style: foldFace }],
          ['div', { style: foldCrease }],
        ],
        ['div', { class: 'rte-info-card__medallion', 'aria-hidden': 'true', style: medStyle }],
        [
          'div',
          { class: 'rte-info-card__main', style: mainStyle },
          ['div', { class: 'rte-info-card__label', style: labelStyle }, preset.label],
          ['div', { class: 'rte-info-card__body', style: bodyStyle }, 0],
        ],
      ],
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
          const preset = getInfoCardPreset(kind);
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
