import './style.css'
import { PresentationState } from './Components/presentation'
import { UIController } from './Components/ui'


function initApp() {
  const state = new PresentationState();
  const ui = new UIController(state);

  (window as any).webslide = { state, ui };

  console.log('WebSlide initialized successfully!');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
