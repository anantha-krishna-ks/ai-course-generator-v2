import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
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
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[26.416%] from-[rgba(255,255,255,0)] to-[66.943%] to-white" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1200px] px-6 pt-[290px] flex flex-col items-center gap-8">
        {/* Heading */}
        <motion.h1
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center leading-[1.05] tracking-[-0.04em]"
          style={{ fontFamily: "'Geist', sans-serif", fontWeight: 500 }}
        >
          <span className="text-[80px] text-[#1a1a2e]">
            Simple{" "}
            <span
              className="text-[100px]"
              style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
            >
              creation
            </span>{" "}
            for
          </span>
          <br />
          <span className="text-[80px] text-[#1a1a2e]">your AI courses</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center text-[18px] max-w-[554px] text-[#373a46] opacity-80 leading-relaxed"
          style={{ fontFamily: "'Geist', sans-serif" }}
        >
          Transform your ideas into comprehensive, structured courses in minutes.
          Powered by AI, designed for educators and teams.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          onClick={() => navigate("/auth")}
          className="flex items-center gap-2 rounded-[32px] bg-gradient-to-b from-[#2a2a3a] to-[#1a1a2e] px-8 py-4 text-[16px] font-medium text-white shadow-[inset_-4px_-6px_25px_0px_rgba(201,201,201,0.08),inset_4px_4px_10px_0px_rgba(29,29,29,0.24)] transition-all hover:opacity-90"
          style={{ fontFamily: "'Geist', sans-serif" }}
        >
          Get Started
          <ArrowRight className="h-5 w-5" />
        </motion.button>

        {/* Social Proof */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-3 mt-2"
        >
          <div className="flex -space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]"
              />
            ))}
          </div>
          <span
            className="text-[14px] text-[#373a46] opacity-70"
            style={{ fontFamily: "'Geist', sans-serif" }}
          >
            1,020+ courses created by educators worldwide
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default Index;
