import { useEffect } from "react";
import { useParams, Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { MultiPageCourseCreator } from "@/components/CourseCreation/MultiPageCourseCreator";
import { AuthorReviewCommentsButton } from "@/components/EditCourse/AuthorReviewCommentsButton";
import { mockCourseData, buildMockRestoreState } from "@/data/mockCourseData";
import { useLiveCourseStatus } from "@/components/Course/CourseStatusBadge";
import { useToast } from "@/hooks/use-toast";

const EditCourse = () => {
  const { courseId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const courseData = courseId ? mockCourseData[courseId] : null;
  const status = useLiveCourseStatus(courseId);

  // Author-side lock: once a course is submitted for review, the author can no
  // longer edit it. Redirect them to the read-only reviewer view.
  useEffect(() => {
    if (courseId && status === "in-review") {
      toast({
        title: "Course locked for review",
        description: "Editing is disabled while reviewers are working on this course.",
      });
      navigate(`/review-course/${courseId}`, { replace: true });
    }
  }, [courseId, status, navigate, toast]);

  if (!courseData) {
    return <Navigate to="/dashboard" replace />;
  }

  if (status === "in-review") {
    // Avoid briefly mounting the editor before the redirect fires.
    return null;
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
