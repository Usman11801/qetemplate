// src/components/Results/StaticQuestionViewer.js
import React, { useState, useEffect } from "react";
import {
  StaticSingleChoiceAnswer,
  StaticMultiChoiceAnswer,
  StaticTrueFalseAnswer,
  StaticFormattedTextDisplay,
  StaticNumericSliderAnswer,
  StaticDiscreteSliderAnswer,
  StaticRankingAnswer,
  StaticMatchingPairsAnswer,
  StaticShortTextAnswer,
  StaticSingleCheckbox,
  StaticToggleButton,
} from "./StaticAnswerComponents";
import MinimalCurvedLineComponent from "../Form/staticComponent/curvedLine";
import ShapeCheckbox from "../Form/staticComponent/shapeCheckBox";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const StaticQuestionViewer = ({ question, response, style = {} }) => {
  const [canvasScale, setCanvasScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerRef, setContainerRef] = useState(null);

  const staticOverlay = {
    position: "absolute",
    inset: 0,
    backgroundColor: "transparent",
    cursor: "not-allowed",
    zIndex: 10,
  };

  // Handle responsive scaling
  useEffect(() => {
    if (!containerRef) return;

    const handleResize = () => {
      const containerRect = containerRef.getBoundingClientRect();
      setContainerWidth(containerRect.width);

      // Calculate scale factor based on container width
      const availableWidth = containerRect.width;
      let scaleFactor = Math.min(availableWidth / CANVAS_WIDTH, 1);

      // Minimum scale to ensure legibility on mobile
      if (window.innerWidth < 480) {
        scaleFactor = Math.max(scaleFactor, 0.4);
      } else if (window.innerWidth < 768) {
        scaleFactor = Math.max(scaleFactor, 0.5);
      } else if (window.innerWidth < 1024) {
        scaleFactor = Math.max(scaleFactor, 0.6);
      }

      setCanvasScale(scaleFactor);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [containerRef]);

  // Debug the response data
  useEffect(() => {
    if (response && question) {
      console.log(
        `DEBUG - StaticQuestionViewer - Question ${question.id}:`,
        question
      );
      console.log(
        `DEBUG - StaticQuestionViewer - Response for Question ${question.id}:`,
        response
      );

      // Additional logging to help debug data structure
      console.log("Response keys:", Object.keys(response));

      // Look for any keys with this question's ID
      const keysWithQuestionId = Object.keys(response || {}).filter((key) =>
        key.includes(String(question.id))
      );

      if (keysWithQuestionId.length > 0) {
        console.log(
          `Keys containing questionId ${question.id}:`,
          keysWithQuestionId
        );
        keysWithQuestionId.forEach((key) => {
          console.log(`${key}:`, response[key]);
        });
      }
    }
  }, [question, response]);

  const getComponentStyle = (comp) => {
    const { position, width, height } = comp;
    return {
      position: "absolute",
      left: position?.left || 0,
      top: position?.top || 0,
      width: width ? `${width}px` : "auto",
      height: height ? `${height}px` : "auto",
      ...style,
    };
  };

  const getContainerStyle = () => {
    if (question?.backgroundColor) {
      return { backgroundColor: question.backgroundColor };
    }
    return {};
  };
  console.log(response, "response");
  // Enhanced answer retrieval for flat data structure
  const getUserAnswer = (comp) => {
    if (!response) return undefined;

    // Direct nested access
    let answer;

    // Try nested structure first
    if (response.answers && response.answers[question.id]) {
      answer = response.answers[question.id][comp.id];
    }

    // If not found, try flat dot-notation directly on response
    if (answer === undefined) {
      const flatKey = `answers.${question.id}.${comp.id}`;
      if (response[flatKey] !== undefined) {
        answer = response[flatKey];
      }
    }

    // Try alternate flat pattern where component values are stored in an object
    if (answer === undefined) {
      const questionAnswersKey = `answers.${question.id}`;
      if (
        response[questionAnswersKey] &&
        response[questionAnswersKey][comp.id] !== undefined
      ) {
        answer = response[questionAnswersKey][comp.id];
      }
    }

    // Also check for "answers.1" where 1 is the question ID (not nested)
    if (answer === undefined) {
      // Find any keys that match the pattern "answers.[questionId]"
      const answerKeys = Object.keys(response || {}).filter(
        (key) =>
          key.startsWith("answers.") &&
          key.split(".")[1] === String(question.id)
      );

      // If we found matching keys, look for component ID
      if (answerKeys.length > 0) {
        const answerKey = answerKeys[0];
        const questionAnswers = response[answerKey];

        if (questionAnswers && questionAnswers[comp.id] !== undefined) {
          answer = questionAnswers[comp.id];
        }
      }
    }

    console.log(`DEBUG - getUserAnswer for Q${question.id} Comp${comp.id}:`, {
      foundAnswer: answer,
      possibleKeys: Object.keys(response || {}).filter((k) =>
        k.startsWith("answers")
      ),
    });

    return answer;
  };

  // Enhanced status retrieval for flat data structure
  const getComponentStatus = (comp) => {
    if (!response) return null;

    // Try nested access first
    let status;

    if (response.componentStatus && response.componentStatus[question.id]) {
      status = response.componentStatus[question.id][comp.id];
    }

    // Try flat key access
    if (status === undefined) {
      const flatKey = `componentStatus.${question.id}.${comp.id}`;
      if (response[flatKey] !== undefined) {
        status = response[flatKey];
      }
    }

    // Try alternate flat format
    if (status === undefined) {
      const statusKey = `componentStatus.${question.id}`;
      if (response[statusKey] && response[statusKey][comp.id] !== undefined) {
        status = response[statusKey][comp.id];
      }
    }

    // Last resort: search keys with pattern matching
    if (status === undefined) {
      const statusKeys = Object.keys(response || {}).filter(
        (key) =>
          key.startsWith("componentStatus.") &&
          key.includes(String(question.id))
      );

      if (statusKeys.length > 0) {
        // Try to find the right component
        for (const key of statusKeys) {
          const parts = key.split(".");
          // If the key pattern includes the component ID
          if (
            parts.length > 2 &&
            parts[1] === String(question.id) &&
            parts[2] === String(comp.id)
          ) {
            status = response[key];
            break;
          }
        }
      }
    }

    console.log(
      `DEBUG - getComponentStatus for Q${question.id} Comp${comp.id}:`,
      {
        foundStatus: status,
        possibleKeys: Object.keys(response || {}).filter((k) =>
          k.startsWith("componentStatus")
        ),
      }
    );

    return status;
  };

  return (
    <div className="w-full overflow-hidden" ref={setContainerRef}>
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          height: `${CANVAS_HEIGHT * canvasScale}px`,
          maxWidth: `${CANVAS_WIDTH}px`,
          margin: "0 auto",
        }}
      >
        {/* Static overlay to prevent interactions */}
        {
          response?.answer &&
          <div style={staticOverlay} />

        }

        {/* Canvas with scaled content */}
        <div
          style={{
            position: "absolute",
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
            transform: `scale(${canvasScale})`,
            transformOrigin: "top left",
          }}
        >
          {/* Render each component */}
          {question?.components?.map((comp) => {
            const answer = getUserAnswer(comp);
            const status = getComponentStatus(comp);
            const compStyle = getComponentStyle(comp);
            console.log(comp, "single_checkboxstatus");

            switch (comp.type) {
              case "text":
                return (
                  <div key={comp.id} style={compStyle}>
                    <StaticFormattedTextDisplay
                      text={comp.text?.text || comp.text}
                      componentValue={comp}
                      format={
                        comp.text?.format || {
                          bold: false,
                          italic: false,
                          align: comp.textAlign || "left",
                          size: comp.textSize || 14,
                          color: comp.textColor || "#000000",
                        }
                      }
                    />
                  </div>
                );

              case "multiple_choice_single":
                return (
                  <div
                    key={comp.id}
                    style={compStyle}
                    className="flex flex-col "
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col w-full">
                      {/* <div className="p-3 border-b border-gray-100 bg-gray-50">
                        <span className="text-xs font-medium text-gray-500">
                          Select one option
                        </span>
                      </div> */}
                      <div className="flex-1 overflow-auto">
                        <StaticSingleChoiceAnswer
                          options={comp.options}
                          value={answer}
                          componentValue={comp}
                        />
                      </div>
                    </div>
                    {status && (
                      <div
                        className={`mt-2 text-sm font-medium ${status === "correct"
                            ? "text-green-600"
                            : "text-red-600"
                          }`}
                      >
                        {status === "correct" ? "✓ Correct" : "✗ Incorrect"}
                      </div>
                    )}
                  </div>
                );

              case "multiple_choice_multi":
                return (
                  <div
                    key={comp.id}
                    style={compStyle}
                    className="flex flex-col "
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col w-full">
                      {/* <div className="p-3 border-b border-gray-100 bg-gray-50">
                        <span className="text-xs font-medium text-gray-500">
                          Select multiple options
                        </span>
                      </div> */}
                      <div className="flex-1 overflow-auto">
                        <StaticMultiChoiceAnswer
                          options={comp.options || []}
                          value={answer || []}
                          componentValue={comp}
                        />
                      </div>
                    </div>
                    {status && (
                      <div
                        className={`mt-2 text-sm font-medium ${status === "correct"
                            ? "text-green-600"
                            : "text-red-600"
                          }`}
                      >
                        {status === "correct" ? "✓ Correct" : "✗ Incorrect"}
                      </div>
                    )}
                  </div>
                );

              case "true_false":
                return (
                  <div
                    key={comp.id}
                    style={compStyle}

                    height={comp.height}
                    width={comp.width}
                  >
                    <div className="w-full h-full  ">
                      <StaticTrueFalseAnswer value={answer} componentValue={comp} />
                    </div>
                    {status && (
                      <div
                        className={`mt-2 text-sm font-medium ${status === "correct"
                            ? "text-green-600"
                            : "text-red-600"
                          }`}
                      >
                        {status === "correct" ? "✓ Correct" : "✗ Incorrect"}
                      </div>
                    )}
                  </div>
                );

              case "short_text_answer":
                return (
                  <div
                    key={comp.id}
                    style={compStyle}
                    className="flex flex-col"
                  >
                    <div
                      className="bg-white rounded-xl  border-gray-200 "

                    >
                      {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                        {comp.label || "Short Text Answer"}
                      </label> */}

                      <StaticShortTextAnswer value={answer || ""} componentValue={comp} isAnswer={true} />


                    </div>
                    {status && (
                      <div
                        className={`mt-2 text-sm font-medium ${status === "correct"
                            ? "text-green-600"
                            : "text-red-600"
                          }`}
                      >
                        {status === "correct" ? "✓ Correct" : "✗ Incorrect"}
                      </div>
                    )}
                  </div>
                );

              case "single_checkbox":
                return (
                  <div key={comp.id} style={compStyle}>
                    <ShapeCheckbox
                      id={comp.id}
                      checked={answer}
                      width={comp.width}
                      height={comp.height}
                      borderColor={comp.borderColor}
                      borderRadius={comp.borderRadius}
                      backgroundColor={comp.backgroundColor}
                      shapeType={comp.shapeType}
                      shapeTypeColor={comp.shapeTypeColor}
                    />
                    {status && (
                      <div
                        className={`mt-2 text-sm font-medium ${status === "correct"
                            ? "text-green-600"
                            : "text-red-600"
                          }`}
                      >
                        {status === "correct" ? "✓ Correct" : "✗ Incorrect"}
                      </div>
                    )}
                  </div>
                );

              case "toggle_button":
                const toggled = answer || false;
                const opacity = comp.opacity ?? 1;

                // Helper function to build Bézier path from saved shape data
                const buildBezierPath = (anchors, handles) => {
                  const N = anchors.length;
                  if (N === 0 || handles.length !== N) return "";
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
                  <div key={comp.id} style={compStyle}>
                    {comp.anchors && comp.handles ? (
                      // Render custom SVG shape
                      <div
                        className="w-full h-full relative"
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
                                fill={comp.backgroundColor || "#ffffff"}
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
                    ) : (
                      // Default button fallback
                      <div
                        className={`w-full h-full relative rounded-xl transition-all shadow-sm flex items-center justify-center ${toggled
                          ? "bg-indigo-500 text-white border-none ring-2 ring-indigo-300"
                          : "bg-white text-gray-700 border border-gray-200"
                          }`}
                        style={{ opacity }}
                      >
                        <span className="font-bold text-sm">
                          {toggled ? "ON" : "OFF"}
                        </span>
                      </div>
                    )}
                    {status && (
                      <div
                        className={`mt-2 text-sm font-medium ${status === "correct"
                            ? "text-green-600"
                            : "text-red-600"
                          }`}
                      >
                        {status === "correct" ? "✓ Correct" : "✗ Incorrect"}
                      </div>
                    )}
                  </div>
                );

              case "image_upload":
                return (
                  <div
                    key={comp.id}
                    style={compStyle}
                    className="overflow-hidden rounded-lg"
                  >
                    {comp.image ? (
                      <img
                        src={comp.image}
                        alt="Question"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                );

              case "numeric_slider":
                return (
                  <div
                    key={comp.id}
                    style={{
                      ...compStyle,
                      height: comp.height - 21
                    }}
                    className="flex flex-col"
                  >
                    <div className="">
                      {comp.label && (
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {comp.label}
                        </label>
                      )}
                      <StaticNumericSliderAnswer
                        value={answer !== undefined ? answer : comp.minValue}
                        minValue={comp.minValue}
                        maxValue={comp.maxValue}
                        targetValue={comp.targetValue}
                        mode={comp.mode}
                        componentValue={comp}
                      />
                    </div>
                    {status && (
                      <div
                        className={`mt-2 text-sm font-medium ${status === "correct"
                            ? "text-green-600"
                            : "text-red-600"
                          }`}
                      >
                        {status === "correct" ? "✓ Correct" : "✗ Incorrect"}
                      </div>
                    )}
                  </div>
                );

              case "discrete_slider":
                console.log(answer, "discrete_slider");
                return (
                  <div
                    key={comp.id}
                    style={compStyle}
                    className="flex flex-col"

                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"

                      style={{
                        background: comp.optionBackgroundColor,
                        borderColor: comp.optionBorderColor,
                        borderRadius: comp.optionBorderRadius,
                      }}>
                      {comp.label && (
                        <label className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {comp.label}
                        </label>
                      )}
                      <StaticDiscreteSliderAnswer
                        value={answer !== undefined ? answer : 0}
                        options={comp.options}
                        componentValue={comp}
                      />
                    </div>
                    {status && (
                      <div
                        className={`mt-2 text-sm font-medium ${status === "correct"
                            ? "text-green-600"
                            : "text-red-600"
                          }`}
                      >
                        {status === "correct" ? "✓ Correct" : "✗ Incorrect"}
                      </div>
                    )}
                  </div>
                );

              case "ranking":
                return (
                  <div
                    key={comp.id}
                    style={compStyle}
                    className="flex flex-col"
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col w-full">
                      {/* {comp.label && (
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {comp.label}
                        </label>
                      )} */}
                      <div className="flex-1 overflow-auto">

                        <StaticRankingAnswer
                          items={comp.items || []}
                          currentOrder={
                            answer || comp.items?.map((_, i) => i) || []
                          }
                          componentValue={comp}
                        />
                      </div>
                    </div>
                    {status && (
                      <div
                        className={`mt-2 text-sm font-medium ${status === "correct"
                            ? "text-green-600"
                            : "text-red-600"
                          }`}
                      >
                        {status === "correct" ? "✓ Correct" : "✗ Incorrect"}
                      </div>
                    )}
                  </div>
                );

              case "matching_pairs":
                console.log(answer, "matching_pairs");
                return (
                  <div
                    key={comp.id}
                    style={{
                      ...compStyle,
                      height: comp.height,
                      width: comp.width,

                    }}
                  // className="flex flex-col h-full"
                  >
                    <div className="w-full h-full  rounded-lg border">
                      <StaticMatchingPairsAnswer
                        pairs={comp.pairs || []}
                        value={answer || []}
                        componentValue={comp}
                      />
                    </div>
                    {status && (
                      <div
                        className={`mt-2 text-sm font-medium ${status === "correct"
                            ? "text-green-600"
                            : "text-red-600"
                          }`}
                      >
                        {status === "correct" ? "✓ Correct" : "✗ Incorrect"}
                      </div>
                    )}
                  </div>
                );

              case "shape":
                return (
                  <div key={comp.id} style={compStyle}>
                    <div
                      style={{
                        backgroundColor: comp.backgroundColor || "#4A90E2",
                        opacity: comp.opacity !== undefined ? comp.opacity : 1,
                        transform: `rotate(${comp.rotation || 0}deg)`,
                        borderWidth: comp.borderWidth
                          ? `${comp.borderWidth}px`
                          : "0px",
                        borderColor: comp.borderColor || "#000",
                        borderStyle: comp.borderStyle || "solid",
                        width: "100%",
                        height: "100%",
                        borderRadius:
                          comp.shapeType === "circle"
                            ? "50%"
                            : comp.borderRadius
                              ? `${comp.borderRadius}px`
                              : 0,
                        clipPath:
                          comp.shapeType === "triangle"
                            ? "polygon(50% 0%, 0% 100%, 100% 100%)"
                            : comp.shapeType === "star"
                              ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                              : comp.shapeType === "hexagon"
                                ? "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)"
                                : "none",
                      }}
                    />
                  </div>
                );

              case "line":
                return (
                  <MinimalCurvedLineComponent key={comp.id} {...comp} />
                  // <svg
                  //   key={comp.id}
                  //   style={{
                  //     position: "absolute",
                  //     top: 0,
                  //     left: 0,
                  //     width: "100%",
                  //     height: "100%",
                  //     pointerEvents: "none",
                  //   }}
                  // >
                  //   <line
                  //     x1={comp.x1}
                  //     y1={comp.y1}
                  //     x2={comp.x2}
                  //     y2={comp.y2}
                  //     stroke={comp.color || "#000"}
                  //     strokeWidth={comp.width || "2"}
                  //     strokeDasharray={comp.dashed ? "5,5" : ""}
                  //   />
                  // </svg>
                );

              default:
                return (
                  <div
                    key={comp.id}
                    style={compStyle}
                    className="flex items-center justify-center bg-gray-100 rounded p-2"
                  >
                    <span className="text-xs text-gray-500">
                      Unsupported component: {comp.type}
                    </span>
                  </div>
                );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default StaticQuestionViewer;
