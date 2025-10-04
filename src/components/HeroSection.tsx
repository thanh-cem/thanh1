import { Button } from '@/components/ui/button';
import { SITE_CONFIG } from '@/config/site-config';
import { useEffect, useMemo, useState } from 'react';

const HeroSection = () => {
  const { personal, assets } = SITE_CONFIG;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById('home');
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const bgDots = useMemo(() => {
    // 4–7 dots, random size/position, subtle motion
    const count = 4 + Math.floor(Math.random() * 4);
    const corners = [
      { top: 6, left: 6 },    // top-left
      { top: 6, left: 94 },   // top-right
      { top: 94, left: 6 },   // bottom-left
      { top: 94, left: 94 },  // bottom-right
    ];
    const jitter = () => (Math.random() - 0.5) * 6; // +/-3%

    return Array.from({ length: count }).map((_, i) => {
      const size = 12 + Math.floor(Math.random() * 20); // 12px - 31px
      const corner = corners[Math.floor(Math.random() * corners.length)];
      const top = Math.min(100, Math.max(0, corner.top + jitter()));
      const left = Math.min(100, Math.max(0, corner.left + jitter()));
      const colorVar = i % 2 === 0 ? 'var(--tomato-green)' : 'var(--primary)';
      const animClass = i % 2 === 0 ? 'animate-float' : 'animate-pulse';
      const delay = `${(Math.random() * 2).toFixed(2)}s`;
      const duration = `${(5 + Math.random() * 5).toFixed(2)}s`;
      const opacity = 0.35;
      return { id: i, size, top, left, colorVar, animClass, delay, duration, opacity };
    });
    // Regenerate when section becomes visible (enter view)
  }, [isVisible]);

  return (
    <section 
      id="home" 
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{
        backgroundImage: assets.heroBackground ? `url(${assets.heroBackground})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Floating Background Elements - randomized */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bgDots.map((d) => (
          <div
            key={d.id}
            className={`absolute rounded-full ${d.animClass}`}
            style={{
              top: `${d.top}%`,
              left: `${d.left}%`,
              width: `${d.size}px`,
              height: `${d.size}px`,
              backgroundColor: `hsl(${d.colorVar})`,
              opacity: d.opacity,
              animationDelay: d.delay as React.CSSProperties['animationDelay'],
              animationDuration: d.duration as React.CSSProperties['animationDuration'],
            }}
          />
        ))}
      </div>

      {/* Two-column layout */}
      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-8 items-center">
        {/* Left side - Space for your PNG image */}
        <div className="flex items-center justify-center lg:w-1/2 flex-shrink-0">
          {assets.heroIllustration ? (
            <img 
              src={assets.heroIllustration} 
              alt="hero illustration" 
              className="w-full max-w-md h-auto animate-fade-in"
            />
          ) : (
            <div className="w-full max-w-md aspect-square bg-card/30 backdrop-blur-sm rounded-lg border-2 border-dashed border-crayon-text/30 flex items-center justify-center">
              <p className="text-crayon-text/50 text-center px-4">your image will go here</p>
            </div>
          )}
        </div>

        {/* Right side - Content */}
        <div className="space-y-6 text-center lg:text-left lg:w-1/2">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-extrabold text-tomato-green">
              {personal.greeting}
            </h1>
            <h1 className="text-5xl md:text-7xl font-extrabold text-tomato-red">
              i'm {personal.name}
            </h1>
          </div>
          
          <p className="text-2xl md:text-3xl font-medium text-tomato-blue">
            {personal.tagline}
          </p>
          
          <div className="flex gap-4 justify-center lg:justify-start pt-8">
            <Button 
              size="lg"
              className="sketchy crayon-button bg-tomato-red hover:bg-tomato-red/90 text-white font-bold transition-bouncy hover:scale-105"
              onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            >
              view my work
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="sketchy font-bold text-tomato-red border-2 border-tomato-red hover:bg-tomato-red hover:text-white transition-bouncy hover:scale-105"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              get in touch
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-tomato-green rounded-full flex justify-center">
          <div className="w-1 h-3 bg-tomato-green rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
