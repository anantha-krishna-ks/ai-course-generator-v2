import {
  StickyNote,
  AlertTriangle,
  Lightbulb,
  GraduationCap,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

export type InfoCardKind =
  | 'note'
  | 'important'
  | 'tip'
  | 'expert-insight'
  | 'best-practice'
  | 'key-takeaway';

export interface InfoCardPreset {
  id: InfoCardKind;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** inline SVG (data URI) used for the sanitized preview medallion */
  iconSvg: string;
  bg: string;
  border: string;
  accent: string;
  fold: string;
  placeholder: string;
}

// Inline SVG icons rendered as background-image on the medallion. Stroke uses
// each preset's accent colour so they match the lucide icon used in the editor.
const svg = (path: string, stroke: string) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${stroke}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>${path}</svg>`,
  )}")`;

export const INFO_CARD_PRESETS: InfoCardPreset[] = [
  {
    id: 'note',
    label: 'Note',
    icon: StickyNote,
    iconSvg: svg(
      `<path d='M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z'/><path d='M15 3v4a2 2 0 0 0 2 2h4'/>`,
      'hsl(215, 75%, 42%)',
    ),
    bg: 'hsl(215 90% 96%)',
    border: 'hsl(215 60% 82%)',
    accent: 'hsl(215 75% 42%)',
    fold: 'hsl(215 75% 86%)',
    placeholder: 'Add a note learners should keep in mind…',
  },
  {
    id: 'important',
    label: 'Important',
    icon: AlertTriangle,
    iconSvg: svg(
      `<path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3'/><path d='M12 9v4'/><path d='M12 17h.01'/>`,
      'hsl(0, 72%, 46%)',
    ),
    bg: 'hsl(0 82% 96%)',
    border: 'hsl(0 65% 84%)',
    accent: 'hsl(0 72% 46%)',
    fold: 'hsl(0 75% 86%)',
    placeholder: 'Highlight a critical warning or caveat…',
  },
  {
    id: 'tip',
    label: 'Tip',
    icon: Lightbulb,
    iconSvg: svg(
      `<path d='M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5'/><path d='M9 18h6'/><path d='M10 22h4'/>`,
      'hsl(30, 90%, 42%)',
    ),
    bg: 'hsl(38 96% 94%)',
    border: 'hsl(38 80% 80%)',
    accent: 'hsl(30 90% 42%)',
    fold: 'hsl(40 88% 82%)',
    placeholder: 'Share a helpful tip or shortcut…',
  },
  {
    id: 'expert-insight',
    label: 'Expert Insight',
    icon: GraduationCap,
    iconSvg: svg(
      `<path d='M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z'/><path d='M22 10v6'/><path d='M6 12.5V16a6 3 0 0 0 12 0v-3.5'/>`,
      'hsl(262, 65%, 50%)',
    ),
    bg: 'hsl(262 70% 96%)',
    border: 'hsl(262 55% 84%)',
    accent: 'hsl(262 65% 50%)',
    fold: 'hsl(262 65% 86%)',
    placeholder: 'Add commentary from a subject-matter expert…',
  },
  {
    id: 'best-practice',
    label: 'Best Practice',
    icon: ShieldCheck,
    iconSvg: svg(
      `<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'/><path d='m9 12 2 2 4-4'/>`,
      'hsl(158, 65%, 32%)',
    ),
    bg: 'hsl(158 60% 94%)',
    border: 'hsl(158 45% 76%)',
    accent: 'hsl(158 65% 32%)',
    fold: 'hsl(158 50% 82%)',
    placeholder: 'Describe the recommended way to do this…',
  },
  {
    id: 'key-takeaway',
    label: 'Key Takeaway',
    icon: KeyRound,
    iconSvg: svg(
      `<path d='M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z'/><circle cx='16.5' cy='7.5' r='.5' fill='hsl(192, 80%, 32%)'/>`,
      'hsl(192, 80%, 32%)',
    ),
    bg: 'hsl(188 78% 94%)',
    border: 'hsl(188 55% 78%)',
    accent: 'hsl(192 80% 32%)',
    fold: 'hsl(188 60% 82%)',
    placeholder: 'Summarise the key point to remember…',
  },
];

export function getInfoCardPreset(kind: string): InfoCardPreset {
  return INFO_CARD_PRESETS.find((p) => p.id === kind) ?? INFO_CARD_PRESETS[0];
}
