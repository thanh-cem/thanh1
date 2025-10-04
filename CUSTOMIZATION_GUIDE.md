# 🎨 Portfolio Customization Guide

This portfolio is designed to be **super easy to customize**! All your personal content, styles, and assets are centralized for quick editing.

## 🚀 Quick Start

### 1. **Edit Your Content** 
Open `src/config/site-config.ts` - this is your main customization hub:

```typescript
// Change your personal info here
personal: {
  name: "Thanh",
  greeting: "Hi, I'm Thanh",
  tagline: "A tech student who loves creative web design.",
  // ... update with your info
},
```

### 2. **Add Your Visual Assets**
Put your custom images in the `public/` folder, then update the config:

```typescript
assets: {
  // Replace with your custom artwork
  heroBackground: "/my-hero-background.png",     // Hero section background
  heroIllustration: "/my-hero-illustration.png", // Hero section illustration
  pageBackground: "/my-page-background.png",     // Full page background
  
  // Set to false if using custom backgrounds
  usePatternBackground: false,
},
```

### 3. **Choose Your Font Style**
In `src/index.css`, uncomment your preferred font:

```css
body {
  /* Choose your font style: */
  font-family: "Kalam", "Caveat", cursive, system-ui; /* Handwritten style */
  /* font-family: "Poppins", system-ui, sans-serif; */ /* Clean style */
}
```

## 📁 File Structure

```
src/
├── config/
│   └── site-config.ts          # 🎯 MAIN CUSTOMIZATION FILE
├── components/
│   ├── HeroSection.tsx         # Hero section with typewriter effect
│   ├── AboutSection.tsx        # About section with skills
│   ├── ProjectsSection.tsx     # Projects showcase
│   └── ContactSection.tsx      # Contact form & social links
├── index.css                   # 🎨 Design system & colors
└── pages/Index.tsx             # Main page layout

public/                         # 📸 Put your images here
├── your-hero-bg.png
├── your-illustration.png
└── your-page-bg.png
```

## 🎨 Customization Options

### **Personal Information**
- Name, greeting, tagline, description
- Contact info (email, GitHub, LinkedIn)
- About section content & skills
- Project details & links

### **Visual Assets**
- **Hero Background**: Custom artwork behind the hero section
- **Hero Illustration**: Your custom illustration/avatar
- **Page Background**: Full-page background artwork
- **Pattern Background**: Toggle dot pattern on/off

### **Content Sections**
- **About**: Bio, current focus, skills, stats
- **Projects**: Title, description, tech stack, links
- **Contact**: Form title, description, fun facts

### **Colors & Fonts**
- **Colors**: Defined in `src/index.css` (crayon theme)
- **Fonts**: Choose between handwritten (Kalam/Caveat) or clean (Poppins)

## 🖼️ Adding Your Artwork

1. **Save your images** to the `public/` folder
2. **Update the config** in `src/config/site-config.ts`:
   ```typescript
   assets: {
     heroBackground: "/my-background.png",
     heroIllustration: "/my-illustration.png", 
     pageBackground: "/my-page-bg.png",
     usePatternBackground: false, // Turn off default patterns
   }
   ```

## 🎯 Quick Tips

- **Content**: Edit `src/config/site-config.ts` for all text content
- **Images**: Drop in `public/` folder, reference with `/filename.png`
- **Colors**: Modify the crayon theme in `src/index.css`
- **Fonts**: Switch between handwritten/clean in `src/index.css`
- **Animations**: All animations are pre-built and automatic!

## 🔧 Advanced Customization

Want to go deeper? Check out:
- `src/index.css` - Design system colors and effects
- `tailwind.config.ts` - Additional color tokens and animations
- Individual component files for layout changes

---

**Happy customizing!** 🎨 Your portfolio should reflect your unique style and personality.