export interface ToolbarActions {
  onExport: () => void;
  onPresent: () => void;
}

export class Toolbar {
  private container: HTMLElement;
  private actions: ToolbarActions;
  private widthInput: HTMLInputElement;
  private heightInput: HTMLInputElement;

  constructor(actions: ToolbarActions) {
    this.actions = actions;
    this.container = this.createContainer();
    this.widthInput = this.container.querySelector('#pageWidth') as HTMLInputElement;
    this.heightInput = this.container.querySelector('#pageHeight') as HTMLInputElement;
    this.attachEvents();
  }

  private createContainer(): HTMLElement {
    // Load saved dimensions from localStorage
    const savedWidth = localStorage.getItem('webslide-width') || '1920';
    const savedHeight = localStorage.getItem('webslide-height') || '1080';
    
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between px-6 py-4 bg-gray-50 border-b-2 border-gray-200';
    div.innerHTML = `
      <div class="flex items-center gap-4">
        <h2 class="text-lg font-semibold">Slide Editor</h2>
        <div class="flex items-center gap-2 text-sm">
          <label class="text-gray-600">Width:</label>
          <input type="number" id="pageWidth" value="${savedWidth}" 
            class="w-20 bg-white px-2 py-1 border border-gray-300 rounded focus:border-primary focus:outline-none" />
          <span class="text-gray-400">×</span>
          <label class="text-gray-600">Height:</label>
          <input type="number" id="pageHeight" value="${savedHeight}" 
            class="w-20 bg-white px-2 py-1 border border-gray-300 rounded focus:border-primary focus:outline-none" />
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button id="exportBtn" 
          class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all">
          💾 Export
        </button>
        <button id="presentBtn" 
          class="px-4 py-2 bg-success text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-all">
          ▶ Present
        </button>
      </div>
    `;
    return div;
  }

  private attachEvents(): void {
    const exportBtn = this.container.querySelector('#exportBtn');
    const presentBtn = this.container.querySelector('#presentBtn');

    exportBtn?.addEventListener('click', () => this.actions.onExport());
    presentBtn?.addEventListener('click', () => this.actions.onPresent());
    
    // Listen for dimension changes
    this.widthInput.addEventListener('change', () => this.onDimensionChange());
    this.heightInput.addEventListener('change', () => this.onDimensionChange());
  }

  private onDimensionChange(): void {
    const dimensions = this.getDimensions();
    
    // Save to localStorage
    localStorage.setItem('webslide-width', dimensions.width.toString());
    localStorage.setItem('webslide-height', dimensions.height.toString());
    
    // Trigger dimension change event
    const event = new CustomEvent('dimensionChange', {
      detail: dimensions
    });
    this.container.dispatchEvent(event);
  }

  public onDimensionChangeCallback(callback: (dimensions: { width: number; height: number }) => void): void {
    this.container.addEventListener('dimensionChange', ((e: CustomEvent) => {
      callback(e.detail);
    }) as EventListener);
  }

  public getDimensions(): { width: number; height: number } {
    return {
      width: parseInt(this.widthInput.value) || 1920,
      height: parseInt(this.heightInput.value) || 1080
    };
  }

  public getElement(): HTMLElement {
    return this.container;
  }
}
