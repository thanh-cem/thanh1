// ==========================================
// SITE CONFIGURATION - EASY CUSTOMIZATION
// ==========================================

export const SITE_CONFIG = {
  // ==========================================
  // PERSONAL INFO (Edit these easily!)
  // ==========================================
  personal: {
    name: "Thanh",
    greeting: "hi!",
    tagline: "an ArtTech student.",
    description: "welcome to my personal web page — where i share what i build and learn along the way.",
    
    // Contact Information
    contact: {
      email: "thanhthaido1704@gmail.com",
      github: "github.com/thanh-cem",
      instagram: "@cemrenji.o",
      githubUrl: "https://github.com/thanh-cem",
      instagramUrl: "https://instagram.com/cemrenji.o",
    }
  },

  // ==========================================
  // VISUAL ASSETS (Easy to swap!)
  // ==========================================
  assets: {
    // Hero Section - Replace with your custom illustration
    heroBackground: null, // Set to "/hero-bg.png" or your custom image path
    heroIllustration: "cem2.png", // Set to "/hero-illustration.png" for custom hero art
    
    // Page Background - Replace with your artwork
    pageBackground: null, // Set to "/page-bg.png" or your custom background
    
    // Alternative: Use pattern background (current default)
    usePatternBackground: true,
  },

  // ==========================================
  // ABOUT SECTION
  // ==========================================
  about: {
    title: "about me",
    paragraphs: [
      "i'm a second-year ArtTech student passionate about illustration and idea exploration. i'm learning to blend creativity with technology to bring my artworks to life. i love experimenting with colors, forms, and motion to tell visual stories in new ways. recently, i've been exploring how interactive design can make digital art more engaging and personal."
    ],
    currentFocus: [
      "🎓 studying ArtTech",
      "💻 building interactive web applications",
      "🎨 learning modern UI/UX principles",
      "🚀 exploring new frontend technologies"
    ],
    skills: {
      technical: ['design', 'drawing', 'coding', 'illustration', 'digital art'],
      style: ['bold', 'colorful', 'expressive', 'playful']
    }
  },

  // ==========================================
  // PROJECTS SECTION
  // ==========================================
  projects: {
    title: "my projects",
    list: [
      {
        title: 'hòa vũ',
        description: 'an interactive art project',
        technologies: ['blender', 'touch designer'],
        image: "hoavu.png",
        demo: '#'
      },
      {
        title: 'waterfall',
        description: 'an interactive visual project that reacts to mouse movement and music.',
        technologies: ['processing'],
        image: "waterfall.png",
        demo: '#'
      },
      {
        title: 'cô gái mở đường',
        description: 'an interactive visual project that reacts to camera tracking and music.',
        technologies: ['processing'],
        image: "cgmd.png",
        demo: '#'
      }
    ],
    callToAction: {
      text: "Want to see more? Check out my GitHub for additional projects and code samples.",
      buttonText: "View All Projects"
    }
  },

  // ==========================================
  // CONTACT SECTION
  // ==========================================
  contact: {
    title: "let's connect",
    subtitle: "get in touch",
    description: "i'm always excited to connect with fellow developers, potential collaborators, or anyone interested in my work. feel free to reach out!",
    formTitle: "send a message",
    funFact: {
      title: "fun fact!",
      text: "i love combining creativity with code. when i'm not programming, you'll find me exploring design trends or experimenting with new web technologies!"
    },
    socialText: "follow my journey and connect with me on social platforms"
  },

  // ==========================================
  // SEO & METADATA
  // ==========================================
  seo: {
    title: "Thanh's Personal Web - Creative Tech Student & Frontend Developer",
    description: "Hi, I'm Thanh! A passionate ICT student and aspiring frontend developer who loves creating beautiful, interactive web experiences. Explore my projects and journey.",
    keywords: "Thanh, frontend developer, web design, ICT student, creative coding, portfolio",
    author: "Thanh",
    ogImage: "https://lovable.dev/opengraph-image-p98pqg.png"
  }
};

// ==========================================
// EASY CUSTOMIZATION NOTES:
// ==========================================
/*
🎨 TO CUSTOMIZE YOUR SITE:

1. REPLACE CONTENT:
   - Edit personal info, descriptions, project details above
   - Update contact information and social links

2. ADD CUSTOM VISUALS:
   - Add your PNG artwork to /public folder
   - Update assets.heroBackground, assets.heroIllustration, assets.pageBackground
   - Set usePatternBackground to false if using custom background

3. PROJECTS:
   - Replace projects list with your actual projects
   - Update GitHub/demo links
   - Add more projects by copying the structure

4. STYLING:
   - Colors and fonts are controlled in src/index.css
   - Animations are in tailwind.config.ts

5. FONTS:
   - Handwritten fonts are now configured (see index.html)
   - Switch between handwritten and clean fonts in index.css
*/