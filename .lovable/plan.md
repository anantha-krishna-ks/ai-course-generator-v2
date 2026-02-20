

## Plan: Show Page UI in Course Outline When "New Page" Is Clicked

### What Changes

When "New page" is clicked from the "Add item" dropdown, a page entry will appear directly in the course outline (not inside a section) with the same clean UI shown in the reference:
- File icon on the left
- "Enter page title..." input, auto-focused with visible underline
- Character counter (0/350)
- "Open" button on the right

### Technical Details

**1. Render all item types in the outline (not just sections)**

Currently, `MultiPageCourseCreator.tsx` line 656 filters items to only show sections. We need to render pages and questions too, in their insertion order.

Update the outline rendering loop to iterate over all `items` and render:
- `type === "section"` -- existing `SectionCard`
- `type === "page"` -- a new standalone `PageItemCard` component
- `type === "question"` -- (leave as-is for now, or skip)

**2. Create a `PageItemCard` component**

A lightweight card rendered in the outline for standalone page items. It will feature:
- A rounded card container with border (matching the section card style)
- Inside: file icon, editable title input (350 char limit), character counter (visible on focus), and an "Open" button
- The input auto-focuses when the page is first added
- Duplicate and delete actions via a three-dot menu (reusing the same delete dialog pattern)
- Drag handle on hover (for future reordering of outline items)

**3. Auto-focus new page input**

When a new page item is added, set its title to empty (`""` instead of `"New Page"`) and auto-focus the input field so the user can immediately start typing.

### Files to Modify

- `src/components/CourseCreation/MultiPageCourseCreator.tsx` -- Render page items in outline, update `handleAddItem` to use empty title for pages
- `src/components/CourseCreation/PageItemCard.tsx` -- New component for standalone page entries in the outline

