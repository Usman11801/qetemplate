// import React, { useState, useEffect, useRef, useMemo } from "react";
// import BaseDraggable from "./BaseDraggable";
// import { GripVertical, Plus, X } from "lucide-react";

// export default function RankingComponent({
//   id,
//   position,
//   items = [],
//   correctOrder = [],
//   onUpdate,
//   onDelete,

//   optionSpacing = 8,
//   width = 288,
//   height = 0,
//   // scale = 1,

//   fontFamily = "Arial, sans-serif",
//   fontSize = 14,
//   optionBackgroundColor = "#f9fafb",
//   options,
//   correctAnswers,
//   updateMCmulti,
//   onDoubleClick,
//       showNumber
// ,
//   // Styling props with defaults
//   fontStyles = {
//     bold: false,
//     italic: false,
//     underline: false,
//     lineThrough: false,
//   },
//   optionBorderColor = "#d1d5db",
//   optionBorderWidth = 1,
//   optionBorderRadius = 8,
//   backgroundColor = "#ffffff",
//   selectType = "square", // "circle" | "square" | "diamond"
// }) {
//   // — dynamic font‐size override
//   const [resizeFontSize, setResizeFontSize] = useState(null);
//   // refs for measuring
//   const canvasRef = useRef(null);
//   const contentRef = useRef(null);
//   const [toolbarFontSize, setToolbarFontSize] = React.useState(fontSize); // null means no override
//   const baseFontSize = 14;
//   const baseHeight = 177;

//   useEffect(() => {
//     canvasRef.current = document.createElement("canvas").getContext("2d");
//   }, []);

//   const computedFontSize = resizeFontSize ?? toolbarFontSize ?? baseFontSize;

//   const dynamicPadding = computedFontSize * 0.05;

//   const toggleSize = computedFontSize + 8;
//   const removeSize = computedFontSize * 1.1 + 8;
//   const gapTotal = 8 * 2;
//   const inputMinChars = 4;
//   const paddingTotal = dynamicPadding * 2;

//   const textWidths = useMemo(() => {
//     const ctx = canvasRef.current;
//     if (!ctx) return [];
//     ctx.font = `${computedFontSize}px ${fontFamily}`;
//     return items.map((i) => ctx.measureText(i).width);
//   }, [items, computedFontSize, fontFamily]);

//   const minTextWidth = Math.max(
//     computedFontSize * inputMinChars,
//     ...textWidths
//   );
//   const inputMinWidth = Math.ceil(minTextWidth);

//   const minWidth = useMemo(() => {
//     return Math.ceil(
//       toggleSize + gapTotal + inputMinWidth + removeSize + paddingTotal + 40
//     );
//   }, [toggleSize, gapTotal, inputMinWidth, removeSize, paddingTotal]);

//   // — calculate minHeight
//   const rowHeight = computedFontSize + 16 + optionSpacing;
//   const optionsHeight = items.length * rowHeight;
//   const footerHeight = rowHeight - optionSpacing;
//   const containerPad = dynamicPadding * 2;
//   const baseMinHeight = optionsHeight + footerHeight + containerPad + 50;
//   const minHeight = baseMinHeight + 30;

//   // — dims state
//   const [dims, setDims] = useState({
//     width,
//     height: height || minHeight,
//   });

//   // ➊ Sync dims whenever the parent prop changes:
//   useEffect(() => {
//     setDims({
//       width,
//       height: height || minHeight,
//     });
//     setResizeFontSize(null);
//   }, [width, height, minHeight]);

//   // only auto-grow when the number of items or our computed minHeight changes
//   useEffect(() => {
//     if (!contentRef.current) return;
//     const contentH = contentRef.current.scrollHeight;
//     const requiredBoxH = contentH + containerPad; // + your padding/border
//     const finalH = Math.max(requiredBoxH, minHeight);

