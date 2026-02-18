

## Two-Tier Image Toolbar

Redesign the image interaction model to have two levels of toolbars, inspired by the reference screenshot.

### Behavior

1. **Single click** on image: Shows a minimal floating toolbar above the image with:
   - **Change image** icon (replace image)
   - **Resize/Edit** icon (crop-like icon to enter full editor)
   - An **"Alt text"** badge/button in the top-right corner of the image

2. **Double click** on image OR clicking the Resize/Edit icon: Opens the full toolbar (current one with zoom, fit mode, flip, rotate, resize handle, Done button)

3. **Click outside**: Collapses whichever toolbar is open (with existing fade animation)

### Technical Changes

**File: `src/components/CourseCreation/ImageBlock.tsx`**

- Replace the single `isEditing` boolean with a state like `editorMode: "none" | "simple" | "full"`
- Add `altText` state (string) and pass it via a new `onAltTextChange` prop (or manage internally)
- **Single click** sets mode to `"simple"`
- **Double click** sets mode to `"full"`
- Clicking the resize/edit icon in the simple toolbar transitions to `"full"`

- **Simple toolbar** (mode === "simple"):
  - Compact floating bar above image with 3 icons separated by dividers: Change Image, Resize/Edit icon, plus an "Alt text" button positioned at top-right of the image container
  - Styled similarly to the reference: pill-shaped, subtle shadow, light background

- **Full toolbar** (mode === "full"):
  - Current toolbar with zoom, fit mode, flip/rotate, Done button, and resize handle below

- Update `closeEditor` to animate back to `"none"`
- Update click-outside detection to work with both modes
- Add an inline alt text input (small popover or inline field) triggered by the Alt text button

- Update the `ImageBlockProps` interface to include optional `altText` and `onAltTextChange` props

