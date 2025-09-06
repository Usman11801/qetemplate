// TrueFalse.js
import React, { useRef, useEffect, useState } from "react";
import BaseDraggable from "./BaseDraggable";

const TrueFalse = ({
  id,
  position,
  value,
  setValue,
  onDelete,
  width = 150,
  height = 56,
  onDoubleClick,
  onUpdate, // Callback to update dimensions on resize

  // Styling props with defaults
  fontFamily = "Arial, sans-serif",
  fontSize = 14,
  fontStyles = {
    bold: false,
    italic: false,
    underline: false,
    lineThrough: false,
  },
  fontColor = "#000000",
  leftBoxColor = "#22c55e",
  rightBoxColor = "#ef4444",
  borderRadius = 12,
  borderColor = "#d1d5db",
  backgroundColor = "#ffffff",
}) => {
  // Ref and state for dynamic minimum sizing
  const measureRef = useRef(null);
  const [minDimensions, setMinDimensions] = useState({ width: 150, height: 56 });

  // Function to calculate minimum dimensions based on hidden content
  const calculateMinDimensions = () => {
    if (measureRef.current) {
      const contentRect = measureRef.current.getBoundingClientRect();
      // Add some padding to ensure content doesn't touch the edges
      const padding = 12;
      const minWidth = Math.ceil(contentRect.width + padding);
      const minHeight = Math.ceil(contentRect.height + padding);
      setMinDimensions({ width: minWidth, height: minHeight });
    }
  };

  // Calculate minimum dimensions when font size or other styling changes
  useEffect(() => {
    // Small delay to ensure content is rendered before measuring
    const timer = setTimeout(() => {
      calculateMinDimensions();
    }, 10);
    return () => clearTimeout(timer);
  }, [fontSize, fontStyles, value]);

  // Initial calculation when component mounts
  useEffect(() => {
    calculateMinDimensions();
  }, []);

  const handleResize = (componentId, dimensions) => {
    // Prevent resizing below minimum dimensions
    const constrainedDimensions = {
      width: Math.max(dimensions.width, minDimensions.width),
      height: Math.max(dimensions.height, minDimensions.height)
    };
    if (onUpdate) {
      onUpdate(componentId, constrainedDimensions);
    }
  };

  // Compute font styles string
  const fontWeight = fontStyles?.bold ? "bold" : "normal";
  const fontStyle = fontStyles?.italic ? "italic" : "normal";
  const textDecoration = [
    fontStyles?.underline ? "underline" : "",
    fontStyles?.lineThrough ? "line-through" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <BaseDraggable
      id={id}
      type="true_false"
      position={position}
      width={width}
      height={height}
      className="group"
      onDelete={onDelete}
      onResize={handleResize}
      minWidth={minDimensions.width}
      minHeight={minDimensions.height}
      style={{
        width,
        height,
        backgroundColor,
        borderRadius,
        border: `1px solid ${borderColor}`,
        boxShadow: "none",
      }}
    >
      {/* Hidden measurement div for natural content size */}
      <div
        ref={measureRef}
        style={{
          position: "absolute",
          left: -9999,
          top: 0,
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: -1,
          height: "auto",
          width: "auto",
          padding: 12,
          fontFamily,
          fontSize,
          fontWeight: fontStyles?.bold ? "bold" : "normal",
          fontStyle: fontStyles?.italic ? "italic" : "normal",
          borderRadius,
          boxSizing: "border-box"
        }}
      >
        <div className="flex w-full gap-3 h-full min-w-0">
          <button
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors font-medium transition-all min-w-0 ${
              value
                ? "bg-green-500 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
            style={{
              backgroundColor: value ? leftBoxColor : "#f0f0f0",
              color: fontColor ,
              fontFamily,
              fontWeight: fontStyles?.bold ? "bold" : "normal",
              fontStyle: fontStyles?.italic ? "italic" : "normal",
              borderRadius,
            }}
          >
            <span
              style={{
                fontSize: fontSize,
                textDecoration,
              }}
            >
              True
            </span>
          </button>

          <button
            className="flex-1 py-2 px-3 rounded-lg font-medium transition-colors transition-all min-w-0"
            style={{
              backgroundColor: !value ? rightBoxColor : "#f0f0f0",
             color: fontColor ,
              fontFamily,
              fontWeight: fontStyles?.bold ? "bold" : "normal",
              fontStyle: fontStyles?.italic ? "italic" : "normal",
              borderRadius,
            }}
          >
            <span
              style={{
                fontSize: fontSize,
                textDecoration,
              }}
            >
              False
            </span>
          </button>
        </div>
      </div>
      {/* Actual visible content */}
      <div
        className="w-full h-full flex items-center justify-center p-2"
        onDoubleClick={(e) => onDoubleClick?.("true_false", id, e)}
      >
        <div className="flex w-full gap-3 h-full min-w-0">
          <button
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors font-medium transition-all min-w-0 ${
              value
                ? "bg-green-500 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setValue(id, true);
            }}
            data-nodrag="true"
            style={{
              backgroundColor: value ? leftBoxColor : "#f0f0f0",
              color:  fontColor ,
              fontFamily,
              fontWeight: fontStyles?.bold ? "bold" : "normal",
              fontStyle: fontStyles?.italic ? "italic" : "normal",
              borderRadius,
            }}
          >
            <span
              className="transform transition-transform group-hover:scale-105"
              style={{
                fontSize: fontSize,
                textDecoration,
              }}
            >
              True
            </span>
          </button>

          <button
            className="flex-1 py-2 px-3 rounded-lg font-medium transition-colors transition-all min-w-0"
            onClick={(e) => {
              e.stopPropagation();
              setValue(id, false);
            }}
            data-nodrag="true"
            style={{
              backgroundColor: !value ? rightBoxColor : "#f0f0f0",
             color: fontColor ,
              fontFamily,
              fontWeight: fontStyles?.bold ? "bold" : "normal",
              fontStyle: fontStyles?.italic ? "italic" : "normal",
              borderRadius,
            }}
          >
            <span
              className="transform transition-transform group-hover:scale-105"
              style={{
                fontSize: fontSize,
                textDecoration,
              }}
            >
              False
            </span>
          </button>
        </div>
      </div>
    </BaseDraggable>
  );
};

export default TrueFalse;
