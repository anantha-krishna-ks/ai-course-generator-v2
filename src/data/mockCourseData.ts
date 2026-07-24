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
          { id: "q-4-2", type: "question", title: "Knowledge Check" },
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
      contentDepth: "balanced",
    },
  };

  // For course "1" (Carbon Accounting-ACCA), enrich seed data with a broad
  // sample of every block variant so the editor + preview show a realistic,
  // fully-populated course.
  if (courseId === "1") {
    enrichCourseOne(base);
  }

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
  | "tabs"
  | "flashcards";

type CopiedLike = { id: string; blocks?: { id: string; type: string; content: string; variant?: string; font?: string }[] };

// ---------------------------------------------------------------------------
// Rich seed enrichment for course id "1" — populates each page with a broad
// mix of block variants (heading, columns, image layouts, video, audio, doc,
// quiz, hotspot, tabs, accordion, flashcards, card-sort, dividers, spacers,
// info-cards, continue buttons) so the editor & preview render a realistic
// end-to-end course.
// ---------------------------------------------------------------------------

type Block = { id: string; type: PageContentBlockType; content: string; variant?: string };

const IMG = {
  workspace: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop",
  laptop: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop",
  woman: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop",
  code: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&auto=format&fit=crop",
  matrix: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop",
  monitor: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop",
};

const J = (o: unknown) => JSON.stringify(o);

