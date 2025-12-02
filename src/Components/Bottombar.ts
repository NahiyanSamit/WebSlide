export interface StatusBarActions {
  onZoomChange: (zoom: number) => void;
}

export class StatusBar {
  private container: HTMLElement;
  private actions: StatusBarActions;
  private zoomLevel: number = 100;
  private zoomDisplay: HTMLElement;
  private slideInfo: HTMLElement;

  constructor(actions: StatusBarActions) {
    this.actions = actions;
    this.container = this.createContainer();
    this.zoomDisplay = this.container.querySelector('#zoomDisplay') as HTMLElement;
    this.slideInfo = this.container.querySelector('#slideInfo') as HTMLElement;
    this.attachEvents();
  }

  private createContainer(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between px-4 py-2 bg-gray-100 border-t border-gray-300';
    div.innerHTML = `
      <div class="flex items-center gap-4 text-xs text-gray-600">
        <span id="slideInfo">Slide 1 of 1</span>
      </div>
      <div class="flex items-center gap-3">
        <button id="zoomOut" 
          class="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 transition-all"
          title="Zoom Out">
          <span class="text-base">−</span>
        </button>
        <input type="range" id="zoomSlider" min="25" max="200" value="100" step="5"
          class="w-24 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-primary"
          title="Zoom Slider" />
        <button id="zoomIn" 
          class="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-50 transition-all"
          title="Zoom In">
          <span class="text-base">+</span>
        </button>
        <div id="zoomDisplay" class="min-w-[50px] text-center text-xs font-semibold text-gray-700">100%</div>
        <button id="zoomReset" 
          class="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition-all"
          title="Fit to Window">
          <span>⊡</span>
        </button>
      </div>
    `;
    return div;
  }

  private attachEvents(): void {
    const zoomInBtn = this.container.querySelector('#zoomIn');
    const zoomOutBtn = this.container.querySelector('#zoomOut');
    const zoomResetBtn = this.container.querySelector('#zoomReset');
    const zoomSlider = this.container.querySelector('#zoomSlider') as HTMLInputElement;

    zoomInBtn?.addEventListener('click', () => {
      this.zoomLevel = Math.min(this.zoomLevel + 10, 200);
      this.updateZoom();
      if (zoomSlider) zoomSlider.value = this.zoomLevel.toString();
    });

    zoomOutBtn?.addEventListener('click', () => {
      this.zoomLevel = Math.max(this.zoomLevel - 10, 25);
      this.updateZoom();
      if (zoomSlider) zoomSlider.value = this.zoomLevel.toString();
    });

    zoomResetBtn?.addEventListener('click', () => {
      this.zoomLevel = 100;
      this.updateZoom();
      if (zoomSlider) zoomSlider.value = this.zoomLevel.toString();
    });

    zoomSlider?.addEventListener('input', (e) => {
      this.zoomLevel = parseInt((e.target as HTMLInputElement).value);
      this.updateZoom();
    });
  }

  private updateZoom(): void {
    this.zoomDisplay.textContent = `${this.zoomLevel}%`;
    this.actions.onZoomChange(this.zoomLevel / 100);
  }

  public updateSlideInfo(current: number, total: number): void {
    this.slideInfo.textContent = `Slide ${current} of ${total}`;
  }

  public getZoomLevel(): number {
    return this.zoomLevel / 100;
  }

  public getElement(): HTMLElement {
    return this.container;
  }
}
