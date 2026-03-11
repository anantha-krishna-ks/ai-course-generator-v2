import { useLocation, Navigate } from "react-router-dom";
import { SinglePageCourseCreator } from "@/components/CourseCreation/SinglePageCourseCreator";
import type { AIOptions } from "@/components/Dashboard/AIOptionsPanel";

interface LocationState {
  title: string;
  layout: string;
  aiOptions?: AIOptions | null;
}

const CreateCourseSinglepage = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;

  if (!state?.title) {
    return <Navigate to="/dashboard" replace />;
  }

  return <SinglePageCourseCreator courseTitle={state.title} aiOptions={state.aiOptions ?? null} />;
};

export default CreateCourseSinglepage;
