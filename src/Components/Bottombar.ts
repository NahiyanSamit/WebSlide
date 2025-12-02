export interface StatusBarActions {
  onZoomChange: (zoom: number) => void;
}

export class StatusBar {
  private container: HTMLElement;
  private slideInfo: HTMLElement;

  constructor() {
    this.container = this.createContainer();
    this.slideInfo = this.container.querySelector('#slideInfo') as HTMLElement;
  }

  private createContainer(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between px-4 py-2 bg-gray-100 border-t border-gray-300';
    div.innerHTML = `
      <div class="flex items-center gap-4 text-xs text-gray-600">
        <span id="slideInfo">Slide 1 of 1</span>
      </div>
      <div class="flex items-center gap-3">
        <p> Created by <a href="https://github.com/nahiyansamit" target="_blank" rel="noopener noreferrer">Ibnus Nahiyan Samit</a></p>
      </div>
    `;
    return div;
  }

  public updateSlideInfo(current: number, total: number): void {
    this.slideInfo.textContent = `Slide ${current} of ${total}`;
  }


  public getElement(): HTMLElement {
    return this.container;
  }
}
