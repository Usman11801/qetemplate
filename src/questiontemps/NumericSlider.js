import React, { useState, useRef, useEffect } from "react";
import BaseDraggable from "./BaseDraggable";
import { Check, Settings } from "lucide-react";

const NumericSlider = ({
  id,
  position,
  minValue = 0,
  maxValue = 100,
  targetValue = 50,
  currentValue,
  sliderColor = "#3b82f6",
  sliderBackgroundColor = "#e5e7eb",
  optionBackgroundColor = "#ffffff",
  showCurrentValue = true,
  mode,
  onUpdate,
  onDoubleClick,
  onDelete,
  width = 320,
  height = 160,
  quizMode = false,
  optionBorderRadius = 8,
  optionSpacing = 4,
  optionTextColor,
  thickness = 8,
  fontStyles = {
    bold: false,
    italic: false,
    underline: false,
    lineThrough: false,
  },
  fontFamily = "Arial, sans-serif",
  fontSize = 14,
}) => {
  const initialValue = quizMode
    ? currentValue ?? minValue
    : currentValue ?? targetValue;

  const [isEditing, setIsEditing] = useState(false);
  const [localMin, setLocalMin] = useState(minValue);
  const [localMax, setLocalMax] = useState(maxValue);
  const [localTarget, setLocalTarget] = useState(targetValue);
  const [localValue, setLocalValue] = useState(initialValue);
  const [contentHeight, setContentHeight] = useState(height);
  const [containerWidth, setContainerWidth] = useState(width);
  const [calculatedMinWidth, setCalculatedMinWidth] = useState(100);

  const contentRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize canvas context for text measurement
  useEffect(() => {
    canvasRef.current = document.createElement("canvas").getContext("2d");
  }, []);

  // Calculate minimum width based on text content
  const calculateMinWidth = () => {
    if (!canvasRef.current) return 200; // fallback

    // Set font for measurement to match the component's font style
    const fontWeight = fontStyles.bold ? "bold" : "normal";
    const fontStyleText = fontStyles.italic ? "italic" : "normal";
    canvasRef.current.font = `${fontStyleText} ${fontWeight} ${fontSize}px ${fontFamily}`;

    // Measure text widths
    const minText = String(localMin);
    const maxText = String(localMax);
    const targetText = `ans - ${localTarget}`;

    const minWidth = canvasRef.current.measureText(minText).width;
    const maxWidth = canvasRef.current.measureText(maxText).width;
    const targetWidth = canvasRef.current.measureText(targetText).width;

    // Calculate total required width with padding and spacing
    const padding = 16; // 2 * 8px padding on each side
    const spacing = 16; // spacing between elements
    const minimumSliderWidth = 100; // minimum space for the slider itself

    const totalTextWidth = minWidth + targetWidth + maxWidth + padding + spacing * 2;
    const calculatedWidth = Math.max(totalTextWidth, minimumSliderWidth + padding);

    return Math.ceil(calculatedWidth + 40); // extra buffer for safety
  };

  useEffect(() => {
    setLocalMin(minValue);
    setLocalMax(maxValue);
    setLocalTarget(targetValue);
    setLocalValue(currentValue ?? targetValue);
  }, [minValue, maxValue, targetValue, currentValue]);

  // Update calculated minimum width when values or font properties change
  useEffect(() => {
    if (canvasRef.current) {
      const newMinWidth = calculateMinWidth();
      setCalculatedMinWidth(newMinWidth);
    }
  }, [localMin, localMax, localTarget, fontSize, fontStyles, fontFamily]);

  // ResizeObserver for content height tracking
  useEffect(() => {
    if (!contentRef.current) return;

    const updateHeight = () => {
      if (contentRef.current) {
        const newHeight = contentRef.current.offsetHeight;
        setContentHeight(newHeight);
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(contentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [
    isEditing,
    localMin,
    localMax,
    localTarget,
    localValue,
    fontSize,
    optionSpacing,
  ]);

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setLocalValue(value);
    if (quizMode) {
      onUpdate(id, value);
    } else {
      onUpdate(id, { currentValue: value });
    }
  };

  const handleSettingsSave = () => {
    onUpdate(id, {
      minValue: parseInt(localMin, 10),
      maxValue: parseInt(localMax, 10),
      targetValue: parseInt(localTarget, 10),
    });
    setIsEditing(false);
  };

  const handleResize = (componentId, dimensions) => {
    // Ensure width doesn't go below calculated minimum
    const constrainedWidth = Math.max(dimensions.width, calculatedMinWidth);
    setContainerWidth(constrainedWidth);
    onUpdate(id, {
      width: constrainedWidth,
      height: contentHeight + 4,
    });
  };

  const percentage = ((localValue - localMin) / (localMax - localMin)) * 100;
  const targetPercentage =
    ((localTarget - localMin) / (localMax - localMin)) * 100;

  const fontStyle = {
    fontWeight: fontStyles?.bold ? "bold" : "normal",
    fontStyle: fontStyles?.italic ? "italic" : "normal",
    textDecoration: `${fontStyles?.underline ? "underline" : ""} ${
      fontStyles?.lineThrough ? "line-through" : ""
    }`.trim(),
    fontFamily,
    fontSize,
    whiteSpace: "nowrap",
  };

  return (
    <BaseDraggable
      id={id}
      type="numeric_slider"
      position={position}
      className="bg-white shadow"
      style={{
        borderRadius: optionBorderRadius,
      }}
      onDelete={onDelete}
      onResize={handleResize}
      width={containerWidth}
      height={contentHeight + 4}
      minWidth={calculatedMinWidth} // ✅ Use dynamic minimum width based on text content
      minHeight={contentHeight + 4}
      maxHeight={contentHeight + 4}
    >
      <div
        ref={contentRef}
        className="flex flex-col"
        style={{
          background: optionBackgroundColor,
          borderRadius: optionBorderRadius,
          width: "100%", // ✅ allow it to shrink with container
          boxSizing: "border-box",
        }}
        onDoubleClick={(e) => onDoubleClick?.("numeric_slider", id, e)}
      >
        {isEditing && !quizMode ? (
          <div className="p-2">
            <div className="flex justify-between w-full gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-600">Min Value</label>
                <input
                  type="number"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-nodrag="true"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600">Max Value</label>
                <input
                  type="number"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-nodrag="true"
                />
              </div>
            </div>

            <div className="mt-2">
              <label className="text-xs text-gray-600">Target Value</label>
              <input
                type="number"
                value={localTarget}
                onChange={(e) => setLocalTarget(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-nodrag="true"
              />
            </div>
          </div>
        ) : (
          <div className="p-2">
            <div
              className="flex justify-between items-center w-full px-2"
              style={{ gap: `${optionSpacing}px` }}
            >
              <span
                className="m-2 text-sm text-gray-600"
                style={{ ...fontStyle, color: optionTextColor }}
              >
                {localMin}
              </span>
              <span
                className="m-2 text-sm text-green-600 font-medium text-center"
                style={fontStyle}
              >
                ans - {localTarget}
              </span>
              <span
                className="m-2 text-sm text-gray-600 text-right"
                style={{ ...fontStyle, color: optionTextColor }}
              >
                {localMax}
              </span>
            </div>

            {/* Slider */}
            <div className="relative mb-4 mt-2">
              <input
                type="range"
                min={localMin}
                max={localMax}
                value={localValue}
                onChange={handleSliderChange}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  height: `${thickness}px`,
                  background: `linear-gradient(to right, ${sliderColor} 0%, ${sliderColor} ${percentage}%, ${sliderBackgroundColor} ${percentage}%, ${sliderBackgroundColor} 100%)`,
                }}
                data-nodrag="true"
              />
              <style>
                {`
            input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            min-height:10px;
            min-width:10px;
            height: ${thickness * 1.6}px;
            width: ${thickness * 1.6}px;
            background: ${sliderColor};
            border-radius: 50%;
            cursor: pointer;
          }

          input[type="range"]::-moz-range-thumb {
            height: ${thickness * 1.6}px;
            width: ${thickness * 1.6}px;
            background: ${sliderColor};
            border-radius: 50%;
            cursor: pointer;  
          }
        `}
              </style>

              {/* Target marker */}
              <div
                className="absolute top-0 w-0.5 h-5 bg-green-500"
                style={{
                  left: `${targetPercentage}%`,
                  transform: "translateX(-50%)",
                }}
              />
            </div>

            {showCurrentValue && (
              <div
                style={{ ...fontStyle, color: optionTextColor }}
                className="text-center text-sm text-gray-700 mt-2"
              >
                Current Value: {localValue}
              </div>
            )}
          </div>
        )}

        {/* Footer Buttons */}
        {/* {!quizMode && (
          <div className="border-t border-gray-200 p-2 flex justify-start">
            <button
              onClick={() => {
                isEditing ? handleSettingsSave() : setIsEditing(true);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition select-none"
              data-nodrag="true"
              aria-label={isEditing ? "Save settings" : "Edit settings"}
            >
              {isEditing ? (
                <>
                  <Check size={16} />
                  <span className="text-sm font-medium">Save</span>
                </>
              ) : (
                <>
                  <Settings size={16} />
                  <span className="text-sm font-medium">Edit</span>
                </>
              )}
            </button>
          </div>
        )} */}
      </div>
    </BaseDraggable>
  );
};

export default NumericSlider;
