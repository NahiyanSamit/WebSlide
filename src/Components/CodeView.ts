declare global {
  interface Window {
    monaco: any;
    require: any;
  }
}

export class CodeView {
  private container: HTMLElement;
  private editor: any | null = null;
  private onChange: (code: string) => void;
  private editorContainer: HTMLElement | null = null;
  private isMonacoLoaded: boolean = false;

  constructor(onChange: (code: string) => void) {
    this.onChange = onChange;
    this.container = this.createContainer();
    this.editorContainer = this.container.querySelector('#monacoEditor') as HTMLElement;
    this.loadMonacoAndInitialize();
  }

  private loadMonacoAndInitialize(): void {
    // Check if Monaco is already loaded
    if (window.monaco) {
      this.isMonacoLoaded = true;
      this.initializeMonaco();
      return;
    }

    // Load Monaco Editor from CDN
    const loaderScript = document.createElement('script');
    loaderScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js';
    loaderScript.onload = () => {
      window.require.config({ 
        paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }
      });
      
      window.require(['vs/editor/editor.main'], () => {
        this.isMonacoLoaded = true;
        this.initializeMonaco();
      });
    };
    document.head.appendChild(loaderScript);
  }

  private createContainer(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'flex flex-col bg-[#1e1e1e] border-r border-gray-300 h-full max-h-full overflow-hidden';
    div.innerHTML = `
      <div class="px-4 py-3 bg-[#2d2d2d] border-b border-[#333] flex-shrink-0 flex items-center justify-between">
        <h3 class="text-sm font-semibold text-gray-300">💻 Code Editor</h3>
        <div class="flex items-center gap-2">
          <button id="formatCode" class="px-2 py-1 text-xs bg-[#3c3c3c] hover:bg-[#4c4c4c] text-gray-300 rounded" title="Format (Alt+Shift+F)">Format</button>
          <button id="toggleMinimap" class="px-2 py-1 text-xs bg-[#3c3c3c] hover:bg-[#4c4c4c] text-gray-300 rounded" title="Toggle Minimap">Map</button>
        </div>
      </div>
      <div class="flex-1 overflow-hidden min-h-0">
        <div id="monacoEditor" class="w-full h-full"></div>
      </div>
    `;
    return div;
  }

  private async initializeMonaco(): Promise<void> {
    if (!this.editorContainer || !window.monaco) return;

    // Configure Monaco Editor
    this.editor = window.monaco.editor.create(this.editorContainer, {
      value: '',
      language: 'html',
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: 14,
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      folding: true,
      suggestOnTriggerCharacters: false,
      quickSuggestions: false,
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste: false,
      formatOnType: false,
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoIndent: 'full',
      bracketPairColorization: {
        enabled: true
      },
      padding: {
        top: 10,
        bottom: 10
      }
    });

    // Debounced change listener to reduce lag
    let changeTimeout: number;
    this.editor.onDidChangeModelContent(() => {
      if (this.editor) {
        clearTimeout(changeTimeout);
        changeTimeout = setTimeout(() => {
          this.onChange(this.editor.getValue());
        }, 150) as any;
      }
    });

    // Setup toolbar buttons
    this.setupToolbarButtons();
  }

  private setupToolbarButtons(): void {
    const formatBtn = this.container.querySelector('#formatCode') as HTMLButtonElement;
    const minimapBtn = this.container.querySelector('#toggleMinimap') as HTMLButtonElement;

    formatBtn?.addEventListener('click', () => {
      this.editor?.getAction('editor.action.formatDocument')?.run();
    });

    let minimapEnabled = true;
    minimapBtn?.addEventListener('click', () => {
      minimapEnabled = !minimapEnabled;
      this.editor?.updateOptions({
        minimap: { enabled: minimapEnabled }
      });
    });
  }

  public setValue(code: string): void {
    if (this.editor) {
      const currentPosition = this.editor.getPosition();
      const currentValue = this.editor.getValue();
      
      // Only update if content is different to avoid cursor reset
      if (currentValue !== code) {
        this.editor.setValue(code);
        
        // Restore cursor position if possible
        if (currentPosition) {
          this.editor.setPosition(currentPosition);
        }
      }
    }
  }

  public getValue(): string {
    return this.editor?.getValue() || '';
  }

  public getElement(): HTMLElement {
    return this.container;
  }

  public dispose(): void {
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
  }
}