const heading = (id: string, h: string, p: string): Block => ({
  id, type: "text", variant: "heading-text",
  content: `<h2>${h}</h2><p>${p}</p>`,
});
const text = (id: string, html: string): Block => ({ id, type: "text", variant: "text-only", content: html });
const twoCols = (id: string, a: [string, string], b: [string, string]): Block => ({
  id, type: "text", variant: "two-columns",
  content: `<!--layout:two-columns--><h3>${a[0]}</h3><p>${a[1]}</p><!--col-break--><h3>${b[0]}</h3><p>${b[1]}</p>`,
});
const threeCols = (id: string, a: [string, string], b: [string, string], c: [string, string]): Block => ({
  id, type: "text", variant: "three-columns",
  content: `<!--layout:three-columns--><h3>${a[0]}</h3><p>${a[1]}</p><!--col-break--><h3>${b[0]}</h3><p>${b[1]}</p><!--col-break--><h3>${c[0]}</h3><p>${c[1]}</p>`,
});
const divLine = (id: string, style: "ornament" | "dashed" | "solid" = "solid"): Block => ({
  id, type: "text", variant: "divider-line", content: J({ style }),
});
const divNum = (id: string, number: number, label: string): Block => ({
  id, type: "text", variant: "divider-numbered", content: J({ number, label }),
});
const spacer = (id: string, height = 32): Block => ({ id, type: "text", variant: "spacer", content: J({ height }) });
const cont = (id: string, label = "Continue"): Block => ({ id, type: "text", variant: "continue-button", content: J({ label }) });
const info = (id: string, kind: "tip" | "important" | "best-practice" | "expert-insight" | "key-takeaway", body: string): Block => ({
  id, type: "text", variant: "info-card", content: J({ kind, body }),
});
const image = (id: string, url: string): Block => ({ id, type: "image", content: url });
const imgDesc = (id: string, layout: "image-top" | "image-bottom" | "image-left" | "image-right", imageUrl: string, description: string): Block => ({
  id, type: "image-description", variant: layout, content: J({ layout, imageUrl, description }),
});
const video = (id: string, url = "/demo/Motion_Video.mp4"): Block => ({ id, type: "video", content: url });
const videoDesc = (id: string, layout: "video-left" | "video-right", videoUrl: string, description: string): Block => ({
  id, type: "video-description", variant: layout, content: J({ layout, videoUrl, description }),
});
const audio = (id: string, url = "/demo/actAudio.mp3"): Block => ({ id, type: "audio", content: url });
const audioAI = (id: string, url = "/demo/actAudio.mp3"): Block => ({ id, type: "audio", variant: "ai-audio", content: url });
const doc = (id: string, url = "/demo/G2_EVS.pdf"): Block => ({ id, type: "doc", content: url });
const accordion = (id: string, items: { title: string; body: string }[]): Block => ({
  id, type: "text", variant: "accordion",
  content: J({
    items: items.map((it, i) => ({ id: `${id}-i${i}`, title: it.title, body: `<p>${it.body}</p>`, imageUrl: "" })),
    openMode: "single",
    defaultOpenIds: [`${id}-i0`],
  }),
});
const tabs = (id: string, variant: "horizontal-tabs" | "vertical-tabs", tabsData: { name: string; content: string; imageUrl?: string }[]): Block => {
  const built = tabsData.map((t, i) => ({ id: `${id}-t${i}`, name: t.name, content: `<p>${t.content}</p>`, imageUrl: t.imageUrl || "" }));
  return { id, type: "tabs", variant, content: J({ tabs: built, activeId: built[0].id }) };
};
const flashcards = (id: string, cards: { front: string; back: string; color?: string }[]): Block => ({
  id, type: "flashcards", variant: "flashcards",
  content: J({
    cards: cards.map((c, i) => ({
      id: `${id}-c${i}`,
      color: c.color || "#FFFFFF",
      front: { contentType: "text", text: c.front, textAlign: "center", formatting: {}, imageUrl: "", imageFit: "cover", imagePosX: 50, imagePosY: 50, imageZoom: 100 },
      back: { contentType: "text", text: c.back, textAlign: "center", formatting: {}, imageUrl: "", imageFit: "cover", imagePosX: 50, imagePosY: 50, imageZoom: 100 },
    })),
    gridCols: 2,
    alignment: "center",
  }),
});
const cardSort = (id: string, categories: string[], items: { text: string; categoryId: number }[]): Block => ({
  id, type: "text", variant: "card-sort",
  content: J({
    categories: categories.map((name, i) => ({ id: `${id}-cat${i}`, name })),
    items: items.map((it, i) => ({ id: `${id}-it${i}`, text: it.text, categoryId: `${id}-cat${it.categoryId}` })),
  }),
});
const hotspot = (id: string, imageUrl: string, hotspots: { x: number; y: number; title: string; description: string }[]): Block => ({
  id, type: "hotspot", variant: "hotspot",
  content: J({
    imageUrl,
    hotspots: hotspots.map((h, i) => ({
      id: `${id}-h${i}`, x: h.x, y: h.y, w: 12, h: 12,
      title: h.title, description: `<p>${h.description}</p>`, shape: "rect",
    })),
    settings: { color: "hsl(211, 100%, 50%)", shape: "rect", opacity: 0.35 },
  }),
});
const quiz = (id: string, variant: string, questions: { q: string; type?: "SCQ" | "MCQ" | "TrueFalse"; options: string[]; answer: string; explanation?: string }[], overrides?: Partial<{ quizType: string; passCriteria: number; retries: string }>): Block => ({
  id, type: "quiz", variant,
  content: J({
    questions: questions.map((qq, i) => ({
      id: i + 1,
      type: qq.type || "SCQ",
      question: qq.q,
      options: qq.options,
      answer: qq.answer,
      explanation: qq.explanation || "",
    })),
    passCriteria: overrides?.passCriteria ?? Math.max(1, Math.ceil(questions.length * 0.6)),
    failNavigationPage: "",
    requireCorrect: false,
    retries: overrides?.retries ?? "unlimited",
    revealAnswers: "reveal_all",
    quizType: overrides?.quizType,
  }),
});

