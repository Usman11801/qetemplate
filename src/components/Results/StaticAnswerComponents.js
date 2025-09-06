// src/components/Results/StaticAnswerComponents.js
import React, { useLayoutEffect, useRef, useState } from "react";

// Helper: render the correct shape based on selectType and selection state
const renderSelectShape = (selectType, selected) => {
  const commonClasses =
    `w-5 h-5 flex items-center justify-center cursor-default transition-colors border-2 ` +
    (selected ? " border-blue-500" : "border-gray-300 hover:border-blue-400");

  switch (selectType) {
    case "square":
      return (
        <div
          className={`${commonClasses} rounded-md`}
          data-nodrag="true"
          role="img"
          aria-label={selected ? "Selected" : "Not selected"}
        >
          {selected && <div className="w-3 h-3 bg-white" />}
        </div>
      );

    case "diamond":
      return (
        // <div
        //   className={`${commonClasses} rotate-45`}
        //   data-nodrag="true"
        //   role="img"
        //   aria-label={selected ? "Selected" : "Not selected"}
        //   style={{ width: 20, height: 20 }}
        // >
        //   {selected && <div className="w-3 h-3 bg-white -rotate-45" />}
        // </div>
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
        <div
          className={`${commonClasses} rounded-full`}
          data-nodrag="true"
          role="img"
          aria-label={selected ? "Selected" : "Not selected"}
        >
          {selected && <div className="w-3 h-3 rounded-full bg-white" />}
        </div>
      );
  }
};

