import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

const LandingPage = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const demoSectionRef = useRef(null);
  const ctaSectionRef = useRef(null);

  // For drag and drop functionality preview
  const [isDragging, setIsDragging] = useState(null);
  const [draggedPosition, setDraggedPosition] = useState({ x: 0, y: 0 });
  const [droppedItems, setDroppedItems] = useState([]);
  const dragAreaRef = useRef(null);
  const [activeComponentId, setActiveComponentId] = useState(null);
  const [interactionStates, setInteractionStates] = useState({});

  // Check if user is logged in, redirect if needed
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Redirect to appropriate page based on admin status
        navigate("/", { replace: true });
      }
    });

    // Initialize animations on scroll
    const handleScroll = () => {
      if (demoSectionRef.current) {
        const demoPosition = demoSectionRef.current.getBoundingClientRect();
        if (demoPosition.top < window.innerHeight * 0.75) {
          setShowAnimation(true);
        }
      }
      
      if (ctaSectionRef.current) {
        const elements = ctaSectionRef.current.querySelectorAll('.animate-on-scroll');
        elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.8) {
            el.classList.add('animate-show');
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, [navigate]);

  // UPDATED: Boundary checking helper
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // UPDATED: Handle drag start for component icons
  const handleDragStart = (e, componentType) => {
    setIsDragging(componentType);
    e.dataTransfer.setData('text/plain', componentType);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggedPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // UPDATED: Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    if (dragAreaRef.current && isDragging) {
      const rect = dragAreaRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - draggedPosition.x;
      const y = e.clientY - rect.top - draggedPosition.y;
      
      const dragPreview = document.getElementById('drag-preview');
      if (dragPreview) {
        dragPreview.style.setProperty('--drag-x', `${x}px`);
        dragPreview.style.setProperty('--drag-y', `${y}px`);
      }
    }
  };

  // UPDATED: Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (!isDragging || !dragAreaRef.current) return;
    
    const rect = dragAreaRef.current.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left - draggedPosition.x, 0, rect.width - 200);
    const y = clamp(e.clientY - rect.top - draggedPosition.y, 0, rect.height - 100);
    
    const newItemId = `item-${Date.now()}`;
    setDroppedItems(prevItems => [
      ...prevItems,
      {
        id: newItemId,
        type: isDragging,
        position: { x, y }
      }
    ]);
    
    // Initialize interaction state for this component with default values
    setInteractionStates(prev => ({
      ...prev,
      [newItemId]: { 
        isActive: false,
        selectedOption: 0, // Default for multiple choice
        value: isDragging === "slider" ? 60 : null, // Default for slider
        isFocused: false // Default for text field
      }
    }));
    
    setIsDragging(null); // Clear dragging state
  };

  // UPDATED: Handle post-drop dragging
  const handleComponentDragStart = (e, id) => {
    e.preventDefault(); // Prevent native drag
    e.stopPropagation(); // Stop event propagation to parent elements
    setActiveComponentId(id);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggedPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    // Add global listeners for move and up
    document.addEventListener('mousemove', handleComponentDrag);
    document.addEventListener('mouseup', handleComponentDragEnd);
  };

  const handleComponentDrag = (e) => {
    if (!activeComponentId || !dragAreaRef.current) return;
    
    const rect = dragAreaRef.current.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left - draggedPosition.x, 0, rect.width - 200); // 200 is component width
    const y = clamp(e.clientY - rect.top - draggedPosition.y, 0, rect.height - 100); // Adjust height as needed
    
    setDroppedItems(items => 
      items.map(item => 
        item.id === activeComponentId 
          ? { ...item, position: { x, y } } 
          : item
      )
    );
  };

  const handleComponentDragEnd = () => {
    setActiveComponentId(null);
    // Clean up global listeners
    document.removeEventListener('mousemove', handleComponentDrag);
    document.removeEventListener('mouseup', handleComponentDragEnd);
  };

  // UPDATED: Touch event handlers
  const handleTouchStart = (e, componentType) => {
    const touch = e.touches[0];
    setIsDragging(componentType);
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggedPosition({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (dragAreaRef.current && isDragging) {
      const touch = e.touches[0];
      const rect = dragAreaRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left - draggedPosition.x;
      const y = touch.clientY - rect.top - draggedPosition.y;
      
      const dragPreview = document.getElementById('drag-preview');
      if (dragPreview) {
        dragPreview.style.setProperty('--drag-x', `${x}px`);
        dragPreview.style.setProperty('--drag-y', `${y}px`);
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (!isDragging || !dragAreaRef.current) return;
    
    const touch = e.changedTouches[0];
    const rect = dragAreaRef.current.getBoundingClientRect();
    const x = clamp(touch.clientX - rect.left - draggedPosition.x, 0, rect.width - 200);
    const y = clamp(touch.clientY - rect.top - draggedPosition.y, 0, rect.height - 100);
    
    const newItemId = `item-${Date.now()}`;
    setDroppedItems(prevItems => [
      ...prevItems,
      {
        id: newItemId,
        type: isDragging,
        position: { x, y }
      }
    ]);
    
    // Initialize interaction state with default values
    setInteractionStates(prev => ({
      ...prev,
      [newItemId]: { 
        isActive: false,
        selectedOption: 0, // Default for multiple choice
        value: isDragging === "slider" ? 60 : null, // Default for slider
        isFocused: false // Default for text field
      }
    }));
    
    setIsDragging(null);
  };

  // UPDATED: Post-drop touch dragging
  const handleComponentTouchStart = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveComponentId(id);
    
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggedPosition({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
    
    document.addEventListener('touchmove', handleComponentTouchMove, { passive: false });
    document.addEventListener('touchend', handleComponentTouchEnd);
  };

  const handleComponentTouchMove = (e) => {
    e.preventDefault();
    if (!activeComponentId || !dragAreaRef.current) return;
    
    const touch = e.touches[0];
    const rect = dragAreaRef.current.getBoundingClientRect();
    const x = clamp(touch.clientX - rect.left - draggedPosition.x, 0, rect.width - 200);
    const y = clamp(touch.clientY - rect.top - draggedPosition.y, 0, rect.height - 100);
    
    setDroppedItems(items => 
      items.map(item => 
        item.id === activeComponentId 
          ? { ...item, position: { x, y } } 
          : item
      )
    );
  };

  const handleComponentTouchEnd = () => {
    setActiveComponentId(null);
    document.removeEventListener('touchmove', handleComponentTouchMove);
    document.removeEventListener('touchend', handleComponentTouchEnd);
  };

  // UPDATED: Reset drag state
  const handleDragEnd = () => {
    setIsDragging(null);
  };

  // COMPLETELY REVISED: Handle component interactions - Fixed all interaction issues
  // Now using direct parameter passing instead of relying on e.currentTarget.dataset
  const handleToggleRadio = (e, id, optionIndex) => {
    e.stopPropagation(); // Prevent triggering drag events
    
    setInteractionStates(prev => ({
      ...prev,
      [id]: { 
        ...prev[id],
        selectedOption: optionIndex 
      }
    }));
  };

  const handleToggleTrueFalse = (e, id, value) => {
    e.stopPropagation(); // Prevent triggering drag events
    
    setInteractionStates(prev => ({
      ...prev,
      [id]: { 
        ...prev[id],
        value: value 
      }
    }));
  };

  const handleUpdateSlider = (e, id, value) => {
    e.stopPropagation(); // Prevent triggering drag events
    
    setInteractionStates(prev => ({
      ...prev,
      [id]: { 
        ...prev[id],
        value: value 
      }
    }));
  };

  const handleFocusTextField = (e, id) => {
    e.stopPropagation(); // Prevent triggering drag events
    
    setInteractionStates(prev => ({
      ...prev,
      [id]: { 
        ...prev[id],
        isFocused: true 
      }
    }));
  };

  const handleBlurTextField = (e, id) => {
    e.stopPropagation(); // Prevent triggering drag events
    
    setInteractionStates(prev => ({
      ...prev,
      [id]: { 
        ...prev[id],
        isFocused: false 
      }
    }));
  };

  // Features data for the features section
  const features = [
    {
      title: "Drag & Drop Builder",
      description: "Create beautiful quizzes with our intuitive drag and drop interface. No coding required.",
      icon: (
        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
        </svg>
      ),
    },
    {
      title: "Dynamic Sessions",
      description: "Create unique quiz sessions for different groups or A/B test different quiz designs.",
      icon: (
        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      ),
    },
    {
      title: "Comprehensive Analytics",
      description: "Get detailed insights into quiz performance and user engagement.",
      icon: (
        <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      ),
    },
    {
      title: "Real-time Results",
      description: "Watch responses roll in as users complete your quizzes.",
      icon: (
        <svg className="w-12 h-12 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      ),
    },
  ];

  // Testimonials data with avatar images
  const testimonials = [
    {
      quote: "Qemplate has transformed how we engage with our students. The analytics are incredibly insightful.",
      author: "Dr. Sarah Johnson",
      role: "Professor of Education",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      organization: {
        name: "Cambridge University"
      }
    },
    {
      quote: "The drag and drop interface makes creating professional quizzes a breeze. I can focus on content, not technical details.",
      author: "Mark Williams",
      role: "Corporate Trainer",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      organization: {
        name: "Global Learning Ltd"
      }
    },
    {
      quote: "We use Qemplate for all our market research surveys. The A/B testing feature has helped us optimise our approach.",
      author: "Emma Chen",
      role: "Marketing Director",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      organization: {
        name: "Innovate Media"
      }
    },
  ];

  // COMPLETELY REVISED: Quiz component types for the drag and drop demo - with fixed interactions
  const componentTypes = [
    {
      id: "multiple_choice",
      name: "Multiple Choice",
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
      color: "bg-blue-500",
      textColor: "text-white", // Keep text white for the component button
      shadowColor: "shadow-blue-500/50",
      previewTemplate: ({ id, interactionState = { selectedOption: 0 } }) => (
        <div className="bg-white rounded-lg p-3 shadow-lg w-full">
          <div className="text-sm font-medium mb-2 text-gray-800">Select the correct answer:</div>
          <div className="space-y-2">
            {["Option A", "Option B", "Option C"].map((option, idx) => (
              <div 
                key={idx} 
                className="flex items-center cursor-pointer" 
                onClick={(e) => handleToggleRadio(e, id, idx)}
                onTouchStart={(e) => handleToggleRadio(e, id, idx)}
              >
                <div 
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                    interactionState.selectedOption === idx 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}
                >
                  {interactionState.selectedOption === idx && 
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  }
                </div>
                <span className="text-gray-800">{option}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "true_false",
      name: "True/False",
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ),
      color: "bg-green-500",
      textColor: "text-white", // Keep text white for the component button
      shadowColor: "shadow-green-500/50",
      previewTemplate: ({ id, interactionState = { value: null } }) => (
        <div className="bg-white rounded-lg p-2 shadow-lg w-full flex overflow-hidden">
          <div 
            className={`w-1/2 ${interactionState.value === true ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'} 
              font-medium flex items-center justify-center py-2 cursor-pointer transition-colors`}
            onClick={(e) => handleToggleTrueFalse(e, id, true)}
            onTouchStart={(e) => handleToggleTrueFalse(e, id, true)}
          >
            True
          </div>
          <div 
            className={`w-1/2 ${interactionState.value === false ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'} 
              font-medium flex items-center justify-center py-2 cursor-pointer transition-colors`}
            onClick={(e) => handleToggleTrueFalse(e, id, false)}
            onTouchStart={(e) => handleToggleTrueFalse(e, id, false)}
          >
            False
          </div>
        </div>
      )
    },
    {
      id: "text",
      name: "Text Field",
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      ),
      color: "bg-purple-500",
      textColor: "text-white", // Keep text white for the component button
      shadowColor: "shadow-purple-500/50",
      previewTemplate: ({ id, interactionState = { isFocused: false } }) => (
        <div className="bg-white rounded-lg p-3 shadow-lg w-full">
          <div className="text-sm font-medium mb-2 text-gray-800">Enter your answer:</div>
          <div 
            className={`border-b-2 ${interactionState.isFocused ? 'border-purple-500' : 'border-gray-300'} 
              w-full py-1 cursor-text transition-colors`}
            onClick={(e) => handleFocusTextField(e, id)}
            onTouchStart={(e) => handleFocusTextField(e, id)}
            onBlur={(e) => handleBlurTextField(e, id)}
          ></div>
        </div>
      )
    },
    {
      id: "matching_pairs",
      name: "Matching",
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
      ),
      color: "bg-pink-500",
      textColor: "text-white", // Keep text white for the component button
      shadowColor: "shadow-pink-500/50",
      previewTemplate: ({ id }) => (
        <div className="bg-white rounded-lg p-3 shadow-lg w-full">
          <div className="text-sm font-medium mb-2 text-gray-800">Match the items:</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-2 rounded border border-gray-200 text-gray-800 cursor-move">Item A</div>
            <div className="bg-gray-50 p-2 rounded border border-gray-200 text-gray-800 cursor-move">Match 2</div>
            <div className="bg-gray-50 p-2 rounded border border-gray-200 text-gray-800 cursor-move">Item B</div>
            <div className="bg-gray-50 p-2 rounded border border-gray-200 text-gray-800 cursor-move">Match 1</div>
          </div>
        </div>
      )
    },
    {
      id: "slider",
      name: "Slider",
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
      ),
      color: "bg-amber-500",
      textColor: "text-white", // Keep text white for the component button
      shadowColor: "shadow-amber-500/50",
      previewTemplate: ({ id, interactionState = { value: 60 } }) => {
        // Always ensure a default value
        const value = typeof interactionState.value === 'number' ? interactionState.value : 60;
        
        return (
          <div className="bg-white rounded-lg p-3 shadow-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-medium mb-2 text-gray-800">Set the value:</div>
            <div className="relative h-1 bg-gray-200 rounded w-full">
              <div className="absolute h-full bg-amber-500 rounded" style={{ width: `${value}%` }}></div>
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-500" style={{ left: `${value}%` }}></div>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(e) => {
                // Get value directly from the event target
                const sliderValue = parseInt(e.target.value, 10);
                handleUpdateSlider(e, id, sliderValue);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
              style={{ zIndex: 1 }}
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-800">0</span>
              <span className="text-xs text-gray-800">100</span>
            </div>
          </div>
        );
      }
    }
  ];

  // UPDATED: Component preview for drag and drop demo
  const ComponentPreview = ({ item }) => {
    const component = componentTypes.find(c => c.id === item.type);
    if (!component) return null;
    
    // Ensure we always have a valid interactionState with defaults
    const interactionState = interactionStates[item.id] || {
      selectedOption: 0,
      value: item.type === "slider" ? 60 : null,
      isFocused: false
    };
    
    return (
      <div 
        className="absolute transform transition-transform cursor-grab"
        style={{ 
          top: item.position.y, 
          left: item.position.x,
          zIndex: activeComponentId === item.id ? 100 : 10,
          width: '200px'
        }}
        onMouseDown={(e) => handleComponentDragStart(e, item.id)}
        onTouchStart={(e) => handleComponentTouchStart(e, item.id)}
      >
        {component.previewTemplate({ id: item.id, interactionState })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col text-white">
      {/* Header - updated with gradient */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-opacity-90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            {/* Replace with your actual logo */}
            <div className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              Qemplate
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="hover:text-teal-400 transition-colors">
              Features
            </a>
            <a href="#demo" className="hover:text-teal-400 transition-colors">
              Demo
            </a>
            <a href="#testimonials" className="hover:text-teal-400 transition-colors">
              Testimonials
            </a>
            <Link
              to="/login"
              className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-medium px-6 py-2 rounded-full transition-all transform hover:scale-105"
            >
              Login
            </Link>
          </nav>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 py-4">
            <div className="container mx-auto px-4 flex flex-col space-y-4">
              <a
                href="#features"
                className="hover:text-teal-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#demo"
                className="hover:text-teal-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Demo
              </a>
              <a
                href="#testimonials"
                className="hover:text-teal-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </a>
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-medium px-6 py-2 rounded-full text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section - enhanced with animated particles */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -left-20 top-40 w-80 h-80 bg-teal-400 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute right-20 bottom-20 w-64 h-64 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
          
          {/* Animated particles for added visual interest */}
          <div className="hidden md:block">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-teal-400 opacity-20"
                style={{
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 10 + 15}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                The Ultimate Drag-and-Drop Quiz Builder
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10">
              Create engaging quizzes, manage dynamic sessions, and analyse results in real-time – 
              all in one intuitive platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-bold px-8 py-4 rounded-full text-lg transition-all transform hover:scale-105 hover:shadow-glow-blue"
              >
                Get Started
              </Link>
              <a
                href="#demo"
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-8 py-4 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Watch Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - updated with more visual separation */}
      <section id="features" className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
        <div className="absolute inset-0 bg-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Everything you need to create, distribute, and analyse quizzes in one intuitive platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 shadow-xl transition-all hover:transform hover:scale-105 hover:shadow-glow-blue border border-gray-700"
              >
                <div className="mb-4 transform transition-transform hover:scale-110">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section - improved video container */}
      <section id="demo" ref={demoSectionRef} className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 bottom-0 w-96 h-96 bg-blue-800 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute right-0 top-0 w-96 h-96 bg-teal-800 rounded-full opacity-10 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                  See Qemplate in Action
                </span>
              </h2>
              <p className="text-lg text-gray-300">
                Watch how easy it is to create engaging quizzes and analyse results.
              </p>
            </div>

            {/* Video Demo - improved with proper aspect ratio and visual styling */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
              <div className="aspect-w-16 aspect-h-9 relative">
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 transform hover:scale-110 transition-transform cursor-pointer hover:bg-opacity-30 group">
                      <svg className="w-12 h-12 text-white group-hover:text-teal-400 transition-colors" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <p className="text-gray-300 text-lg">Demo Video</p>
                  </div>
                </div>
              </div>
            </div>

            {/* UPDATED: Improved Drag and Drop Demo - DESKTOP VERSION */}
            <div className="mt-16 relative hidden md:block">
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 shadow-2xl rounded-lg overflow-hidden mx-auto max-w-4xl relative">
                {/* Demo Canvas with components */}
                <div 
                  className="w-full min-h-[400px] bg-gray-800 relative overflow-hidden"
                  ref={dragAreaRef}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Grid Background for Canvas */}
                  <div className="absolute inset-0 bg-grid opacity-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-transparent opacity-30"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full max-w-md h-48 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <p className="text-gray-400 z-10">Drag components here</p>
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-5 pulse-animation"></div>
                    </div>
                  </div>
                  
                  {/* Dropped components - now draggable and interactive */}
                  {droppedItems.map(item => (
                    <ComponentPreview key={item.id} item={item} />
                  ))}
                  
                  {/* Drag Preview */}
                  {isDragging && (
                    <div 
                      id="drag-preview"
                      className="absolute pointer-events-none"
                      style={{ 
                        top: 'var(--drag-y, 0px)', 
                        left: 'var(--drag-x, 0px)',
                        zIndex: 1000,
                        width: '200px',
                        opacity: 0.8,
                        transform: 'scale(0.95)'
                      }}
                    >
                      {componentTypes.find(c => c.id === isDragging)?.previewTemplate({
                        id: "preview",
                        interactionState: {
                          selectedOption: 0,
                          value: isDragging === "slider" ? 60 : null,
                          isFocused: false
                        }
                      })}
                    </div>
                  )}
                  
                  {/* UPDATED: Component Palette - DESKTOP ONLY */}
                  <div className="absolute right-8 top-8 flex flex-col gap-3">
                    {componentTypes.map(component => (
                      <div
                        key={component.id}
                        className={`${component.color} rounded-lg p-3 shadow-lg ${component.shadowColor} ${component.textColor} cursor-grab hover:scale-105 transition-transform`}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, component.id)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={(e) => handleTouchStart(e, component.id)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        <div className="flex items-center gap-2">
                          {component.icon}
                          <span className="text-sm font-medium">{component.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* UPDATED: MOBILE VERSION of the Drag and Drop Demo */}
            <div className="mt-16 relative md:hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 shadow-2xl rounded-lg overflow-hidden mx-auto max-w-sm relative">
                {/* Demo Canvas with components */}
                <div 
                  className="w-full h-64 bg-gray-800 relative overflow-hidden"
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Grid Background for Canvas */}
                  <div className="absolute inset-0 bg-grid opacity-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-transparent opacity-30"></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-[200px] h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <p className="text-gray-400 z-10 text-center text-sm px-4">Tap components below to add them</p>
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-5 pulse-animation"></div>
                    </div>
                  </div>
                  
                  {/* Dropped components for mobile */}
                  {droppedItems.slice(0, 3).map((item, index) => (
                    <div 
                      key={item.id}
                      className="absolute transform transition-transform" 
                      style={{ 
                        top: `${85 + (index * 15)}px`, 
                        left: `${50 + (index * 10)}px`,
                        zIndex: 10 + index,
                        width: '160px',
                        transform: 'scale(0.85)'
                      }}
                      onTouchStart={(e) => handleComponentTouchStart(e, item.id)}
                    >
                      {componentTypes.find(c => c.id === item.type)?.previewTemplate({ 
                        id: item.id, 
                        interactionState: interactionStates[item.id] || {
                          selectedOption: 0,
                          value: item.type === "slider" ? 60 : null,
                          isFocused: false
                        }
                      })}
                    </div>
                  ))}
                  
                  {/* UPDATED: Mobile Component Palette */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm p-3 border-t border-gray-700">
                    <div className="grid grid-cols-5 gap-2">
                      {componentTypes.map(component => (
                        <div
                          key={component.id}
                          className={`${component.color} rounded-lg p-2 flex items-center justify-center ${component.shadowColor} cursor-pointer touch-manipulation active:scale-95 transition-transform`}
                          onTouchStart={(e) => handleTouchStart(e, component.id)}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                        >
                          {component.icon}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps - enhanced with animations */}
            <div className="mt-16 grid md:grid-cols-3 gap-8">
              <div 
                className={`bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 transform transition-all ${showAnimation ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '0ms' }}
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4 text-xl font-bold shadow-glow-blue">1</div>
                <h3 className="text-xl font-bold mb-2">Create Your Quiz</h3>
                <p className="text-gray-300">Drag and drop question types, customise themes, and set scoring options.</p>
              </div>
              <div 
                className={`bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 transform transition-all ${showAnimation ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '150ms' }}
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4 text-xl font-bold shadow-glow-green">2</div>
                <h3 className="text-xl font-bold mb-2">Share Sessions</h3>
                <p className="text-gray-300">Generate unique sessions for different audiences or A/B test quiz variations.</p>
              </div>
              <div 
                className={`bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 shadow-xl border border-gray-700 transform transition-all ${showAnimation ? 'animate-slide-up opacity-100' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: '300ms' }}
              >
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4 text-xl font-bold shadow-glow-purple">3</div>
                <h3 className="text-xl font-bold mb-2">Analyse Results</h3>
                <p className="text-gray-300">Get detailed insights and visualisations of quiz performance and user engagement.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - enhanced with better card design and avatars, removed organization icons */}
      <section id="testimonials" className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
        <div className="absolute inset-0 bg-pattern-dots opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                What People Are Saying
              </span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Join educators, trainers, and businesses already using Qemplate to engage their audiences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-8 shadow-xl relative transform hover:scale-105 transition-all border border-gray-700 overflow-hidden"
              >
                {/* Top curved decorator */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-400 to-blue-500 rounded-t-xl"></div>
                
                <svg
                  className="w-12 h-12 text-gray-600 absolute top-12 left-6 opacity-30"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <div className="relative z-10">
                  <p className="text-gray-300 mb-8 italic">{testimonial.quote}</p>
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.author} 
                      className="w-12 h-12 rounded-full mr-4 border-2 border-teal-400"
                    />
                    <div>
                      <p className="font-bold">{testimonial.author}</p>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                      <p className="text-xs text-teal-400">{testimonial.organization.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section with Lucide-like icons and fixed styling to match the image */}
      <section 
        ref={ctaSectionRef}
        className="py-20 relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900"
      >
        {/* Dynamic animated background */}
        <div className="absolute inset-0">
          {/* Animated geometric shapes */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-blue-500 opacity-10 blur-xl animate-pulse"
                style={{
                  width: `${Math.random() * 200 + 100}px`,
                  height: `${Math.random() * 200 + 100}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 5 + 5}s`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              ></div>
            ))}
            
            {/* Floating particle effects */}
            {[...Array(20)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className="absolute bg-blue-400 rounded-full opacity-30 animate-float-y"
                style={{
                  width: `${Math.random() * 6 + 2}px`,
                  height: `${Math.random() * 6 + 2}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 10 + 10}s`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              ></div>
            ))}
          </div>
          
          {/* Mesh grid overlay */}
          <div className="absolute inset-0 bg-mesh-grid opacity-10"></div>
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-on-scroll transform transition-transform duration-1000 opacity-0 translate-y-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                <span className="bg-gradient-to-r from-teal-300 to-blue-300 bg-clip-text text-transparent">
                  Ready to Transform Your Quizzes?
                </span>
              </h2>
              <p className="text-lg md:text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
                Join thousands of educators and businesses already using Qemplate to create engaging quizzes and gather valuable insights.
              </p>
            </div>
            
            {/* Animated features list with Lucide-style icons */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="animate-on-scroll glass-card p-4 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm transform hover:scale-105 transition-all hover:bg-opacity-15 hover:shadow-glow-blue">
                <div className="h-12 w-12 mx-auto mb-3 text-white flex items-center justify-center animate-float-slow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L12 13"></path>
                    <path d="M22 2l-7 20-3-9-9-3 20-7z"></path>
                  </svg>
                </div>
                <p className="text-white font-medium">Launch in minutes</p>
              </div>
              
              <div className="animate-on-scroll glass-card p-4 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm transform hover:scale-105 transition-all hover:bg-opacity-15 hover:shadow-glow-blue" style={{ transitionDelay: '100ms' }}>
                <div className="h-12 w-12 mx-auto mb-3 text-white flex items-center justify-center animate-float-slow" style={{ animationDelay: '0.2s' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 8v13H3V8"></path>
                    <path d="M1 3h22v5H1z"></path>
                    <path d="M10 12h4"></path>
                  </svg>
                </div>
                <p className="text-white font-medium">Detailed analytics</p>
              </div>
              
              <div className="animate-on-scroll glass-card p-4 rounded-lg bg-white bg-opacity-10 backdrop-blur-sm transform hover:scale-105 transition-all hover:bg-opacity-15 hover:shadow-glow-blue" style={{ transitionDelay: '200ms' }}>
                <div className="h-12 w-12 mx-auto mb-3 text-white flex items-center justify-center animate-float-slow" style={{ animationDelay: '0.4s' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                    <path d="M16 16h5v5"></path>
                  </svg>
                </div>
                <p className="text-white font-medium">Continuous updates</p>
              </div>
            </div>
            
            {/* Animated CTA button */}
            <div className="animate-on-scroll" style={{ transitionDelay: '300ms' }}>
              <Link
                to="/login"
                className="inline-block bg-gradient-to-r from-blue-400 to-teal-400 hover:from-blue-500 hover:to-teal-500 text-white font-bold px-10 py-5 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-glow-blue animate-pulse-subtle relative overflow-hidden"
              >
                <span className="relative z-10">Get Started for Free</span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-500 opacity-0 hover:opacity-100 transition-opacity"></span>
              </Link>
              
              <p className="mt-6 text-blue-200 text-sm animate-on-scroll" style={{ transitionDelay: '400ms' }}>
                No credit card required • Free forever plan available
              </p>
            </div>
          </div>
        </div>
        
      </section>

      {/* Footer - enhanced with better visual separation */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 py-12 relative">
        <div className="absolute inset-0 bg-pattern-grid opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent mb-4">
                Qemplate
              </div>
              <p className="text-gray-400 mb-4">
                The ultimate quiz platform for educators and businesses.
              </p>
              <div className="flex space-x-4">
                <a href="https://twitter.com" className="text-gray-400 hover:text-teal-400 transition-colors group" aria-label="Twitter">
                  <div className="w-10 h-10 rounded-full bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </div>
                </a>
                <a href="https://linkedin.com" className="text-gray-400 hover:text-teal-400 transition-colors group" aria-label="LinkedIn">
                  <div className="w-10 h-10 rounded-full bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                </a>
                <a href="https://instagram.com" className="text-gray-400 hover:text-teal-400 transition-colors group" aria-label="Instagram">
                  <div className="w-10 h-10 rounded-full bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </div>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-teal-400 transition-colors">Features</a></li>
                <li><a href="#demo" className="text-gray-400 hover:text-teal-400 transition-colors">Demo</a></li>
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Qemplate. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom animation styles */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes float-slow {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes float-y {
          0% { transform: translateY(100vh); opacity: 0.5; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
        
        @keyframes pulse-animation {
          0% { opacity: 0.1; }
          50% { opacity: 0.3; }
          100% { opacity: 0.1; }
        }
        
        @keyframes pulse-subtle {
          0% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.7); }
          100% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 3s infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 3s ease-in-out infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        
        @keyframes slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .animate-show {
          opacity: 1;
          transform: translateY(0);
        }
        
        .shadow-glow-blue {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
        }
        
        .shadow-glow-green {
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
        }
        
        .shadow-glow-purple {
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
        }
        
        .shadow-glow-pink {
          box-shadow: 0 0 15px rgba(236, 72, 153, 0.5);
        }
        
        .shadow-glow-amber {
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.5);
        }
        
        .glass-card {
          backdrop-filter: blur(8px);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        
        .glass-card:hover {
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2), 
                     0 4px 20px rgba(0, 0, 0, 0.2);
        }
        
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
        }
        
        .bg-pattern-dots {
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 20px 20px;
        }
        
        .bg-pattern-grid {
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm1 1v18h18V1H1z' fill='%23ffffff' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E");
          background-size: 20px 20px;
        }
        
        .bg-grid {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
        }
        
        .bg-mesh-grid {
          background-size: 50px 50px;
          background-image: radial-gradient(circle, white 1px, transparent 1px);
        }
        
        .drag-items-container > div {
          transition: transform 0.2s ease;
        }
        
        .drag-items-container > div:hover {
          transform: translateX(-5px) scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;