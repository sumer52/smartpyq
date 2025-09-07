# SmartPYQ Frontend 📚

A modern, accessible React frontend for the SmartPYQ platform - an intelligent website for students to access previous year question papers, chat with AI assistants, and download PDFs.

## ✨ Features

- **🎯 Modern UI/UX**: Built with React, Tailwind CSS, and Framer Motion animations
- **📱 Responsive Design**: Mobile-first approach with seamless desktop experience
- **♿ Accessibility First**: WCAG AA compliant with comprehensive keyboard navigation
- **🚀 Performance Optimized**: Code splitting, lazy loading, and optimized bundles
- **🤖 AI Integration**: Real-time chat with Gemini API integration
- **📄 PDF Handling**: Advanced PDF viewer with watermarking and download controls
- **🔍 Smart Search**: Debounced search with intelligent suggestions
- **🎨 Smooth Animations**: Framer Motion with reduced-motion support

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom design tokens
- **Animations**: Framer Motion with accessibility considerations
- **Icons**: Heroicons (SVG-based)
- **PDF Handling**: PDF.js (lazy-loaded)
- **State Management**: React hooks and context
- **Routing**: React Router DOM
- **Build Tool**: Vite for fast development and optimized builds

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- Modern browser with ES6+ support

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd smartpyq-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:8000

# TODO: Add your API keys here
# VITE_GEMINI_API_KEY=your_gemini_api_key
# VITE_FIREBASE_CONFIG=your_firebase_config
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Navigation and branding
│   ├── Hero.jsx        # Landing page hero section
│   ├── SearchBar.jsx   # Debounced search with suggestions
│   ├── FeaturesGrid.jsx # Feature showcase cards
│   ├── QuickActions.jsx # Action buttons with shortcuts
│   ├── PaperCard.jsx   # Paper display component
│   ├── PDFViewer.jsx   # Advanced PDF viewer
│   ├── UploadStepper.jsx # Multi-step upload UI
│   ├── ChatWidget.jsx  # AI chat interface
│   └── Footer.jsx      # Site footer with newsletter
├── pages/              # Main application pages
│   ├── HomePage.jsx    # Landing and dashboard
│   ├── BrowsePage.jsx  # Paper browsing and filtering
│   ├── UploadPage.jsx  # Paper upload interface
│   └── AIPage.jsx      # AI chat interface
├── lib/                # Utilities and configuration
│   ├── api.js          # API client and endpoints
│   └── syllabus.seed.js # Demo syllabus data
├── hooks/              # Custom React hooks
│   └── useDebounce.js  # Debounced input handling
└── styles/             # Global styles and tokens
    └── index.css       # Tailwind imports and variables
```

## 🎨 Design System

### Color Tokens

```css
:root {
  /* Brand Colors */
  --brand-500: #6C4EF6;
  --brand-600: #5A3CE0;
  --accent-500: #9333EA;
  
  /* Background Colors */
  --bg-dark: #0F172A;
  --bg-light: #F8FAFF;
  --muted-500: #6B7280;
  
  /* Effects */
  --shadow-md: 0 10px 20px rgba(16,24,40,0.08);
  --glow: 0 6px 30px rgba(108,78,246,0.18);
  
  /* Animation Timing */
  --anim-fast: 150ms;
  --anim-medium: 300ms;
  --anim-slow: 600ms;
}
```

### Motion Tokens

```javascript
// Framer Motion spring configuration
const spring = {
  type: 'spring',
  stiffness: 300,
  damping: 20
};
```

## ♿ Accessibility Features

### Built-in Accessibility

- ✅ **Keyboard Navigation**: Full keyboard support for all interactive elements
- ✅ **Screen Reader Support**: Proper ARIA labels and semantic HTML
- ✅ **Focus Management**: Visible focus indicators and logical tab order
- ✅ **Color Contrast**: WCAG AA compliant color combinations
- ✅ **Reduced Motion**: Respects `prefers-reduced-motion` preference
- ✅ **Live Regions**: Dynamic content announcements
- ✅ **Modal Focus Trapping**: Proper focus management in dialogs

### Accessibility Testing Checklist

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Use Enter/Space to activate buttons
- [ ] Use arrow keys in custom components (search suggestions)
- [ ] Escape key closes modals and dropdowns
- [ ] Focus returns to trigger element after modal close

#### Screen Reader Testing
- [ ] Test with NVDA (Windows) or VoiceOver (macOS)
- [ ] Verify all images have alt text
- [ ] Check form labels are properly associated
- [ ] Ensure dynamic content is announced

#### Visual Testing
- [ ] Test at 200% zoom level
- [ ] Verify color contrast ratios
- [ ] Check focus indicators are visible
- [ ] Test in high contrast mode

#### Motion Testing
- [ ] Enable "Reduce motion" in OS settings
- [ ] Verify animations are disabled/reduced
- [ ] Check essential functionality still works

### Testing Commands

```bash
# Run accessibility tests
npm run test:a11y

# Lighthouse accessibility audit
npm run audit:a11y

# Check color contrast
npm run test:contrast
```

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format

# Type checking (if using TypeScript)
npm run type-check
```

### Code Style

- **ESLint**: Configured with React and accessibility rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks

### Component Guidelines

1. **Accessibility First**: Always include ARIA attributes and keyboard support
2. **Performance**: Use React.lazy for heavy components
3. **Animations**: Respect `prefers-reduced-motion`
4. **Error Boundaries**: Wrap components that might fail
5. **Loading States**: Provide skeleton loaders for better UX

## 🔌 Backend Integration

### API Endpoints

The frontend expects these backend endpoints:

```javascript
// Authentication
POST /api/v1/auth/login
POST /api/v1/auth/signup
POST /api/v1/auth/refresh

// Papers
GET /api/v1/papers
GET /api/v1/papers/{id}
POST /api/v1/papers
GET /api/v1/papers/{id}/authorize
POST /api/v1/papers/{id}/stamp

// Search
GET /api/v1/search?q={query}

// Chat
POST /api/v1/chat
GET /api/v1/chat/stream?session_id={id}

// Features
GET /api/v1/features

// Newsletter
POST /api/v1/subscribe
```

### API Client Configuration

Update `src/lib/api.js` with your backend URL:

```javascript
// TODO: Replace with your actual backend URL
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:8000';
```

## 📦 Deployment

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_BACKEND_URL
```

### Docker

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🧪 Testing

### Unit Tests

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### E2E Tests

```bash
# Run Cypress tests
npm run test:e2e

# Open Cypress GUI
npm run test:e2e:open
```

## 🔍 Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Check for unused dependencies
npm run deps:check
```

### Performance Tips

1. **Code Splitting**: Components are lazy-loaded where appropriate
2. **Image Optimization**: Use SVG icons and optimized images
3. **Caching**: Implement proper caching strategies
4. **Preloading**: Critical resources are preloaded
5. **Tree Shaking**: Unused code is eliminated in production builds

## 🐛 Troubleshooting

### Common Issues

#### Development Server Won't Start
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Failures
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

#### API Connection Issues
- Verify `VITE_BACKEND_URL` in `.env.local`
- Check CORS configuration on backend
- Ensure backend server is running

### Debug Mode

```bash
# Enable debug logging
DEBUG=true npm run dev
```

## 📚 Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure accessibility compliance
- Test across different browsers and devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from modern educational platforms
- Accessibility guidelines from W3C WAI
- Performance best practices from web.dev
- Animation patterns from Framer Motion community

---

**Built with ❤️ for students by the SmartPYQ team**

For support, email support@smartpyq.com or create an issue in this repository.