import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react';
import { Settings2, Check, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { INFO_CARD_PRESETS, getInfoCardPreset, type InfoCardKind } from './infoCardPresets';

/**
 * InfoCard NodeView — renders the identical inline-styled markup as
 * InfoCardNode.renderHTML so the editor and the sanitized preview HTML look
 * pixel-identical (gradient card, layered dog-ear fold, medallion with the
 * preset's inline-SVG icon). Adds Change popover + floating formatting
 * toolbar for edit mode only.
 */
export function InfoCardView({ node, updateAttributes, editor, getPos }: NodeViewProps) {
  const kind = (node.attrs.kind as InfoCardKind) || 'note';
  const preset = getInfoCardPreset(kind);
  const Icon = preset.icon;
  const editable = editor?.isEditable ?? true;

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

  const changeButton = editable && (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          className="opacity-0 group-hover/ic:opacity-100 focus:opacity-100 transition-opacity h-5 px-1.5 rounded-md border border-border/60 bg-background/80 backdrop-blur text-[9px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 flex items-center gap-1"
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
          {INFO_CARD_PRESETS.map((p) => {
            const PIcon = p.icon;
            const active = p.id === kind;
            return (
              <button
                key={p.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => updateAttributes({ kind: p.id })}
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-[12px] transition-colors',
                  active ? 'bg-primary/5 text-foreground' : 'hover:bg-muted/60 text-foreground',
                )}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: p.bg, boxShadow: `inset 0 0 0 1px ${p.border}` }}
                  aria-hidden="true"
                >
                  <PIcon className="w-3 h-3" style={{ color: p.accent }} aria-hidden="true" focusable="false" />
                </span>
                <span className="flex-1 font-medium">{p.label}</span>
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
    return (
      <div
        className="absolute -top-11 left-0 z-30 flex items-center gap-0.5 rounded-xl border border-border/80 bg-popover shadow-lg px-1 py-1 animate-in fade-in slide-in-from-bottom-1 duration-150"
        onMouseDown={(e) => e.preventDefault()}
        role="toolbar"
        aria-label="Text formatting"
        contentEditable={false}
      >
        <RtBtn label="Bold" Icon={Bold} active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
        <RtBtn label="Italic" Icon={Italic} active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <RtBtn label="Underline" Icon={UnderlineIcon} active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <RtBtn label="Strikethrough" Icon={Strikethrough} active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
        <span className="w-px h-4 bg-border mx-0.5" aria-hidden="true" />
        <RtBtn label="Clear formatting" Icon={RemoveFormatting} onClick={() => editor.chain().focus().unsetAllMarks().run()} />
        <span
          className="absolute -bottom-1 left-4 w-2 h-2 rotate-45 bg-popover border-r border-b border-border/80"
          aria-hidden="true"
        />
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable, isFocusedInside, editor, kind]);

  return (
    <NodeViewWrapper
      as="div"
      className="rte-info-card group/ic"
      data-info-card={kind}
      style={{ margin: '12px 0' }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          gap: 16,
          alignItems: 'flex-start',
          borderRadius: 18,
          padding: '16px 20px',
          border: `1px solid ${preset.border}`,
          background: `linear-gradient(135deg, ${preset.bg} 0%, hsl(0 0% 100% / 0.35) 100%), ${preset.bg}`,
          boxShadow:
            '0 1px 2px rgba(15,23,42,0.04),0 10px 28px -18px rgba(15,23,42,0.18)',
        }}
      >
        {/* Layered dog-ear fold */}
        <div
          aria-hidden="true"
          contentEditable={false}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 40,
            height: 40,
            borderTopRightRadius: 17,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: 'polygon(0 0,100% 0,100% 100%)',
              background: `radial-gradient(120% 120% at 100% 0%, transparent 55%, ${preset.accent} 100%)`,
              opacity: 0.14,
              transform: 'translate(-2px,2px)',
              filter: 'blur(2px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: 'polygon(0 0,100% 0,100% 100%)',
              backgroundImage: `linear-gradient(215deg, ${preset.fold} 0%, hsl(0 0% 100% / 0.9) 100%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: 'polygon(0 0,100% 0,100% 100%)',
              background: `linear-gradient(225deg, transparent calc(50% - 0.75px), ${preset.accent} 50%, transparent calc(50% + 0.75px))`,
              opacity: 0.35,
            }}
          />
        </div>

        {/* Medallion */}
        <div
          contentEditable={false}
          aria-hidden="true"
          style={{
            flexShrink: 0,
            width: 40,
            height: 40,
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(0 0% 100% / 0.85) 100%)',
            boxShadow: `inset 0 0 0 1px ${preset.border}, 0 1px 2px rgba(15,23,42,0.06), 0 4px 10px -6px ${preset.accent}`,
          }}
        >
          <Icon
            className="w-5 h-5"
            style={{ color: preset.accent }}
            aria-hidden="true"
            focusable="false"
          />
        </div>

        {/* Main */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            contentEditable={false}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: preset.accent,
                lineHeight: 1,
              }}
            >
              {preset.label}
            </span>
            {changeButton}
          </div>
          <div style={{ position: 'relative' }}>
            {toolbar}
            <NodeViewContent
              as="div"
              className="rte-info-card__body"
              style={{
                marginTop: 6,
                fontSize: 14,
                lineHeight: 1.55,
                color: 'hsl(var(--foreground) / 0.9)',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                outline: 'none',
              }}
            />
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
