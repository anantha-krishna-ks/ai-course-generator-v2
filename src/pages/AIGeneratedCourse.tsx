import { useLocation, Navigate } from "react-router-dom";
import { MultiPageCourseCreator, type MultiPageCourseCreatorRestoreState } from "@/components/CourseCreation/MultiPageCourseCreator";

function buildAIGeneratedRestoreState(title: string): MultiPageCourseCreatorRestoreState {
  return {
    title,
    items: [
      {
        id: "ai-sec-1",
        type: "section",
        title: "Introduction & Overview",
        thumbnailUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
        children: [
          { id: "ai-p1-1", type: "page", title: "Welcome & Course Overview" },
          { id: "ai-p1-2", type: "page", title: "Learning Objectives" },
        ],
      },
      {
        id: "ai-sec-2",
        type: "section",
        title: "Core Concepts",
        thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
        children: [
          { id: "ai-p2-1", type: "page", title: "Fundamental Principles" },
          { id: "ai-p2-2", type: "page", title: "Key Terminology & Definitions" },
          { id: "ai-p2-3", type: "page", title: "Practical Applications" },
        ],
      },
      {
        id: "ai-sec-3",
        type: "section",
        title: "Deep Dive & Analysis",
        thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
        children: [
          { id: "ai-p3-1", type: "page", title: "Case Studies" },
          { id: "ai-p3-2", type: "page", title: "Industry Best Practices" },
          { id: "ai-p3-3", type: "page", title: "Interactive Workshop" },
        ],
      },
      {
        id: "ai-sec-4",
        type: "section",
        title: "Assessment & Wrap-Up",
        children: [
          { id: "ai-p4-1", type: "page", title: "Course Summary" },
          { id: "ai-q4-1", type: "question", title: "Final Assessment Quiz" },
        ],
      },
    ],
    contentBlocks: [
      {
        id: "ai-cb-1",
        type: "description",
        content: "<h2>Welcome</h2><p>This AI-generated course has been structured to guide you through a comprehensive learning journey, from foundational concepts to advanced applications.</p>",
      },
      {
        id: "ai-cb-2",
        type: "image",
        content: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop",
      },
    ],
    pageBlocksMap: {
      "ai-p1-1": [
        { id: "ai-pb-1-1", type: "text", content: "<p>Welcome to this AI-generated course! This program has been carefully structured by artificial intelligence to provide you with a comprehensive and engaging learning experience.</p>" },
        { id: "ai-pb-1-2", type: "image", content: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop" },
      ],
      "ai-p1-2": [
        { id: "ai-pb-1-3", type: "text", content: "<p>By the end of this course, you will be able to:</p><ul><li>Understand core principles and frameworks</li><li>Apply concepts to real-world scenarios</li><li>Analyze and evaluate complex situations</li><li>Create actionable strategies</li></ul>" },
      ],
      "ai-p2-1": [
        { id: "ai-pb-2-1", type: "text", content: "<p>The fundamental principles form the backbone of this discipline. Understanding these concepts is crucial for building a strong foundation that supports all subsequent learning.</p>" },
      ],
      "ai-p2-2": [
        { id: "ai-pb-2-2", type: "text", content: "<p>Key terms and definitions that you'll encounter throughout this course:</p><ul><li><strong>Term 1</strong> — Definition and explanation</li><li><strong>Term 2</strong> — Definition and explanation</li><li><strong>Term 3</strong> — Definition and explanation</li></ul>" },
      ],
      "ai-p2-3": [
        { id: "ai-pb-2-3", type: "text", content: "<h3>Practical Applications</h3><p>In this section, we explore how theoretical concepts translate into real-world practice through guided examples and scenarios.</p>" },
        { id: "ai-pb-2-4", type: "image", content: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop" },
      ],
      "ai-p3-1": [
        { id: "ai-pb-3-1", type: "text", content: "<h3>Case Study 1: Industry Analysis</h3><p>This case study examines a real-world scenario where organizations applied the core principles discussed in earlier modules.</p>" },
      ],
      "ai-p3-2": [
        { id: "ai-pb-3-2", type: "text", content: "<h3>Best Practices</h3><p>Based on industry research, the following best practices have been identified:</p><ol><li>Establish clear objectives</li><li>Use data-driven decision making</li><li>Continuously monitor outcomes</li><li>Document lessons learned</li></ol>" },
      ],
      "ai-p3-3": [
        { id: "ai-pb-3-3", type: "text", content: "<h3>Interactive Workshop</h3><p>Apply what you've learned through hands-on exercises designed to reinforce key concepts and develop practical skills.</p>" },
      ],
      "ai-p4-1": [
        { id: "ai-pb-4-1", type: "text", content: "<h3>Course Summary</h3><p>Throughout this course, you have explored the fundamental principles, key terminology, practical applications, and advanced topics. Let's review the major concepts covered in each module.</p>" },
      ],
      "ai-q4-1": [
        { id: "ai-pb-q-1", type: "text", content: "<h3>Final Assessment</h3><p>This quiz will test your understanding of the key concepts covered throughout the course.</p>" },
        { id: "ai-pb-q-2", type: "quiz", content: JSON.stringify([
          { question: "What is the primary purpose of this course?", type: "SCQ", options: ["Entertainment", "Building foundational knowledge and practical skills", "Data entry", "Social networking"], answer: "Building foundational knowledge and practical skills", explanation: "The course is designed to provide in-depth knowledge and practical skills." },
          { question: "Which of the following are covered in the Core Concepts module?", type: "MCQ", options: ["Fundamental Principles", "Key Terminology", "Practical Applications", "All of the above"], answer: "All of the above", explanation: "The Core Concepts section covers principles, terminology, and practical applications." },
          { question: "Case studies help reinforce theoretical concepts with real-world examples.", type: "SCQ", options: ["True", "False"], answer: "True", explanation: "Case studies bridge the gap between theory and practice." },
        ]) },
      ],
    },
    sectionObjectivesMap: {
      "ai-sec-1": "Introduce learners to the course structure and set clear expectations for the learning journey.",
      "ai-sec-2": "Build a strong foundation by covering the core concepts, terminology, and key principles.",
      "ai-sec-3": "Deepen understanding through case studies, best practices, and interactive exercises.",
      "ai-sec-4": "Assess comprehension and reinforce key takeaways from the entire course.",
    },
    activeEditorPageId: null,
    aiOptions: {
      enabled: true,
      supportingDocuments: [],
      bloomsTaxonomy: ["Remember", "Understand", "Apply", "Analyze"],
      intendedLearners: "Beginners to Intermediate",
      guidelines: "",
      guidelinesDocuments: [],
      exclusions: "",
      exclusionsDocuments: [],
      pageSpanTime: 10,
      courseSpanTime: 60,
    },
  };
}

export default function AIGeneratedCourse() {
  const location = useLocation();
  const courseTitle = (location.state as { title?: string })?.title;

  if (!courseTitle) {
    return <Navigate to="/dashboard" replace />;
  }

  const restoreState = buildAIGeneratedRestoreState(courseTitle);

  return (
    <MultiPageCourseCreator
      courseTitle={courseTitle}
      aiOptions={restoreState.aiOptions}
      initialRestoreState={restoreState}
    />
  );
}
