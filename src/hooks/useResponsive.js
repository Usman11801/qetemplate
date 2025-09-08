import { useState, useEffect } from 'react';
import { 
  isMobile, 
  isTablet, 
  isPhone, 
  getDeviceType, 
  getScreenSize, 
  isLandscape, 
  isPortrait,
  getOptimalScale,
  shouldShowOrientationWarning,
  setupMobileOptimizations
} from '../utils/mobileUtils';

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isPhone: false,
    deviceType: 'desktop',
    screenSize: '2xl',
    isLandscape: false,
    isPortrait: false,
    showOrientationWarning: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      setWindowSize({ width: newWidth, height: newHeight });
      
      setDeviceInfo({
        isMobile: isMobile(),
        isTablet: isTablet(),
        isPhone: isPhone(),
        deviceType: getDeviceType(),
        screenSize: getScreenSize(),
        isLandscape: isLandscape(),
        isPortrait: isPortrait(),
        showOrientationWarning: shouldShowOrientationWarning(),
      });
    };

    // Initial setup
    handleResize();
    setupMobileOptimizations();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const getScale = (originalWidth, originalHeight, availableWidth, availableHeight, minScale = 0.2) => {
    return getOptimalScale(originalWidth, originalHeight, availableWidth, availableHeight, minScale);
  };

  const getResponsiveValue = (values) => {
    const { screenSize } = deviceInfo;
    return values[screenSize] || values.default || values;
  };

  const getResponsiveClass = (classes) => {
    const { screenSize, deviceType } = deviceInfo;
    
    if (typeof classes === 'string') return classes;
    
    const deviceClass = classes[deviceType];
    const sizeClass = classes[screenSize];
    const defaultClass = classes.default;
    
    return [deviceClass, sizeClass, defaultClass].filter(Boolean).join(' ');
  };

  return {
    ...windowSize,
    ...deviceInfo,
    getScale,
    getResponsiveValue,
    getResponsiveClass,
  };
};

export default useResponsive;
