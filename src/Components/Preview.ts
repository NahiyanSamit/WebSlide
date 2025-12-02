export class Preview {
  private container: HTMLElement;
  private iframe: HTMLIFrameElement;
  private zoomLevel: number = 1;
  private currentWidth?: number;
  private currentHeight?: number;
  private resizeObserver!: ResizeObserver;

  constructor() {
    this.container = this.createContainer();
    this.iframe = this.container.querySelector('#previewFrame') as HTMLIFrameElement;
    this.setupResizeObserver();
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

  private createContainer(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'flex h-full max-h-full flex-col bg-gray-100 overflow-hidden';
    div.innerHTML = `
      <div class="px-4 py-3 bg-gray-200 border-b border-gray-300 flex-shrink-0">
        <h3 class="text-sm font-semibold text-gray-700">👁 Preview</h3>
      </div>
      <div class="flex-1 p-4 flex items-center justify-center overflow-hidden min-h-0">
        <iframe id="previewFrame" 
          class="border max-h-full max-w-full border-gray-300 rounded bg-white" 
          sandbox="allow-scripts allow-same-origin"></iframe>
      </div>
    `;
    return div;
  }

  private applyDimensions(): void {
    if (!this.currentWidth || !this.currentHeight) return;

    const container = this.iframe.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Calculate aspect ratio preserving dimensions
    const aspectRatio = this.currentWidth / this.currentHeight;
    const containerAspectRatio = containerWidth / containerHeight;
    
    let finalWidth, finalHeight;
    
    if (containerAspectRatio > aspectRatio) {
      // Container is wider, fit to height
      finalHeight = containerHeight;
      finalWidth = finalHeight * aspectRatio;
    } else {
      // Container is taller, fit to width
      finalWidth = containerWidth;
      finalHeight = finalWidth / aspectRatio;
    }
    
    // Apply zoom
    this.iframe.style.width = `${finalWidth}px`;
    this.iframe.style.height = `${finalHeight}px`;
    this.iframe.style.transform = `scale(${this.zoomLevel})`;
    this.iframe.style.transformOrigin = 'center center';
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