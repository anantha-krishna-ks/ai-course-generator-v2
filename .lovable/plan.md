## Goal

Reviewers should see the **exact same Multi-page / Single-page course layout** as authors do, but with no edit / add / delete affordances — only the ability to read content and leave comments on any block (using the existing `BlockCommentIndicator` popover thread).

## Approach

Add a `readOnly` mode to the existing creators and reuse them on the reviewer route. No duplicated layout code.

### 1. `MultiPageCourseCreator` — add `readOnly?: boolean`

When `readOnly` is true:
- Hide all action buttons in the header: Save / Export / Preview stays, but Add page, Add section, Generate, AI, Clone, Delete, Token, Modify Structure, Font, Layout selectors are hidden.
- Outline sidebar: hide drag handles, `+ Add page/section`, rename, duplicate, delete menus on each `PageItemCard` / `SectionCard`. Clicks still navigate / open the page editor.
- Disable `dnd-kit` sortable wiring (skip `useSortable` registrations or render as plain list).
- Pass `readOnly` through to `PageEditorDialog`.
- Hide the title autoresize textarea's editability (make it a static `<h1>`).
- Hide the inline AddContentButton and DropIndicator components in the editor area.

### 2. `PageEditorDialog` — add `readOnly?: boolean`

When `readOnly` is true:
- Render the dialog with the same chrome (header + tabs + content area), but:
  - Hide block sidebar tab buttons that add blocks; keep "Outline" tab read-only.
  - Pass `readOnly` to each `ContentBlock` / `NestedLayoutBlock` so they don't show their action toolbars.
  - Skip rendering the inline `AddContentButton` between blocks and `DropIndicator`.
  - `BlockCommentIndicator` stays — that's the only interaction.
- Hide the trailing Save / Generate buttons in the dialog footer.

### 3. `ContentBlock` already supports `readOnly` (used by AI review). Verify it disables typing in the rich editor and hides the action menu when set. If not, extend it.

### 4. New reviewer container: `src/pages/ReviewCourse.tsx` (replace current implementation)

```tsx
const ReviewCourse = () => {
  const { courseId } = useParams();
  const courseData = mockCourseData[courseId!];
  if (!courseData) return <Navigate to="/dashboard" />;
  const restore = buildMockRestoreState(courseData.title);

  return (
    <>
      <ReviewHeaderBanner title={courseData.title} />
      <MultiPageCourseCreator
        courseTitle={courseData.title}
        aiOptions={restore.aiOptions}
        initialRestoreState={restore}
        readOnly
      />
    </>
  );
};
```

Notes:
- The header banner shows "Review mode · view only" + reviewer badge + back button (replaces the editor's own header actions).
- Comment popover (`BlockCommentIndicator`) already handles posting comments → store → notifies the author.

### 5. Single-page parity

Mirror the same `readOnly` prop on `SinglePageCourseCreator`. Decide which to render based on `mockCourseData[courseId].layout` (multi vs single). If only multi-page mock data exists today, gate single-page behind data and add it later.

### 6. Cleanup

- Remove the bespoke layout code in the current `ReviewCourse.tsx`.
- Keep `reviewCommentsStore` and `BlockCommentIndicator` exactly as they are.
- Dashboard "Review" tab cards still link to `/review-course/:courseId`.

## Out of scope

- Real-time multi-reviewer sync (still localStorage mock).
- Single-page mock data if not present — handled in a follow-up if needed.

## Risk / size

`MultiPageCourseCreator` is ~1650 lines; threading `readOnly` through outline cards, page editor dialog, content blocks, and header is the bulk of the work. Expect changes in ~6 files.

Shall I proceed with this plan, or would you prefer a lighter-weight approach (e.g. keep the current simpler ReviewCourse layout and just upgrade it visually to match the editor's look without reusing the editor components)?
