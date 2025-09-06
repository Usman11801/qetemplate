import React, { useState, useEffect, useRef, useMemo } from "react";
import BaseDraggable from "./BaseDraggable";
import { Plus, X } from "lucide-react";

const MCSingleSelect = ({
  id,
  position,
  options = [],
  correctIndex = null,
  updateMCsingle,
  onDelete,
  onDoubleClick,
  width = 288,
  height = 0, // controlled by parent

  // New styling props with defaults
  fontFamily = "Arial, sans-serif",
  fontSize = 14,
  fontStyles = { bold: false, italic: false, underline: false, lineThrough: false },
  optionSpacing = 8,
  optionBackgroundColor = "#f9fafb",
  optionBorderColor = "#d1d5db",
  optionBorderWidth = 1,
  optionBorderRadius = 8,
  backgroundColor = "#ffffff",
  selectType = "circle", // "circle" | "square" | "diamond"
}) => {
  const [newOption, setNewOption] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const contentRef = useRef(null);
  const canvasRef = useRef(null);
  const [toolbarFontSize, setToolbarFontSize] = React.useState(fontSize); // null means no override
  const [resizeFontSize, setResizeFontSize] = React.useState(null);

  useEffect(() => {
    canvasRef.current = document.createElement("canvas").getContext("2d");
  }, []);
  // Applied font size prioritizes resize size, then toolbar size, then base
  const baseHeight = 177;
  const baseFontSize = 14;
  // const computedFontSize = Math.min(
  //   Math.max(baseFontSize * (1 + (height / baseHeight - 1) / 3), 12),
  //   24
  // );
  const computedFontSize = resizeFontSize ?? toolbarFontSize ?? baseFontSize;
  // console.log(computedFontSize,'computedFontSize')

  const dynamicPadding = height * 0.05;

  const toggleSize = computedFontSize + 8;
  const removeSize = computedFontSize * 1.1 + 8;
  const gapTotal = 8 * 2;
  const inputMinChars = 4;
  const paddingTotal = dynamicPadding * 2;

  const textWidths = useMemo(() => {
    if (!canvasRef.current) return [];
    canvasRef.current.font = `${computedFontSize}px ${fontFamily}`;
    return options.map((opt) => canvasRef.current.measureText(opt).width);
  }, [options, computedFontSize, fontFamily]);

  const minTextWidth = Math.max(computedFontSize * inputMinChars, ...textWidths);
  const inputMinWidth = Math.ceil(minTextWidth);

  const minWidth = useMemo(() => {
    return Math.ceil(toggleSize + gapTotal + inputMinWidth + removeSize + paddingTotal + 40);
  }, [toggleSize, gapTotal, inputMinWidth, removeSize, paddingTotal]);

  const rowHeight = computedFontSize + 16 + optionSpacing;
  const optionsHeight = options.length * rowHeight;
  const footerHeight = rowHeight - optionSpacing;
  const containerPad = dynamicPadding * 2;
  const baseMinHeight = optionsHeight + footerHeight + containerPad + 0; //50
  const minHeight = baseMinHeight + 30;

  useEffect(() => {
    if (!contentRef.current) return;
    const contentH = contentRef.current.scrollHeight;
    const requiredHeight = Math.max(contentH, minHeight);
    if (requiredHeight > height) {
      updateMCsingle(id, { height: requiredHeight + 10 });
    }

    setToolbarFontSize(fontSize);
    setResizeFontSize(null);
  }, [options.length, isAddingNew, height, id, minHeight, updateMCsingle, fontSize]);

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    const newOpts = [...options, newOption];
    updateMCsingle(id, {
      options: newOpts,
      correctIndex,
      width: Math.max(width, minWidth),
    });
    setNewOption("");
    setIsAddingNew(false);
  };

  const handleSetCorrect = (idx) => {
    updateMCsingle(id, { correctIndex: idx });
  };

  const handleRenameOption = (idx, newValue) => {
    const updatedOpts = options.map((opt, i) => (i === idx ? newValue : opt));
    updateMCsingle(id, {
      options: updatedOpts,
      width: Math.max(width, minWidth),
    });
  };

  const handleRemoveOption = (idx) => {
    const updatedOpts = options.filter((_, i) => i !== idx);
    let updatedCorrectIndex = correctIndex;
    if (correctIndex === idx) updatedCorrectIndex = null;
    else if (correctIndex > idx) updatedCorrectIndex = correctIndex - 1;
    updateMCsingle(id, { options: updatedOpts, correctIndex: updatedCorrectIndex });
  };

  // const handleResize = (_id, dims) => {
  //   const updates = {};
  //   if (dims.width !== width) updates.width = Math.max(dims.width, minWidth);
  //   if (dims.height !== height) {
  //     updates.height = Math.max(dims.height, minHeight);
  //     const newFontSize = Math.min(
  //       Math.max(baseFontSize * (1 + (updates.height / baseHeight - 1) / 3), 12),
  //       24
  //     );
  //     updates.fontSize = newFontSize;

  //   }
  //   if (Object.keys(updates).length) updateMCsingle(id, updates);
  // };

  const handleResize = (_id, dims) => {
    const updates = {};
    if (dims.width !== width) updates.width = Math.max(dims.width, minWidth);
    if (dims.height !== height) {
      updates.height = Math.max(dims.height, minHeight);
      console.log(updates.height, "resize height")

      const newFontSize = Math.min(
        Math.max(baseFontSize * (1 + (updates.height / baseHeight - 1) / 3), 12),
        24
      );

      updates.fontSize = newFontSize;

      // Update local state: font size is now from resize, so clear toolbar override
      setResizeFontSize(newFontSize);
      setToolbarFontSize(null);
    }
    if (Object.keys(updates).length) updateMCsingle(id, updates);
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

  // Helper to render correct radio shape
  const renderSelectShape = (selected) => {
    const commonClasses = `w-5 h-5 flex items-center justify-center cursor-pointer transition-colors border-2 ${selected ? " border-blue-500" : "border-gray-300 hover:border-blue-400"
      }`;

    switch (selectType) {
      case "square":
        return (
          <button
            className={`${commonClasses} rounded-md`}
            data-nodrag="true"
            aria-pressed={selected}
            aria-label={selected ? "Selected" : "Not selected"}
          >
            {selected && <div className="w-3 h-3 bg-white" />}
          </button>
        );
      case "diamond":
        return (
          // <button
          //   className={`${commonClasses} rotate-45`}
          //   data-nodrag="true"
          //   aria-pressed={selected}
          //   aria-label={selected ? "Selected" : "Not selected"}
          //   style={{ width: 20, height: 20 }}
          // >
          //   {selected && <div className="w-3 h-3 bg-white rotate-[-45deg]" />}
          // </button>
          <div
            className="w-5 h-5 flex items-center justify-center cursor-pointer"
            data-nodrag="true"
            aria-pressed={selected}
            aria-label={selected ? "Selected" : "Not selected"}
            role="button"
            tabIndex={0}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              className="transition-colors duration-200"
            >
              <polygon
                points="10,2 18,10 10,18 2,10"
                fill={selected ? "#2563eb" : "transparent"}
                stroke={selected ? "#2563eb" : "#d1d5db"}
                strokeWidth="2"
                className="hover:stroke-blue-400"
              />
            </svg>
          </div>
        );
      case "circle":
      default:
        return (
          <button
            className={`${commonClasses} rounded-full`}
            data-nodrag="true"
            aria-pressed={selected}
            aria-label={selected ? "Selected" : "Not selected"}
          >
            {selected && <div className="w-3 h-3 rounded-full bg-white" />}
          </button>
        );
    }
  };

  return (
    <BaseDraggable
      id={id}
      type="multiple_choice_single"
      position={position}
      width={width}
      minWidth={minWidth}
      minHeight={minHeight + 27}
      height={height}
      onDelete={onDelete}
      onResize={handleResize}
      style={{
        width,
        height,
        minWidth,
        minHeight,
        backgroundColor,
        border: "none",
        boxShadow: "none",
      }}
    >
      <div
        ref={contentRef}
        className="flex flex-col h-full rounded-lg border-2 p-2"
        style={{ backgroundColor, borderColor: optionBorderColor, borderWidth: optionBorderWidth, borderStyle: "solid" }}
      onDoubleClick={(e) => onDoubleClick?.("multiple_choice_single", id, e)}
      >
        <div className="flex-1" >
          <div
            className="flex flex-col h-full"
          // style={{ gap: optionSpacing }}
          >
            {options.map((opt, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 group rounded-md p-2 hover:shadow-md transition-shadow duration-150 h-full"
                style={{
                  fontSize: computedFontSize,
                  backgroundColor: optionBackgroundColor,
                  borderColor: optionBorderColor,
                  borderWidth: optionBorderWidth,
                  borderRadius: optionBorderRadius,
                  borderStyle: "solid",
                    marginBottom: idx === options.length - 1 ? 0 : optionSpacing,
                }}
              >
                {/* Select shape button */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetCorrect(idx);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {renderSelectShape(correctIndex === idx)}
                </div>

                {/* Option input */}
                <input
                  className="flex-1 bg-transparent focus:outline-none px-2"
                  value={opt}
                  onChange={(e) => handleRenameOption(idx, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  data-nodrag="true"
                  style={{
                    fontFamily,
                    fontWeight,
                    fontStyle,
                    textDecoration,
                    fontSize: computedFontSize,
                    minWidth: inputMinWidth,
                  }}
                />

                {/* Remove option button */}
                <button
                  onClick={() => handleRemoveOption(idx)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-100 text-red-500 transition-opacity duration-150"
                  data-nodrag="true"
                  aria-label="Remove option"
                >
                  <X size={22} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {isAddingNew ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddOption();
                if (e.key === "Escape") {
                  setIsAddingNew(false);
                  setNewOption("");
                }
              }}
              onBlur={() => {
                newOption.trim() ? handleAddOption() : setIsAddingNew(false);
              }}
              className="border rounded-md focus:outline-none"
              placeholder="New option..."
              style={{ flex: 1, padding: "0.5rem", fontSize: computedFontSize, minWidth: inputMinWidth }}
              data-nodrag="true"
            />
          </div>
        ) : (
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
            style={{ fontSize: computedFontSize, minHeight: 42 }}
            data-nodrag="true"
          >
            <Plus size={computedFontSize + 2} />
            Add Option
          </button>
        )}
      </div>
    </BaseDraggable>
  );
};

export default MCSingleSelect;
