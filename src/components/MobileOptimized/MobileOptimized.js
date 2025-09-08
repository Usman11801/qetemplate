import React, { useEffect } from 'react';
import { setupMobileOptimizations } from '../../utils/mobileUtils';

const MobileOptimized = ({ children, className = '', style = {}, ...props }) => {
  useEffect(() => {
    setupMobileOptimizations();
  }, []);

  return (
    <div 
      className={`mobile-optimized ${className}`}
      style={{
        touchAction: 'manipulation',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default MobileOptimized;
