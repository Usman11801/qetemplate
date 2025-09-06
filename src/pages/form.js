import React, { useRef, useCallback, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ChevronLeft,
  PencilLine,
  Save,
  Users,
  Bot,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

// Components
import Sidebar from "../components/Form/Sidebar";
import Toolbar from "../components/Form/Toolbar";
import RightToolbar from "../components/Form/RightToolbar";
import FormInfo from "../components/Form/FormInfo";
import Canvas from "../components/Form/Canvas";
import ChatBox from "../components/ChatBox";
import Loading from "../pages/loading";
import SuccessOverlay from "../pages/successoverlay";

import { useFormState } from "../hooks/useFormState";
import { useToast } from "../components/Toast";
import LineToolBar from "../components/Form/Toolbar/lineToolBar";
import CheckBoxToolBar from "../components/Form/Toolbar/checkBoxToolBar";
import TrueFalseToolbar from "../components/Form/Toolbar/trueFalseToolbar";
import SingleChoiceToolbar from "../components/Form/Toolbar/MCSingleSelectToolbar";
import MCSingleSelectToolbar from "../components/Form/Toolbar/MCSingleSelectToolbar";
import MCMultipleSelectToolbar from "../components/Form/Toolbar/MCMultipleSelectToolbar";
import ShortTextboxToolbar from "../components/Form/Toolbar/ShortTextboxToolbar";
import ToggleBoxToolbar from "../components/Form/Toolbar/ToggleBoxToolbar";
import RankingComponentToolbar from "../components/Form/Toolbar/RankingToolbar";
import NumericSliderToolbar from "../components/Form/Toolbar/NumericSliderToolbar";
import DiscreteSliderToolbar from "../components/Form/Toolbar/DiscreteSliderToolbar";
import MatchingPairsToolbar from "../components/Form/Toolbar/MachingPairsToolbar";

const ORIGINAL_WIDTH = 800;
const ORIGINAL_HEIGHT = 600;
const TOOLBAR_ORIGINAL_WIDTH = 400;
const TOOLBAR_ORIGINAL_HEIGHT = 144;

const Form = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const toolbarRef = useRef(null);
  const canvasRef = useRef(null);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(
    windowWidth >= 768
  );
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(
    windowWidth >= 768
  );
  const [showOrientationWarning, setShowOrientationWarning] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { addToast } = useToast();

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      setWindowWidth(newWidth);
      setWindowHeight(newHeight);

      // Show orientation warning for mobile devices in portrait mode
      if (newWidth < 768 && newWidth < newHeight) {
        setShowOrientationWarning(true);
      } else {
        setShowOrientationWarning(false);
      }

      if (newWidth < 768 && (isLeftSidebarOpen || isRightSidebarOpen)) {
        setIsLeftSidebarOpen(false);
        setIsRightSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [windowWidth, windowHeight, isLeftSidebarOpen, isRightSidebarOpen]);

  // console.log(windowHeight, " windowHeight");

  const {
    formTitle,
    setFormTitle,
    formDescription,
    setFormDescription,
    category,
    setCategory,
    formImage,
    setFormImage,
    questions,
    activeQuestionId,
    setActiveQuestionId,
    showFormInfo,
    setShowFormInfo,
    handleDeleteQuestion,
    handleReorderQuestions,
    handleAddQuestion,
    saveToFirebase,
    handleComponentUpdate,
    handleDeleteComponent,
    handleDrop,
    handleQuestionUpdate,
    isSaving,
    // -----toolbar-----
    handleDoubleClick,
    editingComponent,
    showLineEditor,
    showCheckboxEditor,
    showTrueFalseEditor,
    showSingleChoiceEditor,
    showMultiChoiceEditor,
    showShortTextEditor,
    showTextEditor,
    showToggleBoxEditor,
    showRankingEditor,
    showDiscreteSliderEditor,
    showNumericSliderEditor,
    showMatchingPairsEditor,
    saveFormDetails,
  } = useFormState(formId);

  const handleQuestionsAdded = useCallback((count, newQuestionIds) => {
    setShowChatBox(false);
    setSuccessMessage(
      `${count} question${count !== 1 ? "s" : ""} added successfully!`
    );
    setShowSuccessOverlay(true);
    // Reload is handled in ChatBox.js after the overlay duration
  }, []);

  const handleFormImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFormImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBack = useCallback(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      .form-info-overlay {
        z-index: 40 !important;
      }
      .form-info-overlay::before {
        content: "";
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        z-index: -1;
      }
      .form-info-content {
        margin-bottom: 2rem !important;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  // const [scale, setScale] = useState(1);

  // Calculate scale for canvas and toolbar based on available space
  // useEffect(() => {
  //   const topNavHeight = 72;
  //   // const bottomToolbarHeight = 144;
  //   const availablePadding = 24;
  //   const maxAttemptBoxHeight = 68;

  //       // Get bottom toolbar height dynamically
  //   let bottomToolbarHeight = 144;
  //   if (toolbarRef.current) {
  //     bottomToolbarHeight = toolbarRef.current.offsetHeight || 0;
  //   }

  //   let availableWidth = windowWidth;
  //   if (isLeftSidebarOpen && windowWidth >= 768) {
  //     availableWidth -= leftSidebarWidth;
  //   }
  //   if (isRightSidebarOpen && windowWidth >= 768) {
  //     availableWidth -= rightSidebarWidth;
  //   }
  //   availableWidth -= availablePadding * 2;

  //   const availableHeight =
  //     windowHeight -
  //     topNavHeight -
  //     bottomToolbarHeight -
  //     maxAttemptBoxHeight -
  //     availablePadding * 2;

  //   const widthScale = availableWidth / ORIGINAL_WIDTH;
  //   const heightScale = availableHeight / ORIGINAL_HEIGHT;

  //   const newScale = Math.min(widthScale, heightScale, 1);
  //   setScale(Math.max(0.3, newScale));
  // }, [
  //   windowWidth,
  //   windowHeight,
  //   isLeftSidebarOpen,
  //   isRightSidebarOpen,
  //   leftSidebarWidth,
  //   rightSidebarWidth,
  // ]);

  // Sidebar widths
  const leftSidebarWidth = windowWidth < 1280 ? 240 : 280;
  const rightSidebarWidth = 64;

  // Scales
  const [canvasScale, setCanvasScale] = useState(1);
  const [toolbarScale, setToolbarScale] = useState(1);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);

      if (
        window.innerWidth < 768 &&
        (isLeftSidebarOpen || isRightSidebarOpen)
      ) {
        setIsLeftSidebarOpen(false);
        setIsRightSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // call once to initialize

    return () => window.removeEventListener("resize", handleResize);
  }, [isLeftSidebarOpen, isRightSidebarOpen]);

  // Calculate scales for Canvas and Toolbar separately
  useEffect(() => {
    const calculateScales = () => {
      const topNavHeight = 72;
      const availablePadding = 24;
      const maxAttemptBoxHeight = 68;

      // Calculate available width excluding sidebars and padding
      let availableWidth = windowWidth;
      if (isLeftSidebarOpen && windowWidth >= 768) {
        availableWidth -= leftSidebarWidth;
      }
      if (isRightSidebarOpen && windowWidth >= 768) {
        availableWidth -= rightSidebarWidth;
      }
      availableWidth -= availablePadding * 2;

      // Toolbar dynamic height
      let bottomToolbarHeight = TOOLBAR_ORIGINAL_HEIGHT;
      if (toolbarRef.current) {
        bottomToolbarHeight =
          toolbarRef.current.offsetHeight || TOOLBAR_ORIGINAL_HEIGHT;
      }

      // Canvas current height (unscaled)
      let canvasActualHeight = ORIGINAL_HEIGHT;
      if (canvasRef.current) {
        canvasActualHeight = canvasRef.current.offsetHeight || ORIGINAL_HEIGHT;
      }

      // Calculate available height for canvas
      const availableHeightForCanvas =
        windowHeight -
        topNavHeight -
        bottomToolbarHeight -
        maxAttemptBoxHeight -
        availablePadding * 2;

      // Canvas scale (fit inside available width and height)
      const widthScale = availableWidth / ORIGINAL_WIDTH;
      const heightScale = availableHeightForCanvas / ORIGINAL_HEIGHT;
      const newCanvasScale = Math.min(widthScale, heightScale, 1);
      
      // Enhanced mobile scaling with better minimum values
      let finalScale = newCanvasScale;
      if (windowWidth < 480) {
        finalScale = Math.max(0.15, newCanvasScale); // Even smaller minimum for very small phones
      } else if (windowWidth < 768) {
        finalScale = Math.max(0.2, newCanvasScale);
      } else {
        finalScale = Math.max(0.3, newCanvasScale);
      }
      
      setCanvasScale(finalScale);

      // Calculate available height for toolbar (space remaining after canvas)
      const availableHeightForToolbar =
        windowHeight -
        topNavHeight -
        maxAttemptBoxHeight -
        availablePadding * 2 -
        canvasActualHeight;

      const toolbarWidthScale = availableWidth / TOOLBAR_ORIGINAL_WIDTH;
      const toolbarHeightScale =
        (availableHeightForToolbar / TOOLBAR_ORIGINAL_HEIGHT) * 0.8;
      const newToolbarScale = Math.min(
        toolbarWidthScale,
        toolbarHeightScale,
        1
      );
      
      // Enhanced toolbar scaling for mobile
      let finalToolbarScale = newToolbarScale;
      if (windowWidth < 480) {
        finalToolbarScale = Math.max(0.15, newToolbarScale);
      } else if (windowWidth < 768) {
        finalToolbarScale = Math.max(0.2, newToolbarScale);
      } else {
        finalToolbarScale = Math.max(0.3, newToolbarScale);
      }
      
      setToolbarScale(finalToolbarScale);
    };

    calculateScales();
  }, [
    windowWidth,
    windowHeight,
    isLeftSidebarOpen,
    isRightSidebarOpen,
    leftSidebarWidth,
    rightSidebarWidth,
  ]);
  console.log(
    toolbarScale,
    "toolbar scale value",
    windowHeight,
    "window Height"
  );

  return (
    <div className="min-h-screen bg-gray-100 fixed inset-0 flex flex-col">
      <SuccessOverlay
        show={showSuccessOverlay}
        message={successMessage}
        onClose={() => setShowSuccessOverlay(false)}
      />

      {showOrientationWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[100] flex flex-col items-center justify-center text-white p-6">
          <div className="transform rotate-90 mb-4">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V5Z"
                stroke="white"
                strokeWidth="2"
              />
              <path
                d="M9 16L15 8"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="9" cy="8" r="1" fill="white" />
              <circle cx="15" cy="16" r="1" fill="white" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Please Rotate Your Device</h2>
          <p className="text-center mb-4">
            The form builder works best in landscape mode on mobile devices. This gives you more space to create and edit your forms.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowOrientationWarning(false)}
              className="px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
            >
              Continue Anyway
            </button>
            <button
              onClick={() => {
                // Try to trigger orientation change
                if (screen.orientation && screen.orientation.lock) {
                  screen.orientation.lock('landscape');
                }
                setShowOrientationWarning(false);
              }}
              className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Rotate Now
            </button>
          </div>
        </div>
      )}

      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
          <Loading
            text="Saving form..."
            type="spinner"
            theme="blue"
            size="large"
          />
        </div>
      )}

      {isLoadingQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center">
          <Loading
            text="Updating questions..."
            type="dots"
            theme="light"
            size="large"
          />
        </div>
      )}

      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm px-4 md:px-6 py-4 flex items-center overflow-visible">
        {!isLeftSidebarOpen && (
          <button
            onClick={() => setIsLeftSidebarOpen(true)}
            className="mr-4 p-1.5 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
        )}

        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="hidden sm:inline">Back to Forms</span>
        </button>

        <div className="ml-auto flex items-center gap-2 md:gap-4 overflow-visible">
          <button
            onClick={() => setShowFormInfo((prev) => !prev)}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow whitespace-nowrap"
          >
            <PencilLine size={16} />
            <span className="hidden sm:inline">Edit Form Info</span>
          </button>

          <button
            onClick={saveToFirebase}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors whitespace-nowrap"
            disabled={isSaving}
          >
            <Save size={16} />
            <span className="hidden sm:inline">Save Form</span>
          </button>

          <button
            onClick={() => {
              navigate(`/sessions/${formId}`);
            }}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors whitespace-nowrap"
          >
            <Users size={16} />
            <span className="hidden sm:inline">Go to Sessions</span>
          </button>

          <button
            onClick={() => setShowChatBox(true)}
            className="group relative flex items-center gap-2 px-2 md:px-4 py-2 rounded-xl 
              bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
              hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600
              text-white shadow-lg transition-all duration-300 hover:shadow-xl
              hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <div className="relative flex items-center gap-2">
              <Bot
                size={16}
                className="transition-transform group-hover:rotate-12"
              />
              <span className="hidden sm:inline font-medium">AI Assistant</span>
              <div
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 
                animate-pulse group-hover:bg-green-300"
              />
            </div>
          </button>
        </div>
      </div>

      <div className="flex flex-1 mt-[72px] overflow-hidden">
        <div
          className={`fixed md:static inset-y-0 left-0 z-30 bg-white shadow-lg transform transition-transform duration-300 pt-16 md:pt-0 ${
            isLeftSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            width: isLeftSidebarOpen
              ? windowWidth < 768
                ? "240px"
                : leftSidebarWidth + "px"
              : "0",
            maxWidth: "85vw",
            overflow: "hidden",
          }}
        >
          <div className="absolute top-3 right-3 p-1 bg-gray-100 rounded-md text-gray-600">
            <button
              onClick={() => setIsLeftSidebarOpen(false)}
              className="block w-6 h-6 flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="h-full overflow-hidden">
            <Sidebar
              questions={questions}
              activeQuestionId={activeQuestionId}
              setActiveQuestionId={(id) => {
                handleDoubleClick();
                setActiveQuestionId(id);
                if (windowWidth < 768) {
                  setIsLeftSidebarOpen(false);
                }
              }}
              onAddQuestion={handleAddQuestion}
              onDeleteQuestion={handleDeleteQuestion}
              onReorderQuestions={handleReorderQuestions}
              sidebarWidth={isLeftSidebarOpen ? leftSidebarWidth : 0}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden">
          <FormInfo
            show={showFormInfo}
            onClose={() => setShowFormInfo(false)}
            formTitle={formTitle}
            setFormTitle={setFormTitle}
            formDescription={formDescription}
            setFormDescription={setFormDescription}
            category={category}
            setCategory={setCategory}
            formImage={formImage}
            formId={formId}
            setFormImage={setFormImage}
            saveFormDetails={saveFormDetails}
            handleFormImageUpload={handleFormImageUpload}
          />

          <Canvas
            formRef={formRef}
            question={questions.find((q) => q.id === activeQuestionId)}
            onComponentUpdate={handleComponentUpdate}
            onDeleteComponent={handleDeleteComponent}
            handleDrop={handleDrop}
            showFormInfo={showFormInfo}
            onQuestionUpdate={handleQuestionUpdate}
            windowWidth={windowWidth}
            windowHeight={windowHeight}
            isLeftSidebarOpen={isLeftSidebarOpen}
            leftSidebarWidth={isLeftSidebarOpen ? leftSidebarWidth : 0}
            isRightSidebarOpen={isRightSidebarOpen}
            rightSidebarWidth={isRightSidebarOpen ? 64 : 0}
            handleDoubleClick={handleDoubleClick}
            scale={canvasScale}
            ref={canvasRef}
          />

          {showLineEditor ||
          showCheckboxEditor ||
          showTrueFalseEditor ||
          showSingleChoiceEditor ||
          showMultiChoiceEditor ||
          showShortTextEditor ||
          showToggleBoxEditor ||
          showTextEditor ||
          showNumericSliderEditor ||
          showDiscreteSliderEditor ||
          showMatchingPairsEditor ||
          showRankingEditor ? (
            <>
              {showLineEditor && (
                <LineToolBar
                  questionId={activeQuestionId}
                  isLeftSidebarOpen={isLeftSidebarOpen}
                  leftSidebarWidth={leftSidebarWidth}
                  isRightSidebarOpen={isRightSidebarOpen}
                  windowWidth={windowWidth}
                  selectedLine={editingComponent}
                  onComponentUpdate={handleComponentUpdate}
                  // onDeselect={}
                  onDeselect={() => handleDoubleClick()}
                />
              )}
              {showCheckboxEditor && (
                <CheckBoxToolBar
                  questionId={activeQuestionId}
                  isLeftSidebarOpen={isLeftSidebarOpen}
                  leftSidebarWidth={leftSidebarWidth}
                  isRightSidebarOpen={isRightSidebarOpen}
                  windowWidth={windowWidth}
                  selectedLine={editingComponent}
                  onComponentUpdate={handleComponentUpdate}
                  // onDeselect={}
                  onDeselect={() => handleDoubleClick()}
                />
              )}
              {showTrueFalseEditor && (
                <TrueFalseToolbar
                  questionId={activeQuestionId}
                  isLeftSidebarOpen={isLeftSidebarOpen}
                  leftSidebarWidth={leftSidebarWidth}
                  isRightSidebarOpen={isRightSidebarOpen}
                  windowWidth={windowWidth}
                  selectedComponent={editingComponent}
                  onComponentUpdate={handleComponentUpdate}
                  // onDeselect={}
                  onDeselect={() => handleDoubleClick()}
                />
              )}
              {showSingleChoiceEditor && (
                <MCSingleSelectToolbar
                  questionId={activeQuestionId}
                  isLeftSidebarOpen={isLeftSidebarOpen}
                  leftSidebarWidth={leftSidebarWidth}
                  isRightSidebarOpen={isRightSidebarOpen}
                  windowWidth={windowWidth}
                  selectedComponent={editingComponent}
                  onComponentUpdate={handleComponentUpdate}
                  // onDeselect={}
                  onDeselect={() => handleDoubleClick()}
                />
              )}
              {showMultiChoiceEditor && (
                <MCMultipleSelectToolbar
                  questionId={activeQuestionId}
                  isLeftSidebarOpen={isLeftSidebarOpen}
                  leftSidebarWidth={leftSidebarWidth}
                  isRightSidebarOpen={isRightSidebarOpen}
                  windowWidth={windowWidth}
                  selectedComponent={editingComponent}
                  onComponentUpdate={handleComponentUpdate}
                  // onDeselect={}
                  onDeselect={() => handleDoubleClick()}
                />
              )}
              {showShortTextEditor && (
                <ShortTextboxToolbar
                  questionId={activeQuestionId}
                  isLeftSidebarOpen={isLeftSidebarOpen}
                  leftSidebarWidth={leftSidebarWidth}
                  isRightSidebarOpen={isRightSidebarOpen}
                  windowWidth={windowWidth}
                  selectedComponent={editingComponent}
                  onComponentUpdate={handleComponentUpdate}
                  compType="short_text"
                  // onDeselect={}
                  onDeselect={() => handleDoubleClick()}
                />
              )}
              {showTextEditor && (
                <ShortTextboxToolbar
                  questionId={activeQuestionId}
                  isLeftSidebarOpen={isLeftSidebarOpen}
                  leftSidebarWidth={leftSidebarWidth}
                  isRightSidebarOpen={isRightSidebarOpen}
                  windowWidth={windowWidth}
                  selectedComponent={editingComponent}
                  onComponentUpdate={handleComponentUpdate}
                  compType="text"
                  // onDeselect={}
                  onDeselect={() => handleDoubleClick()}
                />
              )}
              {showToggleBoxEditor && (
                <ToggleBoxToolbar
                  questionId={activeQuestionId}
                  isLeftSidebarOpen={isLeftSidebarOpen}
                  leftSidebarWidth={leftSidebarWidth}
                  isRightSidebarOpen={isRightSidebarOpen}
                  windowWidth={windowWidth}
                  selectedComponent={editingComponent}
                  onComponentUpdate={handleComponentUpdate}
                  onDelete={(componentId) => {
                    handleDeleteComponent(activeQuestionId, componentId);
                    handleDoubleClick();
                  }}
                  onDeselect={() => handleDoubleClick()}
                />
              )}
              {showRankingEditor && (
                <RankingComponentToolbar
                  questionId={activeQuestionId}
                  isLeftSidebarOpen={isLeftSidebarOpen}
                  leftSidebarWidth={leftSidebarWidth}
                  isRightSidebarOpen={isRightSidebarOpen}
                  windowWidth={windowWidth}
                  selectedComponent={editingComponent}
                  onComponentUpdate={handleComponentUpdate}
                  onDeselect={() => handleDoubleClick()}
                />
              )}
              {showDiscreteSliderEditor && (
                <DiscreteSliderToolbar
                  questionId={activeQuestionId}
                  isLeftSidebarOpen={isLeftSidebarOpen}
                  leftSidebarWidth={leftSidebarWidth}
                  isRightSidebarOpen={isRightSidebarOpen}
                  windowWidth={windowWidth}
                  selectedComponent={editingComponent}
                  onComponentUpdate={handleComponentUpdate}
                  onDeselect={() => handleDoubleClick()}
                />
              )}
              {showMatchingPairsEditor && (
                <MatchingPairsToolbar
                  questionId={activeQuestionId}
                  isLeftSidebarOpen={isLeftSidebarOpen}
                  leftSidebarWidth={leftSidebarWidth}
                  isRightSidebarOpen={isRightSidebarOpen}
                  windowWidth={windowWidth}
                  selectedComponent={editingComponent}
                  onComponentUpdate={handleComponentUpdate}
                  onDeselect={() => handleDoubleClick()}
                />
              )}
              {showNumericSliderEditor && (
                <NumericSliderToolbar
                  questionId={activeQuestionId}
                  isLeftSidebarOpen={isLeftSidebarOpen}
                  leftSidebarWidth={leftSidebarWidth}
                  isRightSidebarOpen={isRightSidebarOpen}
                  windowWidth={windowWidth}
                  selectedComponent={editingComponent}
                  onComponentUpdate={handleComponentUpdate}
                  onDeselect={() => handleDoubleClick()}
                />
              )}
            </>
          ) : (
            <div className="flex w-full">
              <Toolbar
                questionId={activeQuestionId}
                isLeftSidebarOpen={isLeftSidebarOpen}
                leftSidebarWidth={leftSidebarWidth}
                isRightSidebarOpen={isRightSidebarOpen}
                windowWidth={windowWidth}
                scale={1}
                ref={toolbarRef}
              />
            </div>
          )}
        </div>

        <div
          className={`fixed md:static inset-y-0 right-0 z-20 w-16 bg-white shadow-xl transform transition-transform duration-300 pt-16 md:pt-0 ${
            isRightSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            overscrollBehavior: "contain",
            isolation: "isolate",
          }}
        >
          <div className="absolute top-3 left-3 p-1 bg-gray-100 rounded-md text-gray-600 md:hidden">
            <button
              onClick={() => setIsRightSidebarOpen(false)}
              className="block w-6 h-6 flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="h-full overflow-auto overscroll-contain">
            <RightToolbar />
          </div>
        </div>

        {!isRightSidebarOpen && (
          <button
            onClick={() => setIsRightSidebarOpen(true)}
            className="fixed right-4 bottom-20 z-20 p-2 bg-white border border-gray-200 text-gray-600 rounded-full shadow-lg hover:bg-gray-50"
            aria-label="Open tools"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {showChatBox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-11/12 md:w-3/4 lg:w-1/2 h-3/4 max-h-[80vh]">
            <ChatBox
              formId={formId}
              onClose={() => setShowChatBox(false)}
              onQuestionsAdded={handleQuestionsAdded}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