function enrichCourseOne(base: MultiPageCourseCreatorRestoreState): void {
  const p = base.pageBlocksMap;

  // page-1-1: Course Welcome — already has intro numbered/text/image/tip/continue.
  // Insert richer opener before existing continue button.
  const existing111 = p["page-1-1"] || [];
  const cont111 = existing111.find((b) => b.variant === "continue-button");
  const rest111 = existing111.filter((b) => b.variant !== "continue-button");
  p["page-1-1"] = [
    ...rest111,
    heading("bk-111-h", "What you'll gain from this course", "In just a few short lessons you'll build a working mental model of carbon accounting and learn how to apply it to real reporting scenarios."),
    threeCols("bk-111-3c",
      ["Measure", "Learn what to measure and why it matters."],
      ["Report", "Translate measurements into compliant reports."],
      ["Improve", "Identify actions that lower emissions over time."]),
    divLine("bk-111-dl", "ornament"),
    ...(cont111 ? [cont111] : [cont("bk-111-cont", "Start course")]),
  ];

  // page-1-2: Learning Objectives
  p["page-1-2"] = [
    heading("bk-112-h", "Learning objectives", "By the end of this lesson you'll be able to describe the scope, purpose, and stakeholders of a carbon accounting programme."),
    ...(p["page-1-2"] || []),
    imgDesc("bk-112-img", "image-right", IMG.woman, "<p>Meet Priya, a sustainability lead who'll guide you through practical examples in later modules.</p>"),
    spacer("bk-112-sp", 24),
    info("bk-112-key", "key-takeaway", "Objectives are the compass — revisit them at the end of every module."),
    cont("bk-112-cont", "Next: Core concepts"),
  ];

  // page-2-1: Fundamental Principles
  p["page-2-1"] = [
    ...(p["page-2-1"] || []),
    heading("bk-211-h", "The three scopes of emissions", "Every emission a business is responsible for falls into one of three scopes."),
    threeCols("bk-211-3c",
      ["Scope 1", "Direct emissions from owned sources."],
      ["Scope 2", "Indirect emissions from purchased energy."],
      ["Scope 3", "All other value-chain emissions."]),
    imgDesc("bk-211-img", "image-top", IMG.matrix, "<p>A visual overview of how scopes connect across a typical supply chain.</p>"),
    accordion("bk-211-acc", [
      { title: "Why do scopes matter?", body: "They give reporters a shared vocabulary and prevent double counting across organisations." },
      { title: "Which scope is hardest to measure?", body: "Scope 3 — because it depends on suppliers and customers you don't directly control." },
      { title: "Are all scopes mandatory to report?", body: "Requirements vary by jurisdiction; most frameworks require Scopes 1 & 2 today." },
    ]),
    cont("bk-211-cont", "Continue"),
  ];

  // page-2-2: Key Terminology
  p["page-2-2"] = [
    heading("bk-221-h", "The language of carbon accounting", "Master these terms and the rest of the course becomes far easier to follow."),
    ...(p["page-2-2"] || []),
    flashcards("bk-221-fc", [
      { front: "GHG", back: "Greenhouse Gas — CO₂, CH₄, N₂O and more.", color: "#E0F2FE" },
      { front: "CO₂e", back: "Carbon-dioxide equivalent — a common unit for comparing gases.", color: "#DCFCE7" },
      { front: "Emission factor", back: "The rate that converts activity data into emissions.", color: "#FEF3C7" },
      { front: "Boundary", back: "The organisational or operational scope of a report.", color: "#EDE9FE" },
    ]),
    tabs("bk-221-tabs", "horizontal-tabs", [
      { name: "Operational", content: "The operational boundary includes activities the organisation controls day-to-day." },
      { name: "Financial", content: "The financial boundary follows equity share or financial control." },
      { name: "Equity", content: "Equity share allocates emissions in proportion to ownership stake." },
    ]),
    divLine("bk-221-dl", "dashed"),
  ];

  // page-2-3: Practical Applications
  p["page-2-3"] = [
    ...(p["page-2-3"] || []),
    videoDesc("bk-231-vd", "video-right", "/demo/Motion_Video.mp4", "<p>Watch a 60-second walkthrough of how a mid-sized manufacturer built its first inventory.</p>"),
    hotspot("bk-231-hs", IMG.workspace, [
      { x: 20, y: 30, title: "Meters", description: "Electricity meters feed Scope 2 emissions data." },
      { x: 55, y: 55, title: "Fleet", description: "Owned vehicles fall under Scope 1 direct emissions." },
      { x: 78, y: 35, title: "Suppliers", description: "Supplier data drives Scope 3 upstream emissions." },
    ]),
    cont("bk-231-cont", "On to advanced topics"),
  ];

  // page-3-1: Case Studies
  p["page-3-1"] = [
    ...(p["page-3-1"] || []),
    imgDesc("bk-311-img", "image-bottom", IMG.laptop, "<p>Field data collection is where theory meets messy reality — small choices compound quickly.</p>"),
    tabs("bk-311-tabs", "vertical-tabs", [
      { name: "Manufacturer", content: "A European manufacturer reduced Scope 1 emissions by 18% in 18 months through fuel switching." },
      { name: "Retailer", content: "A retailer used supplier engagement to cut Scope 3 emissions by 9% year on year." },
      { name: "SaaS", content: "A SaaS company reduced Scope 2 emissions by moving workloads to renewable-powered regions." },
    ]),
    audioAI("bk-311-audio"),
    spacer("bk-311-sp", 24),
  ];

  // page-3-2: Best Practices
  p["page-3-2"] = [
    ...(p["page-3-2"] || []),
    divNum("bk-321-dn", 2, "Sorting exercise"),
    twoCols("bk-321-2c",
      ["Do", "Document every assumption and revisit them quarterly."],
      ["Don't", "Copy last year's numbers without re-verifying the source data."]),
    cardSort("bk-321-cs",
      ["Scope 1", "Scope 2", "Scope 3"],
      [
        { text: "Company vehicles", categoryId: 0 },
        { text: "Grid electricity", categoryId: 1 },
        { text: "Business travel", categoryId: 2 },
        { text: "Purchased steam", categoryId: 1 },
        { text: "Diesel generator", categoryId: 0 },
        { text: "Employee commuting", categoryId: 2 },
      ]),
    accordion("bk-321-acc", [
      { title: "Start with the data you have", body: "Perfect data is the enemy of a first inventory — start with reasonable estimates and refine over time." },
      { title: "Version everything", body: "Emission factors change. Log which factor and vintage you used for every calculation." },
    ]),
    cont("bk-321-cont", "Wrap up"),
  ];

  // page-4-1: Summary
  p["page-4-1"] = [
    ...(p["page-4-1"] || []),
    image("bk-411-img", IMG.monitor),
    twoCols("bk-411-2c",
      ["What you learned", "Scopes, boundaries, factors and reporting workflow."],
      ["What's next", "Try the assessment to lock the concepts in."]),
    quiz("bk-411-kc", "knowledge-check-page", [
      { q: "Scope 2 covers…", options: ["Direct emissions", "Purchased energy emissions", "Supplier emissions"], answer: "Purchased energy emissions" },
      { q: "CO₂e stands for…", options: ["Carbon output equivalent", "Carbon-dioxide equivalent", "Continuous oxygen emission"], answer: "Carbon-dioxide equivalent" },
    ]),
    divLine("bk-411-dl", "ornament"),
    cont("bk-411-cont", "Take the final assessment"),
  ];

  // q-4-2: Formative Knowledge Check
  p["q-4-2"] = [
    ...(p["q-4-2"] || []),
    quiz(
      "bk-q42-formative",
      "knowledge-check-formative",
      [
        { q: "Which scope includes emissions from a diesel truck the company owns?", options: ["Scope 1", "Scope 2", "Scope 3"], answer: "Scope 1", explanation: "Owned combustion sources are Scope 1." },
        { q: "Purchased grid electricity falls under…", options: ["Scope 1", "Scope 2", "Scope 3"], answer: "Scope 2" },
        { q: "Business travel booked with a third-party airline is…", options: ["Scope 1", "Scope 2", "Scope 3"], answer: "Scope 3" },
      ],
      { quizType: "formative", retries: "unlimited" }
    ),
  ];

  // q-4-1: Final Assessment Quiz
  p["q-4-1"] = [
    ...(p["q-4-1"] || []),
    quiz("bk-q41-final", "learning-assessment-course", [
      { q: "Which scope includes emissions from a diesel truck the company owns?", options: ["Scope 1", "Scope 2", "Scope 3"], answer: "Scope 1", explanation: "Owned combustion sources are Scope 1." },
      { q: "Purchased grid electricity falls under…", options: ["Scope 1", "Scope 2", "Scope 3"], answer: "Scope 2" },
      { q: "Business travel booked with a third-party airline is…", options: ["Scope 1", "Scope 2", "Scope 3"], answer: "Scope 3" },
      { q: "True or false: emission factors never need updating.", type: "TrueFalse", options: ["True", "False"], answer: "False", explanation: "Factors are revised regularly to reflect grid and process changes." },
    ]),
    info("bk-q41-tip", "expert-insight", "Take your time — the goal is understanding, not speed."),
  ];
}


