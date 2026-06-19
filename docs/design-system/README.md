# Corporate Design System

A portable, accessibility-first design system extracted from this application. Built for **corporate web apps** that need to feel trustworthy, calm, and professional — yet modern. Drop the tokens into any React + Tailwind + shadcn project (or use `tokens.json` for non-web stacks).

> **Brand DNA:** minimal · glassmorphic · rounded · trust-first · WCAG 2.2 AA strict

---

## 1. Design Principles

1. **Clarity over cleverness.** Corporate users skim. Hierarchy must be obvious in 2 seconds.
2. **Tokens, never literals.** No `text-white`, no `bg-[#0073E6]`. Always semantic (`text-foreground`, `bg-primary`).
3. **Accessibility is a constraint, not a feature.** WCAG 2.2 AA is the floor, not the ceiling.
4. **Calm motion.** Animations support comprehension; they never compete for attention. Respect `prefers-reduced-motion`.
5. **Light & dark are equal citizens.** Every token has a dark counterpart, defined together.
6. **One H1. Predictable rhythm.** Semantic HTML drives both SEO and a11y.

---

## 2. Color Tokens

All colors are stored as raw **HSL channels** (no `hsl()` wrapper) so Tailwind's `bg-primary/20` opacity modifier works.

### 2.1 Light theme (`:root`)

| Token | HSL | Hex (approx) | Use |
|---|---|---|---|
| `--background` | `210 40% 98%` | `#F7F9FC` | Page background |
| `--foreground` | `222 47% 11%` | `#0F1729` | Default text |
| `--card` | `0 0% 100%` | `#FFFFFF` | Card / panel surface |
| `--card-foreground` | `222 47% 11%` | `#0F1729` | Text on card |
| `--popover` | `0 0% 100%` | `#FFFFFF` | Popover / dropdown surface |
| `--popover-foreground` | `222 47% 11%` | `#0F1729` | Text on popover |
| `--primary` | `211 100% 44%` | `#0073E0` | Brand / primary action |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | Text on primary |
| `--primary-hover` | `211 100% 42%` | `#006AD1` | Primary hover state |
| `--primary-glow` | `211 100% 65%` | `#4DA8FF` | Gradient accent / focus glow |
| `--secondary` | `210 40% 96%` | `#EEF2F7` | Secondary button / chip |
| `--secondary-foreground` | `222 47% 11%` | `#0F1729` | Text on secondary |
| `--muted` | `210 40% 96%` | `#EEF2F7` | Muted surface |
| `--muted-foreground` | `215 16% 44%` | `#5F6B7A` | Helper / placeholder text |
| `--field-label` | `222 10% 42%` | `#606673` | Form field labels |
| `--accent` | `214 32% 91%` | `#DCE3EC` | Hover / selected surface |
| `--accent-foreground` | `222 47% 11%` | `#0F1729` | Text on accent |
| `--destructive` | `0 84% 60%` | `#EF4444` | Errors / destructive actions |
| `--destructive-foreground` | `0 0% 100%` | `#FFFFFF` | Text on destructive |
| `--success` | `142 71% 45%` | `#22C55E` | Success states |
| `--success-foreground` | `0 0% 100%` | `#FFFFFF` | Text on success |
| `--warning` | `38 92% 50%` | `#F59E0B` | Warnings / caution |
| `--warning-foreground` | `0 0% 100%` | `#FFFFFF` | Text on warning |
| `--info` | `211 100% 48%` | `#007AF5` | Informational |
| `--info-foreground` | `0 0% 100%` | `#FFFFFF` | Text on info |
| `--border` | `214 32% 91%` | `#DCE3EC` | Default borders |
| `--input` | `214 32% 91%` | `#DCE3EC` | Input borders |
| `--ring` | `211 100% 48%` | `#007AF5` | Focus ring |

**Sidebar palette** (separate scale, neutral grey for navigation):

| Token | HSL |
|---|---|
| `--sidebar-background` | `0 0% 98%` |
| `--sidebar-foreground` | `240 5.3% 26.1%` |
| `--sidebar-primary` | `240 5.9% 10%` |
| `--sidebar-accent` | `240 4.8% 95.9%` |
| `--sidebar-border` | `220 13% 91%` |
| `--sidebar-ring` | `217.2 91.2% 59.8%` |

### 2.2 Dark theme (`.dark`)

The dark theme rebalances surfaces to deep navy while keeping the same primary hue (slightly brightened for contrast).

| Token | HSL | Notes |
|---|---|---|
| `--background` | `222 47% 11%` | Deep navy page |
| `--foreground` | `210 40% 98%` | Near-white text |
| `--card` | `222 47% 15%` | Elevated navy surface |
| `--primary` | `211 100% 48%` | Brighter on dark for contrast |
| `--primary-hover` | `211 100% 55%` | |
| `--muted` | `217 33% 18%` | |
| `--muted-foreground` | `215 20% 65%` | |
| `--border` | `217 33% 18%` | |

See `tokens/index.css` for the full set.

### 2.3 Corporate adaptation

To reskin for another brand, change **only one variable**:

```css
:root { --primary: <H> <S>% <L>%; }
```

Then derive `--primary-hover` (L − 2), `--primary-glow` (L + 21), and `--ring` (matches primary). Keep neutrals untouched — they carry the corporate feel.

---

## 3. Typography

### 3.1 Family

