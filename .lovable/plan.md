# Plan: Publish "Copy From" Feature Documentation to Confluence

Use the connected **Atlassian MCP** to create a new Confluence page documenting the Copy From / Copy Content feature based on the actual implementation in the codebase. No code changes — this is a documentation-publishing task only.

## Steps

1. **Discover Confluence target**
   - `getAccessibleAtlassianResources` → resolve `cloudId`.
   - `getConfluenceSpaces` → pick the most appropriate space (prefer a Product / Documentation / Engineering space). If multiple plausible, default to the first writable space and note it in the page footer.

2. **Create the page** via `createConfluencePage`
   - Title: **"Copy From — Feature Documentation (Course Builder)"**
   - Status: `current`
   - Body in Confluence storage format (XHTML) with the structure below.

3. **Confirm** back to the user with the new page URL and ID.

## Page Outline (Deep Technical)

1. **Overview** — What Copy From does: lets authors reuse existing course content (sections, pages, blocks) from My Courses or Shared Courses into the course they are editing. Two complementary surfaces:
   - **Copy Content dialog** (pull) — inside the editor, opened from the outline toolbar.
   - **Copy to Course dialog** (push) — from a section/page row's menu, sends that item into another course.

2. **User Flows**
   - **Pull flow (Copy Content)**: open dialog → choose **My Courses / Shared Courses** → pick source course (combobox) → choose **Sections** or **Pages** mode → Continue → Review step with live preview, toggle pages, switch active section → Copy.
   - **Push flow (Copy to)**: from a section/page card menu → pick destination course → (for pages) pick destination section → Copy.
   - Outcome: destination course's outline updates in real time via a `course-copy-updated` event.

3. **UI Surfaces & Entry Points**
   - `MultiPageCourseCreator` toolbar → "Copy Content" button (`showCopyContentDialog`).
   - `SectionCard` (multipage & singlepage variants) → "Copy section to…".
   - `PageItemCard` → "Copy page to…".

4. **Components**
   | Component | File | Responsibility |
   |---|---|---|
   | `CopyContentDialog` | `src/components/CourseCreation/CopyContentDialog.tsx` | 2-step (config → review) pull dialog with live preview, section/pages mode. |
   | `CopyToCourseDialog` | `src/components/CourseCreation/CopyToCourseDialog.tsx` | Push dialog: choose destination course (+ section for pages). |
   | `MultiPageCourseCreator` | `src/components/CourseCreation/MultiPageCourseCreator.tsx` | Hosts Copy Content dialog and consumes `onSelect` payload. |
   | `SectionCard`, `PageItemCard` | `src/components/CourseCreation/` | Trigger CopyToCourseDialog with `mode`, `itemTitle`, payload. |

5. **State & Data Model** (`src/services/courseCopyStore.ts`)
   - `STORAGE_KEY = "course-copy-store-v1"` in `localStorage`.
   - `EVENT_NAME = "course-copy-updated"` for cross-component reactivity.
   - Types: `CopiedPageBlock`, `CopiedPage`, `CopiedSection`, `CourseCopyData { pagesBySection, sections }`.
   - APIs: `getCourseCopies`, `addCopiedPage`, `addCopiedSection`, `subscribeCourseCopies` (listens to both custom event and cross-tab `storage` event, filtered by key).
   - Destination outlines merge copies via `buildMockRestoreState` so copied sections become valid copy targets themselves.

6. **CopyContentDialog Internals**
   - `SourceType = "my" | "shared"`, `Step = "config" | "review"`, `mode = "sections" | "pages"`.
   - Selection state: `course`, `selectedSectionId`, `selectedPageIds`, `previewPageId`.
   - `handleContinue` seeds defaults: sections mode → first section + all its pages (overview preview); pages mode → first 2 root pages.
   - `togglePage` keeps `previewPageId` valid (falls back to overview in section mode, first page in pages mode).
   - Review pane renders preview blocks (`heading|paragraph|list|callout|image|video|audio|doc|quiz`).
   - `onSelect` payload: `{ course, mode, sourceType, selectedSectionId?, selectedPageIds }`.

7. **CopyToCourseDialog Internals**
   - Props: `mode: "page" | "section"`, `itemTitle`, `pagePayload?`, `sectionPayload?`.
   - Reads destination list from `mockCourseData`; merges with `buildMockRestoreState` so previously copied sections appear as targets.
   - Section mode requires only `courseId`; page mode requires `courseId` + `sectionId`.
   - On confirm: dispatches `addCopiedPage` or `addCopiedSection`, then toasts confirmation.

8. **Data Flow Diagram**

```text
   Source Course               CopyContentDialog / CopyToCourseDialog
   ─────────────               ──────────────────────────────────────
   mockCourseData ──► buildMockCourse ──► review/preview
                                    │
                                    ▼
                       addCopiedPage / addCopiedSection
                                    │
                                    ▼
                       localStorage("course-copy-store-v1")
                                    │
                            dispatch CustomEvent
                                    │
                                    ▼
                      subscribeCourseCopies → outline re-render
                                    │
                                    ▼
                      buildMockRestoreState merges copies
                                    │
                                    ▼
                          Destination Course Outline
```

9. **Accessibility**
   - All triggers are `<button>` with `aria-label`s; icons are `aria-hidden="true" focusable="false"`.
   - Dialogs include `DialogDescription` (visible or `sr-only`).
   - Radio cards expose `role="radio"` + `aria-checked`; combobox uses `role="combobox"` + `aria-expanded`.
   - Selects have associated `<label htmlFor>` and `aria-label` on `SelectTrigger`.

10. **Edge Cases & Behaviors**
    - Closing the dialog calls `resetAll()` — selection is not persisted between opens.
    - Storage event handler filters by `STORAGE_KEY` to prevent spurious editor preview re-mounts.
    - Copied page/section IDs are regenerated (`copied-page-…`, `copied-sec-…`) to avoid collisions on destination.
    - Section mode (push) ignores `sectionId`; page mode disables the section select until a course is picked.
    - Mock-only persistence today — `courseCopyStore` is `localStorage` based; production replacement should swap the store implementation while keeping the same API.

11. **Developer Notes / Extension Points**
    - To wire to a real backend: replace `addCopiedPage`/`addCopiedSection` with API calls; keep `subscribeCourseCopies` semantics so consumers don't change.
    - To support cross-org Shared Courses: extend `SourceType` and the `MY_COURSES`/`SHARED_COURSES` mock loaders inside `CopyContentDialog`.
    - To enable block-level copy: `CopiedPage.blocks` is already in the schema; surface a block picker in the review step.

12. **Glossary** — Outline, Section, Page, Block, Destination, Source, Pull vs Push.

13. **References (Source)** — file paths listed in section 4 with line anchors for `CopyContentDialog.tsx` (≈1651 lines), `CopyToCourseDialog.tsx`, `courseCopyStore.ts`, plus consumers in `MultiPageCourseCreator.tsx`, `SectionCard.tsx`, `PageItemCard.tsx`.

## Deliverable
A single Confluence page (new) containing the above, formatted with headings, tables, a code/ASCII data-flow block, and an info panel for the "mock persistence today" caveat. The chat reply will include the new page URL.
