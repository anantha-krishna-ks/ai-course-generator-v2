import { useMemo } from 'react';
import { NodeViewWrapper, NodeViewContent, useEditorState, type NodeViewProps } from '@tiptap/react';
import {
  Settings2,
  Check,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  RemoveFormatting,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { INFO_CARD_KINDS, type InfoCardKind } from './InfoCardNode';

/**
 * InfoCard NodeView — renders the exact same class-based markup as the
 * serialized HTML (see InfoCardNode.renderHTML). Styling lives in
 * src/styles/info-card.css so the card looks identical in the editor and in
 * the sanitized preview HTML. Editor-only chrome (Change popover, floating
 * formatting toolbar) is layered on top for edit mode.
 */
export function InfoCardView({ node, updateAttributes, editor, getPos }: NodeViewProps) {
  const kind = (node.attrs.kind as InfoCardKind) || 'note';
  const editable = editor?.isEditable ?? true;

  // Show floating toolbar only when the caret is inside THIS node.
  const isFocusedInside = useEditorState({
    editor,
    selector: ({ editor: ed }) => {
      if (!ed || !editable) return false;
      const pos = typeof getPos === 'function' ? getPos() : null;
      if (pos == null) return false;
      const { from, to } = ed.state.selection;
      const nodeSize = node.nodeSize;
      return from >= pos && to <= pos + nodeSize;
    },
  });

  const exec = (fn: () => void) => {
    // Preserve selection inside the body while clicking the toolbar.
    fn();
  };

  const changeButton = editable && (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          className="rte-info-card__change opacity-0 group-hover/ic:opacity-100 focus:opacity-100 transition-opacity h-5 px-1.5 rounded-md border border-border/60 bg-background/80 backdrop-blur text-[9px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 flex items-center gap-1"
          aria-label="Change info card type"
        >
          <Settings2 className="w-2.5 h-2.5" aria-hidden="true" focusable="false" />
          Change
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2 bg-background">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pb-1.5">
          Info Card Type
        </p>
        <div className="grid grid-cols-1 gap-1">
          {INFO_CARD_KINDS.map((k) => {
            const active = k.id === kind;
            return (
              <button
                key={k.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateAttributes({ kind: k.id })}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[12px] transition-colors',
                  active ? 'bg-primary/5 text-foreground' : 'hover:bg-muted/60 text-foreground',
                )}
              >
                <span
                  className="rte-info-card__swatch w-6 h-6 rounded-full flex-shrink-0"
                  data-info-card={k.id}
                  aria-hidden="true"
                />
                <span className="flex-1 font-medium">{k.label}</span>
                {active && <Check className="w-3.5 h-3.5 text-primary" aria-hidden="true" focusable="false" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );

  const toolbar = useMemo(() => {
    if (!editable || !isFocusedInside) return null;
    const c = editor.chain().focus();
    return (
      <div
        className="absolute -top-11 left-0 z-30 flex items-center gap-0.5 rounded-xl border border-border/80 bg-popover shadow-lg px-1 py-1 animate-in fade-in slide-in-from-bottom-1 duration-150"
        onMouseDown={(e) => e.preventDefault()}
        role="toolbar"
        aria-label="Text formatting"
        contentEditable={false}
      >
        <RtBtn label="Bold" Icon={Bold} active={editor.isActive('bold')} onClick={() => exec(() => c.toggleBold().run())} />
        <RtBtn label="Italic" Icon={Italic} active={editor.isActive('italic')} onClick={() => exec(() => editor.chain().focus().toggleItalic().run())} />
        <RtBtn label="Underline" Icon={UnderlineIcon} active={editor.isActive('underline')} onClick={() => exec(() => editor.chain().focus().toggleUnderline().run())} />
        <RtBtn label="Strikethrough" Icon={Strikethrough} active={editor.isActive('strike')} onClick={() => exec(() => editor.chain().focus().toggleStrike().run())} />
        <span className="w-px h-4 bg-border mx-0.5" aria-hidden="true" />
        <RtBtn label="Clear formatting" Icon={RemoveFormatting} onClick={() => exec(() => editor.chain().focus().unsetAllMarks().run())} />
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable, isFocusedInside, editor, kind]);

  return (
    <NodeViewWrapper
      as="div"
      className="rte-info-card group/ic"
      data-info-card={kind}
    >
      <div className="rte-info-card__card">
        <div className="rte-info-card__fold" aria-hidden="true" contentEditable={false} />
        <div className="rte-info-card__medallion" aria-hidden="true" contentEditable={false} />
        <div className="rte-info-card__main">
          <div className="rte-info-card__header" contentEditable={false}>
            <div className="rte-info-card__label" aria-hidden="true" />
            {changeButton}
          </div>
          <div className="relative">
            {toolbar}
            <NodeViewContent as="div" className="rte-info-card__body" />
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

function RtBtn({
  onClick,
  label,
  Icon,
  active,
}: {
  onClick: () => void;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        'w-7 h-7 rounded-md flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
      )}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
    </button>
  );
}
