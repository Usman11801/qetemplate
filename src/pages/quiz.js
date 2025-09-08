// Main quiz.js file - after refactoring, this will be mostly imports
import React from "react";
import { ToastProvider } from "../components/Toast";

// Import all the components we're about to create
import { Quiz } from "../components/Quiz/QuizMain";
import '../components/Quiz/QuizStyles.css'

// Add responsive styles
const responsiveStyles = `
  /* Responsive canvas scaling */
  .canvas-wrapper {
    width: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .canvas-container {
    overflow: visible !important;
    transition: all 0.3s ease-out;
    position: relative;
  }
  
  /* Better component positioning */
  .question-component {
    transform-origin: center center;
    touch-action: manipulation;
  }
  
  /* Enhanced mobile touch support */
  @media (max-width: 768px) {
    .question-component {
      touch-action: manipulation;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    
    .question-component input,
    .question-component button,
    .question-component select,
    .question-component textarea {
      font-size: 16px !important; /* Prevent browser zoom on input fields */
      touch-action: manipulation;
    }
    
    .question-component label,
    .question-component span {
      font-size: 14px !important;
    }
    
    /* Better touch targets */
    button, [role="button"] {
      min-height: 44px;
      min-width: 44px;
    }
  }
  
  /* Optimize for landscape phones */
  @media (max-height: 500px) and (orientation: landscape) {
    .quiz-header, .quiz-footer {
      padding: 8px !important;
      margin: 0 !important;
    }
    
    .canvas-wrapper {
      padding: 0 !important;
      margin: 0 !important;
    }
    
    /* Increase text sizes on mobile landscape */
    .question-component input,
    .question-component button,
    .question-component select,
    .question-component span,
    .question-component label {
      font-size: 16px !important;
    }
    
    /* Better touch targets for landscape */
    button, [role="button"] {
      min-height: 48px;
      padding: 12px 16px;
    }
  }
  
  /* Prevent horizontal scrolling */
  body.quiz-active {
    overflow-x: hidden;
    max-width: 100vw;
    position: relative;
  }
  
  /* Extra styling for quiz card */
  .quiz-card {
    max-width: 100%;
    overflow: hidden;
  }
  
  /* Animation for orientation warning */
  @keyframes pulse {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
  }

  .orientation-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  /* Adjust for small landscape screens */
  @media (max-height: 500px) and (orientation: landscape) {
    .quiz-header {
      margin-bottom: 0 !important;
    }
    .quiz-footer {
      margin-top: 0 !important;
    }
  }
  
  /* Adjust for tablets in portrait */
  @media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
    .canvas-wrapper {
      padding-bottom: 1rem;
    }
  }
  
  /* Very small screens optimization */
  @media (max-width: 360px) {
    .question-component input,
    .question-component button,
    .question-component select,
    .question-component textarea {
      font-size: 14px !important;
    }
    
    .question-component label,
    .question-component span {
      font-size: 12px !important;
    }
  }
  
  /* Improve drag and drop on mobile */
  @media (max-width: 768px) {
    [data-draggable="true"], .draggable {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    }
  }
`;

// Add a style tag for the responsive styles
const ResponsiveStyles = () => (
  <style>{responsiveStyles}</style>
);

// Main wrapper component
const QuizWithToast = () => {
  React.useEffect(() => {
    // Add class to body when quiz is active to prevent horizontal scrolling
    document.body.classList.add('quiz-active');
    
    return () => {
      // Remove class when component unmounts
      document.body.classList.remove('quiz-active');
    };
  }, []);

  return (
    <ToastProvider>
      <ResponsiveStyles />
      <Quiz />
    </ToastProvider>
  );
};

// Only one export default
export default QuizWithToast;