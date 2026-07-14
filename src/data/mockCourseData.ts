import type { MultiPageCourseCreatorRestoreState } from "@/components/CourseCreation/MultiPageCourseCreator";
import { getCourseCopies } from "@/services/courseCopyStore";


export const mockCourseData: Record<string, { title: string; layoutType: "multi-page" | "single-page" }> = {
  "1": { title: "Carbon Accounting-ACCA", layoutType: "multi-page" },
  "2": { title: "Budgeting in Management", layoutType: "multi-page" },
  "3": { title: "carbon accounting-0810-01", layoutType: "multi-page" },
  "4": { title: "carbon accounting-0810", layoutType: "multi-page" },
  "5": { title: "Carbon Accounting-0710", layoutType: "multi-page" },
  "6": { title: "Financial Analysis Fundamentals", layoutType: "multi-page" },
  "7": { title: "Advanced Cost Management", layoutType: "multi-page" },
  "8": { title: "Taxation and Compliance 2024", layoutType: "multi-page" },
  "9": { title: "Strategic Financial Planning", layoutType: "multi-page" },
  "10": { title: "Auditing Standards & Practices", layoutType: "multi-page" },
  "11": { title: "Corporate Finance Essentials", layoutType: "multi-page" },
  "12": { title: "Management Accounting Pro", layoutType: "multi-page" },
  "13": { title: "International Financial Reporting", layoutType: "multi-page" },
  "14": { title: "Risk Assessment & Control", layoutType: "multi-page" },
  "15": { title: "Financial Forecasting Methods", layoutType: "multi-page" },
};

