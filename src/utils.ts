// Utility Functions

export class Utils {
  /**
   * Generate unique ID
   */
  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Debounce function calls
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait) as any;
    };
  }

  /**
   * Throttle function calls
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Download file
   */
  static downloadFile(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Read file as text
   */
  static readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * Calculate aspect ratio fit
   */
  static calculateFit(
    contentWidth: number,
    contentHeight: number,
    containerWidth: number,
    containerHeight: number
  ): { width: number; height: number } {
    const contentRatio = contentWidth / contentHeight;
    const containerRatio = containerWidth / containerHeight;

    let width: number, height: number;

    if (contentRatio > containerRatio) {
      // Content is wider - fit to width
      width = containerWidth;
      height = containerWidth / contentRatio;
    } else {
      // Content is taller - fit to height
      height = containerHeight;
      width = containerHeight * contentRatio;
    }

    return { width, height };
  }

  /**
   * Format zoom percentage
   */
  static formatZoom(zoom: number): string {
    return `${Math.round(zoom)}%`;
  }

  /**
   * Clamp value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
