# WebSlide - Professional Presentation Tool

A modern, web-based presentation creator built to rival Microsoft PowerPoint and Canva.

## 🎯 Vision

WebSlide is not a school project - it's a professional-grade presentation tool designed with enterprise architecture, scalability, and user experience in mind.

## ✨ Features

- **Professional Editor**: Full-featured code editor with HTML/CSS/JavaScript support
- **Live Preview**: Real-time preview with accurate aspect ratio rendering
- **Responsive Design**: Adaptive layouts that work on any screen size
- **Export/Import**: Save and share presentations in JSON format
- **Presentation Mode**: Full-screen presentation with keyboard navigation
- **Zoom Controls**: PowerPoint-style zoom with slider and keyboard shortcuts
- **Multi-Slide Management**: Unlimited slides with thumbnail previews
- **Auto-Save**: Automatic saving to prevent data loss (coming soon)
- **Keyboard Shortcuts**: Professional shortcuts for power users (coming soon)

## 🏗️ Architecture

### Component-Based Structure
```
src/
├── Components/
│   ├── Sidebar.ts       - Slide navigation and management
│   ├── Toolbar.ts       - Top toolbar with dimension controls
│   ├── CodeView.ts      - Code editor component
│   ├── Preview.ts       - Live preview renderer with zoom
│   ├── Bottombar.ts     - Status bar with zoom controls
│   └── presentation.ts  - Centralized state management
├── config.ts            - Application configuration
├── utils.ts             - Utility functions
└── app.ts               - Application orchestrator
```

### Design Principles

1. **Separation of Concerns**: Each component is self-contained and handles its own UI/logic
2. **Event-Driven Architecture**: Components communicate through callbacks, not direct references
3. **Centralized State**: Single source of truth for presentation data
4. **Type Safety**: Full TypeScript with strict mode enabled
5. **Performance First**: Efficient rendering, debounced auto-save, optimized previews
6. **Accessibility**: Keyboard navigation, ARIA labels, focus management

## 🚀 Technology Stack

- **Vite 7.2.6**: Lightning-fast build tool and dev server
- **TypeScript 5.9**: Type-safe development
- **Tailwind CSS 3.4**: Utility-first styling framework
- **PostCSS + Autoprefixer**: CSS processing
- **Native Web APIs**: No heavy framework dependencies

## 💻 Development

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## ⌨️ Keyboard Shortcuts (Coming Soon)

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New slide |
| `Delete` | Delete current slide |
| `Ctrl+S` | Save presentation |
| `F5` | Start presentation |
| `Esc` | Exit presentation |
| `←/→` | Navigate slides (in presentation) |
| `Ctrl+=` | Zoom in |
| `Ctrl+-` | Zoom out |

## 🗺️ Roadmap

### Phase 1: Foundation (Current - v1.0)
- [x] Component architecture
- [x] Basic slide management
- [x] Code editor
- [x] Live preview with zoom
- [x] Presentation mode
- [x] Export/Import
- [ ] Auto-save with localStorage
- [ ] Complete keyboard shortcuts
- [ ] Error handling and validation
- [ ] Loading states and feedback

### Phase 2: Enhanced Editor (v2.0)
- [ ] Rich text WYSIWYG editor
- [ ] Drag-and-drop elements
- [ ] Element positioning and resizing
- [ ] Layer management
- [ ] Undo/redo system
- [ ] Grid and snap-to-grid

### Phase 3: Templates & Assets (v3.0)
- [ ] Professional template library
- [ ] Custom themes
- [ ] Asset manager (images, fonts, icons)
- [ ] Shape library
- [ ] Chart and graph tools

### Phase 4: Advanced Features (v4.0)
- [ ] Animations and transitions
- [ ] Master slides
- [ ] Slide notes
- [ ] Video/audio embedding
- [ ] PDF export
- [ ] HTML export

### Phase 5: Collaboration (v5.0)
- [ ] Real-time collaboration
- [ ] Comments and feedback
- [ ] Version history
- [ ] Cloud storage integration
- [ ] Team workspaces

### Phase 6: AI & Automation (v6.0)
- [ ] AI-powered design suggestions
- [ ] Auto-layout
- [ ] Content generation
- [ ] Smart templates
- [ ] Image enhancement

## 🏢 Professional Standards

This project follows enterprise-level development practices:

- ✅ **Clean Code**: SOLID principles, DRY, KISS
- ✅ **Type Safety**: Strict TypeScript with no `any` types
- ✅ **Error Handling**: Try-catch blocks, validation, user feedback
- ✅ **Performance**: Debouncing, throttling, efficient DOM updates
- ✅ **Maintainability**: Clear naming, documentation, modularity
- ✅ **Scalability**: Component-based, event-driven, stateless where possible

## 📝 Contributing

All contributions must meet professional standards:
1. Write clean, documented code
2. Follow TypeScript best practices
3. Add error handling
4. Test thoroughly
5. Update documentation

## 📄 License

MIT License - See LICENSE file for details

## 🎯 Competition Analysis

**vs. Microsoft PowerPoint**:
- ✅ Web-based (no installation required)
- ✅ Free and open-source
- ✅ Full code-level control (HTML/CSS/JS)
- ✅ Cross-platform compatibility
- 🔄 Working on: Templates, animations, collaboration

**vs. Canva**:
- ✅ Full HTML/CSS/JS control for developers
- ✅ Developer-friendly workflow
- ✅ Offline capable
- ✅ No subscription required
- 🔄 Working on: Drag-and-drop UI, asset library, templates

---

**Built with ❤️ for professionals who demand quality**
