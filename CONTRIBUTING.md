# Contributing to WebSlide

Thank you for your interest in contributing to WebSlide! This document provides guidelines and standards for contributing to this professional-grade project.

## 🎯 Our Standards

WebSlide is built to compete with Microsoft PowerPoint and Canva. All contributions must meet enterprise-level standards:

- **Clean Code**: Follow SOLID principles, DRY, and KISS
- **Type Safety**: Strict TypeScript, no `any` types
- **Error Handling**: Comprehensive try-catch blocks and validation
- **Performance**: Optimized rendering, debouncing where needed
- **Documentation**: Clear comments and documentation
- **Testing**: Thorough testing before submission

## 🏗️ Development Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git
- VS Code (recommended)

### Setup Steps

```bash
# Clone the repository
git clone https://github.com/your-username/WebSlide.git
cd WebSlide

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 📐 Code Style

### TypeScript

- Use strict TypeScript with no `any` types
- Prefer interfaces over types for public APIs
- Use proper JSDoc comments for all public methods
- Enable all strict compiler options

```typescript
/**
 * Example of proper documentation
 * @param id - The unique identifier
 * @returns The found item or null
 */
public findById(id: string): Item | null {
  try {
    // Implementation with error handling
  } catch (error) {
    console.error('Failed to find item:', error);
    return null;
  }
}
```

### File Organization

```
src/
├── Components/          # React-like components
│   ├── ComponentName.ts # PascalCase for component files
│   └── ...
├── utils.ts            # Utility functions
├── config.ts           # Configuration constants
└── app.ts             # Main application entry
```

### Naming Conventions

- **Components**: PascalCase (e.g., `StatusBar.ts`)
- **Functions**: camelCase (e.g., `handleClick`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_ZOOM`)
- **Interfaces**: PascalCase with descriptive names
- **Private methods**: Prefix with underscore if needed

## 🔧 Component Development

### Component Structure

Each component should:
1. Have a clear, single responsibility
2. Accept configuration via constructor
3. Emit events via callbacks
4. Handle its own DOM management
5. Include proper error handling

```typescript
export interface ComponentActions {
  onAction: (data: ActionData) => void;
}

export class Component {
  private container: HTMLElement;
  private actions: ComponentActions;

  constructor(actions: ComponentActions) {
    this.actions = actions;
    this.container = this.createContainer();
    this.attachEvents();
  }

  private createContainer(): HTMLElement {
    // Create and return DOM element
  }

  private attachEvents(): void {
    // Attach event listeners
  }

  public getElement(): HTMLElement {
    return this.container;
  }
}
```

## 🧪 Testing

Before submitting a PR:

1. **Manual Testing**: Test all affected features
2. **Error Cases**: Test error handling and edge cases
3. **Performance**: Ensure no performance regressions
4. **Browser Testing**: Test in Chrome, Firefox, Safari
5. **Responsive**: Test at different screen sizes

## 📝 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```
feat(zoom): Add keyboard shortcuts for zoom controls

- Add Ctrl+= for zoom in
- Add Ctrl+- for zoom out
- Update documentation

Closes #123
```

```
fix(preview): Fix aspect ratio calculation for extreme dimensions

Prevents overflow when width or height exceeds container bounds.
```

## 🚀 Pull Request Process

### Before Submitting

1. **Branch naming**: `feature/description` or `fix/description`
2. **Update documentation**: Update README if needed
3. **Clean code**: Remove console.logs, commented code
4. **No lint errors**: Run checks and fix all errors
5. **Test thoroughly**: Ensure everything works

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested manually
- [ ] Tested edge cases
- [ ] Tested in multiple browsers

## Screenshots
(if applicable)

## Additional Notes
Any additional information
```

### Review Process

1. Submit PR with clear description
2. Respond to reviewer feedback promptly
3. Make requested changes
4. Ensure CI passes (when implemented)
5. Wait for approval from maintainers

## 🐛 Bug Reports

### Before Reporting

1. Check if issue already exists
2. Try to reproduce consistently
3. Gather error messages and logs
4. Note browser and OS versions

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error...

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

## Screenshots/Logs
(if applicable)
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Use Case
Why this feature is needed

## Proposed Solution
How you think it should work

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Any other information
```

## 📚 Documentation

All public APIs must be documented:

```typescript
/**
 * Updates the preview with new content
 * @param html - The HTML content to display
 * @param width - The viewport width in pixels
 * @param height - The viewport height in pixels
 * @throws {Error} If iframe creation fails
 */
public updatePreview(html: string, width: number, height: number): void {
  // Implementation
}
```

## 🔒 Security

- Never commit secrets or API keys
- Validate all user input
- Sanitize HTML before rendering
- Use Content Security Policy
- Report security issues privately

## 📞 Getting Help

- **Discord**: [Link] (when available)
- **Issues**: GitHub Issues for bugs
- **Discussions**: GitHub Discussions for questions
- **Email**: [email] (when available)

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping make WebSlide better! 🎉**
