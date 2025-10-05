import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site-config';

const ProjectsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { projects } = SITE_CONFIG;

  // Define the three folder categories and their image slot counts
  const categories = [
    { title: 'interactive', folder: 'interactive', count: 3, images: ['hoavu.png', 'cgmd.png', 'waterfall.png'] },
    {
      title: 'graphic design',
      folder: 'graphic design',
      count: 8,
      images: [
        'graphic design/hoavu1.png',
        'graphic design/tdvl1.png',
        'graphic design/tdvl.png',
        'graphic design/lexigo.png',
        "graphic design/Johnson's_1.png",
        'graphic design/vision-01.png',
        'graphic design/mission-1-02.png',
        'graphic design/core values-03.png',
      ],
    },
    {
      title: 'artwork',
      folder: 'artwork',
      count: 6,
      images: [
        'artwork/stalker.png',
        'artwork/lstk.png',
        'artwork/Untitled-1.png',
        'artwork/eye-01.png',
        'artwork/ca.png',
        'artwork/2.png',
      ],
    },
  ];

  const tagsByCategory: Record<string, string[]> = {
    'interactive': ['processing', 'blender'],
    'graphic design': ['photoshop', 'illustration'],
    'artwork': ['handcraft', 'digitalart']
  };

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
        
        <div className="flex flex-wrap -m-4 items-start">
          {categories.map((cat, index) => (
            <div key={cat.title} className="p-4 w-full md:w-1/2 lg:w-1/3">
              <Card
                className={`sketchy relative overflow-hidden bg-card hover:bg-[#e12727]/10 shadow-crayon hover:shadow-wiggle transition-all duration-500 group cursor-pointer hover-wiggle ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
                }`}
                style={{ 
                  animationDelay: `${index * 200}ms`,
                  animationFillMode: 'forwards'
                }}
                onMouseEnter={() => setHoveredProject(index)}
                onMouseLeave={() => setHoveredProject(null)}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
              {/* Removed full-card overlay so the image remains unaffected by hover tint */}

              <CardHeader className="relative z-10">
                <CardTitle className="text-xl font-semibold text-crayon-text group-hover:text-tomato-red transition-colors">
                  {cat.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-4">
                {/* Closed state: show red hashtags like skills */}
                {openIndex !== index && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-2">
                      {tagsByCategory[cat.title].map((tag) => (
                        <span key={tag} className="text-[#e12727] font-bold">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expanded grid of image demo slots */}
                {openIndex === index && (
                  <div className={cat.images ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'grid grid-cols-2 md:grid-cols-3 gap-3'}>
                    {cat.images
                      ? cat.images.map((filename: string, i: number) => {
                          const isInteractive = cat.title === 'interactive';
                          const isArtwork = cat.title === 'artwork';
                          // Artwork layout: first 3 full width, then two side-by-side, then last full width
                          const artworkFullRow = isArtwork && (i === 0 || i === 1 || i === 2 || i === 5);
                          const containerClass = isInteractive && i === 0
                            ? 'sm:col-span-2'
                            : artworkFullRow
                              ? 'sm:col-span-2'
                              : '';
                          return (
                            <div key={filename} className={`relative ${containerClass}`}>
                              <img
                                src={`/${filename}`}
                                alt={`${cat.title} ${i + 1}`}
                                className={`w-full h-auto object-contain rounded-md sketchy border`}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  const placeholder = (e.currentTarget.nextSibling as HTMLElement);
                                  if (placeholder) placeholder.style.display = 'flex';
                                }}
                              />
                              <div
                                className="hidden rounded-md border-2 border-dashed border-crayon-text/30 items-center justify-center text-xs text-crayon-text/60 p-2 min-h-32"
                                style={{ display: 'none' }}
                              >
                                upload `{filename}` to `/public/`
                              </div>
                            </div>
                          );
                        })
                      : Array.from({ length: cat.count }).map((_, i) => {
                          const src = `/${cat.folder}/${i + 1}.png`;
                          return (
                            <div key={i} className="relative">
                              <img
                                src={src}
                                alt={`${cat.title} ${i + 1}`}
                                className="w-full h-auto object-contain rounded-md sketchy border"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  const placeholder = (e.currentTarget.nextSibling as HTMLElement);
                                  if (placeholder) placeholder.style.display = 'flex';
                                }}
                              />
                              <div
                                className="hidden rounded-md border-2 border-dashed border-crayon-text/30 items-center justify-center text-xs text-crayon-text/60 p-2 min-h-32"
                                style={{ display: 'none' }}
                              >
                                upload `{i + 1}.png` to `/public/{cat.folder}/`
                              </div>
                            </div>
                          );
                        })}
                  </div>
                )}
              </CardContent>
              </Card>
            </div>
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