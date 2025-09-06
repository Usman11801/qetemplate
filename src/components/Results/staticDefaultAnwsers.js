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
import CurvedLineComponent from "../../questiontemps/CurvedLineComponent";
import MinimalCurvedLineComponent from "../Form/staticComponent/curvedLine";
import ShapeCheckbox from "../Form/staticComponent/shapeCheckBox";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const StaticQuestionPreview = ({ question, style = {} }) => {
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

  useEffect(() => {
    if (!containerRef) return;

    const handleResize = () => {
      const containerRect = containerRef.getBoundingClientRect();
      setContainerWidth(containerRect.width);

      let scaleFactor = Math.min(containerRect.width / CANVAS_WIDTH, 1);

      if (window.innerWidth < 480) scaleFactor = Math.max(scaleFactor, 0.4);
      else if (window.innerWidth < 768)
        scaleFactor = Math.max(scaleFactor, 0.5);
      else if (window.innerWidth < 1024)
        scaleFactor = Math.max(scaleFactor, 0.6);

      setCanvasScale(scaleFactor);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [containerRef]);

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

  const getDefaultAnswer = (comp) => {
    switch (comp.type) {
      case "multiple_choice_single":
        return comp.correctIndex ?? 0;
      case "multiple_choice_multi":
        return comp.correctAnswers ?? [];
      case "true_false":
        return comp.value ?? false;
      case "toggle_button":
        return comp.toggled ?? 0;
      case "single_checkbox":
        return comp.correctValue ?? 0;
      case "numeric_slider":
        return comp.currentValue ?? 0;
      case "discrete_slider":
        return comp.selectedIndex;
      case "ranking":
        return comp.items?.map((_, i) => i) || [];
      case "matching_pairs": {
        const leftItems = [...new Set(comp.pairs.map((pair) => pair.left))];
        const rightItems = [...new Set(comp.pairs.map((pair) => pair.right))];

        return comp.pairs.map((pair) => ({
          left: leftItems.indexOf(pair.left),
          right: rightItems.indexOf(pair.right),
        }));
      }
      case "short_text_answer":
        console.log(comp, "short_text_answer");
        return comp.correctAnswer || "";
      default:
        return null;
    }
  };

  const getContainerStyle = () => {
    if (question?.backgroundColor) {
      return { backgroundColor: question.backgroundColor };
    }
    return {};
  };

  return (
    <div className="w-full overflow-hidden" ref={setContainerRef}>
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          ...getContainerStyle(),
          height: `${CANVAS_HEIGHT * canvasScale}px`,
          maxWidth: `${CANVAS_WIDTH}px`,
          margin: "0 auto",
        }}
      >
        <div style={staticOverlay} />
        <div
          style={{
            position: "absolute",
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
            transform: `scale(${canvasScale})`,
            transformOrigin: "top left",
          }}
        >
          {question?.components?.map((comp) => {
            const answer = getDefaultAnswer(comp);
            const compStyle = getComponentStyle(comp);
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
                          align: "left",
                          size: "text-base",
                          color: "text-gray-900",
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
                    <div className="mt-2 text-sm font-medium text-green-600 ">
                      ✓ Correct
                    </div>
                  </div>
                );

              case "multiple_choice_multi":
                // console.log(answer, "answerMulti");
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
                      <div className="flex-1 overflow-auto ">
                        <StaticMultiChoiceAnswer
                          options={comp.options || []}
                          value={answer}
                          componentValue={comp}
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-sm font-medium text-green-600 ">
                      ✓ Correct
                    </div>
                  </div>
                );

              case "true_false":
                return (
                  <div
                    key={comp.id}
                    style={{
                      ...compStyle,
                   height: comp.height ,
                      width: comp.width ,
                    }}
                    

                  >
                    <div className="w-full h-full  rounded-lg "  >
                      <StaticTrueFalseAnswer value={answer} componentValue={comp} />
                    </div>
                    <div className="mt-2 text-sm font-medium text-green-600 ">
                      ✓ Correct
                    </div>
                  </div>
                );

              case "short_text_answer":
                // console.log(comp, "comp on answer box")
                return (
                  <div
                    key={comp.id}
                    style={{
                      ...compStyle,



                      display: "block"
                    }}
                    className=""

                  >

                    <div className="w-full h-full  rounded-lg "   >
                      {/* <label className="block text-sm font-medium text-gray-700 mb-2">
                        {comp.label || "Short Text Answer:"}
                      </label> */}
                      <StaticShortTextAnswer value={answer} componentValue={comp} />
                    </div>
                    <div className="mt-2 text-sm font-medium text-green-600 ">
                      ✓ Correct
                    </div>
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
                    <div className="mt-2 text-sm font-medium text-green-600 ">
                      ✓ Correct
                    </div>
                  </div>
                );

              case "toggle_button":
                return (
                  <div key={comp.id} style={compStyle}>
                    <StaticToggleButton
                      value={answer}
                      onLabel={comp.onLabel || "Toggled On"}
                      offLabel={comp.offLabel || "Toggled Off"}
                      width={comp.width ? `${comp.width}px` : "100%"}
                      height={comp.height ? `${comp.height}px` : "100%"}
                      comp={comp}
                    />
                    <div className="mt-2 text-sm font-medium text-green-600 ">
                      ✓ Correct
                    </div>
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
                    style={{...compStyle,
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
                        value={answer}
                        minValue={comp.minValue}
                        maxValue={comp.maxValue}
                        targetValue={comp.targetValue}
                        mode={comp.mode}
                        componentValue={comp}
                      />
                    </div>
                    <div className="mt-2 text-sm font-medium text-green-600 ">
                      ✓ Correct
                    </div>
                  </div>
                );

              case "discrete_slider":
                console.log(comp, "descrete value")
                return (
                  <div
                    key={comp.id}
                    style={compStyle}
                    className="flex flex-col"
                  >
                    <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4"
                      style={{
                        background: comp.optionBackgroundColor,
                        borderColor: comp.optionBorderColor,
                        borderRadius: comp.optionBorderRadius,
                      }}>
                      {comp.label && (
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {comp.label}
                        </label>
                      )}
                      <StaticDiscreteSliderAnswer
                        value={answer}
                        options={comp.options}
                        componentValue={comp}
                      />
                    </div>
                    <div className="mt-2 text-sm font-medium text-green-600 ">
                      ✓ Correct
                    </div>
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
                        <div className="flex-1 overflow-auto ">

                      <StaticRankingAnswer
                        items={comp.items || []}
                        currentOrder={answer}
                        componentValue={comp}
                      />
                        </div>
                    </div>
                    <div className="mt-2 text-sm font-medium text-green-600 ">
                      ✓ Correct
                    </div>
                  </div>
                );

              case "matching_pairs":
                console.log(answer, "matching_pairs");
                return (
                  <div
                    key={comp.id}
                    style={{
                      ...compStyle,
                      height: comp.height + 20,
                  
                    }}
                    className="flex flex-col h-full"
                  >
                    <div className="w-full h-full rounded-lg border">
                      <StaticMatchingPairsAnswer
                        pairs={comp.pairs || []}
                        value={answer}
                        componentValue={comp}
                      />
                    </div>
                    <div className="mt-2 text-sm font-medium text-green-600 ">
                      ✓ Correct
                    </div>
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

export default StaticQuestionPreview;
