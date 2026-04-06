import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Mail, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <section className="relative min-h-screen overflow-hidden bg-white">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover [transform:scaleY(-1)]"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[26.416%] from-[rgba(255,255,255,0)] to-[66.943%] to-white" />
      </div>

      {/* Back button */}
      <motion.button
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 z-20 flex items-center gap-2 text-[14px] text-[#373a46] opacity-70 hover:opacity-100 transition-opacity"
        style={{ fontFamily: "'Geist', sans-serif" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </motion.button>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-[420px] flex flex-col gap-8">
          {/* Header */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <h1
              className="text-[36px] text-[#1a1a2e] tracking-[-0.04em] leading-tight"
              style={{ fontFamily: "'Geist', sans-serif", fontWeight: 500 }}
            >
              {mode === "login" && "Welcome back"}
              {mode === "signup" && "Create account"}
              {mode === "forgot" && "Reset password"}
            </h1>
            <p
              className="mt-3 text-[16px] text-[#373a46] opacity-60"
              style={{ fontFamily: "'Geist', sans-serif" }}
            >
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
            className="rounded-2xl bg-[#fcfcfc] border border-[#e8e8e8] p-8 shadow-[0px_10px_40px_5px_rgba(194,194,194,0.25)]"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[13px] font-medium text-[#1a1a2e]"
                  style={{ fontFamily: "'Geist', sans-serif" }}
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
                  className="h-11 rounded-xl border-[#e8e8e8] bg-white text-[14px] placeholder:text-[#9ca3af] focus-visible:ring-primary"
                  style={{ fontFamily: "'Geist', sans-serif" }}
                />
              </div>

              {mode !== "forgot" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-[13px] font-medium text-[#1a1a2e]"
                      style={{ fontFamily: "'Geist', sans-serif" }}
                    >
                      Password
                    </Label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-[12px] text-primary hover:underline"
                        style={{ fontFamily: "'Geist', sans-serif" }}
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
                      className="h-11 rounded-xl border-[#e8e8e8] bg-white text-[14px] pr-10 focus-visible:ring-primary"
                      style={{ fontFamily: "'Geist', sans-serif" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#1a1a2e] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === "signup" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-[13px] font-medium text-[#1a1a2e]"
                    style={{ fontFamily: "'Geist', sans-serif" }}
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
                      className="h-11 rounded-xl border-[#e8e8e8] bg-white text-[14px] pr-10 focus-visible:ring-primary"
                      style={{ fontFamily: "'Geist', sans-serif" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#1a1a2e] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-[14px] font-medium transition-all hover:bg-primary/90 disabled:opacity-50"
                style={{ fontFamily: "'Geist', sans-serif" }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    {mode === "login" && <><LogIn className="w-4 h-4" />Sign in</>}
                    {mode === "signup" && <><UserPlus className="w-4 h-4" />Create account</>}
                    {mode === "forgot" && <><Mail className="w-4 h-4" />Send reset link</>}
                  </>
                )}
              </button>
            </form>

            <div
              className="mt-6 text-center text-[13px] text-[#373a46] opacity-60"
              style={{ fontFamily: "'Geist', sans-serif" }}
            >
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
