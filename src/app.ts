import './style.css';
import { PresentationState } from './Components/presentation';
import { Sidebar } from './Components/Sidebar';
import { Toolbar } from './Components/Toolbar';
import { CodeView } from './Components/CodeView';
import { Preview } from './Components/Preview';
import { StatusBar } from './Components/Bottombar';

class App {
  private state: PresentationState;
  private sidebar: Sidebar;
  private toolbar: Toolbar;
  private codeView: CodeView;
  private preview: Preview;
  private statusBar: StatusBar;
  private presentationMode: HTMLElement | null = null;

  constructor() {
    this.state = new PresentationState();
    
    // Initialize components
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
    this.statusBar = new StatusBar({
      onZoomChange: (zoom) => this.handleZoomChange(zoom)
    });

    // Listen for dimension changes
    this.toolbar.onDimensionChangeCallback((dimensions) => {
      const slide = this.state.getCurrentSlide();
      this.preview.updatePreview(slide.html, dimensions.width, dimensions.height);
    });

    this.render();
    this.loadCurrentSlide();
  }

  private render(): void {
    const app = document.getElementById('app');
    if (!app) return;

    // Build layout
    const mainLayout = document.createElement('div');
    mainLayout.className = 'flex flex-col h-screen overflow-hidden';

    const contentArea = document.createElement('div');
    contentArea.className = 'flex-1 grid grid-cols-[280px_1fr] overflow-hidden';

    const mainContent = document.createElement('main');
    mainContent.className = 'flex flex-col bg-white overflow-hidden';

    const editorArea = document.createElement('div');
    editorArea.className = 'flex-1 grid grid-cols-2 gap-0 overflow-hidden';

    editorArea.appendChild(this.codeView.getElement());
    editorArea.appendChild(this.preview.getElement());

    mainContent.appendChild(this.toolbar.getElement());
    mainContent.appendChild(editorArea);

    contentArea.appendChild(this.sidebar.getElement());
    contentArea.appendChild(mainContent);

    mainLayout.appendChild(contentArea);
    mainLayout.appendChild(this.statusBar.getElement());

    // Presentation mode
    this.presentationMode = document.createElement('div');
    this.presentationMode.id = 'presentationMode';
    this.presentationMode.className = 'fixed top-0 left-0 w-full h-full bg-black z-[1000] flex flex-col items-center justify-center';
    this.presentationMode.style.display = 'none';
    this.presentationMode.innerHTML = `
      <div class="flex-1 w-full flex items-center justify-center p-8" id="presentationContent"></div>
      <div class="flex items-center gap-8 px-8 py-6 bg-black/80 rounded-2xl mb-8">
        <button id="prevSlide" class="bg-primary text-white border-none px-8 py-4 text-2xl rounded-lg cursor-pointer transition-all hover:bg-indigo-600 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">←</button>
        <span id="presentationCounter" class="text-white text-lg font-semibold min-w-[100px] text-center"></span>
        <button id="nextSlide" class="bg-primary text-white border-none px-8 py-4 text-2xl rounded-lg cursor-pointer transition-all hover:bg-indigo-600 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">→</button>
        <button id="exitPresentation" class="bg-danger text-white border-none px-6 py-3 rounded-lg cursor-pointer text-base font-semibold transition-all hover:bg-red-600">Exit</button>
      </div>
    `;

    app.appendChild(mainLayout);
    app.appendChild(this.presentationMode);

    this.attachPresentationEvents();
    this.updateStatusBar();
  }

  private handleAddSlide(): void {
    this.state.addSlide();
    this.sidebar.renderSlides(this.state.slides, this.state.currentSlideIndex);
    this.loadCurrentSlide();
    this.updateStatusBar();
  }

  private updateStatusBar(): void {
    this.statusBar.updateSlideInfo(
      this.state.currentSlideIndex + 1,
      this.state.slides.length
    );
  }

  private handleDeleteSlide(): void {
    if (this.state.slides.length > 1) {
      this.state.deleteSlide(this.state.currentSlideIndex);
      this.sidebar.renderSlides(this.state.slides, this.state.currentSlideIndex);
      this.loadCurrentSlide();
      this.updateStatusBar();
    }
  }

  private handleSelectSlide(index: number): void {
    this.state.setCurrentSlide(index);
    this.loadCurrentSlide();
    this.sidebar.renderSlides(this.state.slides, this.state.currentSlideIndex);
    this.updateStatusBar();
  }

  private handleCodeChange(code: string): void {
    this.state.updateSlide(this.state.currentSlideIndex, { html: code });
    const dimensions = this.toolbar.getDimensions();
    this.preview.updatePreview(code, dimensions.width, dimensions.height);
  }

