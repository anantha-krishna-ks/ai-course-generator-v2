
## Goal

Produce a single, portable **Corporate Design System** document derived from this application's actual tokens, typography, components, and accessibility rules — packaged so you can drop it into any other React + Tailwind + shadcn project (or hand it to a designer/dev for a non-React stack).

## Deliverables

1. **`docs/design-system/README.md`** — Human-readable design system spec (the main doc you can share). Includes:
   - Design principles & corporate tone
   - Color tokens (light + dark) with HSL + hex + usage
   - Typography scale (Nunito Sans, heading rhythm, floors)
   - Spacing, radius, elevation, motion tokens
   - Component patterns (buttons, inputs, cards, dialogs, tabs, toasts, scrollbars, sidebars)
   - Accessibility rules (WCAG 2.2 AA implementation)
   - Do / Don't examples

2. **`docs/design-system/tokens/index.css`** — Drop-in CSS with all `:root` and `.dark` variables, base layer, typography floors, scrollbar utilities, focus ring, skip-link, aurora background.

3. **`docs/design-system/tokens/tailwind.config.ts`** — Matching Tailwind config (semantic color mapping, fontFamily, borderRadius, keyframes, animations).

4. **`docs/design-system/tokens/tokens.json`** — Framework-agnostic token export (Style Dictionary / Figma Tokens compatible) so it can be imported into Figma, iOS, Android, or other web stacks.

5. **`docs/design-system/COMPONENTS.md`** — Concrete recipes for the recurring patterns in this app: primary/secondary/ghost buttons, form field with label, status badges (success/warning/destructive/info), card surfaces, dialog shell, glass/aurora hero, sidebar shell.

## What the system captures (from this app)

**Brand & tone** — Corporate, minimal, glassmorphic, rounded; trust-first; subtle motion; strict WCAG 2.2 AA.

**Color palette (light)**
- background `210 40% 98%`, foreground `222 47% 11%`
- primary `211 100% 44%` (#0073E6 family), primary-hover, primary-glow
- semantic: success `142 71% 45%`, warning `38 92% 50%`, destructive `0 84% 60%`, info `211 100% 48%`
- surfaces: card, popover, muted, accent, border, input, ring
- sidebar palette (separate scale)

**Color palette (dark)** — full parallel set already defined in `index.css`.

**Typography**
- Family: Nunito Sans (sans), font-feature-settings `ss01, cv11`
- 16px base, line-height 1.55
- Heading rhythm: H1 clamp 1.625→2rem / 700, H2 clamp 1.375→1.625rem / 700, H3 1.25rem / 600, H4 1.0625rem / 600
- Tiny-text floor: text-xs → 13px, text-sm → 15px (WCAG-friendly)
- Inputs floored to 14px (prevents iOS zoom)

**Radius & elevation**
- `--radius: 0.75rem` with sm/md/lg derivatives
- Shadows: `--shadow-subtle`, `--shadow-card`
- Transition: `--transition-smooth: all 0.2s ease`

**Motion**
- Keyframes: accordion, shimmer, fade-in, slide-in, scale-in, float, wiggle, pulseGlow, sparkle (spin/float/orbit), aurora drift, comment-anchor flash, flash-highlight
- Reduced-motion respected via `prefers-reduced-motion`

**Accessibility (project rule set)**
- Single H1 per page, no heading-level skipping
- `:focus-visible` 2px ring, 2px offset
- Skip-to-main link
- Icon-only buttons require `aria-label`
- Decorative icons: `aria-hidden="true" focusable="false"`
- All form controls labelled
- 4.5:1 text contrast; semantic tokens only — no `text-white`/`bg-black`/opacity-modified text
- Dialog must include `DialogDescription`
- Prose containers use `overflow-wrap: anywhere` and `word-break: break-word`

**Utilities**
- `.thin-scrollbar`, `.pretty-scrollbar`, `.aurora-bg`, `.comment-anchor-flash`, page fade transitions

## Technical notes

- All color values stay in **HSL channels** (no `hsl()` wrapper in the token) so Tailwind can compose them with opacity modifiers (`bg-primary/20`).
- Tokens are defined once in `:root` + `.dark`; components consume only semantic names (`bg-card`, `text-foreground`, `border-border`). No hex in component code.
- The Tailwind config maps semantic tokens 1:1 to color utilities so downstream apps can use `bg-primary`, `text-muted-foreground`, etc. without changes.
- `tokens.json` mirrors the same names in a Style-Dictionary-style nested structure (`color.brand.primary.default`, `color.semantic.success`, `radius.lg`, `font.family.sans`, etc.) so non-Tailwind stacks can adopt it.
- The doc explicitly calls out **Corporate adaptation guidance**: how to reskin the primary hue (single HSL edit), how to tighten radius for more conservative industries, how to swap Nunito Sans for an alternative (e.g., Inter, IBM Plex Sans) while keeping the scale.

## Out of scope

- Generating Figma libraries (doc will be Figma-Tokens compatible but no plugin push).
- Rewriting any existing app components — this is a documentation + tokens package only, no behavioral changes.
