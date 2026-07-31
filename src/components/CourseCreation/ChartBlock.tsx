import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, animate } from "framer-motion";
import { BarChart3, PieChart as PieIcon, Plus, Trash2, Settings2, GripVertical, Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ChartKind = "bar" | "pie";

export interface ChartDatum {
  id: string;
  label: string;
  value: number;
  color?: { from: string; to: string };
}

export interface ChartContent {
  kind: ChartKind;
  title: string;
  caption?: string;
  unit?: string;
  data: ChartDatum[];
}

/**
 * Default dataset — grounded in widely published e-learning benchmark research
 * (course completion by delivery format). Gives authors a realistic starting point.
 */
export const DEFAULT_CHART_CONTENT: ChartContent = {
  kind: "bar",
  title: "Course completion rate by format",
  caption: "Average learner completion across delivery formats (industry benchmark)",
  unit: "%",
  data: [
    { id: "c1", label: "Microlearning", value: 82 },
    { id: "c2", label: "Blended", value: 68 },
    { id: "c3", label: "Instructor-led", value: 61 },
    { id: "c4", label: "Self-paced", value: 44 },
    { id: "c5", label: "MOOC", value: 13 },
  ],
};

export const CHART_PALETTE = [
  { from: "#3B82F6", to: "#1D4ED8" },
  { from: "#22D3EE", to: "#0891B2" },
  { from: "#A78BFA", to: "#6D28D9" },
  { from: "#34D399", to: "#059669" },
  { from: "#FBBF24", to: "#D97706" },
  { from: "#FB7185", to: "#BE123C" },
  { from: "#60A5FA", to: "#2563EB" },
  { from: "#F472B6", to: "#9D174D" },
];

export function getItemColor(item: ChartDatum, index: number) {
  return item.color ?? CHART_PALETTE[index % CHART_PALETTE.length];
}

function darkerTone(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((n >> 16) & 0xff) - 36);
  const g = Math.max(0, ((n >> 8) & 0xff) - 36);
  const b = Math.max(0, (n & 0xff) - 36);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function parseChartContent(raw?: string): ChartContent {
  if (!raw) return DEFAULT_CHART_CONTENT;
  try {
    const stripped = raw.replace(/<!--chart:/, "").replace(/-->$/, "");
    const parsed = JSON.parse(stripped);
    if (parsed && Array.isArray(parsed.data)) {
      return {
        kind: parsed.kind === "pie" ? "pie" : "bar",
        title: parsed.title ?? DEFAULT_CHART_CONTENT.title,
        caption: parsed.caption ?? "",
        unit: parsed.unit ?? "",
        data: parsed.data.map((d: ChartDatum, i: number) => ({
          id: d.id ?? `c${i}`,
          label: String(d.label ?? `Item ${i + 1}`),
          value: Number(d.value) || 0,
          color: d.color && typeof d.color.from === "string" && typeof d.color.to === "string" ? d.color : undefined,
        })),
      };
    }
  } catch {
    /* fall through */
  }
  return DEFAULT_CHART_CONTENT;
}

export function serializeChartContent(content: ChartContent): string {
  return `<!--chart:${JSON.stringify(content)}-->`;
}

/* ------------------------------------------------------------------ */
/* Animated number                                                     */
/* ------------------------------------------------------------------ */
function CountUp({ value, unit, className, delay = 0 }: { value: number; unit?: string; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const controls = animate(0, value, {
      duration: 1.1,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = `${Math.round(v)}${unit ?? ""}`;
      },
    });
    return () => controls.stop();
  }, [value, unit, delay]);
  return <span ref={ref} className={className}>{`0${unit ?? ""}`}</span>;
}

