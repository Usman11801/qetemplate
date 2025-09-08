import React, { useState, useEffect } from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { isMobile, isTablet, isPhone, getDeviceType, getScreenSize } from '../../utils/mobileUtils';

const ResponsiveTest = () => {
  const { windowSize, deviceInfo } = useResponsive();
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    // Test responsive functionality
    const tests = {
      canvasScaling: testCanvasScaling(),
      touchSupport: testTouchSupport(),
      viewportFit: testViewportFit(),
      componentPositioning: testComponentPositioning(),
    };
    
    setTestResults(tests);
  }, [windowSize]);

  const testCanvasScaling = () => {
    const canvas = document.querySelector('.canvas-container');
    if (!canvas) return { status: 'fail', message: 'Canvas not found' };
    
    const transform = canvas.style.transform;
    const hasScale = transform.includes('scale(');
    const scaleValue = hasScale ? parseFloat(transform.match(/scale\(([^)]+)\)/)?.[1] || 0) : 0;
    
    return {
      status: scaleValue > 0 ? 'pass' : 'fail',
      message: `Canvas scale: ${scaleValue}`,
      scale: scaleValue
    };
  };

  const testTouchSupport = () => {
    const touchElements = document.querySelectorAll('.question-component');
    let touchSupportCount = 0;
    
    touchElements.forEach(el => {
      const hasTouchAction = el.style.touchAction === 'manipulation' || 
                            el.style.touchAction === 'none';
      if (hasTouchAction) touchSupportCount++;
    });
    
    return {
      status: touchSupportCount > 0 ? 'pass' : 'fail',
      message: `${touchSupportCount}/${touchElements.length} elements have touch support`,
      count: touchSupportCount
    };
  };

  const testViewportFit = () => {
    const canvas = document.querySelector('.canvas-container');
    if (!canvas) return { status: 'fail', message: 'Canvas not found' };
    
    const canvasRect = canvas.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const fitsWidth = canvasRect.width <= viewportWidth;
    const fitsHeight = canvasRect.height <= viewportHeight;
    
    return {
      status: fitsWidth && fitsHeight ? 'pass' : 'fail',
      message: `Canvas fits viewport: ${fitsWidth ? 'width ✓' : 'width ✗'} ${fitsHeight ? 'height ✓' : 'height ✗'}`,
      fitsWidth,
      fitsHeight
    };
  };

  const testComponentPositioning = () => {
    const components = document.querySelectorAll('.question-component');
    let positionedCount = 0;
    
    components.forEach(comp => {
      const hasPosition = comp.style.position === 'absolute';
      const hasTransformOrigin = comp.style.transformOrigin === 'top left';
      if (hasPosition && hasTransformOrigin) positionedCount++;
    });
    
    return {
      status: positionedCount > 0 ? 'pass' : 'fail',
      message: `${positionedCount}/${components.length} components properly positioned`,
      count: positionedCount
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-100';
      case 'fail': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return '✓';
      case 'fail': return '✗';
      default: return '?';
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="text-lg font-bold mb-3 text-gray-800">Responsive Test</h3>
      
      {/* Device Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-sm mb-2">Device Info</h4>
        <div className="text-xs space-y-1">
          <div>Type: {deviceInfo.deviceType}</div>
          <div>Screen: {deviceInfo.screenSize}</div>
          <div>Size: {windowSize.width} × {windowSize.height}</div>
          <div>Orientation: {deviceInfo.isLandscape ? 'Landscape' : 'Portrait'}</div>
          <div>Mobile: {deviceInfo.isMobile ? 'Yes' : 'No'}</div>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm mb-2">Test Results</h4>
        {Object.entries(testResults).map(([testName, result]) => (
          <div key={testName} className={`p-2 rounded text-xs ${getStatusColor(result.status)}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium capitalize">{testName.replace(/([A-Z])/g, ' $1')}</span>
              <span className="font-bold">{getStatusIcon(result.status)}</span>
            </div>
            <div className="mt-1 text-xs opacity-75">{result.message}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={() => window.location.reload()}
          className="w-full px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
        >
          Refresh Tests
        </button>
      </div>
    </div>
  );
};

export default ResponsiveTest;
