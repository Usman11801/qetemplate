// src/components/Quiz/ResizableComponent.js
import React from 'react';
import { getComponentStyle } from './QuizTheme';

const ResizableComponent = ({ comp, defaultWidth, defaultHeight, children, extraStyle = {} }) => {
  // Get the component's style using the helper function
  const baseStyle = getComponentStyle(comp, defaultWidth, defaultHeight);
  
  return (
    <div 
      className="question-component" 
      style={{ 
        ...baseStyle, 
        ...extraStyle,
        // Ensure proper scaling behavior
        transformOrigin: 'top left',
        willChange: 'transform',
        // Add touch support for mobile
        touchAction: 'manipulation',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      <div style={{ 
        width: "100%", 
        height: "100%",
        // Ensure content is properly contained
        overflow: 'hidden',
        position: 'relative'
      }}>
        {children}
      </div>
    </div>
  );
};

export default ResizableComponent;