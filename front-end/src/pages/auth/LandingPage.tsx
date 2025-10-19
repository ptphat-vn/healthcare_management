import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import bg_authen from "../../assets/images/bg_authen.png";
import { useEffect, useState } from "react";
import dash1 from "../../assets/images/dash1.webp";
import dash2 from "../../assets/images/dash2.webp";
import dash3 from "../../assets/images/dash3.jpg";

export default function LandingPage() {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [dash1, dash2, dash3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
            <h1 className="text-3xl md:text-4xl font-bold leading-tight animate-fade-in">
            The Modern Platform for Blood Test Management
            </h1>
            <p className="text-muted-foreground text-base md:text-lg animate-fade-in-delay">
            From sample tracking to result delivery, our platform optimizes your workflow, enhances security, and ensures data accuracy.            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/start">
                <Button 
                variant="default"
                className="h-11 px-8 rounded-md border-2 border-blue-500 text-white bg-blue-500 hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-400 hover:scale-105 transition-transform duration-200">
                Get Started</Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl hover:scale-105 transition-transform duration-300">
              <div 
                className="flex transition-transform duration-1000 ease-in-out"
                style={{ transform: `translateX(-${currentImage * 100}%)` }}>
                {images.map((image, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <img
                      src={image}
                      alt={`Dashboard ${index + 1}`}
                      className="w-full h-auto rounded-2xl shadow-3xl hover:shadow-2xl transition-shadow duration-300"/>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer hover:scale-125 ${
                      index === currentImage 
                        ? 'bg-gray-600 scale-125' 
                        : 'bg-gray-400 hover:bg-gray-200'
                    }`}/>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    </div>
  );
}