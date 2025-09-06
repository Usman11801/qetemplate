import React, { useState, useEffect, useRef } from 'react';
import { getShuffledOrder } from '../QuizUtils';
import { GripVertical } from 'lucide-react';




export const SingleChoiceAnswer = ({
  value,
  onChange,
  options = [],
  compValues = {},

}) => {
  // Safe defaults
  const {
    optionBorderRadius = 8,
    optionBorderWidth = 1,
    optionBackgroundColor = "#ffffff",
    optionBorderColor = "#e5e7eb",
    optionSpacing = 8,
    fontSize = 14,
    fontFamily = "inherit",
    fontColor = "#374151",
    fontStyles = { bold: false, italic: false, underline: false, lineThrough: false },
    selectType = "circle", // <— new
  } = compValues;

  const textDecoration = [
    fontStyles?.underline ? "underline" : "",
    fontStyles?.lineThrough ? "line-through" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Renders the selection indicator shape
  const renderSelectShape = (type, selected) => {
    const base =
      `w-5 h-5 flex items-center justify-center border-2 transition-colors ` +
      (selected ? "bg-blue-500 border-blue-500" : "border-gray-300 group-hover:border-blue-400");

    switch (type) {
      case "square":
        return (
          <div
            className={`${base} rounded-md`}
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
          //   className={`${base} rotate-45`}
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
            className={`${base} rounded-full`}
            data-nodrag="true"
            role="img"
            aria-label={selected ? "Selected" : "Not selected"}
          >
            {selected && <div className="w-3 h-3 rounded-full bg-white" />}
          </div>
        );
    }
  };

  console.log(value, "correct values");
  return (
    <div className="flex flex-col w-full h-full space-y-2">
      {options.map((option, idx) => {
        const isSelected = value === idx;

        return (
          <button
            key={idx}
            onClick={() => onChange(idx)}
            className={`group flex-1 w-full p-3 text-left rounded-lg border transition-all flex items-center gap-3 ${
              isSelected ? "border-blue-500 bg-blue-50 text-blue-700" : ""
            }`}
            style={{
              margin: 0,
              borderRadius: optionBorderRadius,
              borderWidth: optionBorderWidth,
              // Let Tailwind control selected colors, otherwise use custom
              backgroundColor:  optionBackgroundColor,
              borderColor:  optionBorderColor,
              marginBottom: idx === options.length - 1 ? 0 : optionSpacing,
            }}
            role="radio"
            aria-checked={isSelected}
          >
            {/* New: shape indicator */}
            {renderSelectShape(selectType, isSelected)}

            <span
              style={{
                fontSize: fontSize || "inherit",
                fontFamily: fontFamily || "inherit",
                fontWeight: fontStyles?.bold ? "bold" : "normal",
                fontStyle: fontStyles?.italic ? "italic" : "normal",
                textDecoration,
                color:  fontColor, // don't override Tailwind selected color
              }}
            >
              {typeof option === "string"
                ? option
                : option?.label ?? option?.text ?? String(option)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export const MultiChoiceAnswer = ({
  value = [],
  onChange,
  options = [],
  compValues = {},
}) => {
  // Safe defaults
  const {
    optionBorderRadius = 8,
    optionBorderWidth = 1,
    optionBackgroundColor = "#ffffff",
    optionBorderColor = "#e5e7eb",
    optionSpacing = 8,
    fontSize = 14,
    fontFamily = "inherit",
    fontColor = "#374151",
    fontStyles = { bold: false, italic: false, underline: false, lineThrough: false },
    selectType = "circle", // <-- new
  } = compValues;

  const textDecoration = [
    fontStyles?.underline ? "underline" : "",
    fontStyles?.lineThrough ? "line-through" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Toggle by index (as in your original implementation)
  const handleToggle = (idx) => {
    const next = Array.isArray(value) && value.includes(idx)
      ? value.filter((i) => i !== idx)
      : [...(value || []), idx];
    onChange?.(next);
  };

  // Shape renderer (re-usable)
  const renderSelectShape = (type, selected) => {
    const base =
      `w-5 h-5 flex items-center justify-center border-2 transition-colors ` +
      (selected ? "bg-blue-500 border-blue-500" : "border-gray-300 group-hover:border-blue-400");

    switch (type) {
      case "square":
        return (
          <div
            className={`${base} rounded-sm`}
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
          //   className={`${base} rotate-45`}
          //   data-nodrag="true"
          //   role="img"
          //   aria-label={selected ? "Selected" : "Not selected"}
          //   style={{ width: 20, height: 20 }}
          // >
          //   {selected && <div className="w-3 h-3 bg-blue -rotate-45" />}
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
            className={`${base} rounded-full`}
            data-nodrag="true"
            role="img"
            aria-label={selected ? "Selected" : "Not selected"}
          >
            {selected && <div className="w-3 h-3 rounded-full bg-white" />}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col w-full h-full space-y-2">
      {options.map((option, idx) => {
        const isSelected = Array.isArray(value) && value.includes(idx);

        return (
          <button
            key={idx}
            onClick={() => handleToggle(idx)}
            className={`group flex-1 w-full p-3 text-left rounded-lg border transition-all flex items-center gap-3 ${
              isSelected
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
            style={{
              margin: 0,
              borderRadius: optionBorderRadius,
              borderWidth: optionBorderWidth,
              // Let Tailwind control selected colors; otherwise use custom
              backgroundColor:  optionBackgroundColor,
              borderColor:  optionBorderColor,
              marginBottom: idx === options.length - 1 ? 0 : optionSpacing,
            }}
            role="checkbox"
            aria-checked={isSelected}
          >
            {/* Shape indicator with selectType */}
            {renderSelectShape(selectType, isSelected)}

            <span
              className="flex-1"
              style={{
                fontSize: fontSize || "inherit",
                fontFamily: fontFamily || "inherit",
                fontWeight: fontStyles?.bold ? "bold" : "normal",
                fontStyle: fontStyles?.italic ? "italic" : "normal",
                textDecoration,
                color: fontColor, // don't override selected Tailwind color
              }}
            >
              {typeof option === "string"
                ? option
                : option?.label ?? option?.text ?? String(option)}
            </span>
          </button>
        );
      })}
    </div>
  );
};


export const TrueFalseAnswer = ({ value, onChange,compValues,isDisabled }) => {

    const textDecoration = [
    compValues?.fontStyles?.underline ? "underline" : "",
    compValues?.fontStyles?.lineThrough ? "line-through" : "",
  ]
  // console.log(compValues,'true and false comp')
  return (
    <div className="flex gap-3 w-full h-full">
      <button
        onClick={() => onChange(true)}
        className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors `}
          style={{
              backgroundColor:  value === true ? compValues?.leftBoxColor : "#f0f0f0",
              color: compValues?.fontColor || "#555",
              fontFamily: compValues?.fontFamily,
              fontWeight: compValues?.fontStyles?.bold ? "bold" : "normal",
              fontStyle: compValues?.fontStyles?.italic ? "italic" : "normal",
              borderRadius: compValues?.borderRadius,
            }}
            isDisabled={isDisabled}
      >
          <span
              style={{
                fontSize: compValues?.fontSize,
                textDecoration: textDecoration.join(" "),
              }}
            >
              True
            </span>
      </button>
      <button
        onClick={() => onChange(false)}
        className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors `}
          style={{
              backgroundColor: value === false ? compValues?.rightBoxColor : "#f0f0f0",
                         color: compValues?.fontColor || "#555",
              fontFamily: compValues?.fontFamily,
              fontWeight: compValues?.fontStyles?.bold ? "bold" : "normal",
              fontStyle: compValues?.fontStyles?.italic ? "italic" : "normal",
              borderRadius: compValues?.borderRadius,
            }}
            isDisabled={isDisabled}
      >
         <span
              style={{
                fontSize: compValues?.fontSize,
                   textDecoration: textDecoration.join(" "),
              }}
            >
              False
            </span>
      </button>
    </div>
  );
};

export const FormattedTextDisplay = ({ text: textProp, format: formatProp,compValues }) => {
  const text = typeof textProp === 'string' ? textProp : textProp?.text;
  const format = formatProp || (typeof textProp === 'string' ? {} : textProp?.format || {});

  const getTextClasses = () => {
    const classes = [];
    if (format.size) {
      classes.push(format.size);
    } else {
      classes.push('text-base');
    }
    if (format.color && !format.color.startsWith('#')) {
      classes.push(format.color);
    } else if (!format.color) {
      classes.push('text-gray-900');
    }
    if (format.bold) classes.push('font-bold');
    if (format.italic) classes.push('italic');
    switch (format.align) {
      case 'center': classes.push('text-center'); break;
      case 'right': classes.push('text-right'); break;
      default: classes.push('text-left');
    }
    return classes.join(' ');
  };

  const getTextStyle = () => {
    const style = {};
    if (format.font) {
      style.fontFamily = format.font;
    }
    if (format.color && format.color.startsWith('#')) {
      style.color = format.color;
    }
    return style;
  };

  console.log(compValues, "comp values in formatted text display")
  const textDecoration = [
    compValues?.fontStyles?.underline ? "underline" : "",
    compValues?.fontStyles?.lineThrough ? "line-through" : "",
  ]
  return (
    <div 
      className={`${getTextClasses()} w-full h-full flex items-center`}
      style={{
        textAlign: compValues?.textAlign || 'left',
        padding: '3px',
      }}
    >
      <div className="w-full break-words" style={{
        fontSize:compValues?.fontSize,
        fontFamily: compValues?.fontFamily,
        color: compValues?.fontColor,
        textAlign: compValues?.textAlign || 'left',
        letterSpacing: compValues?.letterSpacing,
        lineHeight: compValues?.lineSpacing,
        fontWeight: compValues?.fontStyles?.bold ? "bold" : "normal",
        fontStyle: compValues?.fontStyles?.italic ? "italic" : "normal",
            textDecoration: textDecoration.join(" "),
      }}>
        {text || "(No text)"}
      </div>
    </div>
  );
};

export const NumericSliderAnswer = ({
  value,
  onChange,
  minValue,
  maxValue,
  targetValue,
  mode,
  style = {},
  className = "",
  compValues
}) => {
  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
            const textDecoration = [
    compValues?.fontStyles?.underline ? "underline" : "",
    compValues?.fontStyles?.lineThrough ? "line-through" : "",
  ]
  return (
    <div className={`${className} bg-white rounded-lg shadow-sm border-2 border-gray-200 `} style={style}>
  <div className="p-2">
    <div className="flex justify-between items-center px-2"
    style={{
      fontSize: compValues?.fontSize,
      fontFamily: compValues?.fontFamily,
      fontWeight: compValues?.fontStyles?.bold ? "bold" : "normal",
      fontStyle: compValues?.fontStyles?.italic ? "italic" : "normal",
      color: compValues?.optionTextColor,
      textDecoration: textDecoration.join(" "),

    }}>
      <span className="text-sm m-2" style={{fontSize: compValues?.fontSize}}>{minValue}</span>
      {mode === 'target' && targetValue !== null && (
        <span className="">
          ans - {targetValue}
        </span>
      )}
      <span className="text-sm m-2 " style={{fontSize: compValues?.fontSize}}>{maxValue}</span>
    </div>

    <div className="relative mb-4 mt-2">
      <input
        type="range"
        min={minValue}
        max={maxValue}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        style={{
          height: compValues?.thickness || '8px',
          // background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
            background: `linear-gradient(to right, ${compValues?.sliderColor} 0%, ${compValues?.sliderColor} ${percentage}%, ${compValues?.sliderBackgroundColor} ${percentage}%, ${compValues?.sliderBackgroundColor} 100%)`,
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
            height: ${compValues?.thickness * 1.6}px;
            width: ${compValues?.thickness * 1.6}px;
            background: ${compValues?.sliderColor};
            border-radius: 50%;
            cursor: pointer;
          }

          input[type="range"]::-moz-range-thumb {
            height: ${compValues?.thickness * 1.6}px;
            width: ${compValues?.thickness * 1.6}px;
            background: ${compValues?.sliderColor};
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
            transform: 'translateX(-50%)'
          }}
        />
      )}
    </div>

    <div className="text-center text-sm" 
    style={{
        fontSize: compValues?.fontSize,
      fontFamily: compValues?.fontFamily,
      fontWeight: compValues?.fontStyles?.bold ? "bold" : "normal",
      fontStyle: compValues?.fontStyles?.italic ? "italic" : "normal",
      color: compValues?.optionTextColor,
      textDecoration: textDecoration.join(" "),
    }}>
      Current Value: {value}
    </div>
  </div>
</div>

    
  );
};


export const DiscreteSliderAnswer = ({ value, onChange, options = [], compValues }) => {
  if (!options.length) return null;
  const textDecoration = [
    compValues?.fontStyles?.underline ? "underline" : "",
    compValues?.fontStyles?.lineThrough ? "line-through" : "",
  ]
  return (
    <div className="w-full px-2">
      <div className="relative h-2 bg-gray-200 rounded-full w-full"
        data-nodrag="true"
              style={{
                height: `${compValues?.thickness}px`,
                background: compValues?.optionSliderBackgroundColor,
              }}>
        <div
          className="absolute h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{
            width: `${(value / (options.length - 1)) * 100}%`,
              background: compValues?.optionSliderColor,
          }}
        />
        {options.map((_, index) => (
          <div
            key={index}
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full cursor-pointer border-2 border-white shadow-md"
            style={{
                 height: `${compValues?.thickness * 1.4}px`,
                    width: `${compValues?.thickness * 1.4}px`,
              left:
                index === 0
                  ? '1%'
                  : index === options.length - 1
                  ? '99%'
                  : `${(index / (options.length - 1)) * 100}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: index <= value ? compValues?.optionSliderColor : '#e5e7eb',

              transition: 'background-color 0.3s ease',
            }}
            onClick={() => onChange(index)}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={options.length - 1}
            aria-valuenow={value}
            aria-label={`Select option ${options[index]}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onChange(index);
            }}
          />
        ))}
      </div>

      <div className="flex justify-between text-sm text-gray-600 w-full select-none mt-1">
        {options.map((option, index) => (
          <div
            key={index}
            className={`cursor-pointer px-1 ${
              index === value ? 'font-medium text-blue-600' : ''
            } transition-colors duration-200`}
            style={{
              width: `${100 / options.length}%`,
              textAlign:
                index === 0
                  ? 'left'
                  : index === options.length - 1
                  ? 'right'
                  : 'center',
              fontSize: compValues?.fontSize,
              fontFamily: compValues?.fontFamily,
              fontWeight: compValues?.fontStyles?.bold ? "bold" : "normal",
              fontStyle: compValues?.fontStyles?.italic ? "italic" : "normal",
              textDecoration: textDecoration.join(" "),
              color: compValues?.optionTextColor || '#374151',
            }}
            onClick={() => onChange(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onChange(index);
            }}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};




export const RankingAnswer = ({ items, onChange, currentOrder: initialOrder, componentValue }) => {
  const [currentOrder, setCurrentOrder] = useState(() => {
    if (initialOrder && Array.isArray(initialOrder) && initialOrder.length === items.length) {
      return initialOrder;
    }
    return getShuffledOrder(items.length);
  });

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (sourceIndex === targetIndex) return;

    const newOrder = [...currentOrder];
    const [movedItem] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, movedItem);
    setCurrentOrder(newOrder);
    onChange(newOrder);
  };

  const handleClick = (e) => {
    e.preventDefault();
  };
  console.log(componentValue, "item value")
   const textDecoration = [
    componentValue.fontStyles?.underline ? "underline" : "",
    componentValue.fontStyles?.lineThrough ? "line-through" : "",
  ]
  return (
    <div className="w-full h-full flex flex-col space-y-2">
      {currentOrder.map((itemIndex, currentPosition) => (
        <div
          key={itemIndex}
          draggable
          onDragStart={(e) => handleDragStart(e, currentPosition)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, currentPosition)}
          onClick={handleClick}
          className="flex items-center h-full p-2 bg-white border rounded-lg hover:bg-gray-50 cursor-move w-full"
          style={{
            backgroundColor: componentValue.optionBackgroundColor || "#f9fafb",
            borderColor: componentValue.optionBorderColor || "#e5e7eb",
            borderWidth: componentValue.optionBorderWidth || 1,
            borderRadius: componentValue.optionBorderRadius || '0.375rem',
            fontSize: componentValue.fontSize,
            fontFamily: componentValue.fontFamily,
            fontWeight: componentValue.fontStyles?.bold ? "bold" : "normal",
            fontStyle: componentValue.fontStyles?.italic ? "italic" : "normal",
            color: componentValue.optionTextColor || '#000',
            textDecoration: textDecoration.join(" "),
          }}
        >
          <GripVertical size={componentValue.fontSize} className="text-gray-400" />
          {
            componentValue.showNumber && (
          <span className="text-sm font-medium text-gray-600 w-6" style={{fontSize:componentValue.fontSize}}>
            {currentPosition + 1}.
          </span>)
          }
          <span className="flex-1" style={{fontSize:componentValue.fontSize}}>{items[itemIndex]}</span>
        </div>
      ))}
    </div>
  );
};

export const MatchingPairsAnswer = ({ pairs, value = [], onChange, containerWidth, containerHeight, optionClassName = "" ,fontSizeValue,compValues, previewMode = false}) => {
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [hoveredRight, setHoveredRight] = useState(null);
  const [prevValue, setPrevValue] = useState([]);
  const [previewLine, setPreviewLine] = useState(null);
  
  const leftRefs = useRef({});
  const rightRefs = useRef({});
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  const [linePositions, setLinePositions] = useState([]);
  const [animatingLines, setAnimatingLines] = useState({});

  const [leftOrder, setLeftOrder] = useState(() => 
    previewMode ? pairs.map((_, index) => index) : getShuffledOrder(pairs.length)
  );
  const [rightOrder, setRightOrder] = useState(() => 
    previewMode ? pairs.map((_, index) => index) : getShuffledOrder(pairs.length)
  );
  
  useEffect(() => {
    if (selectedLeft !== null && hoveredRight !== null) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      const leftElem = leftRefs.current[selectedLeft];
      const rightElem = rightRefs.current[hoveredRight];
      
      if (leftElem && rightElem && containerRect) {
        const leftRect = leftElem.getBoundingClientRect();
        const rightRect = rightElem.getBoundingClientRect();
        
        const x1 = leftRect.right - containerRect.left;
        const y1 = leftRect.top + (leftRect.height / 2) - containerRect.top;
        const x2 = rightRect.left - containerRect.left;
        const y2 = rightRect.top + (rightRect.height / 2) - containerRect.top;
        
        setPreviewLine({ x1, y1, x2, y2 });
      }
    } else {
      setPreviewLine(null);
    }
  }, [selectedLeft, hoveredRight]);
  
  useEffect(() => {
    const newAnimatingLines = {};
    
    value.forEach(match => {
      const matchId = `${match.left}-${match.right}`;
      const existed = prevValue.some(p => p.left === match.left && p.right === match.right);
      if (!existed) {
        newAnimatingLines[matchId] = 'adding';
      }
    });
    
    prevValue.forEach(match => {
      const matchId = `${match.left}-${match.right}`;
      const stillExists = value.some(p => p.left === match.left && p.right === match.right);
      if (!stillExists) {
        newAnimatingLines[matchId] = 'removing';
        
        const leftElem = leftRefs.current[match.left];
        const rightElem = rightRefs.current[match.right];
        
        if (leftElem && rightElem && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const leftRect = leftElem.getBoundingClientRect();
          const rightRect = rightElem.getBoundingClientRect();
          
          const x1 = leftRect.right - containerRect.left;
          const y1 = leftRect.top + (leftRect.height / 2) - containerRect.top;
          const x2 = rightRect.left - containerRect.left;
          const y2 = rightRect.top + (rightRect.height / 2) - containerRect.top;
          
          setLinePositions(prev => [
            ...prev.filter(line => line.id !== matchId),
            { id: matchId, x1, y1, x2, y2 }
          ]);
        }
      }
    });
    
    setAnimatingLines(newAnimatingLines);
    
    const timeout = setTimeout(() => {
      Object.entries(newAnimatingLines).forEach(([id, status]) => {
        if (status === 'removing') {
          setLinePositions(prev => prev.filter(line => line.id !== id));
        }
      });
      setAnimatingLines({});
    }, 500);
    
    setPrevValue(value);
    
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  
  useEffect(() => {
    const updateLines = () => {
      const newLines = [];
      const containerRect = containerRef.current?.getBoundingClientRect();
      
      if (!containerRect) return;
      
      value.forEach(match => {
        const matchId = `${match.left}-${match.right}`;
        const leftElem = leftRefs.current[match.left];
        const rightElem = rightRefs.current[match.right];
        
        if (!leftElem || !rightElem) return;
        
        const leftRect = leftElem.getBoundingClientRect();
        const rightRect = rightElem.getBoundingClientRect();
        
        const x1 = leftRect.right - containerRect.left;
        const y1 = leftRect.top + (leftRect.height / 2) - containerRect.top;
        const x2 = rightRect.left - containerRect.left;
        const y2 = rightRect.top + (rightRect.height / 2) - containerRect.top;
        
        newLines.push({
          id: matchId,
          x1, y1, x2, y2
        });
      });
      
      const removingLines = linePositions.filter(line => 
        animatingLines[line.id] === 'removing' && 
        !newLines.some(nl => nl.id === line.id)
      );
      
      setLinePositions([...newLines, ...removingLines]);
    };
    
    updateLines();
    window.addEventListener('resize', updateLines);
    
    return () => window.removeEventListener('resize', updateLines);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, animatingLines]);
  
  const handleBackgroundClick = (e) => {
    if (e.target === containerRef.current || e.target === svgRef.current) {
      setSelectedLeft(null);
      setHoveredRight(null);
    }
  };
  
  const handleLeftClick = (displayIndex, e) => {
    e.stopPropagation();
    
    const originalIndex = leftOrder[displayIndex];
    
    if (selectedLeft === originalIndex) {
      setSelectedLeft(null);
      return;
    }
    
    const matchForThisLeft = value.find(m => m.left === originalIndex);
    if (matchForThisLeft) {
      const newValue = value.filter(m => m.left !== originalIndex);
      onChange(newValue);
    }
    
    setSelectedLeft(originalIndex);
  };
  
  const handleRightClick = (displayIndex, e) => {
    e.stopPropagation();
    
    const originalIndex = rightOrder[displayIndex];
    
    if (selectedLeft === null) {
      const matchForThisRight = value.find(m => m.right === originalIndex);
      if (matchForThisRight) {
        const leftIndex = matchForThisRight.left;
        const newValue = value.filter(m => m.right !== originalIndex);
        onChange(newValue);
        setSelectedLeft(leftIndex);
      }
      return;
    }
    
    const newValue = [...value];
    const existingMatch = newValue.find(m => m.left === selectedLeft);
    if (existingMatch) {
      newValue.splice(newValue.indexOf(existingMatch), 1);
    }
    
    const existingRightMatch = newValue.find(m => m.right === originalIndex);
    if (existingRightMatch) {
      newValue.splice(newValue.indexOf(existingRightMatch), 1);
    }
    
    newValue.push({ left: selectedLeft, right: originalIndex });
    onChange(newValue);
    setSelectedLeft(null);
    setHoveredRight(null);
  };
  
  const handleRightHover = (displayIndex, isEntering) => {
    const originalIndex = rightOrder[displayIndex];
    if (isEntering) {
      setHoveredRight(originalIndex);
    } else if (hoveredRight === originalIndex) {
      setHoveredRight(null);
    }
  };
  
  const isLeftMatched = (originalIndex) => value.some(m => m.left === originalIndex);
  const isRightMatched = (originalIndex) => value.some(m => m.right === originalIndex);
  
  const getPartnerIndex = (index, side) => {
    const match = value.find(m => m[side] === index);
    return match ? (side === 'left' ? match.right : match.left) : null;
  };
  
  const buttonHeight = pairs.length > 0 ? `${90 / pairs.length}%` : 'auto';
  
  const getLineAnimationClass = (lineId) => {
    const status = animatingLines[lineId];
    if (status === 'adding') return 'animate-line-appear';
    if (status === 'removing') return 'animate-line-disappear';
    return '';
  };
  
   const textDecoration = [
    compValues?.fontStyles?.underline ? "underline" : "",
    compValues?.fontStyles?.lineThrough ? "line-through" : "",
  ]
  console.log(compValues, "matching pair comp values")
  return (
    <div 
      className="relative w-full h-full border p-2 rounded-lg" 
      ref={containerRef}
      onClick={handleBackgroundClick}
      style={{ 
        width: containerWidth ? `${containerWidth }px` : '100%', 
        height: containerHeight ? `${containerHeight }px` : '100%',
        cursor: selectedLeft !== null ? 'pointer' : 'default',
        // backgroundColor: compValues?.optionBackgroundColor || '#fff',
      }}
    >
      <style jsx>{`
        @keyframes lineAppear {
          from { stroke-dashoffset: 100%; }
          to { stroke-dashoffset: 0; }
        }
        
        @keyframes lineDisappear {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        .animate-line-appear {
          stroke-dasharray: 100%;
          animation: lineAppear 0.4s ease-in-out forwards;
        }
        
        .animate-line-disappear {
          animation: lineDisappear 0.4s ease-in-out forwards;
        }
        
        .preview-line {
          stroke-dasharray: 5;
          animation: dash 15s linear infinite;
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: 1000;
          }
        }
      `}</style>
    
      <div className="flex justify-between h-full w-full gap-12">
        <div className=" flex flex-col justify-between gap-2 w-full ">
          {leftOrder.map((originalIndex, displayIndex) => {
            const isMatched = isLeftMatched(originalIndex);
            const partnerIndex = isMatched ? getPartnerIndex(originalIndex, 'left') : null;
            
            return (
              <button
                key={`left-${originalIndex}`}
                ref={el => leftRefs.current[originalIndex] = el}
                onClick={(e) => handleLeftClick(displayIndex, e)}
                style={{ 
                  // height: buttonHeight,
                  cursor: 'pointer',
                  borderRadius: compValues?.optionBorderRadius || '0.375rem',
                  borderWidth: compValues?.optionBorderWidth || '1px',
                  borderColor: compValues?.optionBorderColor || '#e5e7eb',
                  backgroundColor: compValues?.optionBackgroundColor || '#f9fafb',
                  color: compValues?.optionTextColor || '#000',
                }}
                className={`w-full p-2 h-full text-left rounded-lg transition-all duration-300 ease-in-out ${optionClassName}
                  ${selectedLeft === originalIndex 
                    ? 'border-2 border-green-500 shadow-sm' 
                    : isMatched 
                      ? 'border-2 border-green-500' 
                      : 'border border-gray-200 hover:border-green-300'}`}
                aria-label={isMatched ? `${pairs[originalIndex].left} - matched with ${pairs[partnerIndex]?.right}` : pairs[originalIndex].left}
              >
                <div className="flex justify-between items-center">
                  <span  
                   style={{ 
                    fontSize: `${fontSizeValue}px`,
                    fontFamily: compValues?.fontFamily || 'inherit',
                    fontWeight: compValues?.fontStyles?.bold ? "bold" : "normal",
                    fontStyle: compValues?.fontStyles?.italic ? "italic" : "normal",
                    textDecoration: textDecoration.join(" "), // fix spacing
                
                }} >{pairs[originalIndex].left}</span>
                </div>
              </button>
            );
          })}
        </div>
        
        <div className=" flex flex-col justify-between gap-2 w-full">
          {rightOrder.map((originalIndex, displayIndex) => {
            const isMatched = isRightMatched(originalIndex);
            const partnerIndex = isMatched ? getPartnerIndex(originalIndex, 'right') : null;
            
            return (
              <button
                key={`right-${originalIndex}`}
                ref={el => rightRefs.current[originalIndex] = el}
                onClick={(e) => handleRightClick(displayIndex, e)}
                onMouseEnter={() => handleRightHover(displayIndex, true)}
                onMouseLeave={() => handleRightHover(displayIndex, false)}
                style={{ 
                  // height: buttonHeight,
                  cursor: selectedLeft !== null ? 'pointer' : 'default' ,
                    borderRadius: compValues?.optionBorderRadius || '0.375rem',
                  borderWidth: compValues?.optionBorderWidth || '1px',
                  borderColor: compValues?.optionBorderColor || '#e5e7eb',
                  backgroundColor: compValues?.optionBackgroundColor || '#f9fafb',
                   color: compValues?.optionTextColor || '#000',
                }}
                className={`w-full p-2 h-full  text-left rounded-lg transition-all duration-300 ease-in-out ${optionClassName}
                  ${hoveredRight === originalIndex && selectedLeft !== null
                    ? 'border-2 border-green-500 bg-green-50' 
                    : isMatched 
                      ? 'border-2 border-green-500' 
                      : 'border border-gray-200 hover:border-green-300'}`}
                aria-label={isMatched ? `${pairs[originalIndex].right} - matched with ${pairs[partnerIndex]?.left}` : pairs[originalIndex].right}
              >
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: `${fontSizeValue}px`,
                    
                    fontFamily: compValues?.fontFamily || 'inherit',
                    fontWeight: compValues?.fontStyles?.bold ? "bold" : "normal",
                    fontStyle: compValues?.fontStyles?.italic ? "italic" : "normal",
                    textDecoration: textDecoration.join(" "), // fix spacing
                }}>{pairs[originalIndex].right}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      <svg 
        ref={svgRef}
        className="absolute inset-0 pointer-events-none w-full h-full" 
        style={{ zIndex: 1 }}
      >
        {previewLine && selectedLeft !== null && hoveredRight !== null && (
          <line
            x1={previewLine.x1}
            y1={previewLine.y1}
            x2={previewLine.x2}
            y2={previewLine.y2}
            stroke={compValues?.optionBorderColor || "gray"}
           strokeWidth={compValues?.optionBorderWidth || "2"}
              strokeDasharray={compValues?.optionBorderStyle === 'dashed' ? '5,5' : compValues?.optionBorderStyle === 'dotted' ? '1,5' : '0'}
            className="preview-line"
            opacity="0.6"
          />
        )}
        
        {linePositions.map(line => (
          <line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={compValues?.optionBorderColor || "gray"}
            strokeWidth={compValues?.optionBorderWidth || "2"}
                strokeDasharray={compValues?.optionBorderStyle === 'dashed' ? '5,5' : compValues?.optionBorderStyle === 'dotted' ? '1,5' : '0'}
            className={`transition-all duration-300 ease-in-out ${getLineAnimationClass(line.id)}`}
          />
        ))}
      </svg>
    </div>
  );
};

export const ShapeAnswer = ({
  shapeType,
  backgroundColor,
  borderRadius,
  opacity,
  rotation,
  borderWidth,
  borderColor,
  borderStyle,
  style = {},
  className = ""
}) => {
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

  let extraStyle = {};
  switch (shapeType) {
    case "circle":
      extraStyle = { borderRadius: "50%" };
      break;
    case "triangle":
      extraStyle = { clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" };
      break;
    case "star":
      extraStyle = { clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" };
      break;
    case "hexagon":
      extraStyle = { clipPath: "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)" };
      break;
    case "rectangle":
    default:
      if (borderRadius) {
        extraStyle = { borderRadius: `${borderRadius}px` };
      }
      break;
  }

  const computedStyle = { ...baseStyle, ...extraStyle };

  return <div className={`w-full h-full ${className}`} style={computedStyle} />;
};