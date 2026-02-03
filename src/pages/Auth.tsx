import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/logo.png";

type AuthMode = "login" | "signup" | "forgot";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "login") {
      setIsLoading(true);
      
      // Demo mode: Accept any credentials for testing
      // This bypasses the external API which has CORS restrictions
      const DEMO_MODE = true;
      
      if (DEMO_MODE) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (email && password) {
          // Generate a demo token
          const demoToken = `demo_token_${Date.now()}`;
          localStorage.setItem("api_token", demoToken);
          
          toast({
            title: "Login successful",
            description: "Welcome back! (Demo Mode)",
          });
          
          setIsLoading(false);
          navigate("/dashboard");
          return;
        } else {
          toast({
            title: "Login failed",
            description: "Please enter both login ID and password",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }
      
      try {
        const response = await fetch(
          "https://seab-testing.excelindia.com/contentv3api/api/user/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              LoginId: email,
              Password: password,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.Message || "Login failed");
        }

        if (data.Status === 0) {
          // Success - token is in Message field
          const token = data.Message;
          localStorage.setItem("api_token", token);
          
          toast({
            title: "Login successful",
            description: "Welcome back!",
          });
          
          navigate("/dashboard");
        } else if (data.Status === 2) {
          throw new Error(data.Message || "Invalid credentials");
        } else {
          throw new Error("Unexpected response from server");
        }
      } catch (error) {
        toast({
          title: "Login failed",
          description: error instanceof Error ? error.message : "Invalid login credentials",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else if (mode === "signup") {
      toast({
        title: "Sign up not available",
        description: "Please contact your administrator to create an account",
        variant: "destructive",
      });
    } else if (mode === "forgot") {
      toast({
        title: "Password reset not available",
        description: "Please contact your administrator to reset your password",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen flex">
      {/* Left side - Decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Geometric pattern */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-white"
              style={{
                width: `${Math.random() * 300 + 100}px`,
                height: `${Math.random() * 300 + 100}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `translate(-50%, -50%)`,
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-8 lg:px-12 xl:px-16 text-white">
          <div className="space-y-4 lg:space-y-6">
            <div className="inline-flex items-center gap-3 mb-4 lg:mb-8">
              <img src={logo} alt="AI Course Generator" className="w-10 h-10 lg:w-12 lg:h-12" />
              <h1 className="text-xl lg:text-2xl font-semibold">AI COURSE GENERATOR</h1>
            </div>
            
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
              Create AI-powered courses in minutes
            </h2>
            
            <div className="pt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">AI-Powered Generation</h3>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Customizable Content</h3>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Easy to Use</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <img 
              src={logo} 
              alt="AI Course Generator" 
              className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              AI COURSE GENERATOR
            </h1>
          </div>

          <Card className="border-2 border-primary/10 shadow-card hover:border-primary/20 transition-colors">
            <CardHeader className="space-y-1 pb-4 p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl font-semibold">
                {mode === "login" && "Welcome back"}
                {mode === "signup" && "Create an account"}
                {mode === "forgot" && "Reset password"}
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {mode === "login" && "Enter your login ID to sign in to your account"}
                {mode === "signup" && "Enter your login ID to create your account"}
                {mode === "forgot" && "Enter your login ID to receive a reset link"}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Login ID
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Enter your login ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-9 sm:h-10"
                  />
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => setMode("forgot")}
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-9 sm:h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-9 sm:h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-9 sm:h-10 bg-primary text-primary-foreground hover:bg-primary/90 text-sm gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      {mode === "login" && (
                        <>
                          <LogIn className="w-4 h-4" />
                          Sign in
                        </>
                      )}
                      {mode === "signup" && (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Create account
                        </>
                      )}
                      {mode === "forgot" && (
                        <>
                          <Mail className="w-4 h-4" />
                          Send reset link
                        </>
                      )}
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center text-xs sm:text-sm text-muted-foreground">
                {mode === "login" && (
                  <p>
                    Don't have an account?{" "}
                    <button
                      onClick={() => setMode("signup")}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                )}
                {mode === "signup" && (
                  <p>
                    Already have an account?{" "}
                    <button
                      onClick={() => setMode("login")}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                )}
                {mode === "forgot" && (
                  <p>
                    Remember your password?{" "}
                    <button
                      onClick={() => setMode("login")}
                      className="text-primary hover:underline font-medium"
                    >
                      Back to sign in
                    </button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-4 sm:mt-6 px-4">
            By continuing, you agree to our{" "}
            <button className="underline hover:text-foreground">Terms of Service</button>
            {" "}and{" "}
            <button className="underline hover:text-foreground">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
