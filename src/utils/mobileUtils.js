// Mobile utility functions for responsive design and touch interactions

export const isMobile = () => {
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         ('ontouchstart' in window) || 
         (navigator.maxTouchPoints > 0);
};

export const isTablet = () => {
  return /iPad|Android(?=.*Tablet)|Windows NT.*Touch/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints > 0 && window.innerWidth >= 768 && window.innerWidth <= 1024);
};

export const isPhone = () => {
  return isMobile() && !isTablet();
};

export const getDeviceType = () => {
  if (isTablet()) return 'tablet';
  if (isPhone()) return 'phone';
  return 'desktop';
};

export const getScreenSize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  if (width < 360) return 'xs';
  if (width < 480) return 'sm';
  if (width < 768) return 'md';
  if (width < 1024) return 'lg';
  if (width < 1280) return 'xl';
  return '2xl';
};

export const isLandscape = () => {
  return window.innerWidth > window.innerHeight;
};

export const isPortrait = () => {
  return window.innerHeight > window.innerWidth;
};

export const getOptimalScale = (originalWidth, originalHeight, availableWidth, availableHeight, minScale = 0.15) => {
  const widthScale = availableWidth / originalWidth;
  const heightScale = availableHeight / originalHeight;
  const scale = Math.min(widthScale, heightScale, 1);
  
  // Enhanced scaling based on device type with more aggressive minimums
  const deviceType = getDeviceType();
  const screenSize = getScreenSize();
  
  // Debug logging
  console.log('getOptimalScale debug:', {
    originalWidth,
    originalHeight,
    availableWidth,
    availableHeight,
    widthScale,
    heightScale,
    scale,
    deviceType,
    screenSize,
    minScale
  });
  
  let finalScale = scale;
  
  switch (deviceType) {
    case 'phone':
      switch (screenSize) {
        case 'xs':
          finalScale = Math.max(scale, 0.15); // Very small phones
          break;
        case 'sm':
          finalScale = Math.max(scale, 0.2); // Small phones
          break;
        case 'md':
          finalScale = Math.max(scale, 0.25); // Large phones
          break;
        default:
          finalScale = Math.max(scale, 0.3);
      }
      break;
    case 'tablet':
      finalScale = Math.max(scale, 0.35);
      break;
    case 'desktop':
      finalScale = Math.max(scale, 0.4);
      break;
  }
  
  // Ensure we never go below the absolute minimum
  return Math.max(finalScale, minScale);
};

export const shouldShowOrientationWarning = () => {
  const deviceType = getDeviceType();
  const screenSize = getScreenSize();
  
  // Only show warning for very small phones in portrait
  return deviceType === 'phone' && screenSize === 'xs' && isPortrait();
};

export const getTouchAction = (elementType) => {
  switch (elementType) {
    case 'draggable':
      return 'none';
    case 'scrollable':
      return 'pan-y';
    case 'interactive':
      return 'manipulation';
    default:
      return 'auto';
  }
};

export const preventZoom = () => {
  // Prevent zoom on input focus for mobile
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    if (input.style.fontSize === '') {
      input.style.fontSize = '16px';
    }
  });
};

export const setupMobileOptimizations = () => {
  // Prevent zoom on input focus
  preventZoom();
  
  // Add touch-action styles to draggable elements
  const draggableElements = document.querySelectorAll('[data-draggable="true"], .draggable');
  draggableElements.forEach(el => {
    el.style.touchAction = 'none';
    el.style.userSelect = 'none';
    el.style.webkitUserSelect = 'none';
    el.style.mozUserSelect = 'none';
    el.style.msUserSelect = 'none';
  });
  
  // Prevent horizontal scrolling
  document.body.style.overflowX = 'hidden';
  document.body.style.maxWidth = '100vw';
  
  // Setup global touch optimizations
  setupGlobalTouchOptimizations();
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

export const getResponsiveBreakpoints = () => {
  return {
    xs: 360,
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  };
};

export const getCurrentBreakpoint = () => {
  const width = window.innerWidth;
  const breakpoints = getResponsiveBreakpoints();
  
  if (width < breakpoints.xs) return 'xs';
  if (width < breakpoints.sm) return 'sm';
  if (width < breakpoints.md) return 'md';
  if (width < breakpoints.lg) return 'lg';
  if (width < breakpoints.xl) return 'xl';
  return '2xl';
};

export const isSmallScreen = () => {
  return window.innerWidth < 768;
};

export const isVerySmallScreen = () => {
  return window.innerWidth < 480;
};

export const isLandscapeMobile = () => {
  return isMobile() && isLandscape();
};

export const isPortraitMobile = () => {
  return isMobile() && isPortrait();
};
