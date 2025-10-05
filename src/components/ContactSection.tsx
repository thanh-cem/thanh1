import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Github, Instagram, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SITE_CONFIG } from '@/config/site-config';
import NoteCanvas from '@/components/NoteCanvas';

const ContactSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const { toast } = useToast();
  const { contact, personal } = SITE_CONFIG;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('contact');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent! 🚀",
      description: "Thanks for reaching out! I'll get back to you soon.",
    });
    setFormData({ name: '', email: '', message: '' });
  };

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      label: 'email',
      value: personal.contact.email,
      href: `mailto:${personal.contact.email}`,
      color: 'hover:text-tomato-red'
    },
    {
      icon: <Github className="w-5 h-5" />,
      label: 'github',
      value: personal.contact.github,
      href: personal.contact.githubUrl,
      color: 'hover:text-crayon-text'
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      label: 'instagram',
      value: personal.contact.instagram,
      href: personal.contact.instagramUrl,
      color: 'hover:text-tomato-red'
    }
  ];

  return (
    <section id="contact" className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-6xl mx-auto w-full">
        <h2 className={`text-4xl md:text-5xl font-bold text-center text-crayon-text mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {contact.title}
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className={`space-y-8 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
            <div>
              <h3 className="text-2xl font-semibold text-crayon-text mb-4">{contact.subtitle}</h3>
              <p className="text-lg text-crayon-text leading-relaxed mb-8">
                {contact.description}
              </p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-6">
              {contactInfo.map((contactItem, index) => (
                <a
                  key={contactItem.label}
                  href={contactItem.href}
                  className={`flex items-center gap-4 p-4 rounded-xl sketchy bg-card/50 backdrop-blur-sm shadow-crayon hover-wiggle transition-bouncy ${contactItem.color} group`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="p-3 rounded-lg bg-crayon-text text-white group-hover:scale-110 transition-transform">
                    {contactItem.icon}
                  </div>
                  <div>
                    <div className="font-medium text-crayon-text">{contactItem.label}</div>
                    <div className="text-crayon-text group-hover:text-inherit transition-colors">
                      {contactItem.value}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className={`${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
            <Card className="sketchy bg-card/70 backdrop-blur-sm shadow-crayon">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-crayon-text mb-6">{contact.formTitle}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Input
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="sketchy border-border/50 focus:border-tomato-red transition-colors"
                      required
                    />
                  </div>
                  
                  <div>
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="sketchy border-border/50 focus:border-tomato-red transition-colors"
                      required
                    />
                  </div>
                  
                  <div>
                    <Textarea
                      placeholder="Your Message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="sketchy border-border/50 focus:border-tomato-red transition-colors min-h-[120px] resize-none"
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full sketchy font-bold text-tomato-red border-2 border-tomato-red hover:bg-tomato-red hover:text-white transition-bouncy hover:scale-105"
                    size="lg"
                    variant="outline"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Note Canvas Section */}
        <div className={`mt-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
          <h3 className="text-2xl font-semibold text-crayon-text text-center mb-6">or write me a note</h3>
          <NoteCanvas />
        </div>
      </div>
    </section>
  );
};

export default ContactSection;