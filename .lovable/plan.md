

## Configuration Page Revamp — Vertical Tabs + Search

### Why not accordions
Accordions stack 12 long sections vertically — users lose orientation, scroll endlessly, and can't compare or jump between groups. With ~50 fields across 12 groups, we need lateral navigation, not vertical collapse.

### Recommended pattern: **Sticky vertical tabs (left rail) + scrollable form panel (right) + global search**

This is the same pattern used by Stripe Dashboard, Vercel Project Settings, GitHub repo settings, and Linear workspace settings — proven for dense config UIs.

```text
┌──────────────────────────────────────────────────────────────────┐
│  Header + Breadcrumb + "Customer configuration – 101abc1"        │
│                                              [Save configuration]│
├──────────────────────────────────────────────────────────────────┤
│  🔍 Search any setting…  (filters tabs + highlights matches)     │
├────────────────┬─────────────────────────────────────────────────┤
│ ● Connection   │   Connection                          ● Edited  │
│   Azure        │   ─────────────────────────────────────────────│
│   Crypto       │   Connection      [ mongodb://10.10.2.39… ]    │
│   Mail         │   Database        [ CourseEDV6 ]               │
│   File Config  │                                                │
│   CourseED     │   ─── Saved 2 mins ago                          │
│   Video        │                                                │
│   Azure OpenAI │                                                │
│   Gemini       │                                                │
│   AWS          │                                                │
│   Vector DB    │                                                │
│   Time Zone    │                                                │
│ ─────────────  │                                                │
│ 12 groups · 47 │                                                │
│ fields         │                                                │
└────────────────┴─────────────────────────────────────────────────┘
```

### Why this beats accordion
| Concern | Accordion | Vertical Tabs |
|---|---|---|
| Find a field fast | Scroll + open/close | One click + search |
| See current group context | Lost when scrolled | Always visible (sticky rail) |
| Track unsaved edits per group | Hard to spot | Dot indicator on tab |
| Mobile | Same long scroll | Collapses to top dropdown |
| Mental model | "Drawer to dig through" | "Settings app" — familiar |

### Workflow
1. Land on page → first group (Connection) auto-selected, fields visible immediately.
2. Click a tab in the left rail → right panel swaps instantly (no scroll).
3. Edit a field → small **● Edited** dot appears on the tab + group header.
4. **Search bar** at top filters the left rail to only matching groups and highlights matching field labels in the panel.
5. Single sticky **Save configuration** button (top-right) saves all changed groups in one call. Toast on success.
6. **Discard changes** appears next to Save when there are unsaved edits.

### Tab grouping (from screenshots)
Connection · AzureSettings · Crypto · MailSettings · FileConfig · CourseEDSettings · VideoSettings · AzureOpenAI · GeminiSettings · AWSSettings · VectorDB · TimeZone

Each tab gets a small lucide icon (Database, Cloud, KeyRound, Mail, FolderCog, Settings2, Video, Brain, Sparkles, Cloud, Layers, Clock).

### Field rendering rules
- **Text** → `Input`
- **Select** (e.g., Hash Algorithm, Email Provider) → shadcn `Select`
- **Boolean** (Enable SSL, Enable Vector Search) → `Switch` aligned right
- **Secret** (Keys, Passwords, Secrets) → masked `Input` with show/hide eye toggle + copy button
- **URL** → `Input` with `type="url"` + small "Open" icon
- All fields use existing `fieldHeadingClass` (`text-base font-semibold text-foreground mb-2 block`) for consistency with Add/Edit Customer dialogs
- Two-column grid (`md:grid-cols-2`) inside each panel so a group like AzureOpenAI (12 fields) fits without endless scroll

### Responsive
- ≥`lg`: left rail (240px) + right panel
- `md`: left rail collapses to a horizontal scrolling chip strip above panel
- `sm`: chip strip → `Select` dropdown above panel

### Technical notes
- New file `src/pages/CustomerConfiguration.tsx` (replace current placeholder grid)
- Use shadcn `Tabs` with `orientation="vertical"` for the rail; custom styling so it looks like a settings sidebar (full-width pill items, active state with `bg-primary/10 text-primary border-l-2 border-primary`)
- Mock config data structured as `ConfigGroup[] = { id, label, icon, fields: ConfigField[] }` — single source of truth for both rail and panel
- Local `useState` for form values + a `dirtyGroups: Set<string>` to drive the "● Edited" dots
- Search uses simple `.toLowerCase().includes()` over field labels and group labels; non-matching groups are hidden from rail, matching field labels get a `bg-yellow-100/40` highlight
- Sticky header (`sticky top-16`) keeps Save button always reachable
- All a11y: each tab has `aria-label`, secret toggle buttons have `aria-label="Show/Hide value"`, single `<h1>`, form inputs have visible `<Label>`, icons `aria-hidden="true"`

### Out of scope for this pass
- No backend wiring (data is mocked from screenshots)
- No validation rules per field — placeholder values only
- No audit log / change history view

