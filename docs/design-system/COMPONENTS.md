# Component Recipes

Concrete, copy-pasteable patterns. All examples use **semantic tokens only** — never literal colors.

---

## Buttons

### Primary
```tsx
<button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition-[var(--transition-smooth)] hover:bg-[hsl(var(--primary-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Save changes
</button>
```

### Secondary
```tsx
<button className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent">
  Cancel
</button>
```

### Ghost
```tsx
<button className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground">
  Skip
</button>
```

### Destructive
```tsx
<button className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90">
  Delete
</button>
```

### Icon-only (requires `aria-label`)
```tsx
<button aria-label="Close dialog" className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
  <X aria-hidden="true" focusable="false" className="h-4 w-4" />
</button>
```

---

## Form Field

```tsx
<div className="space-y-1.5">
  <label htmlFor="email" className="text-sm font-medium text-[hsl(var(--field-label))]">
    Work email
  </label>
  <input
    id="email"
    type="email"
    placeholder="you@company.com"
    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  />
  <p className="text-xs text-muted-foreground">We'll never share your email.</p>
</div>
```

---

## Status Badges

```tsx
<span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-[hsl(var(--success))]">
  ● Active
</span>

<span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-[hsl(var(--warning))]">
  ⚠ Pending review
</span>

<span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
  ✕ Failed
</span>

<span className="inline-flex items-center gap-1 rounded-full bg-info/10 px-2.5 py-0.5 text-xs font-medium text-[hsl(var(--info))]">
  ℹ Info
</span>
```

---

## Card

```tsx
<article className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
  <h3 className="text-lg font-semibold text-card-foreground">Quarterly revenue</h3>
  <p className="mt-1 text-sm text-muted-foreground">Updated 2 minutes ago</p>
  <div className="mt-4 text-3xl font-bold text-foreground">$2.4M</div>
</article>
```

---

## Dialog (shadcn)

```tsx
<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent className="bg-popover text-popover-foreground">
    <DialogHeader>
      <DialogTitle>Confirm action</DialogTitle>
      <DialogDescription>
        This action cannot be undone. The record will be permanently removed.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="secondary">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

> `DialogDescription` is **mandatory** for screen readers. If you don't want it visible, wrap with `className="sr-only"`.

---

## Page Shell (with skip link + landmarks)

```tsx
<>
  <a href="#main" className="skip-to-main">Skip to main content</a>
  <header className="border-b border-border bg-card">
    <nav aria-label="Main navigation" className="container flex h-14 items-center justify-between">
      <span className="text-lg font-bold text-foreground">Acme</span>
      {/* nav links */}
    </nav>
  </header>
  <main id="main" className="container py-12">
    <h1 className="mb-6">Dashboard</h1>
    {/* page content */}
  </main>
  <footer className="border-t border-border bg-muted/40 py-8 text-sm text-muted-foreground">
    {/* footer */}
  </footer>
</>
```

---

## Sidebar Shell

```tsx
<aside className="flex h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar">
  <div className="flex h-14 items-center gap-2 px-4">
    <span className="text-base font-semibold text-sidebar-foreground">Acme</span>
  </div>
  <nav aria-label="Sidebar" className="flex-1 space-y-1 px-2 py-2">
    <a className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-accent-foreground">
      Dashboard
    </a>
    <a className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent">
      Reports
    </a>
  </nav>
</aside>
```

---

## Glassmorphic Hero (aurora background)

```tsx
<section className="relative overflow-hidden rounded-2xl border border-border bg-card p-12">
  <div className="aurora-bg" />
  <div className="relative z-10 max-w-2xl">
    <h1 className="text-foreground">Built for modern teams</h1>
    <p className="mt-3 text-muted-foreground">
      A calm, accessible, enterprise-grade workspace.
    </p>
    <button className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-[hsl(var(--primary-hover))]">
      Get started
    </button>
  </div>
</section>
```

---

## Scrollbars

Apply `.thin-scrollbar` (4px) or `.pretty-scrollbar` (6px, hover-darkening) to any scroll container.

```tsx
<div className="max-h-96 overflow-y-auto pretty-scrollbar">{/* long list */}</div>
```

---

## Do / Don't

✅ `text-muted-foreground` — semantic, themed, accessible
❌ `text-gray-500` — bypasses dark mode, hardcoded

✅ `bg-primary text-primary-foreground`
❌ `bg-blue-600 text-white`

✅ `<button aria-label="Close">…</button>` for icon-only triggers
❌ `<div onClick={…}>` for triggers (use real `<button>`)

✅ Single `<h1>` per page
❌ Multiple `<h1>`s or skipping `h1 → h3`

✅ `text-foreground` for body text
❌ `text-foreground/70` (opacity on text fails contrast)
