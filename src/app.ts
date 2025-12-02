import './style.css';
import { PresentationState } from './Components/presentation';
import { Sidebar } from './Components/Sidebar';
import { Toolbar } from './Components/Toolbar';
import { CodeView } from './Components/CodeView';
import { Preview } from './Components/Preview';
import { StatusBar } from './Components/Bottombar';
import { CONFIG } from './config';
import { Utils } from './utils';

/**
 * Main Application Class
 * Professional orchestration of all components with proper error handling,
 * keyboard shortcuts, and state management
 */
class App {
  private state!: PresentationState;
  private sidebar!: Sidebar;
  private toolbar!: Toolbar;
  private codeView!: CodeView;
  private preview!: Preview;
  private statusBar!: StatusBar;
  private presentationMode: HTMLElement | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  // ==================== Initialization ====================

  private async initialize(): Promise<void> {
    try {
      // Initialize state
      this.state = new PresentationState();
      
      // Subscribe to state changes
      this.state.onChange((event, data) => {
        this.handleStateChange(event, data);
      });
      
      // Initialize components
      this.initializeComponents();
      
      // Render UI
      this.render();
      
      // Initial render of slides in sidebar
      this.sidebar.renderSlides(this.state.slides, this.state.currentSlideIndex);
      
      // Load current slide
      this.loadCurrentSlide();
      
      // Setup keyboard shortcuts
      this.setupKeyboardShortcuts();
      
      // Setup auto-save
      this.setupAutoSave();
      
      this.isInitialized = true;
      console.log(`✅ ${CONFIG.APP_NAME} v${CONFIG.APP_VERSION} initialized successfully!`);
      
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      this.showError('Failed to initialize the application. Please refresh the page.');
    }
  }

  private initializeComponents(): void {
    this.sidebar = new Sidebar({
      onAddSlide: () => this.handleAddSlide(),
      onDeleteSlide: () => this.handleDeleteSlide(),
      onSelectSlide: (index) => this.handleSelectSlide(index),
      onImport: (file) => this.handleImport(file)
    });

    this.toolbar = new Toolbar({
      onExport: () => this.handleExport(),
      onPresent: () => this.handlePresent()
    });

    this.codeView = new CodeView((code) => this.handleCodeChange(code));
    this.preview = new Preview();
    this.statusBar = new StatusBar();

    // Listen for dimension changes
    this.toolbar.onDimensionChangeCallback((dimensions) => {
      try {
        const slide = this.state.getCurrentSlide();
        this.preview.updatePreview(slide.html, dimensions.width, dimensions.height);
      } catch (error) {
        console.error('Failed to update preview on dimension change:', error);
      }
    });
  }

  // ==================== State Change Handling ====================

  private handleStateChange(event: string, data?: any): void {
    if (!this.isInitialized) return;
    
    try {
      switch (event) {
        case 'slide-added':
        case 'slide-deleted':
        case 'slide-selected':
        case 'presentation-loaded':
          this.sidebar.renderSlides(this.state.slides, this.state.currentSlideIndex);
          this.updateStatusBar();
          break;
        case 'slide-updated':
          // Refresh preview if current slide was updated
          if (data?.index === this.state.currentSlideIndex) {
            this.loadCurrentSlide();
          }
          break;
      }
    } catch (error) {
      console.error('Error handling state change:', error);
    }
  }

  // ==================== UI Rendering ====================

  private render(): void {
    const app = document.getElementById('app');
    if (!app) {
      throw new Error('App container not found');
    }

    // Build main layout
    const mainLayout = document.createElement('div');
    mainLayout.className = 'flex flex-col h-screen overflow-hidden bg-gray-50';

    const contentArea = document.createElement('div');
    contentArea.className = 'flex-1 grid grid-cols-[280px_1fr] overflow-hidden';

    const mainContent = document.createElement('main');
    mainContent.className = 'flex flex-col bg-white overflow-hidden';

    const editorArea = document.createElement('div');
    editorArea.className = 'flex-1 max-h-full grid grid-cols-2 gap-0 overflow-hidden';

    editorArea.appendChild(this.codeView.getElement());
    editorArea.appendChild(this.preview.getElement());

    mainContent.appendChild(this.toolbar.getElement());
    mainContent.appendChild(editorArea);

    contentArea.appendChild(this.sidebar.getElement());
    contentArea.appendChild(mainContent);

    mainLayout.appendChild(contentArea);
    mainLayout.appendChild(this.statusBar.getElement());

    // Create presentation mode overlay
    this.createPresentationMode();

    app.appendChild(mainLayout);
    if (this.presentationMode) {
      app.appendChild(this.presentationMode);
    }

    this.updateStatusBar();
  }

