// SingleCheckboxItem.js
import React from "react";
import BaseDraggable from "./BaseDraggable";
import { Check, X } from "lucide-react";

const SingleCheckboxItem = ({
  id,
  position,
  correctValue = true, // Default to checked
  setCorrectValue,
  onDelete,
  setSize, // Callback to update dimensions on resize
  width = 48,
  height = 48,
  onDoubleClick,

  // ---otherProps----
  backgroundColor = "#fff",
  borderColor = "#000000",
  borderRadius = 2,
  shapeType = "tick", // tick | cross | square | circle
  shapeTypeColor = "#22c55e", // Default green color
}) => {
  const handleToggle = () => {
    setCorrectValue(id, !correctValue);
  };
  console.log(
    shapeType,
    correctValue,
    backgroundColor,
    shapeTypeColor,
    "shapeType"
  );
  // When the component is resized, call setSize (if provided) with the new dimensions.
  const handleResize = (componentId, dimensions) => {
    if (setSize) {
      setSize(componentId, dimensions);
    }
  };
  // console.log("renderShape here", size, shapeType, shapeTypeColor, correctValue);
  const renderShape = () => {
    if (!correctValue) return null;

    const size = Math.min(width, height) - 16;
    switch (shapeType) {
      case "tick":
        return <Check size={size} color={shapeTypeColor} />;
      case "cross":
        return <X size={size} color={shapeTypeColor} />;
      case "square":
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: backgroundColor,
            }}
          />
        );
      case "circle":
        return (
          <div
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: shapeTypeColor,
            }}
          />
        );
      default:
        return null;
    }
  };
  return (
    <BaseDraggable
      id={id}
      type="single_checkbox"
      position={position}
      className="group border-2 border-transparent hover:border-gray-300"
      onDelete={onDelete}
      onResize={handleResize}
      minWidth={48}
      minHeight={48}
      style={{
        width: width,
        height: height,
        background: "transparent",
        boxShadow: "none",
      }}
    >
      <div
        onDoubleClick={(e) => onDoubleClick?.("single_checkbox", id, e)}
        className="w-full h-full flex items-center  justify-center rounded-lg bg-transparent"
      >
        {/* <input
          type="checkbox"
          checked={!!correctValue}
          onChange={handleToggle}
          className="w-6 h-6 accent-blue-500 cursor-pointer"
          data-nodrag="true"
        /> */}
        <input
          type="checkbox"
          checked={!!correctValue}
          onChange={handleToggle}
          className="sr-only"
          id={`checkbox-${id}`}
        />

        <label
          htmlFor={`checkbox-${id}`}
          style={{
            width: "90%",
            height: "90%",
            backgroundColor: correctValue ? backgroundColor : "",
            border: `2px solid ${borderColor}`,
            borderRadius,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {renderShape()}
        </label>
      </div>
    </BaseDraggable>
  );
};

export default SingleCheckboxItem;
