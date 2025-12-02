export class CodeView {
  private container: HTMLElement;
  private textarea: HTMLTextAreaElement;
  private onChange: (code: string) => void;

  constructor(onChange: (code: string) => void) {
    this.onChange = onChange;
    this.container = this.createContainer();
    this.textarea = this.container.querySelector('#codeEditor') as HTMLTextAreaElement;
    this.attachEvents();
  }

  private createContainer(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'flex flex-col bg-[#1e1e1e] border-r border-gray-300';
    div.innerHTML = `
      <div class="px-4 py-3 bg-[#2d2d2d] border-b border-[#333]">
        <h3 class="text-sm font-semibold text-gray-300">💻 Code</h3>
      </div>
      <div class="flex-1 overflow-auto p-4">
        <textarea id="codeEditor" 
          class="w-full h-full bg-[#1e1e1e] border border-[#333] rounded p-4 font-mono text-sm text-gray-300 resize-none outline-none focus:border-primary"></textarea>
      </div>
    `;
    return div;
  }

  private attachEvents(): void {
    this.textarea.addEventListener('input', () => {
      this.onChange(this.textarea.value);
    });
  }

  public setValue(code: string): void {
    this.textarea.value = code;
  }

  public getValue(): string {
    return this.textarea.value;
  }

  public getElement(): HTMLElement {
    return this.container;
  }
}
