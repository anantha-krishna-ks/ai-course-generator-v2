import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Mail, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authBgIllustration from "@/assets/auth-bg-illustration.png";

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
      const DEMO_MODE = true;
      
      if (DEMO_MODE) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (email && password) {
          const demoToken = `demo_token_${Date.now()}`;
          localStorage.setItem("api_token", demoToken);
          toast({ title: "Login successful", description: "Welcome back! (Demo Mode)" });
          setIsLoading(false);
          navigate("/dashboard");
          return;
        } else {
          toast({ title: "Login failed", description: "Please enter both login ID and password", variant: "destructive" });
          setIsLoading(false);
          return;
        }
      }
      
      try {
        const response = await fetch(
          "https://seab-testing.excelindia.com/contentv3api/api/user/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ LoginId: email, Password: password }),
          }
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.Message || "Login failed");
        if (data.Status === 0) {
          localStorage.setItem("api_token", data.Message);
          toast({ title: "Login successful", description: "Welcome back!" });
          navigate("/dashboard");
        } else if (data.Status === 2) {
          throw new Error(data.Message || "Invalid credentials");
        } else {
          throw new Error("Unexpected response from server");
        }
      } catch (error) {
        toast({ title: "Login failed", description: error instanceof Error ? error.message : "Invalid login credentials", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    } else if (mode === "signup") {
      toast({ title: "Sign up not available", description: "Please contact your administrator to create an account", variant: "destructive" });
    } else if (mode === "forgot") {
      toast({ title: "Password reset not available", description: "Please contact your administrator to reset your password", variant: "destructive" });
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.12, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50/80 via-white to-primary/5">
      {/* Decorative illustration */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <img
          src={authBgIllustration}
          alt=""
          width={1024}
          height={1024}
          className="w-[600px] h-[600px] object-contain opacity-[0.07] translate-y-12"
        />
      </div>
      {/* Subtle gradient orbs */}
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-100px] w-[400px] h-[400px] rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />

      {/* Back button */}
      <motion.button
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 z-20 flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/20 backdrop-blur-md text-sm text-foreground/70 hover:bg-white/40 hover:text-foreground hover:border-white/50 hover:shadow-sm transition-all duration-200 hover-scale"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </motion.button>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-[460px] flex flex-col gap-8 bg-white/60 backdrop-blur-sm rounded-3xl p-8">
          {/* Header */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <h1 className="text-[38px] text-foreground tracking-[-0.04em] leading-tight font-medium">
              {mode === "login" && "Welcome back"}
              {mode === "signup" && "Create account"}
              {mode === "forgot" && "Reset password"}
            </h1>
            <p className="mt-3 text-base text-muted-foreground">
              {mode === "login" && "Sign in to continue to your dashboard"}
              {mode === "signup" && "Enter your details to get started"}
              {mode === "forgot" && "Enter your login ID to receive a reset link"}
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-2xl bg-background/95 backdrop-blur-sm border border-border p-10 shadow-[0px_12px_48px_8px_rgba(194,194,194,0.3)] w-full max-w-[460px] mx-auto"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Login ID
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your login ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-border bg-background text-[15px] placeholder:text-muted-foreground focus-visible:ring-primary"
                />
              </div>

              {mode !== "forgot" && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-foreground"
                    >
                      Password
                    </Label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-[13px] text-primary hover:underline"
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
                      className="h-12 rounded-xl border-border bg-background text-[15px] pr-11 focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === "signup" && (
                <div className="space-y-2.5">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-foreground"
                  >
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
                      className="h-12 rounded-xl border-border bg-background text-[15px] pr-11 focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 flex items-center justify-center gap-2.5 rounded-full bg-primary text-primary-foreground text-[15px] font-medium transition-all hover:bg-primary/90 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-[18px] h-[18px] animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    {mode === "login" && <><LogIn className="w-[18px] h-[18px]" />Sign in</>}
                    {mode === "signup" && <><UserPlus className="w-[18px] h-[18px]" />Create account</>}
                    {mode === "forgot" && <><Mail className="w-[18px] h-[18px]" />Send reset link</>}
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 text-center text-sm text-muted-foreground">
              {mode === "login" && (
                <p>
                  Don't have an account?{" "}
                  <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">
                    Sign up
                  </button>
                </p>
              )}
              {mode === "signup" && (
                <p>
                  Already have an account?{" "}
                  <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">
                    Sign in
                  </button>
                </p>
              )}
              {mode === "forgot" && (
                <p>
                  Remember your password?{" "}
                  <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">
                    Back to sign in
                  </button>
                </p>
              )}
            </div>
          </motion.div>

          {/* Terms */}
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center text-[11px] text-[#373a46] opacity-40"
            style={{ fontFamily: "'Geist', sans-serif" }}
          >
            By continuing, you agree to our{" "}
            <button className="underline hover:opacity-100">Terms of Service</button>
            {" "}and{" "}
            <button className="underline hover:opacity-100">Privacy Policy</button>
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default Auth;