export const StaticSingleChoiceAnswer = ({
  value,
  options = [],
  componentValue = {},
}) => {
  // Safe defaults so we don't crash if something is missing
  const {
    backgroundColor = "transparent",
    optionBackgroundColor = "white",
    optionBorderColor = "#e5e7eb", // Tailwind gray-200/300-ish
    optionBorderWidth = 1,
    optionBorderRadius = 8,
    fontSize = 14,
    fontFamily = "inherit",
    fontColor = "#111827", // gray-900
    fontStyles = { bold: false, italic: false, underline: false, lineThrough: false },
    selectType = "circle",
  } = componentValue || {};

  return (
    <div
      className="flex flex-col space-y-2 w-full h-full p-2"
      style={{
        backgroundColor,
        borderColor: optionBorderColor,
        borderWidth: optionBorderWidth,
        borderStyle: "solid",
        borderRadius: optionBorderRadius,
      }}
      role="radiogroup"
      aria-label="Choices"
    >
      {options.map((option, idx) => {
        const selected = value === idx;
        return (
          <div
            key={idx}
            className="flex flex-1 w-full p-3 text-left rounded-lg border"
            style={{
              backgroundColor: optionBackgroundColor,
              borderColor: optionBorderColor,
              borderWidth: optionBorderWidth,
              borderRadius: optionBorderRadius,
              borderStyle: "solid",
              marginBottom: idx === options.length - 1 ? 0 : 8,
            }}
            role="radio"
            aria-checked={selected}
            tabIndex={-1}
          >
            <div className="flex items-center gap-3 w-full">
              {/* Single shape renderer (no extra circular wrapper) */}
              {renderSelectShape(selectType, selected)}

              <span
                className="flex-1"
                style={{
                  fontSize,
                  fontFamily,
                  color: fontColor,
                  fontWeight: fontStyles.bold ? "bold" : "normal",
                  fontStyle: fontStyles.italic ? "italic" : "normal",
                  textDecoration: [
                    fontStyles.underline ? "underline" : "",
                    fontStyles.lineThrough ? "line-through" : "",
                  ]
                    .filter(Boolean)
                    .join(" "),
                }}
              >
                {option}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};


// Static version of MultiChoiceAnswer
// Static version of MultiChoiceAnswer
export const StaticMultiChoiceAnswer = ({
  value = [],
  options = [],
  componentValue = {},
}) => {
  const {
    backgroundColor = "transparent",
    optionBackgroundColor = "#ffffff",
    optionBorderColor = "#e5e7eb",
    optionBorderWidth = 1,
    optionBorderRadius = 8,
    optionSpacing = 8,
    fontSize = 14,
    computedFontSize, // if you pass it, it wins
    fontFamily = "inherit",
    fontColor = "#374151",
    fontStyles = { bold: false, italic: false, underline: false, lineThrough: false },
    selectType = "circle",
  } = componentValue;

  const textDecoration = [
    fontStyles.underline ? "underline" : "",
    fontStyles.lineThrough ? "line-through" : "",
  ]
    .filter(Boolean)
    .join(" ");
  console.log(componentValue, 'componentValue in static multi choice answer')

  // Shape renderer (static)
  const renderSelectShape = (type, selected) => {
    const baseClasses =
      `w-5 h-5 flex items-center justify-center cursor-default transition-colors border-2 ` +
      (selected ? " border-blue-600" : " border-gray-300 hover:border-blue-400");

    switch (type) {
      case "square":
        return (
          <div
            className={`${baseClasses} rounded-sm`}
            data-nodrag="true"
            role="img"
            aria-label={selected ? "Selected" : "Not selected"}
          >
            {selected && <div className="w-3 h-3 bg-white" />}
          </div>
        );
      case "diamond":
        return (
          // <div
          //   className={`${baseClasses} rotate-45`}
          //   data-nodrag="true"
          //   role="img"
          //   aria-label={selected ? "Selected" : "Not selected"}
          //   style={{ width: 20, height: 20 }}
          // >
          //   {/* {selected && <div className="w-3 h-3 bg-white -rotate-45" />} */}
          // </div>
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
          <div
            className={`${baseClasses} rounded-full`}
            data-nodrag="true"
            role="img"
            aria-label={selected ? "Selected" : "Not selected"}
          >
            {selected && <div className="w-3 h-3 rounded-full bg-white" />}
          </div>
        );
    }
  };

  // Helper: support arrays of indices OR arrays of ids/values
  const isSelectedFor = (val, idx, option) => {
    if (!Array.isArray(val)) return false;
    const id = option && (option.id ?? option.value ?? idx);
    return val.includes(idx) || (id != null && val.includes(id));
  };

  return (
    <div
      className="flex flex-col space-y-2 w-full h-full p-2"
      style={{
        backgroundColor,
        borderColor: optionBorderColor,
        borderWidth: optionBorderWidth,
        borderStyle: "solid",
        borderRadius: optionBorderRadius,
      }}
    >
      {options.map((option, idx) => {
        const selected = isSelectedFor(value, idx, option);
        return (
          <div
            key={idx}
            className="flex flex-1 w-full p-3 text-left rounded-lg border"
            style={{
              backgroundColor: optionBackgroundColor,
              borderColor: optionBorderColor,
              borderWidth: optionBorderWidth,
              borderRadius: optionBorderRadius,
              borderStyle: "solid",
              marginBottom: idx === options.length - 1 ? 0 : optionSpacing,
            }}
            role="checkbox"
            aria-checked={selected}
            tabIndex={-1}
          >
            <div className="flex items-center gap-3 w-full">
              {renderSelectShape(selectType, selected)}

              <span
                className="flex-1"
                style={{
                  fontFamily,
                  fontWeight: fontStyles.bold ? "bold" : "normal",
                  fontStyle: fontStyles.italic ? "italic" : "normal",
                  textDecoration,
                  color: fontColor,
                  fontSize: computedFontSize ?? fontSize,
                }}
              >
                {typeof option === "string"
                  ? option
                  : option?.label ?? option?.text ?? String(option)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};


// Static version of TrueFalseAnswer
export const StaticTrueFalseAnswer = ({ value, componentValue }) => {
  const textDecoration = [
    componentValue.fontStyles.underline ? "underline" : "",
    componentValue.fontStyles.lineThrough ? "line-through" : "",
  ]
  return (
    <div className="flex gap-2 w-full h-full p-2" style={{
      width: componentValue?.width,
      height: componentValue?.height,
      backgroundColor: componentValue.backgroundColor,
      borderRadius: componentValue.borderRadius,
      border: `1px solid ${componentValue.borderColor}`,
      boxShadow: "none",

    }} >
      <div
        className={`flex flex-1 items-center justify-center py-2 px-3 rounded-lg font-medium text-center ${value
          ? "bg-green-500 text-white"
          : "bg-gray-100 text-gray-700"
          }`}
        style={{
          backgroundColor: value ? componentValue.leftBoxColor : "#f0f0f0",
                      color: componentValue?.fontColor || "#555",
          fontFamily: componentValue.fontFamily,
          fontWeight: componentValue.fontStyles.bold ? "bold" : "normal",
          fontStyle: componentValue.fontStyles.italic ? "italic" : "normal",
          borderRadius: componentValue.borderRadius,
        }}
      >
        <span
          style={{
            fontSize: componentValue.fontSize,
            textDecoration: textDecoration.join(" "),
          }}
        >
          True
        </span>
      </div>
      <div
        className={`flex flex-1 items-center justify-center py-2 px-3 rounded-lg font-medium text-center  ${value === false
          ? "bg-red-500 text-white"
          : "bg-gray-100 text-gray-700"
          }`}
        style={{
          backgroundColor: !value ? componentValue.rightBoxColor : "#f0f0f0",
                     color: componentValue?.fontColor || "#555",
          fontFamily: componentValue.fontFamily,
          fontWeight: componentValue.fontStyles.bold ? "bold" : "normal",
          fontStyle: componentValue.fontStyles.italic ? "italic" : "normal",
          borderRadius: componentValue.borderRadius,
        }}
      >
        <span
          style={{
            fontSize: componentValue.fontSize,
            textDecoration: textDecoration.join(" "),
          }}
        >

          False
        </span>
      </div>
    </div>
  );
};

// Static version of text display
export const StaticFormattedTextDisplay = ({
  text: textProp,
  format: formatProp,
  componentValue
}) => {
  const textDecoration = [
    componentValue.fontStyles.underline ? "underline" : "",
    componentValue.fontStyles.lineThrough ? "line-through" : "",
  ];
  // Handle the case where format might be passed separately or as part of the text object
  const text = typeof textProp === "string" ? textProp : textProp?.text;
  const format =
    formatProp || (typeof textProp === "string" ? {} : textProp?.format || {});

  const getTextClasses = () => {
    const classes = [];
    if (format.size) {
      classes.push(format.size);
    } else {
      classes.push("text-base");
    }

    // Only add color class if it's not a hex value
    if (format.color && !format.color.startsWith("#")) {
      classes.push(format.color);
    } else if (!format.color) {
      classes.push("text-gray-900");
    }

    if (format.bold) classes.push("font-bold");
    if (format.italic) classes.push("italic");

    switch (format.align) {
      case "center":
        classes.push("text-center");
        break;
      case "right":
        classes.push("text-right");
        break;
      default:
        classes.push("text-left");
    }

    return classes.join(" ");
  };


  console.log(componentValue, 'componentValue in static text display')

  return (
    <div
      className={`${getTextClasses()} w-full h-full flex items-center break-words p-2`}
      style={{
        fontSize: componentValue?.fontSize,
        fontFamily: componentValue?.fontFamily,
        color: componentValue?.fontColor,
        textAlign: componentValue?.textAlign,
        letterSpacing: componentValue?.letterSpacing,
        lineHeight: componentValue?.lineSpacing,
        fontWeight: componentValue?.fontStyles?.bold ? "bold" : "normal",
        fontStyle: componentValue?.fontStyles?.italic ? "italic" : "normal",
        outline: "none",
        overflow: "hidden",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        textDecoration: textDecoration.join(" "),
      }}
    >


      {text || "(No text)"}</div>

  );
};

// Static version of NumericSliderAnswer
export const StaticNumericSliderAnswer = ({
  value,
  minValue,
  maxValue,
  targetValue,
  mode,
  style = {},
  className = "",
  componentValue,
}) => {
  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
  console.log(componentValue, 'componentValue in static numeric slider answer')

  const fontStyle = {
    fontWeight: componentValue.fontStyles.bold ? "bold" : "normal",
    fontStyle: componentValue.fontStyles.italic ? "italic" : "normal",
    textDecoration: `${componentValue.fontStyles.underline ? "underline" : ""} ${componentValue.fontStyles.lineThrough ? "line-through" : ""
      }`.trim(),
    fontFamily: componentValue.fontFamily || "inherit",
    fontSize: componentValue.fontSize || 14,
    whiteSpace: "nowrap",
  };
  return (


    <div className={`${className} bg-white rounded-lg shadow-sm border-2 border-gray-200`} style={{
      ...style, background: componentValue.optionBackgroundColor,
      borderRadius: componentValue.optionBorderRadius,
      width: "100%", // ✅ allow it to shrink with container
      boxSizing: "border-box",
    }}>
      <div className="p-2">
        <div className="flex justify-between items-center px-2">
          <span className="text-sm text-gray-600 m-2" style={{ ...fontStyle, color: componentValue.optionTextColor }}>{minValue}</span>
          {mode === 'target' && targetValue !== null && (
            <span className="text-sm font-medium text-green-600 m-2" style={{ ...fontStyle, color: componentValue.optionTextColor }}>
              ans - {targetValue}
            </span>
          )}
          <span className="text-sm text-gray-600 m-2" style={{ ...fontStyle, color: componentValue.optionTextColor }}>{maxValue}</span>
        </div>

        <div className="relative mb-4">
          <input
            type="range"
            min={minValue}
            max={maxValue}
            value={value}
            // onChange={(e) => onChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              height: `${componentValue.thickness}px`,
              background: `linear-gradient(to right, ${componentValue.sliderColor} 0%, ${componentValue.sliderColor} ${percentage}%, ${componentValue.sliderBackgroundColor} ${percentage}%, ${componentValue.sliderBackgroundColor} 100%)`,
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
            height: ${componentValue.thickness * 1.6}px;
            width: ${componentValue.thickness * 1.6}px;
            background: ${componentValue.sliderColor};
            border-radius: 50%;
            cursor: pointer;
          }

          input[type="range"]::-moz-range-thumb {
            height: ${componentValue.thickness * 1.6}px;
            width: ${componentValue.thickness * 1.6}px;
            background: ${componentValue.sliderColor};
            border-radius: 50%;
            cursor: pointer;  
          }
        `}
          </style>
          {mode === 'target' && targetValue !== null && (
            <div
              className="absolute top-0 w-0.5 h-5 bg-green-500"
              style={{
                left: `${((targetValue - minValue) / (maxValue - minValue)) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            />
          )}
        </div>

        <div className="text-center text-sm font-medium" style={{ ...fontStyle, color: componentValue.optionTextColor }}>
          Current Value: {value}
        </div>
      </div>
    </div>



  );
};

// Static version of DiscreteSliderAnswer
// export const StaticDiscreteSliderAnswer = ({ value, options = [] }) => {
//   if (!options.length) return null;

//   return (
//     <div className="space-y-4 w-full">
//       {/* Visual Slider */}
//       <div className="relative h-1 bg-gray-200 rounded w-full">
//         <div
//           className="absolute h-full bg-blue-500 rounded"
//           style={{
//             width: `${(value / (options.length - 1)) * 100}%`,
//           }}
//         />
//         {options.map((_, index) => (
//           <div
//             key={index}
//             className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
//             style={{
//               left: `${(index / (options.length - 1)) * 100}%`,
//               transform: "translate(-50%, -50%)",
//               backgroundColor: index <= value ? "#3b82f6" : "#e5e7eb",
//             }}
//           />
//         ))}
//       </div>

//       {/* Labels */}
//       <div className="flex justify-between text-sm text-gray-600 w-full">
//         {options.map((option, index) => (
//           <div
//             key={index}
//             className={`text-center ${index === value ? "font-medium text-blue-600" : ""
//               }`}
//             style={{ width: `${100 / options.length}%` }}
//           >
//             {option}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };


export const StaticDiscreteSliderAnswer = ({ value, options = [], componentValue }) => {
  if (!options.length) return null;
  console.log(componentValue, 'componentValue in static discrete slider answer')
  return (
    <div className="w-full"
    >
      {/* Visual Slider */}
      <div className="relative h-2 bg-gray-200 rounded-full w-full"
        style={{
          height: `${componentValue?.thickness}px`,
          background: componentValue.optionSliderBackgroundColor,
        }}>
        <div
          className="absolute h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{
            width: `${(value / (options.length - 1)) * 100}%`,
            background: componentValue.optionSliderColor,
          }}
        />
        {options.map((_, index) => (
          <div
            key={index}
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-md"
            style={{
              height: `${componentValue?.thickness * 1.4}px`,
              width: `${componentValue?.thickness * 1.4}px`,
              left:
                index === 0
                  ? '1%'
                  : index === options.length - 1
                    ? '99%'
                    : `${(index / (options.length - 1)) * 100}%`,

              transform: 'translate(-50%, -50%)',

              backgroundColor:
                index <= value ? componentValue.optionSliderColor : "#e5e7eb",
              transition: 'background-color 0.3s ease',



            }}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-sm text-gray-600 w-full mt-1 select-none">
        {options.map((option, index) => (
          <div
            key={index}
            className={`cursor-default px-1 ${index === value ? 'font-medium text-blue-600' : ''
              }`}
            style={{
              color:
                index === value
                  ? componentValue.optionSliderColor
                  : componentValue.optionTextColor,
              fontSize: componentValue.fontSize,
              fontFamily: componentValue.fontFamily,
              fontWeight: componentValue.fontStyles?.bold ? 'bold' : 'normal',
              fontStyle: componentValue.fontStyles?.italic ? 'italic' : 'normal',
              textDecoration: [
                componentValue.fontStyles?.underline ? 'underline' : '',
                componentValue.fontStyles?.lineThrough ? 'line-through' : '',
              ].filter(Boolean).join(' '),
              width: `${100 / options.length}%`,
              textAlign:
                index === 0
                  ? 'left'
                  : index === options.length - 1
                    ? 'right'
                    : 'center',
            }}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};






// Static version of RankingAnswer
export const StaticRankingAnswer = ({ items, currentOrder = [], componentValue }) => {
  // If currentOrder is empty or not an array, create a default order
  const safeOrder =
    Array.isArray(currentOrder) && currentOrder.length > 0
      ? currentOrder
      : items.map((_, i) => i);

  return (
    <div className="flex flex-col space-y-2 w-full h-full p-2"
      style={{
        backgroundColor: componentValue?.backgroundColor || "transparent",
        borderColor: componentValue.optionBorderColor,
        borderWidth: componentValue.optionBorderWidth,
        borderStyle: "solid",
      }}>
      {safeOrder.map((itemIndex, currentPosition) => (
        <div
          key={currentPosition}
          className="flex items-center gap-3 p-3 bg-white border rounded-lg w-full h-full"
          style={{
            fontSize: componentValue?.fontSize,
            backgroundColor: componentValue.optionBackgroundColor,
            borderColor: componentValue.optionBorderColor,
            borderWidth: componentValue.optionBorderWidth,
            borderRadius: componentValue.optionBorderRadius,
            borderStyle: "solid",
            marginBottom: componentValue.optionSpacing,
          }}
        >
          {

            componentValue?.showNumber &&
            <span className="text-sm font-medium text-gray-600 w-6" style={{
              fontSize: componentValue?.fontSize,
              fontFamily: componentValue?.fontFamily,
              fontWeight: componentValue?.fontStyles?.bold ? "bold" : "normal",
              fontStyle: componentValue?.fontStyles?.italic ? "italic" : "normal",
              textDecoration: [
                componentValue?.fontStyles?.underline ? "underline" : "",
                componentValue?.fontStyles?.lineThrough ? "line-through" : "",
              ].filter(Boolean).join(" "),

            }} >
              {currentPosition + 1}.
            </span>
          }

          <span className="flex-1" style={{
            fontSize: componentValue?.fontSize,
            fontFamily: componentValue?.fontFamily,
            fontWeight: componentValue?.fontStyles?.bold ? "bold" : "normal",
            fontStyle: componentValue?.fontStyles?.italic ? "italic" : "normal",
            textDecoration: [
              componentValue?.fontStyles?.underline ? "underline" : "",
              componentValue?.fontStyles?.lineThrough ? "line-through" : "",
            ].filter(Boolean).join(" "),

          }} >
            {items[itemIndex] || `Item ${itemIndex + 1}`}
          </span>
        </div>
      ))}
    </div>
  );
};

export const StaticMatchingPairsAnswer = ({ pairs = [], value = [], componentValue }) => {
  // Ensure value is an array
  const safeValue = Array.isArray(value) ? value : [];

  const x1 = "41.67%";
  const x2 = "58.33%";

  const parsePercent = (str) => parseFloat(str.replace('%', ''));

  const x1Num = parsePercent(x1);
  const x2Num = parsePercent(x2);

  const lineLengthPercent = x2Num - x1Num; // 16.66%
  const halfLineLengthPercent = lineLengthPercent; // 8.33%

  console.log(halfLineLengthPercent, lineLengthPercent, 'check values')


  const getLineStrokeProps = (cv = {}) => {
    const stroke = cv.optionBorderColor ?? "#e5e7eb";
    const strokeWidth = Math.max(0.5, (cv.optionBorderWidth ?? 1) * 0.4);

    let strokeDasharray;
    let strokeLinecap = "butt";

    switch ((cv.optionBorderStyle || "solid").toLowerCase()) {
      case "dashed":
        // dash, gap
        strokeDasharray = `${strokeWidth * 4},${strokeWidth * 2}`;
        break;
      case "dotted":
        // short dashes with round caps look like dots
        strokeDasharray = `${strokeWidth},${strokeWidth * 1.5}`;
        strokeLinecap = "round";
        break;
      // "solid" or unknown → no dasharray
      default:
        strokeDasharray = undefined;
    }

    return { stroke, strokeWidth, strokeDasharray, strokeLinecap, vectorEffect: "non-scaling-stroke" };
  };

  return (
    <div className="relative w-full h-full p-2 rounded-lg "
      style={{
        width: componentValue?.width, height: componentValue?.height,
        background: "transparent",
        border: "none",
        boxShadow: "none",
        background: componentValue.optionBackgroundColor,
      }}

    >
      <div className="flex justify-between h-full w-full "
        style={{ background: componentValue.optionBackgroundColor }}>
        {/* Left Column */}
        <div className=" flex flex-col justify-between w-full gap-2">
          {pairs.map((pair, index) => {
            const isMatched = safeValue.some((m) => m.left === index);

            return (
              <div
                key={`left-${index}`}
                style={{
                  height: pairs.length > 0 ? `${90 / pairs.length}%` : "auto",
                  width: `calc(100% - ${halfLineLengthPercent}%)`,
                  borderColor: componentValue.optionBorderColor,
                  borderWidth: componentValue.optionBorderWidth,
                  borderRadius: componentValue.optionBorderRadius || "0.375rem",
                }}

                className={`flex-1 flex items-center p-2 shadow-sm rounded-lg ${isMatched
                  ? "border-2 border-green-500"
                  : "border border-gray-200"
                  } flex items-center`}
              >
                <span>{pair.left}</span>
              </div>
            );
          })}
        </div>



        {/* Right Column */}
        <div className=" flex flex-col justify-between w-full gap-2 items-end">
          {pairs.map((pair, index) => {
            const isMatched = safeValue.some((m) => m.right === index);

            return (
              <div
                key={`right-${index}`}
                style={{
                  height: pairs.length > 0 ? `${90 / pairs.length}%` : "auto",
                  width: `calc(100% - ${halfLineLengthPercent}%)`,
                  borderColor: componentValue.optionBorderColor,
                  borderWidth: componentValue.optionBorderWidth,
                  borderRadius: componentValue.optionBorderRadius || "0.375rem",
                }}
                className={`flex-1 flex items-center p-2 shadow-sm rounded-lg ${isMatched
                  ? "border-2 border-green-500"
                  : "border border-gray-200"
                  } flex items-center`}
              >
                <span>{pair.right}</span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Connection lines - IMPROVED to connect properly */}
      <svg
        className="absolute inset-0 pointer-events-none w-full h-full"
        style={{
          zIndex: 1,
          //  borderColor: componentValue?.optionBorderColor,
          // borderWidth: componentValue?.optionBorderWidth * 0.4,
          // borderStyle: componentValue?.optionBorderStyle,
        }}
      >
        {safeValue.map((match, idx) => {
          const rowH = 90 / pairs.length;
          const leftBoxY = match.left * rowH + rowH / 2;
          const rightBoxY = match.right * rowH + rowH / 2;

          const paddingTop = 4; // percent
          const leftY = paddingTop + leftBoxY;
          const rightY = paddingTop + rightBoxY;

          // ensure these are defined (percent strings or numbers)
          const x1 = "41.67%"; // end of left column
          const x2 = "58.33%"; // start of right column

          return (
            <line
              key={idx}
              x1={x1}
              y1={`${leftY}%`}
              x2={x2}
              y2={`${rightY}%`}
              {...getLineStrokeProps(componentValue)}
            />
          );
        })}
      </svg>

    </div>
  );
};



// Static version of ShortTextAnswer
export const StaticShortTextAnswer = ({ value = "", componentValue, isAnswer = false }) => {
  const textDecoration = [
    componentValue.fontStyles.underline ? "underline" : "",
    componentValue.fontStyles.lineThrough ? "line-through" : "",
  ];
  return (

    <div className="bg-white rounded-md border border-gray-200"
      style={{
        width: componentValue?.width, height: componentValue?.height, overflow: "hidden", boxSizing: "border-box", fontSize: componentValue?.fontSize, padding: 5, overflow: "hidden", border: "2px solid #cc",

        boxSizing: "border-box",
        backgroundColor: "#fff",
      }}
    >
      {value ? (
        <textarea
          className={`w-full h-full resize-none border-none bg-gray-100 text-gray-700  ${isAnswer ? 'scrollable ' : 'cursor-not-allowed'
            }`}
          readOnly
          style={{
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            fontSize: `${componentValue?.fontSize}px`,
            fontFamily: componentValue?.fontFamily,
            color: componentValue?.fontColor,
            fontWeight: componentValue.fontStyles.bold ? "bold" : "normal",
            fontStyle: componentValue.fontStyles.italic ? "italic" : "normal",
            textDecoration: textDecoration.join(" "),
            textAlign: componentValue.textAlign || "left",
            lineHeight: componentValue.lineSpacing,
            letterSpacing: `${componentValue.letterSpacing}px`,
            outline: "none",
            overflow: `${isAnswer ? "auto" : 'hidden'}`,

            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            backgroundColor: "#f9fafb",
            borderRadius: "0.5rem",
            padding: 3
          }}>
          {value}
        </textarea>
      ) : (
        <span className="text-gray-400">No answer provided</span>
      )}
    </div>

  );
};

// Static version of SingleCheckbox
export const StaticSingleCheckbox = ({ value = false, label = "Checkbox", componentValue }) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 flex items-center justify-center rounded ${value ? "bg-blue-500" : "border-2 border-gray-300 bg-white"
          }`}
      >
        {value && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

// Static version of ToggleButton  
export const StaticToggleButton = ({
  value = false,
  onLabel = "Toggled On",
  offLabel = "Toggled Off",
  width = "auto",
  height = "auto",
  comp = null, // Pass full component data for custom shapes
}) => {
  const toggled = value;
  const opacity = comp?.opacity ?? 1;

  // Helper function to build Bézier path from saved shape data
  const buildBezierPath = (anchors, handles) => {
    const N = anchors.length;
    if (N === 0 || handles.length !== N) return "";
    let d = `M ${anchors[0].x},${anchors[0].y} `;
    for (let i = 0; i < N; i++) {
      const curr = anchors[i];
      const next = anchors[(i + 1) % N];
      const currentHandle = handles[i];
      const nextHandle = handles[(i + 1) % N];

      if (!currentHandle || !nextHandle) continue;

      const { right: rOff } = currentHandle;
      const { left: lOff } = nextHandle;
      d += `C ${curr.x + rOff.x},${curr.y + rOff.y} ` +
        `${next.x + lOff.x},${next.y + lOff.y} ` +
        `${next.x},${next.y} `;
    }
    return d + "Z";
  };

  // Calculate text center based on anchor positions
  const calculateTextCenter = (anchors, width, height) => {
    if (!anchors || anchors.length === 0) {
      return { x: width / 2, y: height / 2 };
    }

    const sumX = anchors.reduce((sum, anchor) => sum + anchor.x, 0);
    const sumY = anchors.reduce((sum, anchor) => sum + anchor.y, 0);

    return {
      x: sumX / anchors.length,
      y: sumY / anchors.length
    };
  };

  // Calculate bounds of anchors and handles for proper viewBox
  const calculateContentBounds = (anchors, handles) => {
    if (!anchors || anchors.length === 0) return null;

    let minX = anchors[0].x;
    let minY = anchors[0].y;
    let maxX = anchors[0].x;
    let maxY = anchors[0].y;

    // Include handle positions in bounds calculation
    anchors.forEach((anchor, i) => {
      const handle = handles[i];
      if (handle) {
        // Check anchor position
        minX = Math.min(minX, anchor.x);
        minY = Math.min(minY, anchor.y);
        maxX = Math.max(maxX, anchor.x);
        maxY = Math.max(maxY, anchor.y);

        // Check handle positions
        if (handle.left) {
          minX = Math.min(minX, anchor.x + handle.left.x);
          minY = Math.min(minY, anchor.y + handle.left.y);
          maxX = Math.max(maxX, anchor.x + handle.left.x);
          maxY = Math.max(maxY, anchor.y + handle.left.y);
        }
        if (handle.right) {
          minX = Math.min(minX, anchor.x + handle.right.x);
          minY = Math.min(minY, anchor.y + handle.right.y);
          maxX = Math.max(maxX, anchor.x + handle.right.x);
          maxY = Math.max(maxY, anchor.y + handle.right.y);
        }
      }
    });

    return { minX, minY, maxX, maxY };
  };

  // If component has custom shape data, render SVG
  if (comp?.anchors && comp?.handles) {
    return (
      <div
        className="w-full h-full relative "
        style={{
          width: width,
          height: height,
          // opacity 
        }}
      >
        {(() => {
          // Calculate proper viewBox dimensions based on content
          const bounds = calculateContentBounds(comp.anchors, comp.handles);
          const padding = 15;

          let viewBoxWidth, viewBoxHeight, viewBoxX = 0, viewBoxY = 0;

          if (bounds) {
            // Use actual content bounds with padding
            viewBoxWidth = Math.max(bounds.maxX - bounds.minX + padding * 2, 50);
            viewBoxHeight = Math.max(bounds.maxY - bounds.minY + padding * 2, 30);
            viewBoxX = bounds.minX - padding;
            viewBoxY = bounds.minY - padding;
          } else {
            // Fallback to component dimensions
            viewBoxWidth = comp.width || 100;
            viewBoxHeight = comp.height || 40;
          }

          const textCenter = calculateTextCenter(
            comp.anchors,
            viewBoxWidth,
            viewBoxHeight
          );

          return (
            <svg
              width="100%"
              height="100%"
              viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
              preserveAspectRatio="none"
            >
              <path
                d={buildBezierPath(comp.anchors, comp.handles)}
                fill={comp.backgroundColor || "#ffffff"}
                stroke={comp.borderColor || "#000000"}
                strokeWidth={comp.borderWidth || 2}
                fillOpacity={opacity}
              // strokeOpacity={opacity}
              />
              <text
                x={textCenter.x}
                y={textCenter.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={toggled ? "#2563eb" : "#6b7280"}
                fontSize="14"
                fontFamily="Arial, sans-serif"
                fontWeight="bold"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {toggled ? "ON" : "OFF"}
              </text>
            </svg>
          );
        })()}
      </div>
    );
  }

  // Fallback to default button design
  return (
    <div
      className={`relative rounded-xl shadow-sm w-full h-full ${value
        ? "bg-indigo-500 text-white border-none ring-2 ring-indigo-300"
        : "bg-gray-50 border border-gray-300 text-gray-700"
        }`}
      style={{
        width: width,
        height: height,
        opacity
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${value ? "bg-white" : "bg-gray-300"
              }`}
          />
          <span className="font-medium text-sm">
            {value ? onLabel : offLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

// Static version of ShapeAnswer
export const StaticShapeAnswer = ({
  shapeType,
  backgroundColor,
  borderRadius,
  opacity,
  rotation,
  borderWidth,
  borderColor,
  borderStyle,
  style = {},
  className = "",
}) => {
  // Base style that fills the container.
  const baseStyle = {
    backgroundColor: backgroundColor || "#4A90E2",
    opacity: opacity ?? 1,
    transform: `rotate(${rotation || 0}deg)`,
    borderWidth: borderWidth ? `${borderWidth}px` : "0px",
    borderColor: borderColor || "#000",
    borderStyle: borderStyle || "solid",
    width: "100%",
    height: "100%",
    ...style,
  };

  // Adjust style based on shapeType.
  let extraStyle = {};
  switch (shapeType) {
    case "circle":
      extraStyle = { borderRadius: "50%" };
      break;
    case "triangle":
      // A triangle using clip-path.
      extraStyle = { clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" };
      break;
    case "star":
      extraStyle = {
        clipPath:
          "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
      };
      break;
    case "hexagon":
      extraStyle = {
        clipPath:
          "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)",
      };
      break;
    case "rectangle":
    default:
      // If a rectangle (or unknown type), optionally apply a borderRadius if provided.
      if (borderRadius) {
        extraStyle = { borderRadius: `${borderRadius}px` };
      }
      break;
  }

  const computedStyle = { ...baseStyle, ...extraStyle };

  return <div className={`w-full h-full ${className}`} style={computedStyle} />;
};
