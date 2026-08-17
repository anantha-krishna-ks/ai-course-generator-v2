# Portable Toast UI spec (`docs/toast-ui.md`)

Create a single self-contained markdown file that anyone can drop into another project (or paste to an AI agent) to reproduce this app's exact toast system.

## What the file will contain

1. **Overview** — Radix-based toast with left color ribbon, variant icon, title + description, hover-revealed close, top-right viewport, one toast at a time.
2. **Dependencies** — `@radix-ui/react-toast`, `class-variance-authority`, `lucide-react`, `tailwind-merge`/`clsx` (`cn` helper), Tailwind + `tailwindcss-animate`.
3. **Design tokens** — the exact HSL values to add to `index.css` for light and dark: `--success`, `--success-foreground`, `--warning`, `--warning-foreground`, `--info`, `--destructive`, plus the `tailwind.config.ts` color mappings for `success`, `warning`, `info`.
4. **Full source of 4 files**, copied verbatim from this project so it works on paste:
   - `src/components/ui/toast.tsx` — viewport (`fixed top-4 right-4 z-[100] … sm:max-w-[420px]`), `toastVariants` cva with `default | destructive | success | warning | info` and the `[&_.toast-ribbon]:bg-*` selectors, swipe/animation data-attributes, Title, Description, Action, Close.
   - `src/components/ui/toaster.tsx` — variant→icon map (`Info`, `CheckCircle2`, `AlertCircle`, `AlertTriangle`), icon color map, the 1px-wide ribbon div, spacing (`pl-4 pr-8 py-4`, `gap-3`).
   - `src/hooks/use-toast.ts` — reducer store, `TOAST_LIMIT = 1`, and the `inferVariant()` keyword auto-inference (error/failed/invalid → destructive, removed/deleted → warning, saved/created/copied… → success, info/level → info).
   - `src/components/ui/sonner.tsx` — the optional sonner variant with matching token classNames.
5. **Install steps** — where to mount `<Toaster />` in `App.tsx`, and the token/config edits.
6. **Usage examples** — `toast({ title, description })` with auto-inferred variant, explicit `variant: "success"`, and with an action button.
7. **Accessibility notes** — `aria-label="Close notification"`, `aria-hidden`/`focusable="false"` on decorative icons, no opacity-modified text colors.

## Technical detail

Single new file `docs/toast-ui.md`; no source code in the app changes. Code blocks are fenced with `tsx`/`css`/`bash` and paths are stated above each block so the file is directly actionable.
