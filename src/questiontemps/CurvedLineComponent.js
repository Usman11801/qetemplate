import React, { useRef, useState } from "react";
import { X } from "lucide-react";

/**
 * Tiny circular handle that only captures its own pointer events.
 */

function Handle({ cx, cy, onDrag, color, shape, rotation = 0, size = 8 }) {
  const ref = useRef(null);
  console.log(shape, "endpointShape");

  const down = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (ref.current) {
      ref.current.setPointerCapture(e.pointerId);
    }
  };
  const move = (e) => {
    e.stopPropagation();
    if (e.buttons === 1 && onDrag) onDrag(e.movementX, e.movementY);
  };
  const up = (e) => {
    e.stopPropagation();
    if (ref.current) {
      ref.current.releasePointerCapture(e.pointerId);
    }
  };

  // choose which SVG element to render
  switch (shape) {
    case "square":
      // centered square
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
          onPointerDown={(e) => {
            e.stopPropagation();
            down(e);
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            move(e);
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            up(e);
          }}
        />
      );

    case "arrow":
      // triangle pointing along `rotation` degrees
      return (
        <path
          ref={ref}
          d={`M -${size}, -${size} L ${size}, 0 L -${size}, ${size} Z`}
          fill={color}
          stroke="#fff"
          strokeWidth={1}
          transform={`translate(${cx} ${cy}) rotate(${rotation + 180})`}
          style={{ cursor: "grab", pointerEvents: "auto" }}
          onPointerDown={(e) => {
            e.stopPropagation();
            down(e);
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            move(e);
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            up(e);
          }}
        />
      );

    case "circle":
    default:
      // default circle
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
          onPointerDown={(e) => {
            e.stopPropagation();
            down(e);
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            move(e);
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            up(e);
          }}
        />
      );
  }
}

const CurvedLineComponent = ({
  id,
  canvasWidth = 800,
  canvasHeight = 600,
  x1,
  y1,
  x2,
  y2,
  // fallback to straight-line mid-point if undefined:
  cx = (x1 + x2) / 2,
  cy = (y1 + y2) / 2 - 40,
  updateLine,
  onDelete,
  shapeType = "solid",
  strokeWidth = 2,
  strokeColor = "#000",
  arrowType = "none",
  endpointColor = "#000",
  endpointShape,
  onDoubleClick,
  disable = false,
}) => {
  const svgRef = useRef(null);
  const [isDraggingLine, setIsDraggingLine] = useState(false);

  // Move entire curve (translate all three points)
  const onCurveDown = (e) => {
    e.preventDefault();
    svgRef.current.setPointerCapture(e.pointerId);
    setIsDraggingLine(true);
  };
  const onCurveMove = (e) => {
    if (!isDraggingLine || e.buttons !== 1) return;
    const dx = e.movementX,
      dy = e.movementY;
    updateLine(id, {
      x1: x1 + dx,
      y1: y1 + dy,
      x2: x2 + dx,
      y2: y2 + dy,
      cx: cx + dx,
      cy: cy + dy,
    });
  };
  const onCurveUp = (e) => {
    svgRef.current.releasePointerCapture(e.pointerId);
    setIsDraggingLine(false);
  };
  // Double‐click selects
  const onGDouble = (e) => {
    e.stopPropagation();
    onDoubleClick?.("line", id);
  };

  // midpoint of the Bézier (t=0.5)
  const midX = 0.25 * x1 + 0.5 * cx + 0.25 * x2;
  const midY = 0.25 * y1 + 0.5 * cy + 0.25 * y2;

  const dashMap = {
    solid: null,
    dashed: "8 4",
    dotted: "2 2",
  };
  const dashArray = dashMap[shapeType];
  console.log(shapeType, "styleType");
  // compute angles so arrow‐handles point along the curve
  const angleStart = Math.atan2(cy - y1, cx - x1) * (180 / Math.PI);
  const angleEnd = Math.atan2(cy - y2, cx - x2) * (180 / Math.PI);


  function getQuadraticBezierXY(t, p0, p1, p2) {
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    return { x, y };
  }
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
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="0"
            refY="5"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill={strokeColor} />
          </marker>
        </defs>

        <g

          style={{ cursor: isDraggingLine ? "grabbing" : "grab" }}
        >

          {/* the curved main path */}
          <>
            {/* Transparent fat path for better drag hit area */}
            <path
              d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
              fill="none"
              stroke="transparent"
              strokeWidth={20} // fat invisible line
              style={{ cursor: isDraggingLine ? "grabbing" : "grab", pointerEvents: "stroke" }}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.target.setPointerCapture(e.pointerId);
                setIsDraggingLine(true);
              }}
              onPointerMove={(e) => {
                if (!isDraggingLine || e.buttons !== 1) return;
                const dx = e.movementX;
                const dy = e.movementY;
                updateLine(id, {
                  x1: x1 + dx,
                  y1: y1 + dy,
                  x2: x2 + dx,
                  y2: y2 + dy,
                  cx: cx + dx,
                  cy: cy + dy,
                });
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                e.target.releasePointerCapture(e.pointerId);
                setIsDraggingLine(false);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onDoubleClick?.("line", id);
              }}
            />

            {/* Actual visible styled path */}
            <path
              d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
              fill="none"
              strokeDasharray={dashArray}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              style={{ pointerEvents: "none" }}
            />
          </>

          {/* draggable endpoints */}
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

          {(() => {
            const { x, y } = getQuadraticBezierXY(
              0.5,
              { x: x1, y: y1 },
              { x: cx, y: cy },
              { x: x2, y: y2 }
            );
            return (
              <Handle
                cx={x}
                cy={y}
                onDrag={(dx, dy) => updateLine(id, { cx: cx + dx * 2, cy: cy + dy * 2 })}
                color="#0b84a5"
                shape="circle"
              />
            );
          })()}

          {/* delete button at the curve midpoint */}
          <g
            transform={`translate(${midX}, ${midY - 40})`}
            style={{ pointerEvents: "auto" }}
          >
            <rect
              x={-10}
              y={-10}
              width={20}
              height={20}
              rx={4}
              ry={4}
              fill="#fff"
              stroke="#e11d48"
              strokeWidth={1}
              style={{ cursor: "pointer" }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(id);
                onDoubleClick?.();
              }}
            />
            <X
              size={16}
              color="#e11d48"
              style={{ pointerEvents: "none" }}
              x={-8}
              y={-8}
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default CurvedLineComponent;
