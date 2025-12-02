import { CONFIG } from '../config';

/**
 * Slide interface - represents a single presentation slide
 * Each slide contains HTML content and metadata
 */
export interface Slide {
  id: string;
  title: string;
  html: string;
  css: string;      // Reserved for future CSS styling features
  markdown: string; // Reserved for future Markdown support
  createdAt: number;
  updatedAt: number;
}

/**
 * Presentation metadata
 */
export interface PresentationMetadata {
  version: string;
  createdAt: number;
  updatedAt: number;
  title?: string;
  author?: string;
}

/**
 * Complete presentation data structure
 */
export interface PresentationData {
  metadata: PresentationMetadata;
  slides: Slide[];
}

/**
 * State change event types
 */
export type StateChangeEvent = 
  | 'slide-added' 
  | 'slide-deleted' 
  | 'slide-updated' 
  | 'slide-selected' 
  | 'presentation-loaded';

/**
 * State change callback
 */
export type StateChangeCallback = (event: StateChangeEvent, data?: any) => void;

/**
 * Centralized presentation state management
 * Handles all slide operations, validation, and state persistence
 */
export class PresentationState {
  private _slides: Slide[] = [];
  private _currentSlideIndex: number = 0;
  private _metadata: PresentationMetadata;
  private _changeCallbacks: StateChangeCallback[] = [];
  private _autoSaveTimer: number | null = null;

