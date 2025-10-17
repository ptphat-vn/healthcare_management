import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import bg_authen from "../../assets/images/bg_authen.png";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dash1 from "../../assets/images/dash1.webp";
import dash2 from "../../assets/images/dash2.webp";
import dash3 from "../../assets/images/dash3.jpg";
export default function LandingPage() {
  const slides = [dash1, dash2, dash3];
  const [index, setIndex] = useState(0);
  
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 3000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div 
     className="min-h-dvh flex flex-col relative"
    style={{
      backgroundImage: `url(${bg_authen})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
    <div className = "absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/60 backdrop-blur-[2px]"> 

      <header className="sticky top-0 z-20 ">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className=" relative z-10 flex items-center gap-3">
           
          <svg width={40} height={40} viewBox="0 0 56 56" fill="none" aria-hidden="true">
              <path
                d="M6 32h10l6-16 12 40 6-24h10"
                stroke="#222"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                />
            </svg>
            <span className="font-semibold text-xl text-[#222]"> Laboratory Management</span>
          </Link>
          <nav className="flex items-center gap-3">
          <Link to="/auth/register">
              <Button
                size="sm"
                variant="default"
                className="h-10 px-9 rounded-md border-2 border-solid border-blue-400 text-blue-500 bg-white hover:bg-blue-500 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-300">
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            The Modern Platform for Blood Test Management
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
            From sample tracking to result delivery, our platform optimizes your workflow, enhances security, and ensures data accuracy.            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/start">
                <Button 
                variant="default"
                className="h-11 px-8 rounded-md border-2 border-blue-500 text-white bg-blue-500 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-400"
                size="lg">Get Started</Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] w-full rounded-1xl border border-border bg-card/80 backdrop-blur shadow-lg overflow-hidden relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={index}
                  src={slides[index]}
                  alt="illustration"
                  className="absolute inset-0 h-full w-full object-cover rounded-1xl"
                  initial={{ opacity: 0, scale: 0.98, x: 20, filter: "blur(2px)" }}
                  animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.98, x: -20, filter: "blur(2px)" }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/10" />
            </div>
          </div>
        </section>
      </main>
    </div>
    </div>
  );
} 