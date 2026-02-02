import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center animate-fade-in">
        <img 
          src={logo} 
          alt="AI Course Generator" 
          className="w-32 h-32 mx-auto mb-8 animate-scale-in"
        />
        <h1 className="mb-4 text-5xl font-bold text-foreground">
          AI COURSE GENERATOR
        </h1>
        <p className="text-xl text-muted-foreground mb-8 animate-slide-in">
          Transform your ideas into comprehensive courses with AI
        </p>
        <Button 
          onClick={() => navigate("/auth")}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;
