import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import BaseDraggable from "./BaseDraggable";

/**
 * Build a closed SVG path using cubic Béziers through each anchor point
 * via its right handle to the next anchor via its left handle.
 */
function buildBezierPath(anchors, handles) {
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
    d +=
      `C ${curr.x + rOff.x},${curr.y + rOff.y} ` +
      `${next.x + lOff.x},${next.y + lOff.y} ` +
      `${next.x},${next.y} `;
  }
  return d + "Z";
}

/**
 * Calculate the bounding box of anchor points
 */
function calculateBounds(anchors) {
  if (anchors.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

  let minX = anchors[0].x;
  let minY = anchors[0].y;
  let maxX = anchors[0].x;
  let maxY = anchors[0].y;

  for (let i = 1; i < anchors.length; i++) {
    const { x, y } = anchors[i];
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  return { minX, minY, maxX, maxY };
}

export default function ToggleButtonItem({
  id,
  position, // { x, y }
  toggled = false,
  width = 100,
  height = 40,
  opacity = 1,
  borderRadius = 8,
  borderWidth = 2,
  backgroundColor = "#ffffff",
  borderColor = "#000000",
  corners = 4,
  anchors: savedAnchors,
  handles: savedHandles,
  onDelete,
  setToggleValue,
  setSize,
  setShapeData,
  onDoubleClick,
}) {
  const savedAnchorsRef = useRef(savedAnchors);
  const savedHandlesRef = useRef(savedHandles);
  // Keep refs updated with latest saved values
  useEffect(() => {
    savedAnchorsRef.current = savedAnchors;
    savedHandlesRef.current = savedHandles;
  }, [savedAnchors, savedHandles]);

  const generateAnchors = useCallback(() => {
    const padding = 5;
    const cx = width / 2;
    const cy = height / 2;
    const rx = cx - padding;
    const ry = cy - padding;

    // 4 corners -> rectangle (axis-aligned)
    if (corners === 4) {
      return [
        { x: padding, y: padding }, // top-left
        { x: width - padding, y: padding }, // top-right
        { x: width - padding, y: height - padding }, // bottom-right
        { x: padding, y: height - padding }, // bottom-left
      ];
    }

    // default: radial layout (same as yours)
    return Array.from({ length: corners }).map((_, i) => {
      const angle = (2 * Math.PI * i) / corners - Math.PI / 2;
      return {
        x: cx + rx * Math.cos(angle),
        y: cy + ry * Math.sin(angle),
      };
    });
  }, [corners, height, width, borderRadius]);
  // replace your current initialAnchors useMemo with this:
  const initialAnchors = useMemo(() => {
    return generateAnchors();
  }, [generateAnchors]);

  // 2) Keep anchor positions in state for dragging
  const [anchors, setAnchors] = useState(() => {
    // On first load: use saved values if available, otherwise generate new
    return savedAnchors || initialAnchors;
  });

  // Reset anchors/handles only when corners or borderRadius changes (not on first load)
  useEffect(() => {
    const currentSavedAnchors = savedAnchorsRef.current;
    const currentSavedHandles = savedHandlesRef.current;

    // If no saved data, generate fresh anchors and handles
    if (!currentSavedAnchors || currentSavedAnchors.length === 0) {
      console.log("No saved data - generating fresh anchors/handles");
      const newAnchors = generateAnchors();
      const newHandles = newAnchors.map(() => ({
        left: { x: 0, y: 0 },
        right: { x: 0, y: 0 },
      }));

      setAnchors(newAnchors);
      setHandles(newHandles);
      setActiveAnchor(null);
      return;
    }

    // If corners count doesn't match saved anchors length, adjust
    if (corners !== currentSavedAnchors.length) {
      console.log(
        `Adjusting from ${currentSavedAnchors.length} to ${corners} corners`
      );

      let adjustedAnchors = [...currentSavedAnchors];
      let adjustedHandles = currentSavedHandles ? [...currentSavedHandles] : [];

      // If decreasing corners - remove from end
      if (corners < currentSavedAnchors.length) {
        adjustedAnchors = adjustedAnchors.slice(0, corners);
        adjustedHandles = adjustedHandles.slice(0, corners);
      }
      // If increasing corners - add new ones
      else if (corners > currentSavedAnchors.length) {
        const newAnchors = generateAnchors();
        const additionalCount = corners - currentSavedAnchors.length;

        // Add the new anchors from generated ones
        for (let i = 0; i < additionalCount; i++) {
          const newIndex = currentSavedAnchors.length + i;
          adjustedAnchors.push(newAnchors[newIndex]);
          adjustedHandles.push({ left: { x: 0, y: 0 }, right: { x: 0, y: 0 } });
        }
      }

      setAnchors(adjustedAnchors);
      setHandles(adjustedHandles);
      setActiveAnchor(null);
    }
  }, [corners, borderRadius]);

  // 3) Two handle offsets per anchor
  const [handles, setHandles] = useState(() => {
    // On first load: use saved handles if available, otherwise generate default
    if (savedHandles) {
      return savedHandles;
    }
    return initialAnchors.map(() => ({
      left: { x: 0, y: 0 },
      right: { x: 0, y: 0 },
    }));
  });
  // Reset handles when number of anchors changes
  // useEffect(() => {
  //   if (!savedHandles || handles.length !== anchors.length) {
  //     setHandles(
  //       anchors.map(() => ({ left: { x: 0, y: 0 }, right: { x: 0, y: 0 } }))
  //     );
  //     setActiveAnchor(null);
  //   }
  // }, [anchors.length, savedHandles]);

  // 4) Active anchor index (null or 0…corners-1)
  const [activeAnchor, setActiveAnchor] = useState(null);
  // 5) Styling for drag state of the box
  const [isActive, setIsActive] = useState(false);
  // 6) Hover state to show/hide anchor points
  const [isHovered, setIsHovered] = useState(false);
  // 6) Ref to SVG for coordinate mapping
  const svgRef = useRef(null);
  const pathRef = useRef(null);

  // 7) Dynamic dimensions based on actual path bounds
  const [dynamicDimensions, setDynamicDimensions] = useState({ width, height });
  const resizeTimeoutRef = useRef(null);
  const isResizingRef = useRef(false);

  // 8) Build the Bézier path each render
  const pathD = useMemo(
    () => buildBezierPath(anchors, handles),
    [anchors, handles]
  );

  // 9) Function to calculate bounds based on actual path shape (not anchor positions)
  const calculatePathBounds = useCallback(() => {
    if (anchors.length === 0) return null;

    // Sample points along the Bézier curve to get accurate bounds
    const samplePoints = [];
    const numSamples = 50; // Number of points to sample along each curve segment

    for (let i = 0; i < anchors.length; i++) {
      const curr = anchors[i];
      const next = anchors[(i + 1) % anchors.length];
      const currentHandle = handles[i];
      const nextHandle = handles[(i + 1) % anchors.length];

      if (!currentHandle || !nextHandle) continue;

      const { right: rOff } = currentHandle;
      const { left: lOff } = nextHandle;

      // Sample points along this Bézier curve segment
      for (let t = 0; t <= 1; t += 1 / numSamples) {
        // Bézier curve formula: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
        const p0 = curr;
        const p1 = { x: curr.x + rOff.x, y: curr.y + rOff.y };
        const p2 = { x: next.x + lOff.x, y: next.y + lOff.y };
        const p3 = next;

        const t1 = 1 - t;
        const x =
          t1 * t1 * t1 * p0.x +
          3 * t1 * t1 * t * p1.x +
          3 * t1 * t * t * p2.x +
          t * t * t * p3.x;
        const y =
          t1 * t1 * t1 * p0.y +
          3 * t1 * t1 * t * p1.y +
          3 * t1 * t * t * p2.y +
          t * t * t * p3.y;

        samplePoints.push({ x, y });
      }
    }

    if (samplePoints.length === 0) return null;

    // Calculate bounds from sampled points
    let minX = samplePoints[0].x;
    let minY = samplePoints[0].y;
    let maxX = samplePoints[0].x;
    let maxY = samplePoints[0].y;

    samplePoints.forEach((point) => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });

    return { minX, minY, maxX, maxY };
  }, [anchors, handles]);

  // 9b) Function to calculate box that fits all anchor points (kept for reference)
  const calculateAnchorBounds = useCallback(() => {
    if (anchors.length === 0) return null;

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
  }, [anchors, handles]);

  // 10) Debounced function to update BaseDraggable dimensions and position
  const updateDimensionsDebounced = useCallback(
    (newDimensions, newPosition = null) => {
      if (isResizingRef.current) return; // Prevent multiple resize operations

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      isResizingRef.current = true;

      resizeTimeoutRef.current = setTimeout(() => {
        setDynamicDimensions(newDimensions);
        // Also update the parent component's size state
        if (setSize) {
          setSize(id, newDimensions);
        }

        // If new position is provided, update the BaseDraggable position
        if (
          newPosition &&
          newPosition.x !== undefined &&
          newPosition.y !== undefined
        ) {
          // Dispatch position update event
          window.dispatchEvent(
            new CustomEvent("componentDropped", {
              detail: {
                id,
                type: "toggle_button",
                x: newPosition.x,
                y: newPosition.y,
              },
            })
          );
        }

        // Reset the resizing flag after operation is complete
        setTimeout(() => {
          isResizingRef.current = false;
        }, 50);
      }, 500); // Even longer delay to prevent automatic changes
    },
    [id, setSize]
  );

  // 11) Function to fit BaseDraggable to path bounds (expand AND shrink)
  const fitBoxToAnchors = useCallback(() => {
    const bounds = calculatePathBounds();
    if (!bounds) return;

    const padding = 15;
    const { minX, minY, maxX, maxY } = bounds;

    // Calculate optimal box size based on actual path bounds
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const optimalWidth = Math.max(contentWidth + padding * 2, 50);
    const optimalHeight = Math.max(contentHeight + padding * 2, 30);

    // Calculate how much we need to shift content to center it with padding
    const optimalOffsetX = padding - minX;
    const optimalOffsetY = padding - minY;

    // Current dimensions
    const currentWidth = dynamicDimensions.width;
    const currentHeight = dynamicDimensions.height;

    // Check if we need to resize (either expand or shrink)
    const widthDiff = Math.abs(optimalWidth - currentWidth);
    const heightDiff = Math.abs(optimalHeight - currentHeight);
    const offsetXDiff = Math.abs(optimalOffsetX);
    const offsetYDiff = Math.abs(optimalOffsetY);

    // Only resize if the difference is significant (> 5px) to prevent constant micro-adjustments
    const shouldResize =
      widthDiff > 5 || heightDiff > 5 || offsetXDiff > 2 || offsetYDiff > 2;

    if (shouldResize) {
      // Update dimensions to optimal size
      setDynamicDimensions({ width: optimalWidth, height: optimalHeight });

      if (setSize) {
        setSize(id, { width: optimalWidth, height: optimalHeight });
      }

      // Adjust anchors to be properly positioned within the new box
      if (optimalOffsetX !== 0 || optimalOffsetY !== 0) {
        setAnchors((currentAnchors) =>
          currentAnchors.map((anchor) => ({
            x: anchor.x + optimalOffsetX,
            y: anchor.y + optimalOffsetY,
          }))
        );

        // Update position to account for the content shift
        const currentPos = {
          x: position.x || position.left || 0,
          y: position.y || position.top || 0,
        };

        const newPosition = {
          x: currentPos.x - optimalOffsetX,
          y: currentPos.y - optimalOffsetY,
        };

        window.dispatchEvent(
          new CustomEvent("componentDropped", {
            detail: {
              id,
              type: "toggle_button",
              x: newPosition.x,
              y: newPosition.y,
            },
          })
        );
      }
    }
  }, [
    calculatePathBounds,
    dynamicDimensions.width,
    dynamicDimensions.height,
    position.x,
    position.y,
    position.left,
    position.top,
    id,
    setSize,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // 12) Auto-fit box to path shape when anchors/handles change
  useEffect(() => {
    // Only auto-fit if we have saved anchors (user has made modifications) and not during manual resize
    if (savedAnchors || savedHandles) {
      const timer = setTimeout(() => {
        fitBoxToAnchors();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [anchors, handles, fitBoxToAnchors, savedAnchors, savedHandles]);

  // 13) Calculate centroid of all anchor points for text positioning
  const textCenter = useMemo(() => {
    if (anchors.length === 0)
      return {
        x: dynamicDimensions.width / 2,
        y: dynamicDimensions.height / 2,
      };

    const sumX = anchors.reduce((sum, anchor) => sum + anchor.x, 0);
    const sumY = anchors.reduce((sum, anchor) => sum + anchor.y, 0);

    return {
      x: sumX / anchors.length,
      y: sumY / anchors.length,
    };
  }, [anchors, dynamicDimensions.width, dynamicDimensions.height]);

  // 14) Calculate specific handle directions for left and right handles
  const calculateHandleDirections = (anchorIndex) => {
    const current = anchors[anchorIndex];
    const prevIndex = (anchorIndex - 1 + anchors.length) % anchors.length;
    const nextIndex = (anchorIndex + 1) % anchors.length;
    
    const prev = anchors[prevIndex];
    const next = anchors[nextIndex];

    // For 4-corner rectangle, align each handle exactly with the adjacent anchors
    if (corners === 4) {
      // Calculate directions to actual adjacent anchors (not just cardinal directions)
      const toPrev = {
        x: prev.x - current.x,
        y: prev.y - current.y,
      };
      const toNext = {
        x: next.x - current.x,
        y: next.y - current.y,
      };

      // Normalize directions to the actual adjacent anchor positions
      const prevLength = Math.sqrt(toPrev.x * toPrev.x + toPrev.y * toPrev.y);
      const nextLength = Math.sqrt(toNext.x * toNext.x + toNext.y * toNext.y);

      if (prevLength > 0) {
        toPrev.x /= prevLength;
        toPrev.y /= prevLength;
      }
      if (nextLength > 0) {
        toNext.x /= nextLength;
        toNext.y /= nextLength;
      }

      // Return directions pointing exactly toward adjacent anchors
      return {
        left: toPrev,   // toward previous anchor
        right: toNext,  // toward next anchor
      };
    }

    // For other shapes, calculate directions toward adjacent anchors
    const toPrev = {
      x: prev.x - current.x,
      y: prev.y - current.y,
    };
    const toNext = {
      x: next.x - current.x,
      y: next.y - current.y,
    };

    // Normalize directions
    const prevLength = Math.sqrt(toPrev.x * toPrev.x + toPrev.y * toPrev.y);
    const nextLength = Math.sqrt(toNext.x * toNext.x + toNext.y * toNext.y);

    if (prevLength > 0) {
      toPrev.x /= prevLength;
      toPrev.y /= prevLength;
    }
    if (nextLength > 0) {
      toNext.x /= nextLength;
      toNext.y /= nextLength;
    }

    return {
      left: toPrev,
      right: toNext,
    };
  };

  // 15) Save shape data function
  const saveShapeData = () => {
    if (setShapeData) {
      setShapeData(id, {
        anchors,
        handles,
        width: dynamicDimensions.width,
        height: dynamicDimensions.height,
        opacity,
        borderRadius,
        borderWidth,
        backgroundColor,
        borderColor,
        corners,
      });
    }
  };

  // 16) Handle dragging a handle point
  const startHandleDrag = (e, idx, side) => {
    e.stopPropagation();
    const rect = svgRef.current.getBoundingClientRect();

    const onMove = (ev) => {
      const x =
        ((ev.clientX - rect.left) / rect.width) * dynamicDimensions.width;
      const y =
        ((ev.clientY - rect.top) / rect.height) * dynamicDimensions.height;
      const base = anchors[idx];
      const newOff = { x: x - base.x, y: y - base.y };

      // Calculate final handle position
      const handleX = base.x + newOff.x;
      const handleY = base.y + newOff.y;

      // Handle will be constrained by path-based box auto-expansion after drag ends

      setHandles((hs) => {
        const copy = [...hs];
        copy[idx] = { ...copy[idx], [side]: newOff };
        return copy;
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      
      // Always trigger auto-sizing after handle drag
      setTimeout(() => {
        fitBoxToAnchors();
        saveShapeData(); // Save when handle drag ends
      }, 50);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // 17) Handle dragging an anchor point
  const startAnchorDrag = (e, idx) => {
    e.stopPropagation();
    const rect = svgRef.current.getBoundingClientRect();

    const onMove = (ev) => {
      const x =
        ((ev.clientX - rect.left) / rect.width) * dynamicDimensions.width;
      const y =
        ((ev.clientY - rect.top) / rect.height) * dynamicDimensions.height;

      // Anchor will be constrained by path-based box auto-expansion after drag ends

      setAnchors((a) => {
        const copy = [...a];
        copy[idx] = { x, y };
        return copy;
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      
      // Always trigger auto-sizing after anchor drag
      setTimeout(() => {
        fitBoxToAnchors();
        saveShapeData(); // Save when anchor drag ends
      }, 50);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // 18) Handle initial anchor setup when component mounts with saved data
  // useEffect(() => {
  //   if (savedAnchors && savedAnchors.length > 0) {
  //     // If we have saved anchors, use them directly
  //     setAnchors(savedAnchors);
  //   }
  // }, [savedAnchors]);

  // 19) Save initial anchor and handle values when component is first mounted
  useEffect(() => {
    // Only save if we don't have saved anchors/handles and we have initial values
    if (
      !savedAnchors &&
      !savedHandles &&
      anchors.length > 0 &&
      handles.length > 0
    ) {
      const timer = setTimeout(() => {
        saveShapeData();
      }, 500); // Delay to ensure component is fully initialized
      return () => clearTimeout(timer);
    }
  }, [anchors, handles, savedAnchors, savedHandles]);

  // 20) Toggle, resize, drag handlers for the box
  const handleToggle = (e) => {
    e.stopPropagation();
    setToggleValue?.(id, !toggled);
  };
  const handleResize = (_, dims) => {
    setSize?.(id, dims);

    // Update our dynamic dimensions to match the manual resize
    setDynamicDimensions(dims);

    // Scale anchors and handles proportionally to maintain shape
    const scaleX = dims.width / dynamicDimensions.width;
    const scaleY = dims.height / dynamicDimensions.height;

    setAnchors((currentAnchors) =>
      currentAnchors.map((anchor) => ({
        x: anchor.x * scaleX,
        y: anchor.y * scaleY,
      }))
    );

    setHandles((currentHandles) =>
      currentHandles.map((handle) => ({
        left: { x: handle.left.x * scaleX, y: handle.left.y * scaleY },
        right: { x: handle.right.x * scaleX, y: handle.right.y * scaleY },
      }))
    );

    // Save the updated anchor and handle values after resize
    setTimeout(() => {
      saveShapeData();
    }, 50);
  };
  const dragStart = () => setIsActive(true);
  const dragStop = (_, d) => {
    setIsActive(false);
    // Save current anchor and handle values when component is dragged
    saveShapeData();
    window.dispatchEvent(
      new CustomEvent("componentDropped", {
        detail: { id, type: "toggle_button", x: d.x, y: d.y },
      })
    );
  };

  return (
    <BaseDraggable
      id={id}
      type="toggle_button"
      position={position}
      onDelete={onDelete}
      onResize={handleResize}
      onDragStart={dragStart}
      onDragStop={dragStop}
      className={isActive ? "z-[10000] hover:shadow-none" : ""}
      style={{
        width: dynamicDimensions.width,
        height: dynamicDimensions.height,
        boxShadow: "none",
        backgroundColor: "transparent",
      }}
      minWidth={30}
      minHeight={20}
      disableDragging={activeAnchor !== null}
    >
      <div
        className="relative w-full h-full select-none"
        // Prevent box drag when an anchor is active
        onPointerDownCapture={(e) => {
          if (activeAnchor !== null && e.target.tagName !== "circle") {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (activeAnchor !== null) {
            setActiveAnchor(null);
            saveShapeData(); // Save when user deselects anchor
          } else {
            onDoubleClick?.("toggle_button", id, e);
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* SVG overlay */}
        <svg
          ref={svgRef}
          className="absolute inset-0"
          width="100%"
          height="100%"
          viewBox={`0 0 ${dynamicDimensions.width} ${dynamicDimensions.height}`}
          preserveAspectRatio="none"
          style={{ overflow: "visible" }}
        >
          {/* Main Bézier shape */}
          <path
            ref={pathRef}
            d={pathD}
            fill={toggled ? backgroundColor : "transparent"}
            stroke={borderColor}
            strokeWidth={borderWidth}
            fillOpacity={opacity}
            // strokeOpacity={opacity}
            style={{ pointerEvents: "none" }}
          />

          {/* Clickable area for toggle */}
          <rect
            x="0"
            y="0"
            width={dynamicDimensions.width}
            height={dynamicDimensions.height}
            fill="transparent"
            style={{ cursor: "pointer" }}
            onClick={handleToggle}
          />

          {/* ON/OFF label */}
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

          {/* Corner anchors (draggable when active), show on hover */}
          {isHovered &&
            anchors.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={6}
                fill={activeAnchor === i ? "#3b82f6" : "white"}
                stroke={activeAnchor === i ? "#3b82f6" : "gray"}
                strokeWidth={2}
                style={{ cursor: activeAnchor === i ? "move" : "pointer" }}
                onPointerDownCapture={(e) => {
                  e.stopPropagation();
                  // If this anchor is already active, start dragging immediately
                  if (activeAnchor === i) {
                    startAnchorDrag(e, i);
                  } else {
                    // Set this anchor as active and start dragging
                    setActiveAnchor(i);
                    // Initialize handles with path-aligned positions if they're at origin
                    const currentHandles = handles[i];
                    if (
                      currentHandles.left.x === 0 &&
                      currentHandles.left.y === 0 &&
                      currentHandles.right.x === 0 &&
                      currentHandles.right.y === 0
                    ) {
                      // Calculate specific handle directions for each anchor
                      const handleDirections = calculateHandleDirections(i);
                      const handleLength = 30;

                      setHandles((hs) => {
                        const copy = [...hs];
                        copy[i] = {
                          left: {
                            x: handleDirections.left.x * handleLength,
                            y: handleDirections.left.y * handleLength,
                          },
                          right: {
                            x: handleDirections.right.x * handleLength,
                            y: handleDirections.right.y * handleLength,
                          },
                        };
                        return copy;
                      });
                    }
                    // Start dragging immediately after setting active
                    startAnchorDrag(e, i);
                  }
                }}
              />
            ))}

          {/* Handles & lines for the active anchor */}
          {activeAnchor != null &&
            handles[activeAnchor] &&
            ["left", "right"].map((side) => {
              const off = handles[activeAnchor][side];
              const base = anchors[activeAnchor];
              return (
                <g key={side}>
                  <line
                    x1={base.x}
                    y1={base.y}
                    x2={base.x + off.x}
                    y2={base.y + off.y}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    style={{ pointerEvents: "none" }}
                  />
                  <circle
                    cx={base.x + off.x}
                    cy={base.y + off.y}
                    r={5}
                    fill="#3b82f6"
                    stroke="#3b82f6"
                    strokeWidth={1}
                    style={{ cursor: "move" }}
                    onPointerDownCapture={(e) =>
                      startHandleDrag(e, activeAnchor, side)
                    }
                  />
                </g>
              );
            })}
        </svg>
      </div>
    </BaseDraggable>
  );
}