  private handleZoomChange(zoom: number): void {
    this.preview.setZoom(zoom);
    const slide = this.state.getCurrentSlide();
    const dimensions = this.toolbar.getDimensions();
    this.preview.updatePreview(slide.html, dimensions.width, dimensions.height);
  }

  private handleExport(): void {
    const data = this.state.exportPresentation();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  private handleImport(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result as string;
      if (this.state.importPresentation(data)) {
        this.sidebar.renderSlides(this.state.slides, this.state.currentSlideIndex);
        this.loadCurrentSlide();
        this.updateStatusBar();
      } else {
        alert('Failed to import presentation');
      }
    };
    reader.readAsText(file);
  }

  private handlePresent(): void {
    if (this.presentationMode) {
      this.presentationMode.style.display = 'flex';
      this.state.setCurrentSlide(0);
      this.renderPresentationSlide();
    }
  }

  private loadCurrentSlide(): void {
    const slide = this.state.getCurrentSlide();
    this.codeView.setValue(slide.html);
    const dimensions = this.toolbar.getDimensions();
    this.preview.updatePreview(slide.html, dimensions.width, dimensions.height);
  }

  private attachPresentationEvents(): void {
    document.getElementById('prevSlide')?.addEventListener('click', () => {
      if (this.state.currentSlideIndex > 0) {
        this.state.setCurrentSlide(this.state.currentSlideIndex - 1);
        this.renderPresentationSlide();
      }
    });

    document.getElementById('nextSlide')?.addEventListener('click', () => {
      if (this.state.currentSlideIndex < this.state.slides.length - 1) {
        this.state.setCurrentSlide(this.state.currentSlideIndex + 1);
        this.renderPresentationSlide();
      }
    });

    document.getElementById('exitPresentation')?.addEventListener('click', () => {
      if (this.presentationMode) {
        this.presentationMode.style.display = 'none';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (this.presentationMode && this.presentationMode.style.display !== 'none') {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          if (this.state.currentSlideIndex < this.state.slides.length - 1) {
            this.state.setCurrentSlide(this.state.currentSlideIndex + 1);
            this.renderPresentationSlide();
          }
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (this.state.currentSlideIndex > 0) {
            this.state.setCurrentSlide(this.state.currentSlideIndex - 1);
            this.renderPresentationSlide();
          }
        } else if (e.key === 'Escape') {
          if (this.presentationMode) {
            this.presentationMode.style.display = 'none';
          }
        }
      }
    });
  }

  private renderPresentationSlide(): void {
    const content = document.getElementById('presentationContent');
    const counter = document.getElementById('presentationCounter');
    const prevBtn = document.getElementById('prevSlide') as HTMLButtonElement;
    const nextBtn = document.getElementById('nextSlide') as HTMLButtonElement;

    if (content) {
      const slide = this.state.getCurrentSlide();
      const dimensions = this.toolbar.getDimensions();
      
      // Create iframe for presentation
      const iframe = document.createElement('iframe');
      iframe.style.border = 'none';
      iframe.style.backgroundColor = 'white';
      iframe.style.borderRadius = '1rem';
      iframe.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
      
      // Calculate aspect ratio and fit to screen
      const aspectRatio = dimensions.width / dimensions.height;
      
      // Get available space (accounting for controls at bottom)
      const availableHeight = window.innerHeight - 200; // Controls take ~200px
      const availableWidth = window.innerWidth - 64; // Padding
      
      // Calculate which dimension is limiting
      const widthBasedHeight = availableWidth / aspectRatio;
      const heightBasedWidth = availableHeight * aspectRatio;
      
      if (widthBasedHeight <= availableHeight) {
        // Width is the limiting factor
        iframe.style.width = `${availableWidth}px`;
        iframe.style.height = `${widthBasedHeight}px`;
      } else {
        // Height is the limiting factor
        iframe.style.width = `${heightBasedWidth}px`;
        iframe.style.height = `${availableHeight}px`;
      }
      
      iframe.sandbox.add('allow-scripts', 'allow-same-origin');
      
      content.innerHTML = '';
      content.appendChild(iframe);
      
      const previewHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              box-sizing: border-box;
            }
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
        <body>
          ${slide.html}
        </body>
        </html>
      `;

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(previewHtml);
        iframeDoc.close();
      }
    }

    if (counter) {
      counter.textContent = `${this.state.currentSlideIndex + 1} / ${this.state.slides.length}`;
    }

    if (prevBtn) {
      prevBtn.disabled = this.state.currentSlideIndex === 0;
    }

    if (nextBtn) {
      nextBtn.disabled = this.state.currentSlideIndex === this.state.slides.length - 1;
    }
  }
}

// Initialize the app
function initApp() {
  new App();
  console.log('WebSlide initialized successfully!');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
