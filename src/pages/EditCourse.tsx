import { useParams, Navigate, useSearchParams } from "react-router-dom";
import { MultiPageCourseCreator } from "@/components/CourseCreation/MultiPageCourseCreator";
import { AuthorReviewCommentsButton } from "@/components/EditCourse/AuthorReviewCommentsButton";
import { mockCourseData, buildMockRestoreState } from "@/data/mockCourseData";

const EditCourse = () => {
  const { courseId } = useParams();
  const [params] = useSearchParams();
  const courseData = courseId ? mockCourseData[courseId] : null;

  if (!courseData) {
    return <Navigate to="/dashboard" replace />;
  }

  const restoreState = buildMockRestoreState(courseData.title);

  return (
    <>
      <MultiPageCourseCreator
        courseTitle={courseData.title}
        aiOptions={restoreState.aiOptions}
        initialRestoreState={restoreState}
      />
      <AuthorReviewCommentsButton
        courseId={courseId!}
        courseTitle={courseData.title}
        defaultOpen={params.get("comments") === "1"}
      />
    </>
  );
};

export default EditCourse;