export function buildMockRestoreState(title: string, courseId?: string): MultiPageCourseCreatorRestoreState {
  const base: MultiPageCourseCreatorRestoreState = {

    title,
    items: [
      {
        id: "sec-1",
        type: "section",
        title: "Introduction & Overview",
        thumbnailUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
        children: [
          { id: "page-1-1", type: "page", title: "Course Welcome" },
          { id: "page-1-2", type: "page", title: "Learning Objectives" },
        ],
      },
      {
        id: "sec-2",
        type: "section",
        title: "Core Concepts",
        thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
        children: [
          { id: "page-2-1", type: "page", title: "Fundamental Principles" },
          { id: "page-2-2", type: "page", title: "Key Terminology" },
          { id: "page-2-3", type: "page", title: "Practical Applications" },
        ],
      },
      {
        id: "sec-3",
        type: "section",
        title: "Advanced Topics",
        children: [
          { id: "page-3-1", type: "page", title: "Case Studies" },
          { id: "page-3-2", type: "page", title: "Best Practices" },
        ],
      },
      {
        id: "sec-4",
        type: "section",
        title: "Assessment & Review",
        children: [
          { id: "page-4-1", type: "page", title: "Summary" },
          { id: "q-4-1", type: "question", title: "Final Assessment Quiz" },
        ],
      },
    ],
    contentBlocks: [
      {
        id: "cb-1",
        type: "description",
        content: "<h2>Welcome to the Course</h2><p>This comprehensive course is designed to provide you with in-depth knowledge and practical skills. Through carefully structured modules and engaging content, you'll gain expertise in key concepts and real-world applications.</p>",
      },
      {
        id: "cb-2",
        type: "image",
        content: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop",
      },
    ],
    pageBlocksMap: {
      "page-1-1": [
        { id: "pb-1-div", type: "text", variant: "divider-numbered", content: JSON.stringify({ number: 1, label: "Getting Started" }) },
        { id: "pb-1-1", type: "text", content: "<p>Welcome to this course! In this module, you will learn the foundational concepts that will guide your understanding throughout the program.</p>" },
        { id: "pb-1-2", type: "image", content: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop" },
        { id: "pb-1-info", type: "text", variant: "info-card", content: JSON.stringify({ kind: "tip", body: "Take notes as you go — the concepts introduced here build on each other in later modules." }) },
        { id: "pb-1-cont", type: "text", variant: "continue-button", content: JSON.stringify({ label: "Continue" }) },
      ],
      "page-1-2": [
        { id: "pb-1-3", type: "text", content: "<p>By the end of this course, you will be able to:</p><ul><li>Understand core principles and frameworks</li><li>Apply concepts to real-world scenarios</li><li>Analyze and evaluate complex situations</li></ul>" },
        { id: "pb-1-line", type: "text", variant: "divider-line", content: JSON.stringify({ style: "ornament" }) },
        { id: "pb-1-4", type: "video", content: "/demo/Motion_Video.mp4" },
      ],
      "page-2-1": [
        { id: "pb-2-div", type: "text", variant: "divider-numbered", content: JSON.stringify({ number: 1, label: "Fundamentals" }) },
        { id: "pb-2-1", type: "text", content: "<p>The fundamental principles form the backbone of this discipline. Understanding these concepts is crucial for building a strong foundation.</p>" },
        { id: "pb-2-space", type: "text", variant: "spacer", content: JSON.stringify({ height: 32 }) },
        { id: "pb-2-5", type: "audio", content: "/demo/actAudio.mp3" },
      ],
      "page-2-2": [
        { id: "pb-2-2", type: "text", content: "<p>Key terms and definitions that you'll encounter throughout this course:</p><ul><li><strong>Term 1</strong> - Definition and explanation</li><li><strong>Term 2</strong> - Definition and explanation</li><li><strong>Term 3</strong> - Definition and explanation</li></ul>" },
        { id: "pb-2-info", type: "text", variant: "info-card", content: JSON.stringify({ kind: "key-takeaway", body: "Memorising these terms early makes the rest of the course significantly easier to follow." }) },
        { id: "pb-2-6", type: "doc", content: "/demo/G2_EVS.pdf" },
      ],
      "page-2-3": [
        { id: "pb-2-3", type: "text", content: "<h3>Practical Applications</h3><p>In this section, we explore how theoretical concepts translate into real-world practice. You'll work through guided examples and scenarios designed to reinforce your understanding.</p>" },
        { id: "pb-2-line", type: "text", variant: "divider-line", content: JSON.stringify({ style: "dashed" }) },
        { id: "pb-2-4", type: "image", content: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop" },
        { id: "pb-2-important", type: "text", variant: "info-card", content: JSON.stringify({ kind: "important", body: "Always verify your assumptions against real data before drawing conclusions." }) },
      ],
      "page-3-1": [
        { id: "pb-3-div", type: "text", variant: "divider-numbered", content: JSON.stringify({ number: 1, label: "Case Study" }) },
        { id: "pb-3-1", type: "text", content: "<h3>Case Study 1: Industry Analysis</h3><p>This case study examines a real-world scenario where organizations applied the core principles discussed in earlier modules.</p>" },
        { id: "pb-3-4", type: "video", content: "/demo/Motion_Video.mp4" },
        { id: "pb-3-cont", type: "text", variant: "continue-button", content: JSON.stringify({ label: "Next case" }) },
      ],
      "page-3-2": [
        { id: "pb-3-3", type: "text", content: "<h3>Best Practices</h3><p>Based on industry research and expert insights, the following best practices have been identified.</p>" },
        { id: "pb-3-bp", type: "text", variant: "info-card", content: JSON.stringify({ kind: "best-practice", body: "Document decisions and their rationale — future reviewers will thank you." }) },
      ],
      "page-4-1": [
        { id: "pb-4-div", type: "text", variant: "divider-numbered", content: JSON.stringify({ number: 1, label: "Wrap Up" }) },
        { id: "pb-4-1", type: "text", content: "<h3>Course Summary</h3><p>Throughout this course, you have explored the fundamental principles, key terminology, and advanced topics.</p>" },
        { id: "pb-4-info", type: "text", variant: "info-card", content: JSON.stringify({ kind: "expert-insight", body: "Revisit the key-takeaway callouts before attempting the final assessment." }) },
      ],
      "q-4-1": [
        { id: "pb-q-1", type: "text", content: "<h3>Final Assessment</h3><p>This quiz will test your understanding of the key concepts covered throughout the course.</p>" },
      ],
    },
    sectionObjectivesMap: {
      "sec-1": "Introduce learners to the course structure and set clear expectations for the learning journey.",
      "sec-2": "Build a strong foundation by covering the core concepts and terminology.",
      "sec-3": "Explore advanced topics through case studies and industry best practices.",
      "sec-4": "Assess understanding and reinforce key takeaways from the course.",
    },
    activeEditorPageId: null,
    aiOptions: {
      enabled: true,
      supportingDocuments: [],
      bloomsTaxonomy: ["Remember", "Understand", "Apply"],
      intendedLearners: "Beginners",
      guidelines: "",
      guidelinesDocuments: [],
      exclusions: "",
      exclusionsDocuments: [],
      pageSpanTime: 10,
      courseSpanTime: 60,
    },
  };

  if (!courseId) return base;

  const copies = getCourseCopies(courseId);
  if (
    Object.keys(copies.pagesBySection).length === 0 &&
    copies.sections.length === 0
  ) {
    return base;
  }

  // Merge copied pages into existing sections.
  const mergedItems = base.items.map((item) => {
    if (item.type !== "section") return item;
    const extra = copies.pagesBySection[item.id] || [];
    if (extra.length === 0) return item;
    return {
      ...item,
      children: [
        ...(item.children || []),
        ...extra.map((p) => ({ id: p.id, type: "page" as const, title: p.title })),
      ],
    };
  });

  // Append copied sections at the bottom.
  for (const s of copies.sections) {
    mergedItems.push({
      id: s.id,
      type: "section",
      title: s.title,
      children: (s.pages || []).map((p) => ({ id: p.id, type: "page" as const, title: p.title })),
    });
  }

  // Merge pageBlocksMap entries for copied pages (with their blocks).
  const mergedPageBlocks = { ...base.pageBlocksMap };
  const addPageBlocks = (p: CopiedLike) => {
    if (p.blocks && p.blocks.length > 0) {
      mergedPageBlocks[p.id] = p.blocks.map((b) => ({
        id: `${p.id}-${b.id}`,
        type: b.type as PageContentBlockType,
        content: b.content,
        variant: b.variant,
        font: b.font,
      }));
    }
  };
  for (const list of Object.values(copies.pagesBySection)) list.forEach(addPageBlocks);
  for (const s of copies.sections) (s.pages || []).forEach(addPageBlocks);

  return {
    ...base,
    items: mergedItems,
    pageBlocksMap: mergedPageBlocks,
  };
}

type PageContentBlockType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "doc"
  | "quiz"
  | "image-description"
  | "video-description"
  | "hotspot"
  | "tabs";

type CopiedLike = { id: string; blocks?: { id: string; type: string; content: string; variant?: string; font?: string }[] };

