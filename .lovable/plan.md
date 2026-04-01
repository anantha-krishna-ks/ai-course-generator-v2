

# Re-imagined Create Course Dialog

## Current State
A single-screen modal with a vertical stack: title input, two layout cards side-by-side, AI toggle, and a "Start creating" button. Functional but formulaic.

## New Concept: Stepped Wizard with a Left Sidebar Progress Rail

Replace the single scrollable form with a **compact 2-step wizard** inside the same dialog. A slim left-side vertical progress indicator shows where the user is, and content transitions between steps with a subtle slide animation.

### Step 1 -- "Name & Layout"
- A large, prominent **course title input** at the top with a floating label style (no separate heading needed -- the input IS the hero).
- Below it, the **layout selector cards** (kept exactly as-is: preview images, radio indicators, descriptions).
- The **AI Support toggle row** sits at the bottom of this step (kept exactly as-is).
- A "Continue" button at the bottom-right advances to Step 2.

### Step 2 -- "Review & Create"
- A polished **summary card** showing:
  - The entered course title in large text
  - The selected layout as a small badge with its icon
  - AI Support status (enabled/disabled) with the configure link still accessible
- A prominent **"Create Course"** button with a rocket/wand icon
- A "Back" text-link to return to Step 1

### Visual Changes
- **Dialog width**: stays ~800px max but now has a **left progress rail** (48px wide, subtle muted background) with two numbered dots connected by a vertical line. Active dot uses `primary`, completed dot gets a checkmark.
- **Step transitions**: content area uses a CSS `translate-x` + `opacity` transition (200ms) when moving between steps.
- The **title input** becomes a "hero input" -- larger font (1.5rem), no visible border until focus (underline-style), with placeholder "What will you teach?"
- **Footer area**: replaces the centered button with a right-aligned step navigation bar (Back / Continue or Create).

### What's New Beyond Cosmetics
- **Step 2 summary** gives the user a moment of confirmation before committing -- reduces accidental creation with wrong settings.
- The **progress rail** makes the flow feel guided and intentional rather than a dumped form.

## Technical Plan

### File: `src/components/Dashboard/CreateCourseDialog.tsx`
1. Add a `step` state (1 or 2). Default to 1.
2. Restructure the dialog body into a flex layout: left rail (progress indicator) + right content area.
3. **Step 1 content**: Reuse existing title input (restyle with hero treatment), layout selector grid (unchanged), and `AIToggleRow` (unchanged). Replace "Start creating" button with "Continue" that validates title is non-empty.
4. **Step 2 content**: Summary card displaying title, layout badge, AI status. "Create Course" button triggers existing `handleStartCreating` logic. "Back" link sets step to 1.
5. Add a CSS transition wrapper around the step content for slide animation.
6. Reset `step` to 1 in `handleClose`.
7. **InlineLoader** and **AIConfigView** remain unchanged -- they replace the wizard content exactly as before.

### Progress Rail Component (inline, not a separate file)
- A `div` with `w-12 border-r` containing two stacked circle indicators connected by a vertical line.
- Step 1 circle: numbered "1" or checkmark when on step 2.
- Step 2 circle: numbered "2", highlighted when active.

### No changes to:
- `AIOptionsPanel.tsx` (AIToggleRow and AIConfigView stay identical)
- `AIOptions` type or `defaultAIOptions`
- Navigation logic, loading animation, or route handling

