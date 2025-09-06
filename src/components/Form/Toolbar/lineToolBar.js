import React, { useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import { motion } from "framer-motion";
import {
  ToggleLeft,
  Radio,
  CheckSquare,
  Edit,
  Square,
  MousePointerClick,
  SlidersHorizontal,
  Target,
  ListOrdered,
  SplitSquareHorizontal,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";

const toolbarComponents = [
  [
    {
      type: "true_false",
      icon: ToggleLeft,
      label: "True/False",
      dimensions: { width: 128, height: 56 },
    },
    {
      type: "multiple_choice_single",
      icon: Radio,
      label: "Single Choice",
      dimensions: { width: 288, height: 200 },
    },
    {
      type: "multiple_choice_multi",
      icon: CheckSquare,
      label: "Multiple Choice",
      dimensions: { width: 288, height: 200 },
    },
    {
      type: "single_checkbox",
      icon: Square,
      label: "Checkbox",
      dimensions: { width: 48, height: 48 },
    },
    {
      type: "toggle_button",
      icon: MousePointerClick,
      label: "Toggle",
      dimensions: { width: 100, height: 40 },
    },
    {
      type: "short_text_answer",
      icon: Edit,
      label: "Text",
      dimensions: { width: 256, height: 64 },
    },
  ],
  [
    {
      type: "numeric_slider",
      icon: Target,
      label: "Number Slider",
      dimensions: { width: 320, height: 160 },
    },
    {
      type: "discrete_slider",
      icon: SlidersHorizontal,
      label: "Label Slider",
      dimensions: { width: 320, height: 160 },
    },
    {
      type: "ranking",
      icon: ListOrdered,
      label: "Ranking",
      dimensions: { width: 320, height: 220 },
    },
    {
      type: "matching_pairs",
      icon: SplitSquareHorizontal,
      label: "Matching",
      dimensions: { width: 400, height: 200 },
    },
  ],
];

const LineToolBar = ({
  questionId,
  isLeftSidebarOpen,
  leftSidebarWidth = 0,
  isRightSidebarOpen,
  windowWidth,
  selectedLine,
  onComponentUpdate,
  onDeselect,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(windowWidth < 768);
  const [isMobile, setIsMobile] = useState(windowWidth < 768);
  console.log(selectedLine, "selectedLine");
  // Update states when window size changes
  useEffect(() => {
    setIsMobile(windowWidth < 768);
    if (windowWidth < 768 && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [isCollapsed, onDeselect, windowWidth]);
  // Calculate offset for proper centering
  const calculatePosition = () => {
    // For mobile, just center in viewport
    if (windowWidth < 768) {
      return {
        left: "50%",
        transform: "translateX(-50%)",
      };
    }

    // For desktop, account for both sidebars
    let leftOffset = "50%";

    // Calculate sidebar offsets
    const leftSidebarOffset = isLeftSidebarOpen ? leftSidebarWidth / 2 : 0;
    const rightSidebarOffset = isRightSidebarOpen ? -32 : 0; // 64px / 2

    // Combine offsets
    const totalOffset = leftSidebarOffset + rightSidebarOffset;

    if (totalOffset !== 0) {
      leftOffset = `calc(50% + ${totalOffset}px)`;
    }

    return {
      left: leftOffset,
      transform: "translateX(-50%)",
    };
  };

  const position = calculatePosition();

  return (
    <div
      className="fixed bottom-6 z-50 transition-all duration-300"
      style={{
        left: position.left,
        transform: position.transform,
      }}
    >
      <motion.div
        key={questionId}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`${isCollapsed ? "mb-8" : ""}`}
      >
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 relative">
          {/* Collapse toggle button */}
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="absolute -top-3 left-1/2 transform -translate-x-1/2 
              bg-white rounded-full p-1 shadow-md border border-gray-200"
          >
            {isCollapsed ? (
              <ChevronUp size={16} className="text-gray-600" />
            ) : (
              <ChevronDown size={16} className="text-gray-600" />
            )}
          </button>

          {/* <button
            onClick={onDeselect}
            className="absolute -top-3 right-0 transform 
              bg-red-500 rounded-full p-1 shadow-md border border-gray-200 text-white"
          >
            {" "}
            <X className="text-white" />{" "}
          </button> */}

          <div
            className={`overflow-hidden transition-all duration-300 w-[544px] p-2 ${
              isCollapsed ? "max-h-0 py-0" : "max-h-48 "
            }`}
          >
            <div
              style={{ minWidth: 200 }}
              className="flex flex-col justify-between gap-2"
            >
              {/* First Row */}
              <div className="flex justify-between gap-4">
                {/* Line Style */}
                <label className="w-full">
                  <span className="text-xs font-medium text-gray-700">
                    Style:
                  </span>
                  <select
                    value={selectedLine?.shapeType}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedLine.id, {
                        shapeType: e.target.value,
                      })
                    }
                   className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-xs leading-tight text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </label>

                {/* Stroke Width */}
                <label className="w-full">
                  <span className="text-xs font-medium text-gray-700">
                    Width:
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={selectedLine?.strokeWidth}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedLine.id, {
                        strokeWidth: +e.target.value,
                      })
                    }
                    className="h-[36px]  w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-xs leading-tight text-gray-800 shadow-sm
               focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </label>

                {/* Stroke Color */}
                <label className="w-full">
                  <span className="text-xs font-medium text-gray-700">
                    Color:
                  </span>
                  <input
                    type="color"
                    value={selectedLine?.strokeColor}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedLine.id, {
                        strokeColor: e.target.value,
                      })
                    }
                    className="h-[36px] w-full  rounded border border-gray-300 p-0 shadow-sm
               focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </label>
              </div>

              {/* Second Row */}
              <div className="flex justify-between gap-4">
                {/* Arrow Type */}
                <label className="w-full">
                  <span className="text-xs font-medium text-gray-700">
                    Arrows:
                  </span>
                  <select
                    value={selectedLine?.arrowType}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedLine.id, {
                        arrowType: e.target.value,
                      })
                    }
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-xs leading-tight text-gray-800 shadow-sm
               focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="none">None</option>
                    <option value="start">Start</option>
                    <option value="end">End</option>
                    <option value="both">Both</option>
                  </select>
                </label>

                {/* Handle Shape */}
                <label className="w-full">
                  <span className="text-xs font-medium text-gray-700">
                    Handle Shape:
                  </span>
                  <select
                    value={selectedLine?.endpointShape}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedLine.id, {
                        endpointShape: e.target.value,
                      })
                    }
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-xs leading-tight text-gray-800 shadow-sm
               focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="circle">Circle</option>
                    <option value="square">Square</option>
                    <option value="arrow">Arrow</option>
                  </select>
                </label>

                {/* Handle Color */}
                <label className="w-full">
                  <span className="text-xs font-medium text-gray-700">
                    Handle Color:
                  </span>
                  <input
                    type="color"
                    value={selectedLine.endpointColor}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedLine.id, {
                        endpointColor: e.target.value,
                      })
                    }
                    className="h-[36px] w-full  rounded border border-gray-300 p-0 shadow-sm
               focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LineToolBar;