  constructor() {
    this._metadata = {
      version: CONFIG.APP_VERSION,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Try to load from localStorage first
    const loaded = this.loadFromStorage();
    if (!loaded) {
      // Initialize with an empty slide if no saved data
      this.initializeWithEmptySlide();
    }
  }

  // ==================== Getters ====================

  get slides(): Slide[] {
    return [...this._slides]; // Return copy to prevent direct mutation
  }

  get currentSlideIndex(): number {
    return this._currentSlideIndex;
  }

  get metadata(): PresentationMetadata {
    return { ...this._metadata };
  }

  // ==================== State Change Notifications ====================

  /**
   * Subscribe to state changes
   */
  public onChange(callback: StateChangeCallback): void {
    this._changeCallbacks.push(callback);
  }

  /**
   * Notify all subscribers of state change
   */
  private notifyChange(event: StateChangeEvent, data?: any): void {
    this._changeCallbacks.forEach(cb => {
      try {
        cb(event, data);
      } catch (error) {
        console.error('Error in state change callback:', error);
      }
    });
    
    // Update timestamp
    this._metadata.updatedAt = Date.now();
    
    // Trigger auto-save
    this.scheduleAutoSave();
  }

  // ==================== Initialization ====================

  private initializeWithEmptySlide(): void {
    const emptySlide: Slide = {
      id: this.generateId(),
      title: 'Untitled Slide',
      html: '',
      css: '',
      markdown: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this._slides = [emptySlide];
    this._currentSlideIndex = 0;
  }

  // ==================== ID Generation ====================

  private generateId(): string {
    return `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== Slide Operations ====================

  /**
   * Add a new slide
   */
  public addSlide(): Slide {
    const newSlide: Slide = {
      id: this.generateId(),
      title: `Slide ${this._slides.length + 1}`,
      html: '',
      css: '',
      markdown: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    this._slides.push(newSlide);
    this._currentSlideIndex = this._slides.length - 1;
    
    this.notifyChange('slide-added', { slide: newSlide, index: this._currentSlideIndex });
    return newSlide;
  }

  /**
   * Delete a slide by index
   */
  public deleteSlide(index: number): boolean {
    // Validate index
    if (index < 0 || index >= this._slides.length) {
      console.error('Invalid slide index:', index);
      return false;
    }

    // Prevent deleting the last slide
    if (this._slides.length <= 1) {
      console.warn('Cannot delete the last slide');
      return false;
    }

    const deletedSlide = this._slides[index];
    this._slides.splice(index, 1);

    // Adjust current index if needed
    if (this._currentSlideIndex >= this._slides.length) {
      this._currentSlideIndex = this._slides.length - 1;
    }

    this.notifyChange('slide-deleted', { slide: deletedSlide, index });
    return true;
  }

  /**
   * Get current slide
   */
  public getCurrentSlide(): Slide {
    return { ...this._slides[this._currentSlideIndex] };
  }

  /**
   * Get slide by index
   */
  public getSlide(index: number): Slide | null {
    if (index >= 0 && index < this._slides.length) {
      return { ...this._slides[index] };
    }
    return null;
  }

  /**
   * Update a slide
   */
  public updateSlide(index: number, updates: Partial<Slide>): boolean {
    if (index < 0 || index >= this._slides.length) {
      console.error('Invalid slide index:', index);
      return false;
    }

    this._slides[index] = {
      ...this._slides[index],
      ...updates,
      updatedAt: Date.now(),
    };

    this.notifyChange('slide-updated', { index, updates });
    return true;
  }

  /**
   * Set current slide by index
   */
  public setCurrentSlide(index: number): boolean {
    if (index >= 0 && index < this._slides.length) {
      this._currentSlideIndex = index;
      this.notifyChange('slide-selected', { index });
      return true;
    }
    console.error('Invalid slide index:', index);
    return false;
  }

  /**
   * Duplicate a slide
   */
  public duplicateSlide(index: number): Slide | null {
    const slide = this.getSlide(index);
    if (!slide) return null;

    const newSlide: Slide = {
      ...slide,
      id: this.generateId(),
      title: `${slide.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this._slides.splice(index + 1, 0, newSlide);
    this._currentSlideIndex = index + 1;
    
    this.notifyChange('slide-added', { slide: newSlide, index: this._currentSlideIndex });
    return newSlide;
  }

  // ==================== Import/Export ====================

  /**
   * Export presentation as JSON
   */
  public exportPresentation(): string {
    const data: PresentationData = {
      metadata: {
        ...this._metadata,
        updatedAt: Date.now(),
      },
      slides: this._slides,
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import presentation from JSON
   */
  public importPresentation(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData) as PresentationData;
      
      // Validate structure
      if (!data.slides || !Array.isArray(data.slides)) {
        throw new Error('Invalid presentation format: missing slides array');
      }

      // Validate slides
      const validSlides = data.slides.every((slide: any) => 
        typeof slide.id === 'string' &&
        typeof slide.html === 'string' &&
        slide.title !== undefined
      );

      if (!validSlides) {
        throw new Error('Invalid slide format');
      }

      // Ensure all slides have required fields
      this._slides = data.slides.map(slide => ({
        ...slide,
        css: slide.css || '',
        markdown: slide.markdown || '',
        createdAt: slide.createdAt || Date.now(),
        updatedAt: slide.updatedAt || Date.now(),
      }));

      this._currentSlideIndex = 0;
      
      // Update metadata
      if (data.metadata) {
        this._metadata = {
          ...data.metadata,
          updatedAt: Date.now(),
        };
      }

      this.notifyChange('presentation-loaded', { slideCount: this._slides.length });
      return true;
    } catch (error) {
      console.error('Failed to import presentation:', error);
      return false;
    }
  }

  // ==================== Persistence ====================

  /**
   * Save to localStorage
   */
  public saveToStorage(): boolean {
    try {
      const data = this.exportPresentation();
      localStorage.setItem(CONFIG.STORAGE_KEY, data);
      console.log('Presentation auto-saved');
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  /**
   * Load from localStorage
   */
  public loadFromStorage(): boolean {
    try {
      const data = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (data) {
        return this.importPresentation(data);
      }
      return false;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return false;
    }
  }

  /**
   * Clear stored data
   */
  public clearStorage(): void {
    try {
      localStorage.removeItem(CONFIG.STORAGE_KEY);
      console.log('Presentation storage cleared');
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  /**
   * Schedule auto-save
   */
  private scheduleAutoSave(): void {
    if (this._autoSaveTimer) {
      clearTimeout(this._autoSaveTimer);
    }

    this._autoSaveTimer = setTimeout(() => {
      this.saveToStorage();
    }, CONFIG.AUTO_SAVE_INTERVAL) as any;
  }

  /**
   * Force immediate save
   */
  public forceSave(): boolean {
    if (this._autoSaveTimer) {
      clearTimeout(this._autoSaveTimer);
      this._autoSaveTimer = null;
    }
    return this.saveToStorage();
  }

  // ==================== Utility ====================

  /**
   * Get total slide count
   */
  public get slideCount(): number {
    return this._slides.length;
  }

  /**
   * Check if current slide is first
   */
  public get isFirstSlide(): boolean {
    return this._currentSlideIndex === 0;
  }

  /**
   * Check if current slide is last
   */
  public get isLastSlide(): boolean {
    return this._currentSlideIndex === this._slides.length - 1;
  }

  /**
   * Navigate to next slide
   */
  public nextSlide(): boolean {
    if (!this.isLastSlide) {
      return this.setCurrentSlide(this._currentSlideIndex + 1);
    }
    return false;
  }

  /**
   * Navigate to previous slide
   */
  public previousSlide(): boolean {
    if (!this.isFirstSlide) {
      return this.setCurrentSlide(this._currentSlideIndex - 1);
    }
    return false;
  }
}
