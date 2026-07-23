## Plan

You’re right — the **Page duration** control was added to the AI generation step-by-step screen, but not to the dashboard **Create Course** popup you’re looking at.

I’ll add it directly in this modal so it appears in the same screen as **Course Title**, **AI Support**, **SCORM Preferences**, and **Import outline**.

### Changes

1. **Add Page duration to Create Course popup**
   - Place the shared **Page duration** card inside `CreateCourseDialog`, likely between **AI Support** and **SCORM Preferences** so it is easy to find.
   - Bind it to the existing `aiOptions.pageSpanTime` value already used by this flow.

2. **Keep it separate from SCORM**
   - The control will not live inside SCORM Preferences.
   - SCORM will remain only for packaging/completion rules.

3. **Reuse the same UI**
   - Use the existing shared `PageDurationDefaultCard` so the visual style stays consistent with the other workflows.
   - Store minutes/seconds cleanly while preserving this modal’s existing minute-based `pageSpanTime` data.

4. **Accessibility and layout**
   - Keep the inputs labeled with accessible names.
   - Make the card compact enough for the popup and aligned with the surrounding rows.