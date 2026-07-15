import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react';
import {
  StickyNote,
  AlertTriangle,
  Lightbulb,
  GraduationCap,
  ShieldCheck,
  KeyRound,
  Settings2,
  Check,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { InfoCardKind } from './InfoCardNode';

interface InfoCardPreset {
  id: InfoCardKind;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  bg: string;
  border: string;
  accent: string;
  fold: string;
}

const PRESETS: InfoCardPreset[] = [
  { id: 'note', label: 'Note', icon: StickyNote, bg: 'hsl(215 90% 96%)', border: 'hsl(215 60% 82%)', accent: 'hsl(215 75% 42%)', fold: 'hsl(215 75% 86%)' },
  { id: 'important', label: 'Important', icon: AlertTriangle, bg: 'hsl(0 82% 96%)', border: 'hsl(0 65% 84%)', accent: 'hsl(0 72% 46%)', fold: 'hsl(0 75% 86%)' },
  { id: 'tip', label: 'Tip', icon: Lightbulb, bg: 'hsl(38 96% 94%)', border: 'hsl(38 80% 80%)', accent: 'hsl(30 90% 42%)', fold: 'hsl(40 88% 82%)' },
  { id: 'expert-insight', label: 'Expert Insight', icon: GraduationCap, bg: 'hsl(262 70% 96%)', border: 'hsl(262 55% 84%)', accent: 'hsl(262 65% 50%)', fold: 'hsl(262 65% 86%)' },
  { id: 'best-practice', label: 'Best Practice', icon: ShieldCheck, bg: 'hsl(158 60% 94%)', border: 'hsl(158 45% 76%)', accent: 'hsl(158 65% 32%)', fold: 'hsl(158 50% 82%)' },
  { id: 'key-takeaway', label: 'Key Takeaway', icon: KeyRound, bg: 'hsl(188 78% 94%)', border: 'hsl(188 55% 78%)', accent: 'hsl(192 80% 32%)', fold: 'hsl(188 60% 82%)' },
];

const getPreset = (kind: string): InfoCardPreset =>
  PRESETS.find((p) => p.id === kind) ?? PRESETS[0];

export function InfoCardView({ node, updateAttributes, editor }: NodeViewProps) {
  const kind = (node.attrs.kind as InfoCardKind) || 'note';
  const preset = getPreset(kind);
  const Icon = preset.icon;
  const editable = editor?.isEditable ?? true;

  return (
    <NodeViewWrapper
      as="div"
      className="rte-info-card w-full py-2 group/util"
      data-info-card={kind}
    >
      <div
        className="relative rounded-[18px] border pl-4 pr-5 py-4 sm:pl-5 sm:py-[18px] flex gap-4 items-start shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-18px_rgba(15,23,42,0.18)] transition-shadow duration-200 group-hover/util:shadow-[0_1px_2px_rgba(15,23,42,0.05),0_14px_32px_-16px_rgba(15,23,42,0.22)]"
        style={{
          background: `linear-gradient(135deg, ${preset.bg} 0%, hsl(0 0% 100% / 0.35) 100%), ${preset.bg}`,
          borderColor: preset.border,
        }}
      >
        {/* Dog-ear fold */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          aria-hidden="true"
          contentEditable={false}
          style={{ width: 40, height: 40, borderTopRightRadius: '17px', overflow: 'hidden' }}
        >
          <div
            className="absolute"
            style={{
              inset: 0,
              clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
              background: `radial-gradient(120% 120% at 100% 0%, transparent 55%, ${preset.accent} 100%)`,
              opacity: 0.14,
              transform: 'translate(-2px, 2px)',
              filter: 'blur(2px)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
              backgroundImage: `linear-gradient(215deg, ${preset.fold} 0%, hsl(0 0% 100% / 0.9) 100%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(225deg, transparent calc(50% - 0.75px), ${preset.accent} 50%, transparent calc(50% + 0.75px))`,
              opacity: 0.35,
              clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: 2,
              right: 2,
              width: 10,
              height: 10,
              clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
              background: 'linear-gradient(215deg, hsl(0 0% 100% / 0.8), transparent 70%)',
            }}
          />
        </div>

        {/* Icon medallion */}
        <div
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          contentEditable={false}
          style={{
            background: 'linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(0 0% 100% / 0.85) 100%)',
            boxShadow: `inset 0 0 0 1px ${preset.border}, 0 1px 2px rgba(15,23,42,0.06), 0 4px 10px -6px ${preset.accent}`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color: preset.accent }} aria-hidden="true" focusable="false" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2" contentEditable={false}>
            <span
              className="text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: preset.accent }}
            >
              {preset.label}
            </span>
            {editable && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    className="opacity-0 group-hover/util:opacity-100 transition-opacity h-5 px-1.5 rounded-md border border-border/60 bg-background/80 backdrop-blur text-[9px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 flex items-center gap-1"
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
                    {PRESETS.map((p) => {
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
            )}
          </div>
          <NodeViewContent
            as="div"
            className="text-sm text-foreground/85 leading-relaxed mt-1 whitespace-pre-wrap break-words prose prose-sm max-w-none focus:outline-none"
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
