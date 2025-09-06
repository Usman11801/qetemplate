import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Scan, X } from "lucide-react";
import RangeSlider from "react-range-slider-input";
import 'react-range-slider-input/dist/style.css';    // if required
import "../../../App.css"

const ToggleBoxToolbar = ({
  questionId,
  isLeftSidebarOpen,
  leftSidebarWidth = 0,
  isRightSidebarOpen,
  windowWidth,
  selectedComponent,
  onComponentUpdate,
  onDelete,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(windowWidth < 768);
  const [isMobile, setIsMobile] = useState(windowWidth < 768);

  useEffect(() => {
    setIsMobile(windowWidth < 768);
    if (windowWidth < 768 && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [windowWidth, isCollapsed]);

  const calculatePosition = () => {
    if (windowWidth < 768) {
      return { left: "50%", transform: "translateX(-50%)" };
    }
    const leftSidebarOffset = isLeftSidebarOpen ? leftSidebarWidth / 2 : 0;
    const rightSidebarOffset = isRightSidebarOpen ? -32 : 0;
    const totalOffset = leftSidebarOffset + rightSidebarOffset;
    const leftOffset =
      totalOffset !== 0 ? `calc(50% + ${totalOffset}px)` : "50%";
    return { left: leftOffset, transform: "translateX(-50%)" };
  };

  const position = calculatePosition();

  // Generic onChange handler
  const handleChange = (field, value) => {
    onComponentUpdate(questionId, selectedComponent.id, {
      [field]: value,
    });
  };

  // Special handler for corner changes that resets the shape
  const handleCornerChange = (newCornerCount) => {
    onComponentUpdate(questionId, selectedComponent.id, {
      corners: newCornerCount,
      anchors: null, // Reset anchors to trigger regeneration
      handles: null  // Reset handles to trigger regeneration
    });
  };

  return (
    <div
      className="fixed bottom-6 z-50 transition-all duration-300"
      style={{
        left: position.left,
        transform: position.transform,
        // width: "400px",
      }}
    >
      <motion.div
        key={questionId}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`${
          isCollapsed ? "mb-8" : ""
        } bg-white rounded-xl shadow-xl border border-gray-200 relative`}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1 shadow-md border border-gray-200"
          aria-label="Toggle toolbar"
          type="button"
        >
          {isCollapsed ? (
            <ChevronUp size={16} className="text-gray-600" />
          ) : (
            <ChevronDown size={16} className="text-gray-600" />
          )}
        </button>

        {/* Delete button */}
        {/* {onDelete && (
          <button
            onClick={() => onDelete(selectedComponent?.id)}
            className="absolute -top-3 -right-3 bg-red-500 rounded-full p-1 shadow-md border border-gray-200 text-white hover:bg-red-600 transition-colors"
            aria-label="Delete component"
            type="button"
          >
            <X size={16} />
          </button>
        )} */}

        <div
          className={`transition-all duration-300 px-2 w-full min-w-[546px] max-w-[546px] ${
            isCollapsed
              ? "max-h-0 py-0 overflow-auto"
              : "max-h-[146px] py-2 overflow-hidden"
          }`}
        >
          <div className="flex justify-around gap-3">
            <div className="flex flex-col gap-2">
              {/* Opacity */}
              {/* <label>
                <p className="text-md text-black font-semibold mb-1">Opacity</p>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={selectedComponent?.opacity ?? 1}
                  onChange={(e) =>
                    handleChange("opacity", parseFloat(e.target.value))
                  }
                  className="w-full slider-thumb"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {selectedComponent?.opacity?.toFixed(2)}
                </div>
              </label> */}
              <div className="flex flex-col gap-2 w-[100px]">
                <p className="text-xs text-black font-semibold">Opacity</p>
                <div>
                  <RangeSlider
                    className="single-thumb"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[0, selectedComponent?.opacity ?? 1]}
                    thumbsDisabled={[true, false]}
                    rangeSlideDisabled={true}
                    onInput={([_, newValue]) =>
                      handleChange("opacity", parseFloat(newValue.toFixed(2)))
                    }
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {(selectedComponent?.opacity ?? 1).toFixed(2)}
                  </div>
                </div>
              </div>
              
            </div>
            <div className="flex flex-col justify-center gap-3">
              {/* Background Color */}
              <label className="flex items-center gap-2">
                <div className="flex justify-center items-center w-10 h-10 overflow-hidden rounded-lg shadow-lg border border-gray-200">
                  <input
                    type="color"
                    value={selectedComponent?.backgroundColor ?? "#ffffff"}
                    onChange={(e) =>
                      handleChange("backgroundColor", e.target.value)
                    }
                    className="w-[calc(100%+8px)] h-14 -m-1 border-none p-0 focus:outline-none ring-0 outline-none"
                  />
                </div>
                <p className="text-xs text-black font-semibold mb-1">
                  Background<br/>Color
                </p>
              </label>
              {/* Border Color */}
              <label className="flex items-center gap-2">
                <div className="flex justify-center items-center w-10 h-10 overflow-hidden rounded-lg shadow-lg border border-gray-200 ">
                  <input
                    type="color"
                    value={selectedComponent?.borderColor ?? "#000000"}
                    onChange={(e) =>
                      handleChange("borderColor", e.target.value)
                    }
                    className="w-[calc(100%+8px)] h-14 -m-1 border-none p-0 focus:outline-none ring-0 outline-none"
                  />
                </div>
                <p className="text-xs text-black font-semibold mb-1">
                  Border<br/>Color
                </p>
              </label>
            </div>
            <div className="flex flex-col gap-2">
              {/* Number of Corners */}
              <div className="flex flex-col gap-2">
                <p className="text-xs text-black font-semibold">
                  Number of Corners
                </p>
                <div className="min-w-36">
                  <RangeSlider
                    className="single-thumb"
                    min={3}
                    max={9}
                    step={1}
                    value={[3, selectedComponent?.corners ?? 4]}
                    onInput={([_, newValue]) =>
                      handleCornerChange(parseInt(newValue, 10))
                    }
                    thumbsDisabled={[true, false]}
                    rangeSlideDisabled={true}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedComponent?.corners ?? 4} corners (Min 3, Max 9)
                  </div>
                </div>
              </div>
              {/* Border width */}
              <label>
                <p className="text-xs text-black font-semibold mb-1">
                  Border Width
                </p>
                <div className="flex items-center gap-2 pr-1 pl-2 w-max h-10 overflow-hidden rounded-md bg-gray-200 shadow-md">
                  <Scan className="h-6 w-6" />
                  <input
                    type="number"
                    min={2}
                    max={8}
                    value={selectedComponent?.borderWidth ?? "2"}
                    onChange={(e) =>
                      handleChange("borderWidth", e.target.value)
                    }
                    className="w-8 border-none  text-sm font-medium bg-transparent focus:outline-none"
                  />
                </div>
              </label>

              {/* <label>
                <p className="text-md text-black font-semibold mb-1">
                  Number of Corners
                </p>
                <input
                  type="number"
                  min={3}
                  max={12}
                  value={selectedComponent?.corners ?? 4}
                  onChange={(e) =>
                    handleChange("corners", Number(e.target.value))
                  }
                  className="block w-full rounded-md border border-gray-300 p-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <div className="text-xs text-gray-500 mt-1">Min 3, Max 12</div>
              </label> */}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ToggleBoxToolbar;
