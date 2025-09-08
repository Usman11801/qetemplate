// Touch utilities for better mobile interactions
import { getDeviceType } from './mobileUtils';

export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const preventDefaultTouch = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

export const setupTouchHandlers = (element, options = {}) => {
  const {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    preventDefault = true,
    passive = false
  } = options;

  const touchStartHandler = (e) => {
    if (preventDefault) preventDefaultTouch(e);
    if (onTouchStart) onTouchStart(e);
  };

  const touchMoveHandler = (e) => {
    if (preventDefault) preventDefaultTouch(e);
    if (onTouchMove) onTouchMove(e);
  };

  const touchEndHandler = (e) => {
    if (preventDefault) preventDefaultTouch(e);
    if (onTouchEnd) onTouchEnd(e);
  };

  element.addEventListener('touchstart', touchStartHandler, { passive });
  element.addEventListener('touchmove', touchMoveHandler, { passive });
  element.addEventListener('touchend', touchEndHandler, { passive });

  return () => {
    element.removeEventListener('touchstart', touchStartHandler);
    element.removeEventListener('touchmove', touchMoveHandler);
    element.removeEventListener('touchend', touchEndHandler);
  };
};

export const getTouchPosition = (e) => {
  const touch = e.touches[0] || e.changedTouches[0];
  return {
    x: touch.clientX,
    y: touch.clientY
  };
};

export const createTouchDragHandler = (onDrag, onDragStart, onDragEnd) => {
  let isDragging = false;
  let startPosition = null;

  return {
    onTouchStart: (e) => {
      const pos = getTouchPosition(e);
      startPosition = pos;
      isDragging = true;
      if (onDragStart) onDragStart(pos, e);
    },
    onTouchMove: (e) => {
      if (!isDragging || !startPosition) return;
      
      const pos = getTouchPosition(e);
      const delta = {
        x: pos.x - startPosition.x,
        y: pos.y - startPosition.y
      };
      
      if (onDrag) onDrag(delta, pos, e);
    },
    onTouchEnd: (e) => {
      if (!isDragging) return;
      
      isDragging = false;
      startPosition = null;
      if (onDragEnd) onDragEnd(e);
    }
  };
};

export const addTouchStyles = (element) => {
  element.style.touchAction = 'none';
  element.style.userSelect = 'none';
  element.style.webkitUserSelect = 'none';
  element.style.mozUserSelect = 'none';
  element.style.msUserSelect = 'none';
  element.style.webkitTouchCallout = 'none';
};

export const removeTouchStyles = (element) => {
  element.style.touchAction = '';
  element.style.userSelect = '';
  element.style.webkitUserSelect = '';
  element.style.mozUserSelect = '';
  element.style.msUserSelect = '';
  element.style.webkitTouchCallout = '';
};

export const setupGlobalTouchOptimizations = () => {
  // Prevent zoom on double tap
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Prevent context menu on long press
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // Prevent pull-to-refresh
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
};

export const getOptimalTouchTargetSize = () => {
  const deviceType = getDeviceType();
  switch (deviceType) {
    case 'phone':
      return 48; // Larger touch targets for phones
    case 'tablet':
      return 44; // Standard touch target size
    default:
      return 40; // Smaller for desktop
  }
};

