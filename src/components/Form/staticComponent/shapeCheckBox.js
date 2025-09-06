// ShapeCheckbox.jsx
import { Check, X } from "lucide-react";
import React from "react";

const ShapeCheckbox = ({
  id,
  checked,
  onChange,
  width,
  height,
  borderColor,
  borderRadius,
  backgroundColor,
  shapeType,
  shapeTypeColor,
}) => {
  const renderShape = () => {
    if (!checked) return null;
    const size = Math.min(width, height) - 20;
  

    switch (shapeType) {
      case "tick":
        return <Check size={size} color={shapeTypeColor} />;
      case "cross":
        return <X size={size} color={shapeTypeColor} />;
      case "square":
        return (
          <div
            style={{
              width: size + 16,
              height: size + 15,
              backgroundColor: "transparent",
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
  console.log(shapeType, width, height, "check values")

  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-lg bg-transparent border-2 border-transparent p-2"
      style={{ width, height }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
        id={`checkbox-${id}`}
      />

      <label
        htmlFor={`checkbox-${id}`}
        style={{
          width: width - 20,
          height: height - 20,
          backgroundColor: checked ? backgroundColor : "",
          border: `2px solid ${borderColor}`,
          borderRadius: borderRadius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {renderShape()}
      </label>
    </div>
  );
};

export default ShapeCheckbox;
