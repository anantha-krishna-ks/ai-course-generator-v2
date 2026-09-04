import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import { PremiumToastButton } from "@/components/Help/PremiumToastButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Download,
  Sparkles,
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  ListChecks,
  PlayCircle,
  HelpCircle,
  LifeBuoy,
  ArrowRight,
  Mail,
  ChevronLeft,
  Rocket,
  Layers,
  Wand2,
} from "lucide-react";

const MANUAL_URL = "/Content_Studio_Product_Manual.pdf";

const quickLinks = [
  { icon: Rocket, title: "Getting Started", desc: "Sign in and orient yourself in Content Studio.", anchor: "#getting-started" },
  { icon: LayoutDashboard, title: "Dashboard", desc: "Where your courses live and how to start a new one.", anchor: "#dashboard" },
  { icon: Wand2, title: "AI Course Generation", desc: "Create a full course from a topic, file, or outline.", anchor: "#ai" },
  { icon: Layers, title: "Sections & Pages", desc: "Organize content with the outline panel.", anchor: "#structure" },
  { icon: FileText, title: "Content Blocks", desc: "Text, Image, Video, Audio, File, Question, Quiz.", anchor: "#blocks" },
  { icon: PlayCircle, title: "Preview & Export", desc: "Multi-page or single-page, SCORM/PDF/PPT/HTML.", anchor: "#preview" },
];

const workflows = [
  {
    title: "Manual creation with AI assistance",
    icon: BookOpen,
    steps: [
      "Open Dashboard and click Create New Course.",
      "Enter a title, choose Multi-Page or Single-Page layout.",
      "Add Guidelines and Exclusions (use the info icons for examples).",
      "Build outline: + Add Section, then + Add Page inside each section.",
      "Add content blocks and use the AI Support panel as needed.",
      "Preview, then Save and Export to your preferred format.",
    ],
  },
  {
    title: "Fully AI-generated course",
    icon: Sparkles,
    steps: [
      "From the Dashboard click Generate with AI.",
      "Step 1 — Enter intent: title, source files, layout.",
      "Step 2 — Pick audience, region, and duration.",
      "Step 3 — Add learning objectives and Bloom’s emphasis.",
      "Step 4 — Review and adjust the proposed structure.",
      "Click Generate Course. Refine the draft in the editor.",
    ],
  },
];

const faqs = [
  { q: "Do I need to know how to code?", a: "No. Content Studio is fully no-code." },
  { q: "Can I switch layouts later?", a: "Yes — use the Layout dropdown. Your content is preserved." },
  { q: "Where are my courses stored?", a: "In your organization’s Content Studio workspace." },
  { q: "How are AI tokens billed?", a: "Tokens are consumed per AI action. Check the meter in the header." },
  { q: "Which export formats are supported?", a: "SCORM 2004, PDF, MS Word, PPT (with templates), and HTML." },
  { q: "How do I reset a course?", a: "Use Clone to preserve the original, then edit the copy." },
];

const Help = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Help & Documentation — Content Studio";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Help center, product manual, and FAQs for Content Studio — the enterprise course authoring platform.");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" focusable="false" />
          Back
        </button>

        {/* Hero */}
        <section
          aria-labelledby="help-hero-title"
          className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 sm:p-12"
        >
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-12 w-72 h-72 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1 gap-1.5">
              <LifeBuoy className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
              Help Center
            </Badge>
            <h1 id="help-hero-title" className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Everything you need to master Content Studio
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl text-base sm:text-lg">
              Step-by-step guides, AI workflows, and the official product manual — written for first-time, non-technical users.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full gap-2">
                <a href={MANUAL_URL} download>
                  <Download className="w-4 h-4" aria-hidden="true" focusable="false" />
                  Download Product Manual (PDF)
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full gap-2">
                <a href={MANUAL_URL} target="_blank" rel="noopener noreferrer">
                  <BookOpen className="w-4 h-4" aria-hidden="true" focusable="false" />
                  Open in new tab
                </a>
              </Button>
              <PremiumToastButton />
            </div>
          </div>
        </section>

        {/* Quick links */}
        <section aria-labelledby="quick-links-title">
          <h2 id="quick-links-title" className="text-xl font-semibold text-foreground mb-4">
            Quick links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map(({ icon: Icon, title, desc, anchor }) => (
              <a
                key={title}
                href={anchor}
                className="group rounded-2xl border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" aria-hidden="true" focusable="false" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" focusable="false" />
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Workflows */}
        <section id="ai" aria-labelledby="workflows-title">
          <h2 id="workflows-title" className="text-xl font-semibold text-foreground mb-4">
            Course creation workflows
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {workflows.map(({ title, icon: Icon, steps }) => (
              <Card key={title} className="rounded-2xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" aria-hidden="true" focusable="false" />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </div>
                  <CardDescription>Follow these steps end-to-end.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2.5">
                    {steps.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-foreground">{s}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Feature areas */}
        <section id="structure" aria-labelledby="features-title">
          <h2 id="features-title" className="text-xl font-semibold text-foreground mb-4">
            Feature areas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: "blocks", icon: FileText, title: "Content Blocks", body: "Text, Image, Video, Audio, File, Question, Quiz, and Multicolumn blocks — each with AI assistance." },
              { id: "preview", icon: PlayCircle, title: "Preview & Export", body: "Preview Multi-Page or Single-Page layouts on desktop, tablet, and mobile. Export to SCORM, PDF, MS Word, PPT, or HTML." },
              { id: "blueprint", icon: Layers, title: "Course Blueprint", body: "Reusable course skeletons. Import an outline (PDF/DOCX/TXT) and let AI structure it for you." },
              { id: "ai-features", icon: Sparkles, title: "AI Features", body: "AI drafting, rewriting, summarizing, translation, question generation, image generation, and Bloom’s mapping." },
              { id: "editor", icon: ImageIcon, title: "Rich Text Editor", body: "Headings, lists, tables, colors, alignment, links, font controls, undo/redo, and AI sparkles." },
              { id: "structure-section", icon: ListChecks, title: "Sections & Pages", body: "Three-level hierarchy: Course → Section → Page. Drag-and-drop reordering and accordion sections." },
            ].map(({ id, icon: Icon, title, body }) => (
              <div key={id} id={id} className="rounded-2xl border bg-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5" aria-hidden="true" focusable="false" />
                  </div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section aria-labelledby="faq-title">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-primary" aria-hidden="true" focusable="false" />
            <h2 id="faq-title" className="text-xl font-semibold text-foreground">
              Frequently asked questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="rounded-2xl border bg-card divide-y">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="px-5">
                <AccordionTrigger className="text-left text-foreground hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Contact */}
        <section
          aria-labelledby="contact-title"
          className="rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h2 id="contact-title" className="text-lg font-semibold text-foreground">Still need help?</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Reach out to your administrator or the Content Studio support team for personalized assistance.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full gap-2">
            <a href="mailto:support@contentstudio.app">
              <Mail className="w-4 h-4" aria-hidden="true" focusable="false" />
              Contact Support
            </a>
          </Button>
        </section>
      </main>
    </div>
  );
};

export default Help;
