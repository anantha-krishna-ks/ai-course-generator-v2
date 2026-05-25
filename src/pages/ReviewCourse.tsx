import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MultiPageCourseCreator } from "@/components/CourseCreation/MultiPageCourseCreator";
import { mockCourseData, buildMockRestoreState } from "@/data/mockCourseData";

const ReviewCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const course = courseId ? mockCourseData[courseId] : null;
  const restoreState = useMemo(
    () => (course ? buildMockRestoreState(course.title) : null),
    [course],
  );

  useEffect(() => {
    document.title = course ? `Review · ${course.title}` : "Review Course";
  }, [course]);

  if (!course || !restoreState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Course not found.</p>
          <Button onClick={() => navigate("/dashboard")} className="rounded-full">
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <MultiPageCourseCreator
      key={courseId}
      courseTitle={course.title}
      initialRestoreState={restoreState}
      aiOptions={restoreState.aiOptions}
      readOnly
    />
  );
};

export default ReviewCourse;