//     if (finalH > dims.height) {
//       setDims((d) => ({ ...d, height: finalH }));
//       onUpdate(id, { height: finalH });
//     }
//     setToolbarFontSize(fontSize);
//     setResizeFontSize(null);
//     // 👉 drop `onUpdate` (and even `id`) from deps, so it won’t re-fire on unrelated updates
//   }, [
//     containerPad,
//     dims.height,
//     fontSize,
//     id,
//     items.length,
//     minHeight,
//     onUpdate,
//   ]);

//   // — reorder
//   const handleDrop = (e, toIdx) => {
//     e.preventDefault();
//     const fromIdx = Number(e.dataTransfer.getData("text/plain"));
//     if (fromIdx === toIdx) return;
//     const newItems = [...items];
//     const [moved] = newItems.splice(fromIdx, 1);
//     newItems.splice(toIdx, 0, moved);
//     onUpdate(id, {
//       items: newItems,
//       correctOrder: newItems.map((_, i) => i),
//     });
//   };

//   // — add new
//   const [adding, setAdding] = useState(false);
//   const [newText, setNewText] = useState("");
//   const handleAddItem = () => {
//     if (!newText.trim()) {
//       setAdding(false);
//       setNewText("");
//       return;
//     }

//     const newItems = [...items, newText];
//     onUpdate(id, {
//       items: newItems,
//       correctOrder: newItems.map((_, i) => i),
//     });

//     // onUpdate(id, { items: [...items, newText] });
//     setNewText("");
//     setAdding(false);
//   };

//   // — on‐resize recompute font‐size
//   const handleResize = (_id, newDims) => {
//     const updates = {};
//     if (newDims.width !== width) updates.width = Math.max(newDims.width, minWidth);
//     if (newDims.height !== height) {
//       const h = Math.max(newDims.height, minHeight);
//       updates.height = h;
//       const newFS = Math.min(
//         Math.max(baseFontSize * (1 + (h / baseHeight - 1) / 3), 12),
//         24
//       );
//       updates.fontSize = newFS;
//       setResizeFontSize(newFS);
//       setToolbarFontSize(null);
//     }
//     if (Object.keys(updates).length) onUpdate(id, updates);
//   };

//   // Font style string construction
//   const fontWeight = fontStyles?.bold ? "bold" : "normal";
//   const fontStyle = fontStyles?.italic ? "italic" : "normal";
//   const textDecoration = [
//     fontStyles?.underline ? "underline" : "",
//     fontStyles?.lineThrough ? "line-through" : "",
//   ]
//     .filter(Boolean)
//     .join(" ");

//   return (
//     <BaseDraggable
//       id={id}
//       type="ranking"
//       position={position}
//       width={width}
//       height={height}
//       minWidth={minWidth}
//       minHeight={minHeight + 27}
//       // scale={scale}
//       onDelete={onDelete}
//       onResize={handleResize}
//       style={{
//         width,
//         height,
//         minWidth,
//         minHeight,
//         backgroundColor,
//         border: "none",
//         boxShadow: "none",
//       }}
//     >
//       <div
//         ref={contentRef}
//         className="flex flex-col  h-full rounded-lg border-2 p-2"
//         style={{
//           backgroundColor,
//           borderColor: optionBorderColor,
//           borderWidth: optionBorderWidth,
//           borderStyle: "solid",
//         }}
//         onDoubleClick={(e) => onDoubleClick?.("ranking", id, e)}
//       >
//         <div className="flex-1 ">
//           <div className="flex flex-col h-full">
//             {items.map((item, idx) => (
//               <div
//                 key={idx}
//                 className="group flex items-center gap-2 rounded-lg p-2 hover:shadow-md transition-shadow duration-150 h-full"
//                 style={{
//                   fontSize: computedFontSize,
//                   backgroundColor: optionBackgroundColor,
//                   borderColor: optionBorderColor,
//                   borderWidth: optionBorderWidth,
//                   borderRadius: optionBorderRadius,
//                   borderStyle: "solid",
//                   marginBottom: optionSpacing,
//                 }}
//               >
//                 <GripVertical
//                   size={computedFontSize}
//                   className="text-gray-400"
//                 />
//                 {showNumber && <span className="w-6 text-right">{idx + 1}.</span>}
//                 <input
//                   className="flex-1 bg-transparent focus:outline-none px-2"
//                   value={item}
//                   onChange={(e) => {
//                     const newItems = [...items];
//                     newItems[idx] = e.target.value;
//                     onUpdate(id, { items: newItems });
//                   }}
//                   onClick={(e) => e.stopPropagation()}
//                   data-nodrag="true"
//                   style={{
//                     fontFamily,
//                     fontWeight,
//                     fontStyle,
//                     textDecoration,
//                     fontSize: computedFontSize,
//                     minWidth: inputMinWidth,
//                   }}
//                 />
//                 <button
//                   onClick={() => {
//                     const newItems = items.filter((_, i) => i !== idx);
//                     onUpdate(id, {
//                       items: newItems,
//                       correctOrder: newItems.map((_, i) => i),
//                     });
//                     // onUpdate(id, { items: items.filter((_, i) => i !== idx) });
//                   }}
//                   className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded-full transition-opacity"
//                   data-nodrag="true"
//                 >
//                   <X size={22} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>