  private createPresentationMode(): void {
    this.presentationMode = document.createElement('div');
    this.presentationMode.id = 'presentationMode';
    this.presentationMode.className = 'fixed inset-0 w-full h-full bg-black z-[1000] flex items-center justify-center';
    this.presentationMode.style.display = 'none';
    this.presentationMode.innerHTML = `
      <div class="w-full h-full flex items-center justify-center" id="presentationContent"></div>
    `;

    this.attachPresentationEvents();
  }

  // ==================== Slide Operations ====================

  private handleAddSlide(): void {
    try {
      this.state.addSlide();
    } catch (error) {
      console.error('Failed to add slide:', error);
      this.showError('Failed to add slide');
    }
  }

  private handleDeleteSlide(): void {
    try {
      if (this.state.slideCount > 1) {
        const confirmed = confirm('Are you sure you want to delete this slide?');
        if (confirmed) {
          this.state.deleteSlide(this.state.currentSlideIndex);
        }
      } else {
        this.showInfo('Cannot delete the last slide');
      }
    } catch (error) {
      console.error('Failed to delete slide:', error);
      this.showError('Failed to delete slide');
    }
  }

  private handleSelectSlide(index: number): void {
    try {
      this.state.setCurrentSlide(index);
      this.loadCurrentSlide();
    } catch (error) {
      console.error('Failed to select slide:', error);
      this.showError('Failed to select slide');
    }
  }

  private handleCodeChange(code: string): void {
    try {
      this.state.updateSlide(this.state.currentSlideIndex, { html: code });
      const dimensions = this.toolbar.getDimensions();
      this.preview.updatePreview(code, dimensions.width, dimensions.height);
    } catch (error) {
      console.error('Failed to update code:', error);
    }
  }

  private loadCurrentSlide(): void {
    try {
      const slide = this.state.getCurrentSlide();
      this.codeView.setValue(slide.html);
      const dimensions = this.toolbar.getDimensions();
      this.preview.updatePreview(slide.html, dimensions.width, dimensions.height);
    } catch (error) {
      console.error('Failed to load slide:', error);
      this.showError('Failed to load slide');
    }
  }

  private updateStatusBar(): void {
    try {
      this.statusBar.updateSlideInfo(
        this.state.currentSlideIndex + 1,
        this.state.slideCount
      );
    } catch (error) {
      console.error('Failed to update status bar:', error);
    }
  }

  // ==================== Import/Export ====================

  private handleExport(): void {
    try {
      const data = this.state.exportPresentation();
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `webslide-presentation-${timestamp}.json`;
      
      Utils.downloadFile(data, filename, 'application/json');
      this.showSuccess('Presentation exported successfully!');
    } catch (error) {
      console.error('Failed to export presentation:', error);
      this.showError('Failed to export presentation');
    }
  }

  private async handleImport(file: File): Promise<void> {
    try {
      const data = await Utils.readFile(file);
      
      if (this.state.importPresentation(data)) {
        this.showSuccess('Presentation imported successfully!');
      } else {
        this.showError('Invalid presentation file format');
      }
    } catch (error) {
      console.error('Failed to import presentation:', error);
      this.showError('Failed to import presentation');
    }
  }

  // ==================== Presentation Mode ====================

  private handlePresent(): void {
    try {
      if (this.presentationMode) {
        this.presentationMode.style.display = 'flex';
        this.state.setCurrentSlide(0);
        
        // Request fullscreen first
        if (this.presentationMode.requestFullscreen) {
          this.presentationMode.requestFullscreen()
            .then(() => {
              // Render after fullscreen is active
              setTimeout(() => {
                this.renderPresentationSlide();
              }, 100);
            })
            .catch(err => {
              console.warn('Failed to enter fullscreen:', err);
              // Render anyway if fullscreen fails
              this.renderPresentationSlide();
            });
        } else {
          // No fullscreen support, just render
          this.renderPresentationSlide();
        }
      }
    } catch (error) {
      console.error('Failed to start presentation:', error);
      this.showError('Failed to start presentation mode');
    }
  }

