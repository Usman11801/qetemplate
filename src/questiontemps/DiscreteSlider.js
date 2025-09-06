import React, { useState, useEffect, useRef } from "react";
import BaseDraggable from "./BaseDraggable";
import { Plus, Edit2, Check, Trash2 } from "lucide-react";

const DiscreteSlider = ({
  id,
  position,
  options = [],
  selectedIndex,
  onUpdate,
  onDelete,
  width = 320,
  height = 120,
  optionSpacing = 8,
  optionTextColor = "#000000",
  optionSliderColor = "#3b82f6",
  optionSliderBackgroundColor = "#e5e7eb",
  thickness = 6,
  fontFamily = "Arial, sans-serif",
  fontSize = 14,
  optionBackgroundColor = "#f9fafb",
  onDoubleClick,
  fontStyles = {
    bold: false,
    italic: false,
    underline: false,
    lineThrough: false,
  },
  optionBorderColor = "#d1d5db",
  optionBorderRadius = 8,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingOptionIndex, setEditingOptionIndex] = useState(null);
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [contentHeight, setContentHeight] = useState(height);
  const [containerWidth, setContainerWidth] = useState(width);
  const [calculatedMinWidth, setCalculatedMinWidth] = useState(200);

  const contentRef = useRef(null);
  const mainSlider = useRef(null);
  const canvasRef = useRef(null);

  // Initialize canvas context for text measurement
  useEffect(() => {
    canvasRef.current = document.createElement("canvas").getContext("2d");
  }, []);

  const baseHeight = 200;
  const baseFontSize = fontSize;
  const computedFontSize = Math.min(
    Math.max(baseFontSize * (1 + (height / baseHeight - 1) / 2), 12),
    48
  );

  const fontStyle = {
    fontWeight: fontStyles?.bold ? "bold" : "normal",
    fontStyle: fontStyles?.italic ? "italic" : "normal",
    textDecoration: `${fontStyles?.underline ? "underline" : ""} ${
      fontStyles?.lineThrough ? "line-through" : ""
    }`.trim(),
    fontFamily,
    baseFontSize,
    whiteSpace: "nowrap",
  };

  const calculateMinWidth = () => {
    if (!canvasRef.current || options.length === 0) return 200; // fallback

    const fontWeight = fontStyles.bold ? "bold" : "normal";
    const fontStyleText = fontStyles.italic ? "italic" : "normal";
    canvasRef.current.font = `${fontStyleText} ${fontWeight} ${baseFontSize}px ${fontFamily}`;

    let maxOptionWidth = 0;
    options.forEach(option => {
      const optionWidth = canvasRef.current.measureText(option).width;
      if (optionWidth > maxOptionWidth) maxOptionWidth = optionWidth;
    });

    const padding = 16; 
    const spacing = 8;     
    const optionCount = options.length;
    const minOptionWidth = maxOptionWidth * optionCount + (optionCount - 1) * spacing;
    
    return Math.ceil(Math.max(minOptionWidth + padding, 200)); // minimum 200px
  };

  useEffect(() => {
    if (canvasRef.current) {
      const newMinWidth = calculateMinWidth();
      setCalculatedMinWidth(newMinWidth);
    }
  }, [options, fontSize, fontStyles, fontFamily]);

  // ResizeObserver to track content height changes dynamically
  useEffect(() => {
    if (!contentRef.current) return;

    const updateHeight = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.offsetHeight);
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
  }, [options, isEditing, newOptionLabel, editingOptionIndex]);

  // Keep selectedIndex valid if options are deleted
  useEffect(() => {
    if (selectedIndex >= options.length && options.length > 0) {
      onUpdate(id, { selectedIndex: options.length - 1 });
    }
  }, [options, selectedIndex, id, onUpdate]);

  const handleOptionEdit = (index, newLabel) => {
    const updatedOptions = [...options];
    updatedOptions[index] = newLabel.trim() || updatedOptions[index];
    onUpdate(id, { options: updatedOptions });
    setEditingOptionIndex(null);
  };

  const handleAddOption = () => {
    if (!newOptionLabel.trim()) return;
    const updatedOptions = [...options, newOptionLabel.trim()];
    onUpdate(id, { options: updatedOptions });
    setNewOptionLabel("");
  };

  const handleDeleteOption = (index) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    onUpdate(id, { options: updatedOptions });
    if (editingOptionIndex === index) setEditingOptionIndex(null);
  };

  const handleSelectionChange = (index) => {
    onUpdate(id, { selectedIndex: index });
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

  // Helper style for vertical spacing using marginBottom except last child
  const applyMarginBottom = (index, arrayLength, value = "1rem") =>
    index !== arrayLength - 1 ? { marginBottom: value } : {};

  return (
    <BaseDraggable
      id={id}
      type="discrete_slider"
      position={position}
      className="bg-white shadow rounded-md"
      onDelete={onDelete}
      onResize={handleResize}
      width={containerWidth}
      height={contentHeight + 4}
      minWidth={calculatedMinWidth} // ✅ Use dynamic minimum width based on text content
      minHeight={120}
      style={{
        background: optionBackgroundColor,
        borderColor: optionBorderColor,
        borderRadius: optionBorderRadius,
      }}
    >
      <div
        ref={contentRef}
        className="select-none"
        onDoubleClick={(e) => onDoubleClick?.("discrete_slider", id, e)}
        style={{
          background: optionBackgroundColor,
          borderRadius: optionBorderRadius,
          borderColor: optionBorderColor,
          width: "100%", // ✅ allow it to shrink with container
          boxSizing: "border-box",
        }}
      >
        {isEditing ? (
          <div
            className="p-2 scrollable"
            style={{ maxHeight: 300, overflowY: "auto" }}
          >
            {options.map((option, index) => (
              <div
                key={index}
                className="flex items-center p-1 border-b border-gray-300"
              >
                {editingOptionIndex === index ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      autoFocus
                      value={option}
                      onChange={(e) => {
                        const updatedOptions = [...options];
                        updatedOptions[index] = e.target.value;
                        onUpdate(id, { options: updatedOptions });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleOptionEdit(index, option);
                        if (e.key === "Escape") setEditingOptionIndex(null);
                      }}
                      className="flex-1 px-3 py-1.5 text-sm rounded-md focus:outline-none"
                      data-nodrag="true"
                    />
                    <button
                      onClick={() => handleOptionEdit(index, option)}
                      className="p-1 rounded-full hover:bg-green-100 text-green-600 transition"
                      data-nodrag="true"
                      aria-label="Save option"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingOptionIndex(index)}
                      className="flex-1 text-left px-3 py-1.5 text-sm hover:bg-gray-100 rounded-md transition"
                      data-nodrag="true"
                    >
                      {option}
                    </button>
                    <button
                      onClick={() => handleDeleteOption(index)}
                      className="p-1 rounded-full hover:bg-red-100 text-red-600 transition"
                      data-nodrag="true"
                      aria-label="Delete option"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            ))}

            <div
              className="flex items-center gap-1"
              style={{ marginTop: "1rem" }}
            >
              <input
                value={newOptionLabel}
                onChange={(e) => setNewOptionLabel(e.target.value)}
                placeholder="Add new option..."
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddOption();
                }}
                data-nodrag="true"
              />
              <button
                onClick={handleAddOption}
                className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newOptionLabel.trim()}
                data-nodrag="true"
                aria-label="Add option"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 py-6" style={{ ...fontStyle }}>
            <div
              className="relative h-2 bg-gray-200 rounded-full w-full"
              data-nodrag="true"
              style={{
                height: `${thickness}px`,
                background: optionSliderBackgroundColor,
              }}
            >
              <div
                className="absolute h-full rounded-full transition-all duration-300"
                style={{
                  width:
                    options.length > 1
                      ? `${(selectedIndex / (options.length - 1)) * 100}%`
                      : "0%",
                  maxWidth: "100%",
                  background: optionSliderColor,
                }}
              />
              {options.map((_, index) => (
                <div
                  key={index}
                  className="absolute top-1/2 -translate-y-1/2 rounded-full cursor-pointer border-2 border-white shadow-md"
                  style={{
                    height: `${thickness * 1.4}px`,
                    width: `${thickness * 1.4}px`,
                    left:
                      index === 0
                        ? "0%"
                        : index === options.length - 1
                        ? "100%"
                        : `${(index / (options.length - 1)) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    backgroundColor:
                      index <= selectedIndex ? optionSliderColor : "#e5e7eb",
                    transition: "background-color 0.3s ease",
                    ...fontStyle,
                  }}
                  onClick={() => handleSelectionChange(index)}
                  data-nodrag="true"
                  role="slider"
                  aria-valuemin={0}
                  aria-valuemax={options.length - 1}
                  aria-valuenow={selectedIndex}
                  aria-label={`Select option ${options[index]}`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleSelectionChange(index);
                  }}
                />
              ))}
            </div>

            <div className="flex justify-between text-sm text-gray-600 select-none w-full">
              {options.map((option, index) => (
                <div
                  key={index}
                  className={`cursor-pointer px-1 ${
                    index === selectedIndex ? "font-semibold text-blue-600" : ""
                  } transition-colors duration-200 mt-1`}
                  style={{
                    color:
                      index === selectedIndex
                        ? optionSliderColor
                        : optionTextColor,
                    fontSize: baseFontSize,
                    width: `${100 / options.length}%`,
                    textAlign:
                      index === 0
                        ? "left"
                        : index === options.length - 1
                        ? "right"
                        : "center",
                  }}
                  onClick={() => handleSelectionChange(index)}
                  data-nodrag="true"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleSelectionChange(index);
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="border-t border-gray-200 p-2 rounded-bl-lg rounded-br-lg"
          style={{
            marginTop: "0.5rem",
          }}
        >
          <button
            onClick={() => {
              if (isEditing) setEditingOptionIndex(null);
              setIsEditing(!isEditing);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition select-none"
            data-nodrag="true"
            aria-label={isEditing ? "Save options" : "Edit options"}
          >
            {isEditing ? <Check size={18} /> : <Edit2 size={18} />}
            <span className="text-sm font-medium">
              {isEditing ? "Save" : "Edit"}
            </span>
          </button>
        </div>
      </div>
    </BaseDraggable>
  );
};

export default DiscreteSlider;