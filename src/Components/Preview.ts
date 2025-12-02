export class Preview {
  private container: HTMLElement;
  private iframe: HTMLIFrameElement;
  private zoomLevel: number = 1;

  constructor() {
    this.container = this.createContainer();
    this.iframe = this.container.querySelector('#previewFrame') as HTMLIFrameElement;
  }

  private createContainer(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'flex flex-col bg-gray-100';
    div.innerHTML = `
      <div class="px-4 py-3 bg-gray-200 border-b border-gray-300">
        <h3 class="text-sm font-semibold text-gray-700">👁 Preview</h3>
      </div>
      <div class="flex-1 overflow-auto p-4 flex items-center justify-center">
        <iframe id="previewFrame" 
          class="border border-gray-300 rounded bg-white" 
          sandbox="allow-scripts allow-same-origin"></iframe>
      </div>
    `;
    return div;
  }

  public updatePreview(html: string, width?: number, height?: number): void {
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

    // Apply aspect ratio if dimensions provided
    if (width && height) {
      // Get the actual container dimensions
      const container = this.iframe.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calculate what the height would be if we use full width
        const heightIfFullWidth = (containerWidth * height) / width;
        
        // Calculate what the width would be if we use full height
        const widthIfFullHeight = (containerHeight * width) / height;
        
        // Choose the option that fits
        let finalWidth, finalHeight;
        if (heightIfFullWidth <= containerHeight) {
          // Use full width, height will fit
          finalWidth = containerWidth;
          finalHeight = heightIfFullWidth;
        } else {
          // Use full height, width will fit
          finalWidth = widthIfFullHeight;
          finalHeight = containerHeight;
        }
        
        // Apply zoom
        this.iframe.style.width = `${finalWidth * this.zoomLevel}px`;
        this.iframe.style.height = `${finalHeight * this.zoomLevel}px`;
        this.iframe.style.transform = `scale(${this.zoomLevel})`;
        this.iframe.style.transformOrigin = 'center center';
      }
    } else {
      this.iframe.style.width = '100%';
      this.iframe.style.height = '100%';
      this.iframe.style.transform = 'none';
    }

    const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(previewHtml);
      iframeDoc.close();
    }
  }

  public setZoom(zoom: number): void {
    this.zoomLevel = zoom;
  }

  public getElement(): HTMLElement {
    return this.container;
  }
}
