import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, Zap, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-primary/30 animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-primary/20 animate-pulse delay-700" />
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full bg-primary/25 animate-pulse delay-1000" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(211_100%_44%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(211_100%_44%/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Logo with glow */}
        <div className="relative inline-block mb-8 animate-scale-in">
          <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-150" />
          <img
            src={logo}
            alt="CourseED"
            className="relative h-14 mx-auto"
          />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Course Creation
        </div>

        {/* Heading */}
        <h1 className="mb-4 text-4xl sm:text-5xl font-bold text-foreground tracking-tight animate-fade-in">
          Create Courses{" "}
          <span className="text-primary">Effortlessly</span>
        </h1>

        <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto animate-fade-in">
          Transform your ideas into comprehensive, structured courses with the power of AI
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 animate-fade-in">
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 px-8 gap-2 group"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
          {[
            { icon: Sparkles, title: "AI Generation", desc: "Generate full courses in minutes" },
            { icon: BookOpen, title: "Multi-format", desc: "Single & multi-page layouts" },
            { icon: Zap, title: "Quick Export", desc: "Export to SCORM & more" },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/60 hover:border-primary/30 hover:shadow-md transition-all duration-300"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3 mx-auto group-hover:bg-primary/15 transition-colors">
                <feature.icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
