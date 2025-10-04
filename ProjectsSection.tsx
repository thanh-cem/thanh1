import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site-config';

const ProjectsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const { projects } = SITE_CONFIG;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const element = document.getElementById('projects');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // Removed old gradient color array; using a fixed subtle red overlay on hover

  return (
    <section id="projects" className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-7xl mx-auto w-full">
        <h2 className={`text-4xl md:text-5xl font-bold text-center text-crayon-text mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {projects.title}
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.list.map((project, index) => (
            <Card
              key={project.title}
              className={`sketchy relative overflow-hidden bg-card hover:bg-[#e12727]/10 shadow-crayon hover:shadow-wiggle transition-all duration-500 group cursor-pointer hover-wiggle ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                animationDelay: `${index * 200}ms`,
                animationFillMode: 'forwards'
              }}
              onMouseEnter={() => setHoveredProject(index)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              {/* Removed full-card overlay so the image remains unaffected by hover tint */}

              <CardHeader className="relative z-10">
                <CardTitle className="text-xl font-semibold text-crayon-text group-hover:text-tomato-red transition-colors">
                  {project.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4">
                {/* Media Area */}
                {project.image ? (
                  <img
                    src={project.image as string}
                    alt={project.title}
                    className="w-full h-48 object-cover rounded-md sketchy border mb-2"
                  />
                ) : (
                  <div className="w-full h-48 rounded-md border-2 border-dashed border-crayon-text/30 flex items-center justify-center text-crayon-text/50 mb-2">
                    image coming soon
                  </div>
                )}

                <p className="text-crayon-text leading-relaxed">
                  {project.description}
                </p>
                
                {/* Technologies */}
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="text-[#e12727] font-bold">
                      #{tech}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className={`flex gap-2 pt-4 transition-all duration-300 ${
                  hoveredProject === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 sketchy font-bold text-tomato-red border-2 border-tomato-red hover:bg-tomato-red hover:text-white transition-bouncy hover:scale-105"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}>
          <p className="text-crayon-text mb-6">
            {projects.callToAction.text}
          </p>
          <Button
            size="lg"
            variant="outline"
            className="sketchy border-2 border-tomato-red text-tomato-red hover:bg-tomato-red hover:text-white transition-bouncy hover:scale-105"
          >
            <Github className="w-5 h-5 mr-2" />
            {projects.callToAction.buttonText}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;