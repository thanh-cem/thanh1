import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import ContactSection from "@/components/ContactSection";
import ScrollToTop from "@/components/ScrollToTop";
import CursorTrail from "@/components/CursorTrail";
import { SITE_CONFIG } from "@/config/site-config";
import { useEffect, useMemo, useState } from "react";

const Index = () => {
  const { assets } = SITE_CONFIG;
  const [activeSection, setActiveSection] = useState<string>("home");
  
  // Track which section is in view to re-seed dots per section
  useEffect(() => {
    const ids = ["home", "about", "projects", "contact"];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const dots = useMemo(() => {
    // Generate a list of randomized dots; re-run when activeSection changes
    const count = 140; // slightly more dots, but not too much
    const arr = Array.from({ length: count }).map((_, i) => {
      const size = Math.floor(2 + Math.random() * 6); // 2px - 7px
      const top = Math.random() * 100; // percent
      const left = Math.random() * 100; // percent
      const color = i % 2 === 0 ? "var(--tomato-red)" : "var(--tomato-green)";
      const opacity = i % 2 === 0 ? 0.16 : 0.12; // subtle variance
      const animClass = i % 3 === 0 ? "animate-float" : i % 3 === 1 ? "animate-pulse" : "";
      const delay = `${(Math.random() * 2).toFixed(2)}s`;
      const duration = `${(4 + Math.random() * 4).toFixed(2)}s`; // 4s - 8s
      return { id: `${activeSection}-${i}`, size, top, left, color, opacity, animClass, delay, duration };
    });
    return arr;
  }, [activeSection]);
  
  return (
    <div 
      className="bg-cream-bg min-h-screen overflow-x-hidden"
      style={{
        backgroundImage: assets.pageBackground ? `url(${assets.pageBackground})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <Navigation />
      <CursorTrail />
      <main>
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <ScrollToTop />
      
      {/* Background Pattern - randomized dots with gentle motion */}
      {assets.usePatternBackground && !assets.pageBackground && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {dots.map((dot) => (
            <div
              key={dot.id}
              className={`absolute rounded-full ${dot.animClass}`}
              style={{
                top: `${dot.top}%`,
                left: `${dot.left}%`,
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                backgroundColor: `hsl(${dot.color})`,
                opacity: dot.opacity,
                animationDelay: dot.delay as React.CSSProperties["animationDelay"],
                animationDuration: dot.duration as React.CSSProperties["animationDuration"],
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;