//         {adding ? (
//           <div className="flex items-center gap-2">
//             <input
//               autoFocus
//               value={newText}
//               onChange={(e) => setNewText(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") handleAddItem();
//                 if (e.key === "Escape") {
//                   setAdding(false);
//                   setNewText("");
//                 }
//               }}
//               onBlur={handleAddItem}
//               className="border rounded-md focus:outline-none"
//               placeholder="New item..."
//               style={{
//                 flex: 1,
//                 padding: "0.5rem",
//                 fontSize: computedFontSize,
//                 minWidth: inputMinWidth,
//               }}
//               data-nodrag="true"
//             />
//           </div>
//         ) : (
//           <button
//             onClick={() => setAdding(true)}
//             className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
//             data-nodrag="true"
//             style={{ fontSize: computedFontSize, minHeight: 42 }}
//           >
//             <Plus size={computedFontSize + 2} />
//             Add Item
//           </button>
//         )}
//       </div>
//     </BaseDraggable>
//   );
// }






import React, { useState, useEffect, useRef, useMemo } from "react";
import BaseDraggable from "./BaseDraggable";
import { GripVertical, Plus, X } from "lucide-react";

export default function RankingComponent({
  id,
  position,
  items = [],
  correctOrder = [],
  onUpdate,
  onDelete,

  optionSpacing = 8,
  width = 288,
  height = 0,

  fontFamily = "Arial, sans-serif",
  fontSize = 14,
  optionBackgroundColor = "#f9fafb",
  options,
  correctAnswers,
  updateMCmulti,
  onDoubleClick,
  showNumber,

  fontStyles = {
    bold: false,
    italic: false,
    underline: false,
    lineThrough: false,
  },
  optionBorderColor = "#d1d5db",
  optionBorderWidth = 1,
  optionBorderRadius = 8,
  backgroundColor = "#ffffff",
  selectType = "square",
}) {
  const [resizeFontSize, setResizeFontSize] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);

  const canvasRef = useRef(null);
  const contentRef = useRef(null);

  const [toolbarFontSize, setToolbarFontSize] = useState(fontSize);
  const baseFontSize = 14;
  const baseHeight = 177;

  useEffect(() => {
    canvasRef.current = document.createElement("canvas").getContext("2d");
  }, []);

  useEffect(() => {
    const off = () => setReorderMode(false);
    
    window.addEventListener("mouseup", off);
    window.addEventListener("touchend", off);
    window.addEventListener("touchcancel", off);
    
    return () => {
      window.removeEventListener("mouseup", off);
      window.removeEventListener("touchend", off);
      window.removeEventListener("touchcancel", off);
    };
  }, []);

  const computedFontSize = resizeFontSize ?? toolbarFontSize ?? baseFontSize;

  const dynamicPadding = computedFontSize * 0.05;
  const toggleSize = computedFontSize + 8;
  const removeSize = computedFontSize * 1.1 + 8;
  const gapTotal = 16;
  const inputMinChars = 4;
  const paddingTotal = dynamicPadding * 2;

  const textWidths = useMemo(() => {
    const ctx = canvasRef.current;
    if (!ctx) return [];
    ctx.font = `${computedFontSize}px ${fontFamily}`;
    return items.map((i) => ctx.measureText(i).width);
  }, [items, computedFontSize, fontFamily]);

  const minTextWidth = Math.max(computedFontSize * inputMinChars, ...textWidths);
  const inputMinWidth = Math.ceil(minTextWidth);

  const minWidth = useMemo(() => {
    return Math.ceil(
      toggleSize + gapTotal + inputMinWidth + removeSize + paddingTotal + 40
    );
  }, [toggleSize, gapTotal, inputMinWidth, removeSize, paddingTotal]);

  const rowHeight = computedFontSize + 16 + optionSpacing;
  const optionsHeight = items.length * rowHeight;
  const footerHeight = rowHeight - optionSpacing;
  const containerPad = dynamicPadding * 2;
  const baseMinHeight = optionsHeight + footerHeight + containerPad + 50;
  const minHeight = baseMinHeight + 30;

  const [dims, setDims] = useState({
    width,
    height: height || minHeight,
  });

  useEffect(() => {
    setDims({
      width,
      height: height || minHeight,
    });
    setResizeFontSize(null);
  }, [width, height, minHeight]);

  useEffect(() => {
    if (!contentRef.current) return;
    const contentH = contentRef.current.scrollHeight;
    const requiredBoxH = contentH + containerPad;
    const finalH = Math.max(requiredBoxH, minHeight);

    if (finalH > dims.height) {
      setDims((d) => ({ ...d, height: finalH }));
      onUpdate(id, { height: finalH });
    }
    setToolbarFontSize(fontSize);
    setResizeFontSize(null);
  }, [containerPad, dims.height, fontSize, id, items.length, minHeight, onUpdate]);

  const handleDrop = (e, toIdx) => {
    e.preventDefault();
    const fromIdx = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isNaN(fromIdx) || fromIdx === toIdx) return;

    const newItems = [...items];
    const [moved] = newItems.splice(fromIdx, 1);
    newItems.splice(toIdx, 0, moved);

    onUpdate(id, {
      items: newItems,
      correctOrder: newItems.map((_, i) => i),
    });
  };

  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const handleAddItem = () => {
    if (!newText.trim()) {
      setAdding(false);
      setNewText("");
      return;
    }
    const newItems = [...items, newText];
    onUpdate(id, {
      items: newItems,
      correctOrder: newItems.map((_, i) => i),
    });
    setNewText("");
    setAdding(false);
  };

  const handleResize = (_id, newDims) => {
    const updates = {};
    if (newDims.width !== width) updates.width = Math.max(newDims.width, minWidth);
    if (newDims.height !== height) {
      const h = Math.max(newDims.height, minHeight);
      updates.height = h;
      const newFS = Math.min(
        Math.max(baseFontSize * (1 + (h / baseHeight - 1) / 3), 12),
        24
      );
      updates.fontSize = newFS;
      setResizeFontSize(newFS);
      setToolbarFontSize(null);
    }
    if (Object.keys(updates).length) onUpdate(id, updates);
  };

  const fontWeight = fontStyles?.bold ? "bold" : "normal";
  const fontStyle = fontStyles?.italic ? "italic" : "normal";
  const textDecoration = [
    fontStyles?.underline ? "underline" : "",
    fontStyles?.lineThrough ? "line-through" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <BaseDraggable
      id={id}
      type="ranking"
      position={position}
      width={width}
      height={height}
      minWidth={minWidth}
      minHeight={minHeight + 27}
      onDelete={onDelete}
      onResize={handleResize}
      disableDrag={reorderMode}
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
        style={{
          backgroundColor,
          borderColor: optionBorderColor,
          borderWidth: optionBorderWidth,
          borderStyle: "solid",
        }}
        onDoubleClick={(e) => onDoubleClick?.("ranking", id, e)}
        data-nodrag="true"
        onKeyDown={(e) => {
          if (e.key === "Escape") setReorderMode(false);
        }}
      >
        <div className="flex-1">
          <div className="flex flex-col h-full">
            {items.map((item, idx) => (
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
                  cursor: reorderMode ? "grab" : "default",
                  userSelect: reorderMode ? "none" : "auto",
                  touchAction: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                }}
                draggable={reorderMode}
                // onDragStart={(e) => {
                //   if (!reorderMode) return;
                //   e.stopPropagation();
                //   e.dataTransfer.setData("text/plain", String(idx));
                // }}
                // onDragOver={(e) => {
                //   if (!reorderMode) return;
                //   e.preventDefault();
                //   e.stopPropagation();
                // }}
                // onDrop={(e) => {
                //   if (!reorderMode) return;
                //   handleDrop(e, idx);
                //   e.stopPropagation();
                // }}
                onDragStart={(e) => {
                  if (!reorderMode) return;
                  e.stopPropagation();
                  setReorderMode(true);
                  e.dataTransfer.setData("text/plain", String(idx));
                  e.dataTransfer.effectAllowed = "move";
                  // Add visual feedback
                  e.target.style.opacity = "0.5";
                }}
                onDragOver={(e) => {
                  if (!reorderMode) return;
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = "move";
                }}
                onDrop={(e) => {
                  if (!reorderMode) return;
                  e.preventDefault();
                  handleDrop(e, idx);
                  e.stopPropagation();
                  setReorderMode(false);
                }}
                onDragEnd={(e) => {
                  setReorderMode(false);
                  // Remove visual feedback
                  e.target.style.opacity = "1";
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setReorderMode(true);
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  setReorderMode(false);
                }}
                data-nodrag="true"
              >
                <GripVertical
                  size={computedFontSize}
                  className={`text-gray-400 ${reorderMode ? "cursor-grabbing focus:outline-none focus:ring-0" : "cursor-grab"} touch-manipulation`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setReorderMode(true);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    setReorderMode(true);
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                  }}
                  tabIndex={0}
                  data-nodrag="true"
                  style={{ 
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                />

                {showNumber && <span className="w-6 text-right select-none">{idx + 1}.</span>}

                <input
                  className="flex-1 bg-transparent focus:outline-none px-2"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx] = e.target.value;
                    onUpdate(id, { items: newItems });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  data-nodrag="true"
                  style={{
                    fontFamily,
                    fontWeight,
                    fontStyle,
                    textDecoration,
                    fontSize: computedFontSize,
                    minWidth: inputMinWidth,
                    touchAction: "manipulation",
                    WebkitUserSelect: "text",
                    MozUserSelect: "text",
                    msUserSelect: "text",
                    userSelect: "text",
                  }}
                  disabled={reorderMode}
                />

                <button
                  onClick={() => {
                    const newItems = items.filter((_, i) => i !== idx);
                    onUpdate(id, {
                      items: newItems,
                      correctOrder: newItems.map((_, i) => i),
                    });
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded-full transition-opacity"
                  data-nodrag="true"
                >
                  <X size={22} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* {reorderMode && (
          <div className="text-xs text-gray-500 mt-1 select-none" data-nodrag="true">
            Reorder mode: drag rows to change order • Release mouse/touch or press Esc to exit
          </div>
        )} */}

        {adding ? (
          <div className="flex items-center gap-2" data-nodrag="true">
            <input
              autoFocus
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddItem();
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewText("");
                }
              }}
              onBlur={handleAddItem}
              className="border rounded-md focus:outline-none"
              placeholder="New item..."
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
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
            data-nodrag="true"
            style={{ fontSize: computedFontSize, minHeight: 42 }}
            disabled={reorderMode}
          >
            <Plus size={computedFontSize + 2} />
            Add Item
          </button>
        )}
      </div>
    </BaseDraggable>
  );
}
