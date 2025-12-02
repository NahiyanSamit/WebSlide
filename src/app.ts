import './style.css';
import { PresentationState } from './Components/presentation';
import { Sidebar } from './Components/Sidebar';
import { Toolbar } from './Components/Toolbar';
import { CodeView } from './Components/CodeView';
import { Preview } from './Components/Preview';

class App {
  private state: PresentationState;
  private sidebar: Sidebar;
  private toolbar: Toolbar;
  private codeView: CodeView;
  private preview: Preview;
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

    this.render();
    this.loadCurrentSlide();
  }

  private render(): void {
    const app = document.getElementById('app');
    if (!app) return;

    // Build layout
    const layout = document.createElement('div');
    layout.className = 'grid grid-cols-[280px_1fr] h-screen overflow-hidden';

    const mainContent = document.createElement('main');
    mainContent.className = 'flex flex-col bg-white overflow-hidden';

    const editorArea = document.createElement('div');
    editorArea.className = 'flex-1 grid grid-cols-2 gap-0 overflow-hidden';

    editorArea.appendChild(this.codeView.getElement());
    editorArea.appendChild(this.preview.getElement());

    mainContent.appendChild(this.toolbar.getElement());
    mainContent.appendChild(editorArea);

    layout.appendChild(this.sidebar.getElement());
    layout.appendChild(mainContent);

    // Presentation mode
    this.presentationMode = document.createElement('div');
    this.presentationMode.id = 'presentationMode';
    this.presentationMode.className = 'fixed top-0 left-0 w-full h-full bg-black z-[1000] flex flex-col items-center justify-center';
    this.presentationMode.style.display = 'none';
    this.presentationMode.innerHTML = `
      <div class="flex-1 w-full max-w-7xl flex items-center justify-center p-16" id="presentationContent"></div>
      <div class="flex items-center gap-8 px-8 py-8 bg-black/80 rounded-2xl mb-8">
        <button id="prevSlide" class="bg-primary text-white border-none px-8 py-4 text-2xl rounded-lg cursor-pointer transition-all hover:bg-indigo-600 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">←</button>
        <span id="presentationCounter" class="text-white text-lg font-semibold min-w-[100px] text-center"></span>
        <button id="nextSlide" class="bg-primary text-white border-none px-8 py-4 text-2xl rounded-lg cursor-pointer transition-all hover:bg-indigo-600 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">→</button>
        <button id="exitPresentation" class="bg-danger text-white border-none px-6 py-3 rounded-lg cursor-pointer text-base font-semibold transition-all hover:bg-red-600">Exit</button>
      </div>
    `;

    app.appendChild(layout);
    app.appendChild(this.presentationMode);

    this.attachPresentationEvents();
  }

  private handleAddSlide(): void {
    this.state.addSlide();
    this.sidebar.renderSlides(this.state.slides, this.state.currentSlideIndex);
    this.loadCurrentSlide();
  }

  private handleDeleteSlide(): void {
    if (this.state.slides.length > 1) {
      this.state.deleteSlide(this.state.currentSlideIndex);
      this.sidebar.renderSlides(this.state.slides, this.state.currentSlideIndex);
      this.loadCurrentSlide();
    }
  }

  private handleSelectSlide(index: number): void {
    this.state.setCurrentSlide(index);
    this.loadCurrentSlide();
    this.sidebar.renderSlides(this.state.slides, this.state.currentSlideIndex);
  }

  private handleCodeChange(code: string): void {
    this.state.updateSlide(this.state.currentSlideIndex, { html: code });
    this.preview.updatePreview(code);
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
    this.preview.updatePreview(slide.html);
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
      content.innerHTML = `
        <div class="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          ${slide.html}
        </div>
      `;
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