  private exitPresentationMode(): void {
    if (this.presentationMode) {
      this.presentationMode.style.display = 'none';
      
      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.warn('Failed to exit fullscreen:', err);
        });
      }
    }
  }

  private attachPresentationEvents(): void {
    // Navigation handled by keyboard only - no buttons
  }

  private renderPresentationSlide(): void {
    const content = document.getElementById('presentationContent');
    const counter = document.getElementById('presentationCounter');
    const prevBtn = document.getElementById('prevSlide') as HTMLButtonElement;
    const nextBtn = document.getElementById('nextSlide') as HTMLButtonElement;

    if (!content) return;

    try {
      const slide = this.state.getCurrentSlide();
      const dimensions = this.toolbar.getDimensions();
      
      // Use full screen dimensions
      const availableHeight = window.innerHeight;
      const availableWidth = window.innerWidth;
      
      // Calculate scale to fit maximum screen area while maintaining aspect ratio
      const scaleX = availableWidth / dimensions.width;
      const scaleY = availableHeight / dimensions.height;
      const scale = Math.min(scaleX, scaleY);
      
      // Create iframe for presentation
      const iframe = document.createElement('iframe');
      iframe.style.border = 'none';
      iframe.style.backgroundColor = 'white';
      
      // Set iframe to slide dimensions
      iframe.style.width = `${dimensions.width}px`;
      iframe.style.height = `${dimensions.height}px`;
      
      // Apply scale to maximize screen usage
      iframe.style.transform = `scale(${scale})`;
      iframe.style.transformOrigin = 'center center';
      
      iframe.sandbox.add('allow-scripts', 'allow-same-origin');
      
      content.innerHTML = '';
      content.appendChild(iframe);
      
      // Write content to iframe
      const previewHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { box-sizing: border-box; }
            html, body {
              margin: 0;
              padding: 0;
              width: ${dimensions.width}px;
              height: ${dimensions.height}px;
              overflow: hidden;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            }
          </style>
        </head>
        <body>${slide.html}</body>
        </html>
      `;

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(previewHtml);
        iframeDoc.close();
      }

      // Update controls
      if (counter) {
        counter.textContent = `${this.state.currentSlideIndex + 1} / ${this.state.slideCount}`;
      }

      if (prevBtn) {
        prevBtn.disabled = this.state.isFirstSlide;
      }

      if (nextBtn) {
        nextBtn.disabled = this.state.isLastSlide;
      }
    } catch (error) {
      console.error('Failed to render presentation slide:', error);
    }
  }

  // ==================== Keyboard Shortcuts ====================

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Presentation mode navigation
      if (this.presentationMode && this.presentationMode.style.display !== 'none') {
        this.handlePresentationKeyboard(e);
        return;
      }

      // Global shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            this.handleAddSlide();
            break;
          case 's':
            e.preventDefault();
            this.handleSave();
            break;
          case '=':
        }
      }

      // Other shortcuts
      if (e.key === 'Delete' && e.target === document.body) {
        e.preventDefault();
        this.handleDeleteSlide();
      }

      if (e.key === 'F5') {
        e.preventDefault();
        this.handlePresent();
      }
    });
  }

  private handlePresentationKeyboard(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        this.state.nextSlide();
        this.renderPresentationSlide();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.state.previousSlide();
        this.renderPresentationSlide();
        break;
      case 'Escape':
        e.preventDefault();
        this.exitPresentationMode();
        break;
      case 'Home':
        e.preventDefault();
        this.state.setCurrentSlide(0);
        this.renderPresentationSlide();
        break;
      case 'End':
        e.preventDefault();
        this.state.setCurrentSlide(this.state.slideCount - 1);
        this.renderPresentationSlide();
        break;
    }
  }

  // ==================== Auto-Save ====================

  private setupAutoSave(): void {
    // Save before page unload
    window.addEventListener('beforeunload', () => {
      this.state.forceSave();
    });
  }

  private handleSave(): void {
    try {
      if (this.state.forceSave()) {
        this.showSuccess('Presentation saved!');
      } else {
        this.showError('Failed to save presentation');
      }
    } catch (error) {
      console.error('Save failed:', error);
      this.showError('Failed to save presentation');
    }
  }

  // ==================== User Feedback ====================

  private showError(message: string): void {
    console.error(message);
    // TODO: Implement toast notifications
    alert(`❌ ${message}`);
  }

  private showSuccess(message: string): void {
    console.log(`✅ ${message}`);
    // TODO: Implement toast notifications
  }

  private showInfo(message: string): void {
    console.info(`ℹ️ ${message}`);
    // TODO: Implement toast notifications
    alert(`ℹ️ ${message}`);
  }
}

// ==================== Application Entry Point ====================

function initializeApp(): void {
  try {
    new App();
  } catch (error) {
    console.error('❌ Fatal error during app initialization:', error);
    alert('Failed to initialize WebSlide. Please refresh the page and try again.');
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Export for debugging
(window as any).WebSlide = { App, CONFIG };
