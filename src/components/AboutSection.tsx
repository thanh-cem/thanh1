import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SITE_CONFIG } from '@/config/site-config';

const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { about } = SITE_CONFIG;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('about');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-5xl mx-auto w-full">
        <h2 className={`text-4xl md:text-5xl font-bold text-center text-crayon-text mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {about.title}
        </h2>
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Introduction - Full width on mobile, spans 2 columns on desktop */}
          <div className={`md:col-span-2 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <Card className="sketchy bg-card/50 backdrop-blur-sm shadow-crayon h-full">
              <CardContent className="p-8">
                {about.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-lg text-crayon-text leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Current Focus - Pop effect only */}
          <Card className={`sketchy bg-card/50 backdrop-blur-sm shadow-crayon transition-transform duration-300 hover:scale-105 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-crayon-text mb-4">current focus</h3>
              <ul className="space-y-2 text-crayon-text">
                {about.currentFocus.map((focus, index) => (
                  <li key={index}>{focus}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Skills & Style Box - Hashtag style */}
          <Card className={`sketchy bg-card/50 backdrop-blur-sm shadow-crayon transition-transform duration-300 hover:scale-105 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-crayon-text mb-4">skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {about.skills.technical.map((skill, index) => (
                      <span 
                        key={index} 
                        className="text-tomato-red font-bold text-lg"
                      >
                        #{skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-crayon-text mb-4">style</h3>
                  <div className="flex flex-wrap gap-2">
                    {about.skills.style.map((style, index) => (
                      <span 
                        key={index} 
                        className="text-tomato-green font-bold text-lg"
                      >
                        #{style}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
