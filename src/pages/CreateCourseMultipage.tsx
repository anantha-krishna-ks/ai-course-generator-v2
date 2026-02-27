import { useLocation, Navigate } from "react-router-dom";
import { MultiPageCourseCreator } from "@/components/CourseCreation/MultiPageCourseCreator";
import type { AIOptions } from "@/components/Dashboard/AIOptionsPanel";

interface LocationState {
  title: string;
  layout: string;
  aiOptions?: AIOptions | null;
}

const CreateCourseMultipage = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;

  // Redirect to dashboard if no state (direct access)
  if (!state?.title) {
    return <Navigate to="/dashboard" replace />;
  }

  return <MultiPageCourseCreator courseTitle={state.title} aiOptions={state.aiOptions ?? null} />;
};

export default CreateCourseMultipage;