/* ------------------------------------------------------------------ */
/* Glossy bar chart                                                    */
/* ------------------------------------------------------------------ */
function GlossyBarChart({ content, uid }: { content: ChartContent; uid: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.3 });
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(...content.data.map((d) => d.value), 1);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  // Smart orientation: long labels or many items read far better horizontally,
  // which removes any chance of x-axis labels colliding.
  const longest = content.data.reduce((m, d) => Math.max(m, d.label.length), 0);
  const horizontal = content.data.length > 6 || longest > 12;

  if (horizontal) {
    return (
      <div ref={wrapRef} className="w-full space-y-2.5">
        {content.data.map((d, i) => {
          const pal = getItemColor(d, i);
          const pct = (d.value / max) * 100;
          const active = hover === d.id;
          return (
            <div
              key={d.id}
              className={cn(
                "flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors duration-300",
                active ? "bg-foreground/[0.04]" : "bg-transparent"
              )}
              onMouseEnter={() => setHover(d.id)}
              onMouseLeave={() => setHover(null)}
            >
              <span
                title={d.label}
                className="w-[92px] shrink-0 truncate text-[11px] font-medium text-muted-foreground sm:w-[132px]"
              >
                {d.label}
              </span>
              <div className="relative h-4 min-w-0 flex-1 overflow-hidden rounded-full bg-foreground/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${pct}%` } : {}}
                  transition={{ duration: 1, delay: 0.07 * i, ease: [0.16, 1, 0.3, 1] }}
                  className="relative h-full overflow-hidden rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${pal.from} 0%, ${pal.to} 100%)`,
                    boxShadow: active
                      ? `0 8px 18px -8px ${pal.to}99, inset 0 1px 0 rgba(255,255,255,0.5)`
                      : `0 6px 14px -10px ${pal.to}80, inset 0 1px 0 rgba(255,255,255,0.35)`,
                  }}
                >
                  <span
                    className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-full"
                    style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0))" }}
                    aria-hidden="true"
                  />
                  <motion.span
                    className="pointer-events-none absolute inset-y-0 w-1/3"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)" }}
                    initial={{ x: "-120%" }}
                    animate={inView ? { x: ["-120%", "320%"] } : {}}
                    transition={{ duration: 1.4, delay: 0.5 + 0.07 * i, ease: "easeInOut" }}
                    aria-hidden="true"
                  />
                </motion.div>
              </div>
              <span className="w-[52px] shrink-0 text-right text-[11px] font-semibold tabular-nums text-foreground">
                <CountUp value={d.value} unit={content.unit} delay={0.3 + 0.07 * i} />
              </span>
            </div>
          );
        })}
        <span className="sr-only">{`Bar chart ${uid}`}</span>
      </div>
    );
  }


  return (
    <div ref={wrapRef} className="relative w-full">
      {/* grid */}
      <div className="relative h-[240px] w-full">
        <div className="absolute inset-0 flex flex-col justify-between" aria-hidden="true">
          {[...ticks].reverse().map((t) => (
            <div key={t} className="flex items-center gap-2">
              <span className="w-9 shrink-0 text-right text-[10px] font-medium text-muted-foreground tabular-nums">
                {Math.round(max * t)}
                {content.unit}
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-foreground/10 via-foreground/[0.06] to-transparent" />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 pl-11 flex items-end gap-2 sm:gap-4">
          {content.data.map((d, i) => {
            const pal = getItemColor(d, i);
            const pct = (d.value / max) * 100;
            const active = hover === d.id;
            return (
              <div
                key={d.id}
                className="group relative flex h-full flex-1 items-end justify-center"
                onMouseEnter={() => setHover(d.id)}
                onMouseLeave={() => setHover(null)}
              >
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={inView ? { height: `${pct}%`, opacity: 1 } : {}}
                  transition={{ duration: 1, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full max-w-[64px] origin-bottom overflow-hidden rounded-t-[10px]"
                  style={{
                    background: `linear-gradient(180deg, ${pal.from} 0%, ${pal.to} 100%)`,
                    boxShadow: active
                      ? `0 18px 32px -12px ${pal.to}99, inset 0 1px 0 rgba(255,255,255,0.55)`
                      : `0 10px 24px -14px ${pal.to}80, inset 0 1px 0 rgba(255,255,255,0.4)`,
                    transform: active ? "translateY(-4px)" : "translateY(0)",
                    transition: "box-shadow 300ms ease, transform 300ms ease",
                  }}
                >
                  {/* gloss highlight */}
                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-t-[10px]"
                    style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.38), rgba(255,255,255,0))" }}
                    aria-hidden="true"
                  />
                  {/* sheen sweep */}
                  <motion.span
                    className="pointer-events-none absolute inset-0"
                    style={{ background: "linear-gradient(180deg, transparent 20%, rgba(255,255,255,0.55) 50%, transparent 80%)" }}
                    initial={{ y: "120%" }}
                    animate={inView ? { y: ["120%", "-120%"] } : {}}
                    transition={{ duration: 1.4, delay: 0.5 + 0.08 * i, ease: "easeInOut" }}
                    aria-hidden="true"
                  />
                </motion.div>

                {/* value bubble */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.6 + 0.08 * i }}
                  className={cn(
                    "pointer-events-none absolute -translate-y-2 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums backdrop-blur-sm transition-all duration-300",
                    active
                      ? "border-foreground/15 bg-background text-foreground shadow-md"
                      : "border-transparent bg-transparent text-foreground/80"
                  )}
                  style={{ bottom: `${pct}%` }}
                >
                  <CountUp value={d.value} unit={content.unit} delay={0.3 + 0.08 * i} />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* labels */}
      <div className="mt-3 flex items-start gap-2 pl-11 sm:gap-4">
        {content.data.map((d) => (
          <div key={d.id} className="min-w-0 flex-1 text-center">
            <span
              title={d.label}
              className="mx-auto block max-w-full text-[11px] font-medium leading-tight text-muted-foreground [display:-webkit-box] [overflow-wrap:anywhere] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden"
            >
              {d.label}
            </span>
          </div>
        ))}
      </div>

      <span className="sr-only">{`Bar chart ${uid}`}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Glossy donut chart                                                  */
/* ------------------------------------------------------------------ */
function GlossyPieChart({ content, uid }: { content: ChartContent; uid: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.3 });
  const [hover, setHover] = useState<string | null>(null);
  const total = content.data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 68;
  const C = 2 * Math.PI * R;

  let offsetAcc = 0;
  const segs = content.data.map((d, i) => {
    const frac = d.value / total;
    const seg = { d, i, frac, dash: frac * C, offset: offsetAcc };
    offsetAcc += frac * C;
    return seg;
  });

  const activeSeg = segs.find((s) => s.d.id === hover);

  return (
    <div ref={wrapRef} className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-10">
      <div className="relative">
        <motion.svg
          width={200}
          height={200}
          viewBox="0 0 200 200"
          initial={{ opacity: 0, scale: 0.92, rotate: -12 }}
          animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          role="img"
          aria-label={`${content.title} donut chart`}
        >
          <defs>
            {content.data.map((d, i) => {
              const pal = getItemColor(d, i);
              return (
                <linearGradient key={d.id} id={`${uid}-g${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={pal.from} />
                  <stop offset="100%" stopColor={pal.to} />
                </linearGradient>
              );
            })}
            <radialGradient id={`${uid}-gloss`} cx="35%" cy="25%" r="70%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
              <stop offset="55%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <filter id={`${uid}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.18" />
            </filter>
          </defs>

          <circle cx="100" cy="100" r={R} fill="none" stroke="currentColor" className="text-foreground/5" strokeWidth="26" />

          <g filter={`url(#${uid}-shadow)`}>
            {segs.map((s) => {
              const active = hover === s.d.id;
              return (
                <motion.circle
                  key={s.d.id}
                  cx="100"
                  cy="100"
                  r={R}
                  fill="none"
                  stroke={`url(#${uid}-g${s.i})`}
                  strokeWidth={active ? 32 : 26}
                  strokeLinecap="butt"
                  transform="rotate(-90 100 100)"
                  strokeDasharray={`${s.dash} ${C - s.dash}`}
                  strokeDashoffset={-s.offset}
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={inView ? { opacity: hover && !active ? 0.35 : 1, pathLength: 1 } : {}}
                  transition={{ pathLength: { duration: 1.1, delay: 0.1 * s.i, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.3 }, strokeWidth: { duration: 0.25 } }}
                  onMouseEnter={() => setHover(s.d.id)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: "pointer" }}
                />
              );
            })}
          </g>

          {/* glass dome */}
          <circle cx="100" cy="100" r={R + 13} fill={`url(#${uid}-gloss)`} pointerEvents="none" />
        </motion.svg>

        {/* center readout */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSeg?.d.id ?? "total"}
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className="text-center"
            >
              <div className="text-[22px] font-semibold tabular-nums text-foreground">
                {activeSeg ? `${Math.round((activeSeg.frac) * 100)}%` : <CountUp value={total} unit={content.unit} />}
              </div>
              <div className="max-w-[104px] truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {activeSeg ? activeSeg.d.label : "Total"}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* legend */}
      <ul className="w-full max-w-[260px] space-y-1.5">
        {segs.map((s) => {
          const pal = getItemColor(s.d, s.i);
          const active = hover === s.d.id;
          return (
            <motion.li
              key={s.d.id}
              initial={{ opacity: 0, x: 10 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.25 + 0.06 * s.i, duration: 0.4 }}
              onMouseEnter={() => setHover(s.d.id)}
              onMouseLeave={() => setHover(null)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border px-2.5 py-1.5 transition-all duration-300",
                active ? "border-foreground/10 bg-foreground/[0.04] shadow-sm" : "border-transparent"
              )}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: `linear-gradient(135deg, ${pal.from}, ${pal.to})`, boxShadow: `0 0 0 3px ${pal.from}22` }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-foreground [overflow-wrap:anywhere]">{s.d.label}</span>
              <span className="text-[12px] font-semibold tabular-nums text-muted-foreground">
                {s.d.value}
                {content.unit}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared shell                                                        */
/* ------------------------------------------------------------------ */
function ChartShell({ content, children }: { content: ChartContent; children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-background/90 to-muted/30 p-5 shadow-[0_18px_40px_-28px_hsl(var(--foreground)/0.35)] backdrop-blur-sm sm:p-6">
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.07] to-transparent"
        aria-hidden="true"
      />
      <div className="relative mb-5">
        <h3 className="text-[15px] font-semibold leading-snug text-foreground [overflow-wrap:anywhere]">{content.title}</h3>
        {content.caption ? (
          <p className="mt-1 text-[12px] text-muted-foreground [overflow-wrap:anywhere]">{content.caption}</p>
        ) : null}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

/** Read-only, animated chart used in course previews. */
export function ChartPreview({ content }: { content?: string }) {
  const parsed = useMemo(() => parseChartContent(content), [content]);
  const uid = useMemo(() => `ch${Math.random().toString(36).slice(2, 8)}`, []);
  return (
    <ChartShell content={parsed}>
      {parsed.kind === "bar" ? <GlossyBarChart content={parsed} uid={uid} /> : <GlossyPieChart content={parsed} uid={uid} />}
    </ChartShell>
  );
}

/* ------------------------------------------------------------------ */
/* Editor block                                                        */
/* ------------------------------------------------------------------ */
interface ChartBlockProps {
  content?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export function ChartBlock({ content, onChange, readOnly }: ChartBlockProps) {
  const [data, setData] = useState<ChartContent>(() => parseChartContent(content));
  const [dataOpen, setDataOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);

  const stopAutoScroll = () => {
    if (autoScrollRef.current !== null) {
      cancelAnimationFrame(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  // Auto-scroll the list while dragging near its top/bottom edges
  const handleDragAutoScroll = (clientY: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const zone = 48;
    let speed = 0;
    if (clientY < rect.top + zone) speed = -Math.ceil((rect.top + zone - clientY) / 4);
    else if (clientY > rect.bottom - zone) speed = Math.ceil((clientY - (rect.bottom - zone)) / 4);

    stopAutoScroll();
    if (speed === 0) return;
    const step = () => {
      el.scrollTop += speed;
      autoScrollRef.current = requestAnimationFrame(step);
    };
    autoScrollRef.current = requestAnimationFrame(step);
  };

  useEffect(() => stopAutoScroll, []);

  const uid = useMemo(() => `ce${Math.random().toString(36).slice(2, 8)}`, []);


  const update = (next: ChartContent) => {
    setData(next);
    onChange?.(serializeChartContent(next));
  };

  const reorder = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const next = [...data.data];
    const from = next.findIndex((d) => d.id === fromId);
    const to = next.findIndex((d) => d.id === toId);
    if (from < 0 || to < 0) return;
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    update({ ...data, data: next });
  };

  if (readOnly) return <ChartPreview content={content} />;


  const addItem = () =>
    update({
      ...data,
      data: [...data.data, { id: `c${Date.now()}`, label: `Item ${data.data.length + 1}`, value: 10 }],
    });

  return (
    <div className="w-full px-1 py-2">
      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Select
          value={data.kind}
          onValueChange={(value) => update({ ...data, kind: value as ChartKind })}
        >
          <SelectTrigger
            aria-label="Chart type"
            className="h-9 w-auto min-w-[140px] gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-[12px] font-medium text-foreground shadow-none hover:bg-muted/50 focus:ring-1 focus:ring-primary/25 focus:ring-offset-0 [&>svg]:text-muted-foreground"
          >
            <SelectValue placeholder="Pick chart type" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border border-border/60 p-1.5 shadow-lg">
            {[
              { kind: "bar" as const, label: "Bar chart", Icon: BarChart3 },
              { kind: "pie" as const, label: "Pie chart", Icon: PieIcon },
            ].map(({ kind, label, Icon }) => (
              <SelectItem
                key={kind}
                value={kind}
                className="gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-medium focus:bg-primary/10 focus:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
                  </span>
                  {label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover open={dataOpen} onOpenChange={setDataOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 rounded-full border border-border/60 px-3 text-[12px] text-muted-foreground hover:text-foreground">
              <Settings2 className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
              Chart data
              <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px] font-semibold tabular-nums text-foreground">{data.data.length}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[360px] rounded-2xl p-0">
            <div className="border-b border-border/60 px-4 py-3">
              <p className="text-[13px] font-semibold text-foreground">Chart data</p>
              <p className="text-[11px] text-muted-foreground">Add items and values — the chart updates live.</p>
            </div>
            <div
              ref={scrollRef}
              onWheel={(e) => {
                const el = scrollRef.current;
                if (!el) return;
                e.stopPropagation();
                el.scrollTop += e.deltaY;
              }}
              onDragOver={(e) => {
                e.preventDefault();
                handleDragAutoScroll(e.clientY);
              }}
              onDragLeave={stopAutoScroll}
              onDrop={stopAutoScroll}
              onDragEnd={stopAutoScroll}
              className="thin-scrollbar max-h-[min(60vh,420px)] space-y-3 overflow-y-auto overscroll-contain px-4 py-3"
            >
              <div className="space-y-1.5">
                <Label htmlFor={`${uid}-title`} className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Title</Label>
                <Input id={`${uid}-title`} value={data.title} onChange={(e) => update({ ...data, title: e.target.value })} className="h-8 text-[13px]" />
              </div>
              <div className="grid grid-cols-[1fr_72px] gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`${uid}-cap`} className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Caption</Label>
                  <Input id={`${uid}-cap`} value={data.caption ?? ""} onChange={(e) => update({ ...data, caption: e.target.value })} className="h-8 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${uid}-unit`} className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Unit</Label>
                  <Input id={`${uid}-unit`} value={data.unit ?? ""} onChange={(e) => update({ ...data, unit: e.target.value })} placeholder="%" className="h-8 text-[13px]" />
                </div>
              </div>

              <div className="space-y-1.5" onDragLeave={() => setOverId(null)}>
                {data.data.map((item, i) => {
                  const pal = getItemColor(item, i);
                  const setColor = (from: string, to: string) => {
                    update({
                      ...data,
                      data: data.data.map((d) => (d.id === item.id ? { ...d, color: { from, to } } : d)),
                    });
                  };
                  const isDragging = dragId === item.id;
                  const isOver = overId === item.id && dragId !== item.id;
                  return (
                    <div
                      key={item.id}
                      draggable={dragId === item.id}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", item.id);
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverId(null);
                      }}
                      onDragOver={(e) => {
                        if (!dragId) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        setOverId(item.id);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (dragId) reorder(dragId, item.id);
                        setDragId(null);
                        setOverId(null);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl border bg-muted/20 px-2 py-1.5 transition-all duration-200",
                        isDragging ? "border-primary/50 opacity-50 shadow-sm" : "border-border/60",
                        isOver && "border-primary/60 ring-2 ring-primary/20"
                      )}
                    >

                      {/* Color picker */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            aria-label={`Change color for ${item.label}`}
                            className="group relative h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1 ring-border/60 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            style={{ background: `linear-gradient(135deg, ${pal.from}, ${pal.to})` }}
                          >
                            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/10">
                              <Paintbrush className="h-3 w-3 text-white opacity-0 drop-shadow-sm transition-opacity group-hover:opacity-100" aria-hidden="true" focusable="false" />
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-[220px] rounded-2xl p-3">
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Preset colors</p>
                          <div className="mb-3 grid grid-cols-4 gap-2">
                            {CHART_PALETTE.map((c, idx) => (
                              <button
                                key={idx}
                                type="button"
                                aria-label={`Select color ${idx + 1}`}
                                onClick={() => setColor(c.from, c.to)}
                                className="h-8 w-full rounded-full ring-1 ring-border/40 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Custom</span>
                            <label className="relative flex h-7 flex-1 cursor-pointer items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-2 text-[11px] font-medium text-foreground hover:bg-muted/50">
                              <input
                                type="color"
                                value={pal.from}
                                aria-label={`Custom color for ${item.label}`}
                                onChange={(e) => setColor(e.target.value, darkerTone(e.target.value))}
                                className="h-4 w-4 cursor-pointer appearance-none rounded-full border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0"
                              />
                              Pick color
                            </label>
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Drag handle */}
                      <button
                        type="button"
                        role="button"
                        tabIndex={0}
                        aria-label={`Drag to reorder ${item.label}. Use arrow up or down keys to move.`}
                        onPointerDown={() => setDragId(item.id)}
                        onPointerUp={() => !overId && setDragId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowUp" && i > 0) {
                            e.preventDefault();
                            reorder(item.id, data.data[i - 1].id);
                          } else if (e.key === "ArrowDown" && i < data.data.length - 1) {
                            e.preventDefault();
                            reorder(item.id, data.data[i + 1].id);
                          }
                        }}
                        className="shrink-0 cursor-grab rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        <GripVertical className="h-4 w-4" aria-hidden="true" focusable="false" />
                      </button>


                      <Input
                        value={item.label}
                        aria-label={`Item ${i + 1} label`}
                        onChange={(e) =>
                          update({ ...data, data: data.data.map((d) => (d.id === item.id ? { ...d, label: e.target.value } : d)) })
                        }
                        className="h-7 min-w-0 flex-1 border-none bg-transparent px-1 text-[12px] shadow-none focus-visible:ring-0"
                      />
                      <Input
                        type="number"
                        value={item.value}
                        aria-label={`Item ${i + 1} value`}
                        onChange={(e) =>
                          update({ ...data, data: data.data.map((d) => (d.id === item.id ? { ...d, value: Number(e.target.value) || 0 } : d)) })
                        }
                        className="h-7 w-[56px] shrink-0 text-[12px] tabular-nums"
                      />
                      <button
                        type="button"
                        aria-label={`Remove ${item.label}`}
                        onClick={() => update({ ...data, data: data.data.filter((d) => d.id !== item.id) })}
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <Button
                size="sm"
                onClick={addItem}
                className="sticky bottom-0 w-full gap-2 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/90 to-primary/70 py-2 text-[12px] font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] hover:from-primary hover:to-primary/80 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur-sm">
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
                </span>
                Add item
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Live chart */}
      <ChartShell content={data}>
        {data.kind === "bar" ? (
          <GlossyBarChart key={`bar-${data.data.length}-${data.data.map((d) => d.value).join("_")}`} content={data} uid={uid} />
        ) : (
          <GlossyPieChart key={`pie-${data.data.length}-${data.data.map((d) => d.value).join("_")}`} content={data} uid={uid} />
        )}
      </ChartShell>
    </div>
  );
}

export default ChartBlock;
