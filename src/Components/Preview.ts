export class Preview {
  private container: HTMLElement;
  private iframe: HTMLIFrameElement;

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
      <div class="flex-1 overflow-auto p-4">
        <iframe id="previewFrame" 
          class="w-full h-full border border-gray-300 rounded bg-white" 
          sandbox="allow-scripts allow-same-origin"></iframe>
      </div>
    `;
    return div;
  }

  public updatePreview(html: string): void {
    const previewHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;

    const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(previewHtml);
      iframeDoc.close();
    }
  }

  public getElement(): HTMLElement {
    return this.container;
  }
}
