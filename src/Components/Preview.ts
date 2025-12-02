export class Preview {
  private container: HTMLElement;
  private iframe: HTMLIFrameElement;
  private zoomLevel: number = 1;
  private currentWidth?: number;
  private currentHeight?: number;
  private resizeObserver!: ResizeObserver;
  private isPanning: boolean = false;
  private panStartX: number = 0;
  private panStartY: number = 0;
  private viewportElement!: HTMLElement;

  constructor() {
    this.container = this.createContainer();
    this.iframe = this.container.querySelector('#previewFrame') as HTMLIFrameElement;
    this.viewportElement = this.container.querySelector('.flex-1') as HTMLElement;
    this.setupResizeObserver();
    this.setupPanControls();
  }

  private setupResizeObserver(): void {
    // Observe the container for size changes
    this.resizeObserver = new ResizeObserver(() => {
      if (this.currentWidth && this.currentHeight) {
        this.applyDimensions();
      }
    });
    
    const containerElement = this.container.querySelector('.flex-1') as HTMLElement;
    if (containerElement) {
      this.resizeObserver.observe(containerElement);
    }
  }

  private setupPanControls(): void {
    const wrapper = this.container.querySelector('#iframeWrapper') as HTMLElement;
    const zoomDisplay = this.container.querySelector('#zoomDisplay') as HTMLElement;
    const zoomInBtn = this.container.querySelector('#zoomIn') as HTMLButtonElement;
    const zoomOutBtn = this.container.querySelector('#zoomOut') as HTMLButtonElement;
    const fitBtn = this.container.querySelector('#fitToScreen') as HTMLButtonElement;
    const actualSizeBtn = this.container.querySelector('#actualSize') as HTMLButtonElement;
    
    // Track key states
    let isSpacePressed = false;
    
    const updateCursor = () => {
      if (this.isPanning) {
        wrapper.style.cursor = 'grabbing';
        this.viewportElement.style.cursor = 'grabbing';
      } else if (isSpacePressed) {
        wrapper.style.cursor = 'grab';
        this.viewportElement.style.cursor = 'grab';
      } else {
        wrapper.style.cursor = 'default';
        this.viewportElement.style.cursor = 'default';
      }
    };

    const updateZoomDisplay = () => {
      zoomDisplay.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    };

    // Space bar panning
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        isSpacePressed = true;
        updateCursor();
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        isSpacePressed = false;
        updateCursor();
      }
    });

    // Pan on mouse drag with space held
    this.viewportElement.addEventListener('mousedown', (e) => {
      if (isSpacePressed) {
        e.preventDefault();
        this.isPanning = true;
        this.panStartX = e.clientX + this.viewportElement.scrollLeft;
        this.panStartY = e.clientY + this.viewportElement.scrollTop;
        updateCursor();
        this.viewportElement.style.userSelect = 'none';
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        e.preventDefault();
        const x = e.clientX;
        const y = e.clientY;
        
        this.viewportElement.scrollLeft = this.panStartX - x;
        this.viewportElement.scrollTop = this.panStartY - y;
      }
    });

    document.addEventListener('mouseup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        updateCursor();
        this.viewportElement.style.userSelect = '';
      }
    });

    // Ctrl + Mouse wheel zoom
    this.viewportElement.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newZoom = Math.max(0.1, Math.min(5, this.zoomLevel + delta));
        this.setZoomFromCenter(newZoom);
        updateZoomDisplay();
      }
    }, { passive: false });

    // Zoom buttons
    zoomInBtn.addEventListener('click', () => {
      const newZoom = Math.min(5, this.zoomLevel + 0.1);
      this.setZoomFromCenter(newZoom);
      updateZoomDisplay();
    });

    zoomOutBtn.addEventListener('click', () => {
      const newZoom = Math.max(0.1, this.zoomLevel - 0.1);
      this.setZoomFromCenter(newZoom);
      updateZoomDisplay();
    });

    // Fit to screen
    fitBtn.addEventListener('click', () => {
      this.fitToScreen();
      updateZoomDisplay();
    });

    // Actual size (100%)
    actualSizeBtn.addEventListener('click', () => {
      this.setZoomFromCenter(1);
      updateZoomDisplay();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        if (e.key === '0') {
          e.preventDefault();
          this.fitToScreen();
          updateZoomDisplay();
        } else if (e.key === '1') {
          e.preventDefault();
          this.setZoomFromCenter(1);
          updateZoomDisplay();
        } else if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          const newZoom = Math.min(5, this.zoomLevel + 0.1);
          this.setZoomFromCenter(newZoom);
          updateZoomDisplay();
        } else if (e.key === '-') {
          e.preventDefault();
          const newZoom = Math.max(0.1, this.zoomLevel - 0.1);
          this.setZoomFromCenter(newZoom);
          updateZoomDisplay();
        }
      }
    });

    updateZoomDisplay();
  }

  private fitToScreen(): void {
    if (!this.currentWidth || !this.currentHeight) return;

    const containerWidth = this.viewportElement.clientWidth - 32;
    const containerHeight = this.viewportElement.clientHeight - 32;

    const scaleX = containerWidth / this.currentWidth;
    const scaleY = containerHeight / this.currentHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    this.setZoom(scale);
  }

  private createContainer(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'flex h-full max-h-full flex-col bg-gray-100 overflow-hidden';
    div.innerHTML = `
      <div class="px-4 py-2 bg-gray-200 border-b border-gray-300 flex-shrink-0 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-700">👁 Preview</h3>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">Space+Drag • Ctrl+Wheel</span>
          <div class="flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-300">
            <button id="zoomOut" class="px-2 py-0.5 hover:bg-gray-100 rounded text-sm" title="Zoom Out (Ctrl+-)">−</button>
            <span id="zoomDisplay" class="text-xs font-mono min-w-[3rem] text-center">100%</span>
            <button id="zoomIn" class="px-2 py-0.5 hover:bg-gray-100 rounded text-sm" title="Zoom In (Ctrl++)">+</button>
          </div>
          <button id="fitToScreen" class="px-2 py-1 text-xs bg-white hover:bg-gray-100 rounded border border-gray-300" title="Fit to Screen (Ctrl+0)">Fit</button>
          <button id="actualSize" class="px-2 py-1 text-xs bg-white hover:bg-gray-100 rounded border border-gray-300" title="Actual Size (Ctrl+1)">1:1</button>
        </div>
      </div>
      <div class="flex-1 overflow-auto min-h-0 relative" style="background: repeating-conic-gradient(#f0f0f0 0% 25%, #fafafa 0% 50%) 50% / 20px 20px;">
        <div style="min-height: 100%; min-width: 100%; padding: 16px;">
          <div id="iframeWrapper" style="position: relative; margin: auto;">
            <iframe id="previewFrame" 
              class="border border-gray-300 rounded bg-white shadow-lg" 
              sandbox="allow-scripts allow-same-origin"
              style="display: block; pointer-events: none;"></iframe>
          </div>
        </div>
      </div>
    `;
    return div;
  }

  private applyDimensions(): void {
    if (!this.currentWidth || !this.currentHeight) return;

    const wrapper = this.iframe.parentElement;
    if (!wrapper) return;

    // When zoomed, iframe can exceed container - that's OK with scrolling
    const baseWidth = this.currentWidth;
    const baseHeight = this.currentHeight;
    
    // Set iframe to actual slide dimensions
    this.iframe.style.width = `${baseWidth}px`;
    this.iframe.style.height = `${baseHeight}px`;
    
    // Apply zoom via transform with top-left origin
    this.iframe.style.transform = `scale(${this.zoomLevel})`;
    this.iframe.style.transformOrigin = 'top left';
    
    // Update wrapper to accommodate scaled size
    const scaledWidth = baseWidth * this.zoomLevel;
    const scaledHeight = baseHeight * this.zoomLevel;
    wrapper.style.width = `${scaledWidth}px`;
    wrapper.style.height = `${scaledHeight}px`;
  }

  public updatePreview(html: string, width?: number, height?: number): void {
    // Store current dimensions
    this.currentWidth = width;
    this.currentHeight = height;

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
            width: 100%;
            height: 100%;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

    // Write HTML to iframe
    const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(previewHtml);
      iframeDoc.close();
    }

    // Apply dimensions
    if (width && height) {
      this.applyDimensions();
    } else {
      this.iframe.style.width = '100%';
      this.iframe.style.height = '100%';
      this.iframe.style.transform = 'none';
    }
  }

  private setZoomFromCenter(newZoom: number): void {
    if (!this.currentWidth || !this.currentHeight) {
      this.setZoom(newZoom);
      return;
    }

    const wrapper = this.iframe.parentElement;
    if (!wrapper) {
      this.setZoom(newZoom);
      return;
    }

    // Store current state
    const oldZoom = this.zoomLevel;
    const scrollLeft = this.viewportElement.scrollLeft;
    const scrollTop = this.viewportElement.scrollTop;
    const viewportWidth = this.viewportElement.clientWidth;
    const viewportHeight = this.viewportElement.clientHeight;
    
    // Find the center point in the current view (in slide coordinates)
    // Since transform-origin is top-left, the slide coordinates are:
    const centerSlideX = (scrollLeft + viewportWidth / 2) / oldZoom;
    const centerSlideY = (scrollTop + viewportHeight / 2) / oldZoom;

    // Apply new zoom
    this.zoomLevel = newZoom;
    this.applyDimensions();

    // Calculate new scroll to keep the same slide point centered
    requestAnimationFrame(() => {
      const newScrollLeft = centerSlideX * newZoom - viewportWidth / 2;
      const newScrollTop = centerSlideY * newZoom - viewportHeight / 2;
      
      this.viewportElement.scrollLeft = newScrollLeft;
      this.viewportElement.scrollTop = newScrollTop;
    });
  }

  public setZoom(zoom: number): void {
    this.zoomLevel = zoom;
    this.applyDimensions();
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}