import { useLocation, Navigate } from "react-router-dom";
import { SinglePageCourseCreator, type SinglePageRestoreState } from "@/components/CourseCreation/SinglePageCourseCreator";
import type { AIOptions } from "@/components/Dashboard/AIOptionsPanel";
import type { LayoutTransferState } from "@/components/CourseCreation/LayoutSelectorDropdown";

interface LocationState {
  title: string;
  layout: string;
  aiOptions?: AIOptions | null;
  restoreState?: LayoutTransferState | null;
}

const CreateCourseSinglepage = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;

  if (!state?.title) {
    return <Navigate to="/dashboard" replace />;
  }

  // Convert LayoutTransferState to SinglePageRestoreState if present
  const restoreState: SinglePageRestoreState | null = state.restoreState ? {
    title: state.restoreState.title,
    items: state.restoreState.items.map(item => ({
      id: item.id,
      type: item.type === "question" ? "page" as const : item.type,
      title: item.title,
      children: item.children?.map(child => ({
        id: child.id,
        type: child.type === "question" ? "page" as const : child.type,
        title: child.title,
      })),
    })),
    contentBlocks: state.restoreState.contentBlocks.map(b => ({
      id: b.id,
      type: b.type as "text" | "image" | "description" | "video" | "audio" | "doc" | "quiz" | "image-description" | "video-description",
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
    sectionImages: state.restoreState.sectionImages ?? {},
    aiOptions: state.restoreState.aiOptions,
  } : null;

  return (
    <SinglePageCourseCreator
      courseTitle={state.title}
      aiOptions={state.aiOptions ?? null}
      initialRestoreState={restoreState}
    />
  );
};

export default CreateCourseSinglepage;
