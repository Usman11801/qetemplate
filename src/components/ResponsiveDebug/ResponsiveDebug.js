import React, { useState, useEffect } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

const ResponsiveDebug = () => {
  const { windowSize, deviceInfo } = useResponsive();
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    // Check if we're in development mode
    const isDev = process.env.NODE_ENV === 'development';
    setIsVisible(isDev);

    if (isDev) {
      // Gather debug information
      const canvas = document.querySelector('.canvas-container');
      const formCanvas = document.querySelector('[style*="transform: translateX(-50%) scale("]');
      const quizCanvas = document.querySelector('[style*="transform: scale("]');
      
      setDebugInfo({
        canvas: canvas ? {
          found: true,
          transform: canvas.style.transform,
          width: canvas.style.width,
          height: canvas.style.height
        } : { found: false },
        formCanvas: formCanvas ? {
          found: true,
          transform: formCanvas.style.transform
        } : { found: false },
        quizCanvas: quizCanvas ? {
          found: true,
          transform: quizCanvas.style.transform
        } : { found: false }
      });
    }
  }, [windowSize]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Responsive Debug</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-300"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>Device:</strong> {deviceInfo.deviceType} ({deviceInfo.screenSize})
        </div>
        <div>
          <strong>Size:</strong> {windowSize.width} × {windowSize.height}
        </div>
        <div>
          <strong>Orientation:</strong> {deviceInfo.isLandscape ? 'Landscape' : 'Portrait'}
        </div>
        <div>
          <strong>Mobile:</strong> {deviceInfo.isMobile ? 'Yes' : 'No'}
        </div>
        
        <div className="border-t border-gray-600 pt-2">
          <strong>Canvas Status:</strong>
          <div className="ml-2">
            <div>Canvas: {debugInfo.canvas?.found ? '✓' : '✗'}</div>
            <div>Form Canvas: {debugInfo.formCanvas?.found ? '✓' : '✗'}</div>
            <div>Quiz Canvas: {debugInfo.quizCanvas?.found ? '✓' : '✗'}</div>
          </div>
        </div>
        
        {debugInfo.canvas?.found && (
          <div className="border-t border-gray-600 pt-2">
            <strong>Canvas Transform:</strong>
            <div className="ml-2 text-xs break-all">
              {debugInfo.canvas.transform || 'None'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsiveDebug;
