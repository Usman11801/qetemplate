import React, { useRef, useState } from "react";

function Handle({
  cx,
  cy,
  onDrag,
  color,
  shape = "circle",
  rotation = 0,
  size = 8,
}) {
  const ref = useRef(null);

  const down = (e) => {
    e.preventDefault();
    e.stopPropagation();
    ref.current?.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (e.buttons === 1 && onDrag) onDrag(e.movementX, e.movementY);
  };
  const up = (e) => {
    ref.current?.releasePointerCapture(e.pointerId);
  };

  switch (shape) {
    case "square":
      return (
        <rect
          ref={ref}
          x={cx - size}
          y={cy - size}
          width={size * 2}
          height={size * 2}
          fill={color}
          stroke="#fff"
          strokeWidth={2}
          style={{ cursor: "grab", pointerEvents: "auto" }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
        />
      );
    case "arrow":
      return (
        <path
          ref={ref}
          d={`M -${size}, -${size} L ${size}, 0 L -${size}, ${size} Z`}
          fill={color}
          stroke="#fff"
          strokeWidth={1}
          transform={`translate(${cx} ${cy}) rotate(${rotation + 180})`}
          style={{ cursor: "grab", pointerEvents: "auto" }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
        />
      );
    default:
      return (
        <circle
          ref={ref}
          cx={cx}
          cy={cy}
          r={size}
          fill={color}
          stroke="#fff"
          strokeWidth={2}
          style={{ cursor: "grab", pointerEvents: "auto" }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
        />
      );
  }
}

const MinimalCurvedLineComponent = ({
  id,
  canvasWidth = 800,
  canvasHeight = 600,
  x1,
  y1,
  x2,
  y2,
  cx = (x1 + x2) / 2,
  cy = (y1 + y2) / 2 - 40,
  updateLine,
  shapeType = "solid",
  strokeWidth = 2,
  strokeColor = "#000",
  arrowType = "none",
  endpointColor = "#000",
  endpointShape,
}) => {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const dashMap = {
    solid: null,
    dashed: "8 4",
    dotted: "2 2",
  };
  const dashArray = dashMap[shapeType];

  const angleStart = Math.atan2(cy - y1, cx - x1) * (180 / Math.PI);
  const angleEnd = Math.atan2(cy - y2, cx - x2) * (180 / Math.PI);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: canvasWidth,
        height: canvasHeight,
        pointerEvents: "none",
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ pointerEvents: "none" }}
      >
        <path
          d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          style={{ pointerEvents: "stroke" }}
        />

        {(arrowType === "start" || arrowType === "both") && (
          <Handle
            cx={x1}
            cy={y1}
            onDrag={(dx, dy) => updateLine(id, { x1: x1 + dx, y1: y1 + dy })}
            color={endpointColor}
            shape={endpointShape}
            rotation={angleStart}
          />
        )}

        {(arrowType === "end" || arrowType === "both") && (
          <Handle
            cx={x2}
            cy={y2}
            onDrag={(dx, dy) => updateLine(id, { x2: x2 + dx, y2: y2 + dy })}
            color={endpointColor}
            shape={endpointShape}
            rotation={angleEnd}
          />
        )}

      </svg>
    </div>
  );
};

export default MinimalCurvedLineComponent;
