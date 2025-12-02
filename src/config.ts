// Project Configuration and Constants

export const CONFIG = {
  // Application Info
  APP_NAME: 'WebSlide',
  APP_VERSION: '1.0.0',
  
  // Default Slide Dimensions
  DEFAULT_WIDTH: 1920,
  DEFAULT_HEIGHT: 1080,
  
  // Zoom Limits
  MIN_ZOOM: 25,
  MAX_ZOOM: 200,
  ZOOM_STEP: 10,
  DEFAULT_ZOOM: 100,
  
  // Presentation
  PRESENTATION_PADDING: 64,
  CONTROLS_HEIGHT: 200,
  
  // Storage
  STORAGE_KEY: 'webslide_presentation',
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  
  // Supported Export Formats
  EXPORT_FORMATS: {
    JSON: 'application/json',
    HTML: 'text/html',
  },
  
  // Keyboard Shortcuts
  SHORTCUTS: {
    NEW_SLIDE: 'Ctrl+N',
    DELETE_SLIDE: 'Delete',
    NEXT_SLIDE: 'ArrowRight',
    PREV_SLIDE: 'ArrowLeft',
    PRESENT: 'F5',
    EXIT_PRESENT: 'Escape',
    SAVE: 'Ctrl+S',
    ZOOM_IN: 'Ctrl+=',
    ZOOM_OUT: 'Ctrl+-',
  },
  
  // UI Settings
  SIDEBAR_WIDTH: 280,
  TOOLBAR_HEIGHT: 60,
  STATUSBAR_HEIGHT: 40,
} as const;

export type AppConfig = typeof CONFIG;
