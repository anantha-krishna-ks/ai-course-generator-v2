import { useEffect, useMemo, useState } from "react";
import { useParams, Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { MultiPageCourseCreator } from "@/components/CourseCreation/MultiPageCourseCreator";
import { AuthorReviewCommentsButton } from "@/components/EditCourse/AuthorReviewCommentsButton";
import { mockCourseData, buildMockRestoreState } from "@/data/mockCourseData";
import { useLiveCourseStatus } from "@/components/Course/CourseStatusBadge";
import { useToast } from "@/hooks/use-toast";
import { subscribeCourseCopies } from "@/services/courseCopyStore";

const EditCourse = () => {
  const { courseId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const courseData = courseId ? mockCourseData[courseId] : null;
  const status = useLiveCourseStatus(courseId);

  // Re-mount the editor whenever copied items change so newly copied pages /
  // sections show up live in the destination course.
  const [copyVersion, setCopyVersion] = useState(0);
  useEffect(() => {
    return subscribeCourseCopies(() => setCopyVersion((v) => v + 1));
  }, []);

  useEffect(() => {
    if (courseId && status === "in-review") {
      toast({
        title: "Course locked for review",
        description: "Editing is disabled while reviewers are working on this course.",
      });
      navigate(`/review-course/${courseId}`, { replace: true });
    }
  }, [courseId, status, navigate, toast]);

  const restoreState = useMemo(
    () => (courseData && courseId ? buildMockRestoreState(courseData.title, courseId) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [courseData, courseId, copyVersion],
  );

  if (!courseData) {
    return <Navigate to="/dashboard" replace />;
  }

  if (status === "in-review") {
    return null;
  }

  return (
    <>
      <MultiPageCourseCreator
        key={`${courseId}-${copyVersion}`}
        courseTitle={courseData.title}
        aiOptions={restoreState!.aiOptions}
        initialRestoreState={restoreState!}
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
