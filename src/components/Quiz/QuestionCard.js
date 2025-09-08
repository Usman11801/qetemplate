import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  XCircle,
  Star,
  Clock,
  ChevronRight,
  RotateCw,
} from "lucide-react";
import { getOptimalScale, shouldShowOrientationWarning, setupMobileOptimizations } from "../../utils/mobileUtils";
import ResizableComponent from "./ResizeableComponent";
import { defaultSizes } from "./QuizTheme";
import FeedbackIndicator from "./FeedbackIndicator";
import {
  SingleChoiceAnswer,
  MultiChoiceAnswer,
  TrueFalseAnswer,
  FormattedTextDisplay,
  NumericSliderAnswer,
  DiscreteSliderAnswer,
  MatchingPairsAnswer,
  ShapeAnswer,
  RankingAnswer,
} from "./QuizAnswer";
import { getShuffledOrder } from "./QuizUtils";
import MinimalCurvedLineComponent from "../Form/staticComponent/curvedLine";
import SingleCheckboxItem from "../../questiontemps/SingleCheckboxItem";
import ShapeCheckbox from "../Form/staticComponent/shapeCheckBox";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const QuestionCard = ({
  question,
  index,
  answers,
  updateAnswer,
  validationResults,
  attemptsUsed,
  questionScores,
  submittingQuestions,
  handleSubmitQuestion,
  sessionSettings,
  timeIsUp,
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [canvasScale, setCanvasScale] = useState(1);
  const [showOrientationWarning, setShowOrientationWarning] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      setWindowWidth(newWidth);
      setWindowHeight(newHeight);

      // Calculate available space more accurately for single view
      const headerHeight = 60; // Reduced quiz header height
      const footerHeight = 50; // Reduced submit button area height
      const padding = 12; // Reduced overall padding
      const questionHeaderHeight = 80; // Reduced question title and info area
      
      const availableWidth = newWidth - (padding * 2);
      const availableHeight = newHeight - headerHeight - footerHeight - questionHeaderHeight - (padding * 2);

      // Ensure we have minimum usable space but be more aggressive about fitting
      const minUsableHeight = Math.max(availableHeight, 150);
      const minUsableWidth = Math.max(availableWidth, 250);

      // Use mobile utilities for optimal scaling
      const scaleFactor = getOptimalScale(
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        minUsableWidth,
        minUsableHeight
      );

      setCanvasScale(scaleFactor);
      
      // Debug logging
      console.log('Quiz scaling debug:', {
        newWidth,
        newHeight,
        availableWidth,
        availableHeight,
        scaleFactor,
        canvasWidth: CANVAS_WIDTH,
        canvasHeight: CANVAS_HEIGHT
      });

      // Use mobile utilities for orientation warning
      setShowOrientationWarning(shouldShowOrientationWarning());
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Setup mobile optimizations
    setupMobileOptimizations();

    return () => {
      window.removeEventListener("resize", handleResize);
    };

  }, []);

  console.log(question, 'here is quesion')
  const used = attemptsUsed[question.id] || 0;
  const attemptsLeft = Math.max(question.maxAttempts - used, 0);
  const alreadyCorrect = !!questionScores[question.id];
  const submitDisabled = attemptsLeft <= 0 || alreadyCorrect || timeIsUp;

  const backgroundColor = question.backgroundColor || "white";

  return (
    <div
      className="rounded-2xl shadow-md overflow-hidden transition-all hover:shadow-lg border border-gray-100 relative animate-slideIn"
      style={{
        animationDelay: `${index * 0.1}s`,
        backgroundColor: backgroundColor,
      }}
    >
      {showOrientationWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-[100] flex flex-col items-center justify-center text-white p-6">
          <div className="transform mb-6 animate-pulse">
            <RotateCw
              size={80}
              className="rotate-90 text-white"
            />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-center">Rotate Your Device</h2>
          <p className="text-center mb-6 text-lg leading-relaxed max-w-sm">
            For the best quiz experience, please rotate your device to landscape mode. This ensures all question components are properly visible and interactive.
          </p>
          <div className="flex items-center text-indigo-300 text-sm">
            <Clock size={16} className="mr-2" />
            <span>Rotate your device to continue</span>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-2 sm:p-4 border-b border-indigo-100">
        <div className="flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-1 mb-1 text-indigo-700 bg-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-sm border border-indigo-200">
              <span className="font-medium text-xs sm:text-sm">
                Q{index + 1}
              </span>
              <span className="text-xs bg-indigo-100 px-1 py-0.5 rounded-full">
                {question.points}pts
              </span>
            </div>
            <h2 className="text-sm sm:text-lg font-bold text-gray-800 line-clamp-2">
              {question.title || `Question ${index + 1}`}
            </h2>
          </div>

          <div className="flex flex-col items-end">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">
              {alreadyCorrect ? (
                <span className="text-emerald-600 font-medium">
                  {questionScores[question.id]} points earned
                </span>
              ) : (
                <span>
                  Attempts:{" "}
                  <span className="font-medium">
                    {used}/{question.maxAttempts}
                  </span>
                </span>
              )}
            </div>
            {!alreadyCorrect && (
              <div className="flex space-x-1">
                {Array.from({ length: question.maxAttempts }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${i < used ? "bg-gray-400" : "bg-gray-200"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {alreadyCorrect && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-emerald-600/30 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center max-w-sm mx-auto transform transition-all">
            <div className="rounded-full bg-emerald-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-emerald-700 mb-2">
              Well done!
            </h3>
            <p className="text-emerald-600 mb-4">
              You earned {questionScores[question.id]} point
              {questionScores[question.id] !== 1 ? "s" : ""} in {used} attempt
              {used !== 1 ? "s" : ""} out of {question.maxAttempts}.
            </p>
            <div className="inline-flex items-center text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              <Star size={16} className="mr-1" />
              <span>Completed</span>
            </div>
          </div>
        </div>
      )}

      {!alreadyCorrect && attemptsLeft <= 0 && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-red-600/30 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center max-w-sm mx-auto">
            <div className="rounded-full bg-red-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-700 mb-2">
              No more attempts
            </h3>
            <p className="text-red-600 mb-4">
              You've used all {question.maxAttempts} attempts for this question.
            </p>
            <div className="inline-flex items-center text-sm font-medium text-red-700 bg-red-50 px-3 py-1 rounded-full">
              <X size={16} className="mr-1" />
              <span>No attempts left</span>
            </div>
          </div>
        </div>
      )}

      <div className="relative px-2 py-2 flex justify-center canvas-wrapper">
        <div
          className="mx-auto relative canvas-container flex justify-center items-center"
          style={{
            minHeight: "120px",
            width: "100%",
            maxWidth: `${CANVAS_WIDTH}px`,
            aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
            backgroundColor: backgroundColor,
            overflow: "visible",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: `${CANVAS_WIDTH}px`,
              height: `${CANVAS_HEIGHT}px`,
              transform: `scale(${canvasScale})`,
              transformOrigin: "center center",
              left: "50%",
              top: "50%",
              marginLeft: `-${CANVAS_WIDTH / 2}px`,
              marginTop: `-${CANVAS_HEIGHT / 2}px`,
              willChange: "transform",
            }}
          >
            {question.components?.map((comp) => {
              const compResult = validationResults[question.id]?.[comp.id];
              const renderFeedback = (
                <FeedbackIndicator
                  result={compResult}
                  showHints={sessionSettings.showComponentHints}
                />
              );

              if (comp.type === "text") {
                // console.log(comp, "here is comp")
                return (
                  <ResizableComponent
                    key={comp.id}
                    comp={comp}
                    defaultWidth={defaultSizes.text.width}
                    defaultHeight={defaultSizes.text.height}
                  >
                    <div
                      className="w-full h-full p-1"
                      style={{
                        fontFamily:
                          comp.text?.format?.font || "Inter, sans-serif",
                      }}
                    >
                      <FormattedTextDisplay text={comp.text} compValues={comp} />
                    </div>
                  </ResizableComponent>
                );
              }

              if (comp.type === "image_upload") {
                return (
                  <ResizableComponent
                    key={comp.id}
                    comp={comp}
                    defaultWidth={defaultSizes.image_upload.width}
                    defaultHeight={defaultSizes.image_upload.height}
                    extraStyle={{ overflow: "hidden", borderRadius: "0.75rem" }}
                  >
                    {comp.image ? (
                      <img
                        src={comp.image}
                        alt="Question"
                        className="w-full h-full object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg border border-gray-200">
                        No Image
                      </div>
                    )}
                    {compResult && renderFeedback}
                  </ResizableComponent>
                );
              }

              if (comp.type === "line") {
                return <MinimalCurvedLineComponent key={comp.id} {...comp} />;
              }

              if (comp.type === "multiple_choice_single") {
                const val = answers[question.id]?.[comp.id] ?? null;
                console.log("multiple_choice_single", comp,)
                return (
                  <ResizableComponent
                    key={comp.id}
                    comp={comp}
                    defaultWidth={defaultSizes.multiple_choice_single.width}
                    defaultHeight={defaultSizes.multiple_choice_single.height}
                    extraStyle={{ height: comp.height - 52 + (comp.optionBorderWidth * 2) }}
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col"
                      style={{ backgroundColor: comp.backgroundColor || "#ffffff", borderColor: comp.optionBorderColor || "#e5e7eb", borderWidth: comp.optionBorderWidth || 1, }}

                    >
                      {/* <div className="p-3 border-b border-gray-100 bg-gray-50">
                        <span className="text-xs font-medium text-gray-500">
                          Select one option
                        </span>
                      </div> */}
                      <div className="flex-1 overflow-auto p-2">
                        <SingleChoiceAnswer
                          value={val}
                          onChange={(newVal) =>
                            updateAnswer(question.id, comp.id, newVal)
                          }
                          compValues={comp}
                          options={comp.options || []}
                        />
                      </div>
                    </div>
                    {compResult && renderFeedback}
                  </ResizableComponent>
                );
              }

              if (comp.type === "multiple_choice_multi") {
                const val = answers[question.id]?.[comp.id] || [];
                console.log(comp, 'comp here')
                return (
                  <ResizableComponent
                    key={comp.id}
                    comp={comp}
                    defaultWidth={defaultSizes.multiple_choice_multi.width}
                    defaultHeight={defaultSizes.multiple_choice_multi.height}
                    extraStyle={{ height: comp.height - 52 + (comp.optionBorderWidth * 2) }}
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col"
                      style={{ backgroundColor: comp.backgroundColor || "#ffffff", borderColor: comp.optionBorderColor || "#e5e7eb", borderWidth: comp.optionBorderWidth || 1, }}>
                      {/* <div className="p-3 border-b border-gray-100 bg-gray-50">
                        <span className="text-xs font-medium text-gray-500">
                          Select multiple options
                        </span>
                      </div> */}
                      <div className="flex-1 overflow-auto p-2">
                        <MultiChoiceAnswer
                          value={val}
                          onChange={(newVal) =>
                            updateAnswer(question.id, comp.id, newVal)
                          }
                          compValues={comp}
                          options={comp.options || []}
                        />
                      </div>
                    </div>
                    {compResult && renderFeedback}
                  </ResizableComponent>
                );
              }

              if (comp.type === "true_false") {
                const val = answers[question.id]?.[comp.id];

                return (
                  <ResizableComponent
                    key={comp.id}
                    comp={comp}
                    defaultWidth={comp.width}
                    defaultHeight={comp.height}
                  >
                    <div
                      className="w-full h-full flex items-center justify-center bg-white rounded-xl shadow-sm p-2"
                      style={{ minWidth: comp.width, minHeight: comp.height, borderRadius: comp.borderRadius || "0.5rem", borderColor: comp.borderColor || "#e5e7eb", backgroundColor: comp.backgroundColor || "#f9fafb" }}
                    >
                      <TrueFalseAnswer
                        value={val}
                        compValues={comp}
                        onChange={(val2) =>
                          updateAnswer(question.id, comp.id, val2)
                        }
                      />
                    </div>
                    {compResult && renderFeedback}
                  </ResizableComponent>
                );
              }

              if (comp.type === "short_text_answer") {
                const val = answers[question.id]?.[comp.id] || "";
                const count = val.length;
                console.log("short_text_answer", comp);
                const textDecoration = [
                  comp?.fontStyles.underline ? "underline" : "",
                  comp?.fontStyles.lineThrough ? "line-through" : "",
                ]
                return (
                  <ResizableComponent
                    key={comp.id}
                    comp={comp}
                    defaultWidth={comp.width + 20}
                    defaultHeight={comp.height + 20}
                  >
                    <div
                      className="bg-white rounded-md border border-gray-200 relative"
                      style={{
                        width: comp.width,
                        height: comp.height,
                        boxSizing: "border-box",
                        padding: 5,
                        border: "2px solid #ccc",
                        overflow: "hidden",
                      }}
                    >
                      <textarea
                        className="w-full h-full resize-none border-none bg-gray-100 text-gray-700"
                        value={val}
                        onChange={(e) =>
                          updateAnswer(question.id, comp.id, e.target.value)
                        }
                        maxLength={200}
                        placeholder="Type your answer..."
                        style={{
                          width: "100%",
                          height: "100%",
                          boxSizing: "border-box",
                          fontSize: `${!val ? 14 : comp.fontSize}px`,
                          lineHeight: comp.lineSpacing || 1.5,
                          letterSpacing: comp.letterSpacing || 0,
                          fontFamily: comp.fontFamily || "Inter, sans-serif",
                          textAlign: comp.textAlign || "left",
                          fontStyle: comp.fontStyles.italic ? "italic" : "normal",
                          fontWeight: comp.fontStyles.bold ? "bold" : "normal",
                          color: comp.fontColor || "#374151",
                          outline: "none",
                          overflow: "auto",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          backgroundColor: "#f9fafb",
                          borderRadius: "0.5rem",
                          padding: 3,
                          textDecoration: textDecoration.join(" "),
                        }}
                      />

                      {compResult && renderFeedback}

                      {/* character counter */}
                      <div
                        className="absolute bottom-1 right-4  text-xs text-gray-500 pointer-events-none select-none"
                        style={{ fontSize: 10 }}
                      >
                        {count}/200
                      </div>
                    </div>
                  </ResizableComponent>
                );
              }


              if (comp.type === "single_checkbox") {
                const userVal = answers[question.id]?.[comp.id];
                const checked = userVal === undefined ? false : userVal;
                console.log("single_checkbox", comp, checked)
                return (
                  <ResizableComponent
                    key={comp.id}
                    comp={comp}
                    defaultWidth={defaultSizes.single_checkbox.width}
                    defaultHeight={defaultSizes.single_checkbox.height}
                  >
                    <ShapeCheckbox
                      id={comp.id}
                      checked={checked}
                      onChange={(e) =>
                        updateAnswer(question.id, comp.id, e.target.checked)
                      }
                      width={comp.width}
                      height={comp.height}
                      borderColor={comp.borderColor}
                      borderRadius={comp.borderRadius}
                      backgroundColor={comp.backgroundColor}
                      shapeType={comp.shapeType}
                      shapeTypeColor={comp.shapeTypeColor}
                    />
                    {compResult && renderFeedback}
                  </ResizableComponent>
                );
              }

              if (comp.type === "toggle_button") {
                const userVal = answers[question.id]?.[comp.id];
                const toggled = userVal === undefined ? false : userVal;
                const opacity = comp.opacity ?? 1;
                console.log("toggle button", comp,)

                // Helper function to build Bézier path from saved shape data
                const buildBezierPath = (anchors, handles) => {
                  const N = anchors?.length || 0;
                  if (N === 0 || handles?.length !== N) return "";
                  let d = `M ${anchors[0].x},${anchors[0].y} `;
                  for (let i = 0; i < N; i++) {
                    const curr = anchors[i];
                    const next = anchors[(i + 1) % N];
                    const currentHandle = handles[i];
                    const nextHandle = handles[(i + 1) % N];

                    if (!currentHandle || !nextHandle) continue;

                    const { right: rOff } = currentHandle;
                    const { left: lOff } = nextHandle;
                    d += `C ${curr.x + rOff.x},${curr.y + rOff.y} ` +
                      `${next.x + lOff.x},${next.y + lOff.y} ` +
                      `${next.x},${next.y} `;
                  }
                  return d + "Z";
                };

                // Calculate text center based on anchor positions
                const calculateTextCenter = (anchors, width, height) => {
                  if (!anchors || anchors.length === 0) {
                    return { x: width / 2, y: height / 2 };
                  }

                  const sumX = anchors.reduce((sum, anchor) => sum + anchor.x, 0);
                  const sumY = anchors.reduce((sum, anchor) => sum + anchor.y, 0);

                  return {
                    x: sumX / anchors.length,
                    y: sumY / anchors.length
                  };
                };

                // Calculate bounds of anchors and handles for proper viewBox
                const calculateContentBounds = (anchors, handles) => {
                  if (!anchors || anchors.length === 0) return null;

                  let minX = anchors[0].x;
                  let minY = anchors[0].y;
                  let maxX = anchors[0].x;
                  let maxY = anchors[0].y;

                  // Include handle positions in bounds calculation
                  anchors.forEach((anchor, i) => {
                    const handle = handles[i];
                    if (handle) {
                      // Check anchor position
                      minX = Math.min(minX, anchor.x);
                      minY = Math.min(minY, anchor.y);
                      maxX = Math.max(maxX, anchor.x);
                      maxY = Math.max(maxY, anchor.y);

                      // Check handle positions
                      if (handle.left) {
                        minX = Math.min(minX, anchor.x + handle.left.x);
                        minY = Math.min(minY, anchor.y + handle.left.y);
                        maxX = Math.max(maxX, anchor.x + handle.left.x);
                        maxY = Math.max(maxY, anchor.y + handle.left.y);
                      }
                      if (handle.right) {
                        minX = Math.min(minX, anchor.x + handle.right.x);
                        minY = Math.min(minY, anchor.y + handle.right.y);
                        maxX = Math.max(maxX, anchor.x + handle.right.x);
                        maxY = Math.max(maxY, anchor.y + handle.right.y);
                      }
                    }
                  });

                  return { minX, minY, maxX, maxY };
                };
                return (
                  <ResizableComponent
                    key={comp.id}
                    comp={comp}
                    defaultWidth={defaultSizes.toggle_button.width}
                    defaultHeight={defaultSizes.toggle_button.height}
                  >

                    {/* // Render custom SVG shape */}
                    <div
                      className="w-full h-full relative cursor-pointer"
                      onClick={() => updateAnswer(question.id, comp.id, !toggled)}
                    // style={{ opacity }}
                    >
                      {(() => {
                        // Calculate proper viewBox dimensions based on content
                        const bounds = calculateContentBounds(comp.anchors, comp.handles);
                        const padding = 15;

                        let viewBoxWidth, viewBoxHeight, viewBoxX = 0, viewBoxY = 0;

                        if (bounds) {
                          // Use actual content bounds with padding
                          viewBoxWidth = Math.max(bounds.maxX - bounds.minX + padding * 2, 50);
                          viewBoxHeight = Math.max(bounds.maxY - bounds.minY + padding * 2, 30);
                          viewBoxX = bounds.minX - padding;
                          viewBoxY = bounds.minY - padding;
                        } else {
                          // Fallback to component dimensions
                          viewBoxWidth = comp.width || 100;
                          viewBoxHeight = comp.height || 40;
                        }

                        const textCenter = calculateTextCenter(
                          comp.anchors,
                          viewBoxWidth,
                          viewBoxHeight
                        );

                        return (
                          <svg
                            width="100%"
                            height="100%"
                            viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
                            preserveAspectRatio="none"
                          >
                            <path
                              d={buildBezierPath(comp.anchors, comp.handles)}
                              fill={toggled ? comp.backgroundColor || "#ffffff" : "transparent"}
                              stroke={comp.borderColor || "#000000"}
                              strokeWidth={comp.borderWidth || 2}
                              fillOpacity={opacity}
                            // strokeOpacity={opacity}
                            />
                            <text
                              x={textCenter.x}
                              y={textCenter.y}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={toggled ? "#2563eb" : "#6b7280"}
                              fontSize="14"
                              fontFamily="Arial, sans-serif"
                              fontWeight="bold"
                              style={{ pointerEvents: "none", userSelect: "none" }}
                            >
                              {toggled ? "ON" : "OFF"}
                            </text>
                          </svg>
                        );
                      })()}
                    </div>

                    {compResult && renderFeedback}
                  </ResizableComponent>
                );
              }

              if (comp.type === "numeric_slider") {
                const val = answers[question.id]?.[comp.id] ?? comp.currentValue ?? comp.minValue;
                const boxHeight = comp.height
              
                console.log("numeric slider", comp, boxHeight)
                return (
                  <ResizableComponent
                    key={comp.id}
                    comp={comp}
                    defaultWidth={comp.width}
                    defaultHeight={boxHeight}
                    extraStyle={{ height: boxHeight }}
                  //  style={{ height: '200px !important' }}
                  >
                    <div className="">
                      <NumericSliderAnswer
                        value={val}
                        onChange={(newVal) =>
                          updateAnswer(question.id, comp.id, newVal)
                        }
                        minValue={comp.minValue}
                        maxValue={comp.maxValue}
                        targetValue={comp.targetValue}
                        mode={comp.mode}
                        className="w-full"
                        style={{ width: "100%", height: boxHeight, backgroundColor: comp.optionBackgroundColor || "#f9fafb", borderRadius: comp.optionBorderRadius }}
                        compValues={comp}
                      />
                      {compResult && renderFeedback}
                    </div>
                  </ResizableComponent>
                );
              }

              if (comp.type === "discrete_slider") {
                const val = answers[question.id]?.[comp.id] ?? comp.selectedIndex ?? 0;
                console.log("discrete_slider", comp)
                return (
                  <ResizableComponent
                    key={comp.id}
                    comp={comp}
                    defaultWidth={comp.width}
                    defaultHeight={comp.height}
                  >
                    <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-4" style={{ backgroundColor: comp.optionBackgroundColor || "#f9fafb", borderRadius: comp.optionBorderRadius }}>
                      <DiscreteSliderAnswer
                        value={val}
                        onChange={(newVal) =>
                          updateAnswer(question.id, comp.id, newVal)
                        }
                        options={comp.options}
                        compValues={comp}
                      />
                      {compResult && renderFeedback}
                    </div>
                  </ResizableComponent>
                );
              }

              if (comp.type === "ranking") {
                const currentOrder =
                  answers[question.id]?.[comp.id] ||
                  getShuffledOrder(comp.items.length);
                console.log(comp, "ranking component")
                return (
                  <ResizableComponent
                    key={comp.id}
                    comp={comp}
                    defaultWidth={defaultSizes.ranking.width}
                    defaultHeight={defaultSizes.ranking.height}
                    extraStyle={{ height: comp.height - 52 + (comp.optionBorderWidth * 2) }}
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col"
                      style={{ backgroundColor: comp.backgroundColor || "#ffffff", borderColor: comp.optionBorderColor || "#e5e7eb", borderWidth: comp.optionBorderWidth || 1, }}>
                      <div className="flex-1 overflow-auto p-2">

                        <RankingAnswer
                          items={comp.items || []}
                          currentOrder={currentOrder}
                          componentValue={comp}
                          onChange={(newOrder) =>
                            updateAnswer(question.id, comp.id, newOrder)
                          }
                        />
                      </div>
                      {compResult && renderFeedback}
                    </div>
                  </ResizableComponent>
                );
              }

              if (comp.type === "matching_pairs") {
                const currentMatches = answers[question.id]?.[comp.id] || [];
                console.log("matching_pairs",  currentMatches)
                const compWidth =
                  comp.width || defaultSizes.matching_pairs.width;
                const compHeight =
                  comp.height || defaultSizes.matching_pairs.height;
              
              
                return (
                  <ResizableComponent
                    key={comp.id}
                    comp={comp}
                    defaultWidth={compWidth}
                    defaultHeight={compHeight}

                  >
                    {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-2 "
                      style={{
                          width: `${compWidth}px`,
                          height: `${compHeight}px`,
                        }}
                        
                        > */}
                    {/* <div
                        className="absolute inset-0"
                      
                      > */}
                    <MatchingPairsAnswer
                      pairs={comp.pairs}
                      value={currentMatches}
                      onChange={(newMatches) =>
                        updateAnswer(question.id, comp.id, newMatches)
                      }
                      containerWidth={compWidth}
                      containerHeight={compHeight}
                      fontSizeValue
                      optionClassName="bg-white  hover:bg-indigo-50 border-2 hover:border-indigo-300 transition-colors "
                      compValues={comp}

                    />
                    {/* </div> */}
                    {compResult && renderFeedback}
                    {/* </div> */}
                  </ResizableComponent>
                );
              }

              if (comp.type === "shape") {
                return (
                  <ResizableComponent
                    key={comp.id}
                    comp={comp}
                    defaultWidth={defaultSizes.shape.width}
                    defaultHeight={defaultSizes.shape.height}
                  >
                    <div className="bg-transparent w-full h-full">
                      <ShapeAnswer
                        shapeType={comp.shapeType || "rectangle"}
                        backgroundColor={comp.backgroundColor || "#4A90E2"}
                        borderRadius={comp.borderRadius}
                        opacity={comp.opacity || 1}
                        rotation={comp.rotation || 0}
                        borderWidth={comp.borderWidth || 0}
                        borderColor={comp.borderColor || "transparent"}
                        borderStyle={comp.borderStyle || "solid"}
                        className="w-full h-full"
                      />
                    </div>
                    {compResult && renderFeedback}
                  </ResizableComponent>
                );
              }

              return null;
            })}
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {attemptsLeft > 0 && !alreadyCorrect ? (
            <span className="flex items-center">
              <Clock size={12} className="mr-1" />
              {attemptsLeft} left
            </span>
          ) : alreadyCorrect ? (
            <span className="flex items-center text-emerald-600">
              <Check size={12} className="mr-1" />
              Complete
            </span>
          ) : (
            <span className="flex items-center text-red-600">
              <X size={12} className="mr-1" />
              No attempts
            </span>
          )}
        </div>

        <button
          onClick={() => handleSubmitQuestion(question.id)}
          disabled={submitDisabled || submittingQuestions[question.id]}
          className={`flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${submitDisabled || submittingQuestions[question.id]
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
            }`}
        >
          {submittingQuestions[question.id] ? (
            <>
              <svg
                className="animate-spin h-3 w-3 sm:h-4 sm:w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <span>Submit Answer</span>
              <ChevronRight size={8} className="sm:size-8" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
