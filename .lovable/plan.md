# Premium "Set up video" call-to-action

Revamp the empty-state video block in `src/components/CourseCreation/VideoGenerationBlock.tsx` (lines 1621–1653) so the primary action reads as the clear, premium focal point of the card.

## What changes

**The card**
- Keep the 16:9 cinematic stage, but layer it properly: deep gradient base, a soft radial key light behind the CTA, and a very subtle grid/noise sheen so the surface feels like a studio backdrop rather than a flat gradient.
- Tighten the copy stack: a small "AI VIDEO" eyebrow label, the "Video Generation" title, and the avatar/duration/word summary line beneath it.
- Add a faint bottom scrim so the button always sits on high contrast.

**The button (the focal point)**
- Move from the current small `size="sm"` pill to a large, prominent CTA: taller height, wider horizontal padding, larger semibold label, `rounded-full`.
- Premium treatment: gradient fill built from `--primary` tokens, a soft primary-colored glow shadow, a thin light ring, and an inner highlight along the top edge for the glossy read.
- Motion: gentle lift and glow intensification on hover, press-down on active, animated shine sweep on hover, plus a slow ambient pulse ring while the block is untouched so the eye lands there first.
- Icon: `Sparkles` (with `Play`/arrow motion on hover) instead of the settings gear, since this is a create action, not a config action.
- Secondary affordance: a quiet ghost "See how it works" / avatar-preview link under the CTA so the primary button stays visually singular.

**States**
- Untouched: "Set up video" with the ambient pulse.
- Partially configured: "Continue setup" plus a small progress chip (e.g. "2 of 4 ready") derived from the existing `checklist`, and the pulse is dropped.
- Generating state stays as-is, with the progress bar restyled to match the new surface.

**Accessibility**
- Real `<button>` with a descriptive label, all decorative layers `aria-hidden="true"`, focus-visible ring kept clearly visible against the dark stage, motion respecting `prefers-reduced-motion`.

## Technical notes

Changes are confined to the non-generated branch of the block render in `VideoGenerationBlock.tsx`; no logic, state, or generation behaviour changes. Colors use existing semantic tokens (`--primary`, `--primary-foreground`, `--background`) — no hardcoded hex or `text-white`. Any new gradient/shadow values are expressed with token-based HSL.
