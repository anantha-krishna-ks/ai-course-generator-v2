# Cross-container drag & drop for pages and sections

Today the outline uses two isolated `DndContext`s:
- `MultiPageCourseCreator` — top-level items (sections + loose pages), reorder only.
- `SectionCard` — pages inside a single section, reorder only.

Because they don't share a context, a page inside Section A cannot be dragged into Section B, nor out to become a top-level page, nor can a top-level page be dropped into a section. This plan unifies them.

## Goal

- Drag a child page out of its section -> drop on top level (becomes a loose top-level page).
- Drag a top-level page into a section -> becomes a child of that section.
- Drag a child page from Section A into Section B (any position).
- Reorder child pages within a section and top-level items (existing behavior preserved).
- Sections themselves keep reordering at the top level only (can't be nested inside another section).

## Approach

Move all outline DnD into one `DndContext` owned by `MultiPageCourseCreator`, with each section's child page list as its own droppable `SortableContext`. Remove the nested `DndContext` from `SectionCard`.

### 1. Single source of truth for drag state

`MultiPageCourseCreator` already holds `items` (sections with `children` and loose pages). All move logic happens here via a new `movePage(activeId, target)` reducer:

- `target = { kind: "section", sectionId, overPageId? }` — insert into section's children, before `overPageId` or at end.
- `target = { kind: "top", overItemId? }` — insert as top-level page before `overItemId` or at end.

It also removes the page from its current parent (top-level or any section) first.

### 2. Droppable containers

- Each section exposes a droppable zone for its children list via `useDroppable({ id: "section-drop:" + sectionId })` wrapped around the existing pages list, plus its `SortableContext` listing child page ids. An empty section still shows a visible "Drop page here" hint when something is being dragged.
- The top-level list keeps its existing `SortableContext` of `items.map(i => i.id)`.

### 3. Collision detection & `onDragOver`

Use `closestCorners` (better for nested lists than `closestCenter`). In `onDragOver`, if the active id is a page and it's hovering over a section container (or a child page of a different section), optimistically reparent it so the user sees it move in real time (standard dnd-kit multi-container pattern).

In `onDragEnd`, finalize position via `arrayMove` within the resolved container. Sections dragged over child pages are clamped to top-level reorder only.

### 4. Visual feedback

- Reuse the existing `DragOverlay` to render a lightweight ghost of the dragged page/section title.
- Highlight the hovered section's child list with the existing `ring-2 ring-dashed ring-primary/40` style when a page is being dragged over it.
- Empty section child area gets a min-height placeholder: "Drop page here".

### 5. SectionCard changes

- Remove its internal `DndContext` and `pageSensors`.
- Keep its `SortableContext` for child pages, but driven by the parent context.
- Replace local `setPages` reorder with the existing `onPagesChange` callback (already wired to parent `items`). All mutations route through `MultiPageCourseCreator`.

### 6. Accessibility

- Keep `aria-label="Drag to reorder page/section"` on handles.
- Add `aria-label="Drop pages into section X"` on section drop zones.
- Keyboard reordering (PointerSensor + KeyboardSensor) still works for in-list reorder; cross-container keyboard move is out of scope for this pass.

## Technical notes

- File edits: `src/components/CourseCreation/MultiPageCourseCreator.tsx`, `src/components/CourseCreation/SectionCard.tsx`.
- New helper: `movePage` inside `MultiPageCourseCreator` (pure transform on `items`).
- Drag identity: prefix child page ids in `SortableContext` is not needed — page ids are already unique across the tree. We resolve parent by scanning `items` for the active id.
- `pageBlocksMap` and `sectionObjectivesMap` are keyed by id, so moving a page preserves its content automatically.
- No backend/storage changes; this is purely client state.

## Out of scope

- Nesting sections inside sections.
- Multi-select drag.
- Keyboard-driven cross-container moves (will follow if requested).
