import React, { useState, useEffect, useRef, useMemo } from "react";
import BaseDraggable from "./BaseDraggable";
import { Plus, X } from "lucide-react";

const MCMultipleSelect = ({
  id,
  position,
  options,
  correctAnswers,
  updateMCmulti,
  onDelete,
  onDoubleClick,
  width = 288,
  height = 0, // controlled by parent

  // Styling props with defaults
  fontFamily = "Arial, sans-serif",
  fontSize = 14,
  fontStyles = {
    bold: false,
    italic: false,
    underline: false,
    lineThrough: false,
  },
  optionSpacing = 8,
  optionBackgroundColor = "#f9fafb",
  optionBorderColor = "#d1d5db",
  optionBorderWidth = 1,
  optionBorderRadius = 8,
  backgroundColor = "#ffffff",
  selectType = "square", // "circle" | "square" | "diamond"
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
  const baseHeight = 155;
  const baseFontSize = 14;

  const computedFontSize = resizeFontSize ?? toolbarFontSize ?? baseFontSize;

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

  const minTextWidth = Math.max(
    computedFontSize * inputMinChars,
    ...textWidths
  );
  const inputMinWidth = Math.ceil(minTextWidth);

  const minWidth = useMemo(() => {
    return Math.ceil(
      toggleSize + gapTotal + inputMinWidth + removeSize + paddingTotal + 40
    );
  }, [toggleSize, gapTotal, inputMinWidth, removeSize, paddingTotal]);

  const rowHeight = computedFontSize + 16 + optionSpacing;
  const optionsHeight = options.length * rowHeight;
  const footerHeight = rowHeight - optionSpacing;
  const containerPad = dynamicPadding * 2;
  const baseMinHeight = optionsHeight + footerHeight + containerPad + 0; //50 removes
  const minHeight = baseMinHeight + 30;

  useEffect(() => {
    if (!contentRef.current) return;
    const contentH = contentRef.current.scrollHeight;
    const requiredHeight = Math.max(contentH, minHeight);
    if (requiredHeight > height) {
      updateMCmulti(id, { height: requiredHeight + 10 });
    }
    setToolbarFontSize(fontSize);
    setResizeFontSize(null);
  }, [options.length, isAddingNew, height, id, minHeight, updateMCmulti]);

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    const newOpts = [...options, newOption];
    updateMCmulti(id, {
      options: newOpts,
      correctAnswers,
      width: Math.max(width, minWidth),
    });
    setNewOption("");
    setIsAddingNew(false);
  };

  const handleToggleCorrect = (idx) => {
    const updated = correctAnswers.includes(idx)
      ? correctAnswers.filter((a) => a !== idx)
      : [...correctAnswers, idx];
    updateMCmulti(id, { correctAnswers: updated });
  };

  const handleRenameOption = (idx, newValue) => {
    const updatedOpts = options.map((opt, i) => (i === idx ? newValue : opt));
    updateMCmulti(id, {
      options: updatedOpts,
      width: Math.max(width, minWidth),
    });
  };

  const handleRemoveOption = (idx) => {
    const updatedOpts = options.filter((_, i) => i !== idx);
    const updatedCorrect = correctAnswers
      .filter((a) => a !== idx)
      .map((a) => (a > idx ? a - 1 : a));
    updateMCmulti(id, { options: updatedOpts, correctAnswers: updatedCorrect });
  };

  // const handleResize = (_id, dims) => {
  //   const updates = {};
  //   if (dims.width !== width) updates.width = Math.max(dims.width, minWidth);
  //   if (dims.height !== height) {
  //     updates.height = Math.max(dims.height, minHeight);

  //     const newFontSize = Math.min(
  //       Math.max(baseFontSize * (1 + ((updates.height / baseHeight - 1) / 3)), 12),
  //       24
  //     );

  //     updates.fontSize = newFontSize;
  //   }
  //   if (Object.keys(updates).length) updateMCmulti(id, updates);
  // };

  const handleResize = (_id, dims) => {
    const updates = {};
    if (dims.width !== width) updates.width = Math.max(dims.width, minWidth);
    if (dims.height !== height) {
      updates.height = Math.max(dims.height, minHeight);

      const newFontSize = Math.min(
        Math.max(
          baseFontSize * (1 + (updates.height / baseHeight - 1) / 3),
          12
        ),
        24
      );

      updates.fontSize = newFontSize;

      // Update local state: font size is now from resize, so clear toolbar override
      setResizeFontSize(newFontSize);
      setToolbarFontSize(null);
    }
    if (Object.keys(updates).length) updateMCmulti(id, updates);
  };

  // Font style string construction
  const fontWeight = fontStyles?.bold ? "bold" : "normal";
  const fontStyle = fontStyles?.italic ? "italic" : "normal";
  const textDecoration = [
    fontStyles?.underline ? "underline" : "",
    fontStyles?.lineThrough ? "line-through" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Render select shape button for multiple select (square checkboxes, circles, diamonds)
  const renderSelectShape = (selected) => {
    const baseClasses = `w-5 h-5 flex items-center justify-center cursor-pointer transition-colors border-2 ${selected
        ? "bg-blue-600 border-blue-600"
        : "border-gray-300 hover:border-blue-400"
      }`;

    switch (selectType) {
      case "square":
        return (
          <button
            className={`${baseClasses} rounded-sm`}
            data-nodrag="true"
            aria-pressed={selected}
            aria-label={selected ? "Selected" : "Not selected"}
          >
            {selected && <div className="w-3 h-3 bg-white" />}
          </button>
        );
      case "diamond":
        return (
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
            className={`${baseClasses} rounded-full`}
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
      type="multiple_choice_multi"
      position={position}
      width={width}
      minWidth={minWidth}
      minHeight={minHeight + 27}
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
        className="flex flex-col  h-full rounded-lg border-2 p-2"
        style={{
          backgroundColor,
          borderColor: optionBorderColor,
          borderWidth: optionBorderWidth,
          borderStyle: "solid",
        }}
        onDoubleClick={(e) => onDoubleClick?.("multiple_choice_multi", id, e)}
      >
        <div className="flex-1">
          <div className="flex flex-col h-full">
            {options.map((opt, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-2 rounded-lg p-2 hover:shadow-md transition-shadow duration-150 h-full"
                style={{
                  fontSize: computedFontSize,
                  backgroundColor: optionBackgroundColor,
                  borderColor: optionBorderColor,
                  borderWidth: optionBorderWidth,
                  borderRadius: optionBorderRadius,
                  borderStyle: "solid",
                  marginBottom: optionSpacing,
                }}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleCorrect(idx);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {renderSelectShape(correctAnswers.includes(idx))}
                </div>

                <input
                  className="flex-1 bg-transparent focus:outline-none"
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
              style={{
                flex: 1,
                padding: "0.5rem",
                fontSize: computedFontSize,
                minWidth: inputMinWidth,
              }}
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
            <Plus size={computedFontSize + 2} /> Add Option
          </button>
        )}
      </div>
    </BaseDraggable>
  );
};

export default MCMultipleSelect;
