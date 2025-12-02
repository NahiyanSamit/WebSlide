// Slide interface - each slide is a web page with HTML, CSS, and Markdown
export interface Slide {
  id: string;
  title: string;
  html: string;
  css: string;
  markdown: string;
}

// Presentation state
export class PresentationState {
  slides: Slide[] = [];
  currentSlideIndex: number = 0;

  constructor() {
    // Initialize with an empty slide
    this.slides.push({
      id: this.generateId(),
      title: '',
      html: '',
      css: '',
      markdown: ''
    });
  }

  generateId(): string {
    return `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  addSlide(): Slide {
    const newSlide: Slide = {
      id: this.generateId(),
      title: '',
      html: '',
      css: '',
      markdown: ''
    };
    this.slides.push(newSlide);
    this.currentSlideIndex = this.slides.length - 1;
    return newSlide;
  }

  deleteSlide(index: number): void {
    if (this.slides.length > 1) {
      this.slides.splice(index, 1);
      if (this.currentSlideIndex >= this.slides.length) {
        this.currentSlideIndex = this.slides.length - 1;
      }
    }
  }

  getCurrentSlide(): Slide {
    return this.slides[this.currentSlideIndex];
  }

  updateSlide(index: number, updates: Partial<Slide>): void {
    this.slides[index] = { ...this.slides[index], ...updates };
  }

  setCurrentSlide(index: number): void {
    if (index >= 0 && index < this.slides.length) {
      this.currentSlideIndex = index;
    }
  }

  exportPresentation(): string {
    return JSON.stringify({
      slides: this.slides,
      version: '2.0'
    }, null, 2);
  }

  importPresentation(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.slides && Array.isArray(data.slides)) {
        // Validate that slides have the correct structure
        const validSlides = data.slides.every((slide: any) => 
          slide.id && slide.title !== undefined && 
          slide.html !== undefined && slide.css !== undefined && 
          slide.markdown !== undefined
        );
        
        if (validSlides) {
          this.slides = data.slides;
          this.currentSlideIndex = 0;
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to import presentation:', error);
      return false;
    }
  }
}
