import { useLocation, Navigate } from "react-router-dom";
import { MultiPageCourseCreator, type MultiPageCourseCreatorRestoreState } from "@/components/CourseCreation/MultiPageCourseCreator";
import type { AIOptions } from "@/components/Dashboard/AIOptionsPanel";
import type { LayoutTransferState } from "@/components/CourseCreation/LayoutSelectorDropdown";

interface LocationState {
  title: string;
  layout: string;
  aiOptions?: AIOptions | null;
  restoreState?: LayoutTransferState | null;
}

const CreateCourseMultipage = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;

  // Redirect to dashboard if no state (direct access)
  if (!state?.title) {
    return <Navigate to="/dashboard" replace />;
  }

  // Convert LayoutTransferState to MultiPageCourseCreatorRestoreState if present
  // Merge sectionImages back into items' thumbnailUrl
  const sectionImagesFromTransfer = state.restoreState?.sectionImages ?? {};

  const restoreState: MultiPageCourseCreatorRestoreState | null = state.restoreState ? {
    title: state.restoreState.title,
    items: state.restoreState.items.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      inclusions: item.inclusions,
      exclusions: item.exclusions,
      thumbnailUrl: item.thumbnailUrl || (item.type === "section" && sectionImagesFromTransfer[item.id] ? sectionImagesFromTransfer[item.id]! : item.thumbnailUrl),
      children: item.children?.map(child => ({
        id: child.id,
        type: child.type,
        title: child.title,
        inclusions: child.inclusions,
        exclusions: child.exclusions,
        thumbnailUrl: child.thumbnailUrl,
      })),
    })),
    contentBlocks: state.restoreState.contentBlocks.map(b => ({
      id: b.id,
      type: b.type as "text" | "image" | "description",
      content: b.content,
    })),
    pageBlocksMap: Object.fromEntries(
      Object.entries(state.restoreState.pageBlocksMap).map(([k, v]) => [
        k,
        v.map(b => ({
          id: b.id,
          type: b.type as "text" | "image" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description",
          content: b.content,
        })),
      ])
    ),
    sectionObjectivesMap: state.restoreState.sectionObjectivesMap ?? {},
    activeEditorPageId: null,
    aiOptions: state.restoreState.aiOptions,
  } : null;

  return (
    <MultiPageCourseCreator
      courseTitle={restoreState?.title ?? state.title}
      aiOptions={state.aiOptions ?? null}
      initialRestoreState={restoreState}
    />
  );
};

export default CreateCourseMultipage;