- **Primary:** `Nunito Sans`, fallback `sans-serif`
- **Feature settings:** `"ss01", "cv11"` (stylistic alternates for a more refined look)
- **Alternatives for stricter corporate brands:** Inter, IBM Plex Sans, Source Sans 3. Keep the scale unchanged.

### 3.2 Scale (16px base, line-height 1.55)

| Class / Element | Size | Weight | Line-height | Notes |
|---|---|---|---|---|
| `h1` | `clamp(1.625rem, 1.4rem + 1vw, 2rem)` | 700 | 1.2 | tracking −0.01em, **one per page** |
| `h2` | `clamp(1.375rem, 1.25rem + 0.6vw, 1.625rem)` | 700 | 1.25 | tracking −0.005em |
| `h3` | `1.25rem` | 600 | 1.3 | |
| `h4` | `1.0625rem` | 600 | 1.35 | |
| `text-base` | `1rem` (16px) | 400 | 1.55rem | body default |
| `text-sm` | `0.9375rem` (15px) | 400 | 1.4rem | secondary copy |
| `text-xs` | `0.8125rem` (13px) | 400 | 1.25rem | floor — never smaller |
| `input, textarea, select` | `max(0.9375rem, 14px)` | — | — | prevents iOS zoom |

> **Floor rule:** any inline arbitrary size between 8–13px is auto-promoted to 13px via a `!important` override. Tiny text fails WCAG; the system refuses to render it.

---

## 4. Spacing, Radius, Elevation

### 4.1 Spacing

Use Tailwind's default 4px scale (`p-1`..`p-24`). Recommended rhythm:

- **Inside a card:** `p-6` (24px)
- **Between cards:** `gap-4` (16px) or `gap-6` (24px)
- **Section padding (page):** `py-12` desktop, `py-8` mobile
- **Form field gap:** `space-y-4`

### 4.2 Radius

```
--radius: 0.75rem;   /* 12px — lg */
rounded-md = 10px
rounded-sm = 8px
rounded-full        /* pills, avatars, icon buttons */
```

> **Corporate variant:** for finance/legal/healthcare tones, set `--radius: 0.5rem` (8px). For consumer-facing SaaS, keep 12px or push to 14px.

### 4.3 Elevation

```css
--shadow-subtle: 0 1px 3px 0 hsl(0 0% 0% / 0.05);
--shadow-card:   0 1px 2px 0 hsl(0 0% 0% / 0.05);
```

Two shadows only. Resist adding more — corporate apps look chaotic with 5+ elevation levels. Use **borders + background contrast** instead of bigger shadows.

### 4.4 Motion

```css
--transition-smooth: all 0.2s ease;
```

Standard durations: `150ms` (micro), `200ms` (default), `300ms` (modal/sheet), `500ms` (hero). Easing: `ease`, `ease-out`, or `cubic-bezier(0.4, 0, 0.2, 1)`.

Always wrap purely decorative motion (aurora, sparkle, float) in:

```css
@media (prefers-reduced-motion: reduce) { animation: none; }
```

---

## 5. Accessibility (WCAG 2.2 AA)

Non-negotiable rules — same set the app is built against:

1. **Single `<h1>` per page.** Use `<span>` for logo/branding in headers.
2. **Heading levels never skip** (`h1 → h2 → h3`, never `h1 → h3`).
3. **Color contrast** ≥ 4.5:1 for text, ≥ 3:1 for non-text. Never use opacity modifiers on text (`text-foreground/60` ❌). Use `text-muted-foreground` instead.
4. **Focus-visible** on all interactive elements: 2px solid `hsl(var(--ring))`, 2px offset.
5. **Skip-to-main link** at the top of every page.
6. **Icon-only buttons** require `aria-label="<action>"`.
7. **Decorative icons:** `aria-hidden="true" focusable="false"`.
8. **Every form control** has a `<label>` or `aria-label`. shadcn `SelectTrigger` always gets `aria-label`.
9. **Dialogs** must include `DialogDescription` (use `className="sr-only"` if visually hidden).
10. **Keyboard:** all flows operable via Tab / Enter / Space / Esc. Clickable `<div>` needs `role="button"`, `tabIndex={0}`, and key handler.
11. **Landmarks:** semantic `<main>`, `<header>`, `<nav>`, `<footer>`. `<nav>` gets `aria-label`.
12. **Prose containers** use `overflow-wrap: anywhere` and `word-break: break-word` to prevent breakage from long URLs/words.

---

## 6. Component Patterns

See [`COMPONENTS.md`](./COMPONENTS.md) for full recipes (buttons, inputs, cards, badges, dialogs, sidebar shell, glass hero).

---

## 7. Files in this package

```
docs/design-system/
├── README.md              ← this file
├── COMPONENTS.md          ← copy-paste recipes
└── tokens/
    ├── index.css          ← drop into any Tailwind project
    ├── tailwind.config.ts ← semantic color mapping
    └── tokens.json        ← Style-Dictionary / Figma Tokens export
```

## 8. How to adopt (5 minutes)

1. Copy `tokens/index.css` into your project's global CSS entry.
2. Merge `tokens/tailwind.config.ts` into your existing config (keep your `content` paths).
3. Install Nunito Sans (Google Fonts) or your replacement display font.
4. Use semantic classes only: `bg-background text-foreground`, `bg-card`, `bg-primary text-primary-foreground`, `border-border`, `text-muted-foreground`.
5. Run a contrast audit (axe DevTools) and verify focus rings on every interactive element.

Done. You now have the same design system as this app.
