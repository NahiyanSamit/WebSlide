import type { Slide } from './presentation';

export interface SidebarActions {
  onAddSlide: () => void;
  onDeleteSlide: () => void;
  onSelectSlide: (index: number) => void;
  onImport: (file: File) => void;
}

export class Sidebar {
  private container: HTMLElement;
  private slidesList: HTMLElement;
  private actions: SidebarActions;
  private currentIndex: number = 0;

  constructor(actions: SidebarActions) {
    this.actions = actions;
    this.container = this.createContainer();
    this.slidesList = this.container.querySelector('#slidesList') as HTMLElement;
    this.attachEvents();
  }

  private createContainer(): HTMLElement {
    const aside = document.createElement('aside');
    aside.className = 'bg-gray-50 border-r border-gray-200 flex flex-col p-6';
    aside.innerHTML = `
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-primary mb-1">WebSlide</h1>
        <p class="text-sm text-gray-500">Code Your Slides</p>
      </div>

      <div class="flex flex-col gap-3 mb-6">
        <button id="addSlide" 
          class="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <span>+</span> Add Slide
        </button>
        <button id="deleteSlide" 
          class="flex items-center justify-center gap-2 px-4 py-3 bg-danger text-white rounded-lg text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <span>🗑</span> Delete
        </button>
      </div>

      <div class="flex-1 overflow-y-auto mb-6 flex flex-col gap-3" id="slidesList"></div>

      <div class="flex flex-col gap-3 pt-6 border-t border-gray-200">
        <button id="importBtn" 
          class="flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-800 border border-gray-200 rounded-lg text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg">
          <span>📁</span> Import
        </button>
        <input type="file" id="importFile" accept=".json" style="display: none;" />
      </div>
    `;
    return aside;
  }

  private attachEvents(): void {
    const addBtn = this.container.querySelector('#addSlide');
    const deleteBtn = this.container.querySelector('#deleteSlide');
    const importBtn = this.container.querySelector('#importBtn');
    const importFile = this.container.querySelector('#importFile') as HTMLInputElement;

    addBtn?.addEventListener('click', () => this.actions.onAddSlide());
    deleteBtn?.addEventListener('click', () => this.actions.onDeleteSlide());
    importBtn?.addEventListener('click', () => importFile?.click());
    
    importFile?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.actions.onImport(file);
      }
    });
  }

  public renderSlides(slides: Slide[], currentIndex: number): void {
    this.currentIndex = currentIndex;
    this.slidesList.innerHTML = '';
    
    slides.forEach((slide, index) => {
      const slideItem = document.createElement('div');
      const isActive = index === currentIndex;
      slideItem.className = `bg-white border-2 ${isActive ? 'border-primary bg-indigo-50' : 'border-gray-200'} rounded-lg p-3 cursor-pointer transition-all hover:border-primary hover:translate-x-1 flex gap-3 items-center`;
      slideItem.innerHTML = `
        <div class="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">${index + 1}</div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-sm mb-1 text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap">
            ${slide.title || 'Slide ' + (index + 1)}
          </div>
          <div class="text-xs text-gray-500">Slide ${index + 1}</div>
        </div>
      `;
      
      slideItem.addEventListener('click', () => {
        this.actions.onSelectSlide(index);
      });
      
      this.slidesList.appendChild(slideItem);
    });
  }

  public getElement(): HTMLElement {
    return this.container;
  }
}
