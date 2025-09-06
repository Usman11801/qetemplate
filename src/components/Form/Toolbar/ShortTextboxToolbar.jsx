import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  ChevronUp,
  IndentIncrease,
  Italic,
  LetterText,
  List,
  ListOrdered,
  ListX,
  MoveVertical,
  Strikethrough,
  Underline,
} from "lucide-react";

const fontFamilies = [
  "Arial, sans-serif",
  "'Courier New', monospace",
  "'Times New Roman', serif",
  "'Roboto', sans-serif",
  "'Georgia', serif",
];

const textAlignOptions = ["left", "center", "right"];
const listTypes = ["none", "bullet", "number"];

const ShortTextboxToolbar = ({
  questionId,
  isLeftSidebarOpen,
  leftSidebarWidth = 0,
  isRightSidebarOpen,
  windowWidth,
  selectedComponent,
  onComponentUpdate,
  compType
}) => {
  const [isCollapsed, setIsCollapsed] = useState(windowWidth < 768);
  const [isMobile, setIsMobile] = useState(windowWidth < 768);

  useEffect(() => {
    setIsMobile(windowWidth < 768);
    if (windowWidth < 768 && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [windowWidth, isCollapsed]);

  const calculatePosition = () => {
    if (windowWidth < 768) {
      return { left: "50%", transform: "translateX(-50%)" };
    }
    const leftSidebarOffset = isLeftSidebarOpen ? leftSidebarWidth / 2 : 0;
    const rightSidebarOffset = isRightSidebarOpen ? -32 : 0;
    const totalOffset = leftSidebarOffset + rightSidebarOffset;
    const leftOffset =
      totalOffset !== 0 ? `calc(50% + ${totalOffset}px)` : "50%";
    return { left: leftOffset, transform: "translateX(-50%)" };
  };

  const position = calculatePosition();

  // Toggle font style property (bold, italic, underline, strikeThrough)
  const toggleFontStyle = (styleKey) => {
    onComponentUpdate(questionId, selectedComponent.id, {
      fontStyles: {
        ...selectedComponent.fontStyles,
        [styleKey]: !selectedComponent.fontStyles?.[styleKey],
      },
    });
  };

  return (
    <div
      className="fixed bottom-6 z-50 transition-all duration-300"
      style={{
        left: position.left,
        transform: position.transform,
        // width: "600px",
      }}
    >
      <motion.div
        key={questionId}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`${
          isCollapsed ? "mb-8" : ""
        } bg-white rounded-xl shadow-xl border border-gray-200`}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1 shadow-md border border-gray-200"
          aria-label="Toggle toolbar"
        >
          {isCollapsed ? (
            <ChevronUp size={16} className="text-gray-600" />
          ) : (
            <ChevronDown size={16} className="text-gray-600" />
          )}
        </button>

        <div
          className={`transition-all duration-300 px-4 w-full min-w-[546px] max-w-[546px] ${
            isCollapsed
              ? "max-h-0 py-0 overflow-auto"
              : "max-h-[320px] py-6 overflow-hidden"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-between gap-4">
              {/* Font Family & Size */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-1">
                  <label className="flex-1">
                    <select
                      value={selectedComponent?.fontFamily || fontFamilies[0]}
                      onChange={(e) =>
                        onComponentUpdate(questionId, selectedComponent.id, {
                          fontFamily: e.target.value,
                        })
                      }
                      className="block w-full rounded-md border border-gray-300 p-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {fontFamilies.map((f) => (
                        <option key={f} value={f}>
                          {f.split(",")[0]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="w-10">
                    <input
                      type="number"
                      min={8}
                      max={72}
                      value={selectedComponent?.fontSize || 14}
                      onChange={(e) =>
                        onComponentUpdate(questionId, selectedComponent.id, {
                          fontSize: +e.target.value,
                        })
                      }
                      className="block w-full rounded-md border border-gray-300 p-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </label>
                </div>
                {/* Font Style Toggles */}
                <div className="flex gap-1">
                  {["bold", "italic", "underline", "lineThrough"].map(
                    (style) => {
                      const labelMap = {
                        bold: <Bold className="h-5 w-5" />,
                        italic: <Italic className="h-5 w-5" />,
                        underline: <Underline className="h-5 w-5" />,
                        lineThrough: <Strikethrough className="h-5 w-5" />,
                        // bold: "B",
                        // italic: "I",
                        // underline: "U",
                        // lineThrough: "S",
                      };
                      return (
                        <button
                          key={style}
                          onClick={() => {
                            const current =
                              selectedComponent.fontStyles?.[style] || false;
                            onComponentUpdate(
                              questionId,
                              selectedComponent.id,
                              {
                                fontStyles: {
                                  ...selectedComponent.fontStyles,
                                  [style]: !current,
                                },
                              }
                            );
                          }}
                          className={`w-8 h-8 rounded border text-sm font-semibold flex items-center justify-center select-none
                      ${
                        selectedComponent?.fontStyles?.[style]
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                          title={labelMap[style]}
                          type="button"
                        >
                          {labelMap[style]}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {/* Line Spacing */}
                <label>
                  <p className="text-xs text-black font-semibold mb-1">
                    Line Spacing
                  </p>
                  <div className="flex items-center gap-2 px-2 w-24 w- h-8 overflow-hidden rounded-md bg-gray-300">
                    <LetterText lassName="h-5 w-5" />
                    <input
                      type="number"
                      min={1}
                      max={3}
                      step={0.1}
                      value={selectedComponent?.lineSpacing || 1.2}
                      onChange={(e) =>
                        onComponentUpdate(questionId, selectedComponent.id, {
                          lineSpacing: parseFloat(e.target.value),
                        })
                      }
                      className="w-10 border-none  text-sm font-medium bg-transparent focus:outline-none"
                    />
                  </div>
                </label>
                {/* Letter Spacing */}
                <label>
                  <p className="text-xs text-black font-semibold mb-1">
                    Letter Spacing
                  </p>
                  <div className="flex items-center gap-2 px-2 w-24 w- h-8 overflow-hidden rounded-md bg-gray-300">
                    <IndentIncrease className="h-5 w-5" />
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={selectedComponent?.letterSpacing || 0}
                      onChange={(e) =>
                        onComponentUpdate(questionId, selectedComponent.id, {
                          letterSpacing: parseFloat(e.target.value),
                        })
                      }
                      className="w-10 border-none  text-sm font-medium bg-transparent focus:outline-none"
                    />
                  </div>
                </label>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-2">
                  {
                    compType === "short_text" ??
                  <div className="flex gap-2">
                    {[
                      { type: "bullet", icon: <List className="h-6 w-6" /> },
                      {
                        type: "number",
                        icon: <ListOrdered className="h-6 w-6" />,
                      },
                      { type: "none", icon: <ListX className="h-6 w-6" /> },
                    ].map(({ type, icon }) => (
                      <button
                        key={type}
                        onClick={() =>
                          onComponentUpdate(questionId, selectedComponent.id, {
                            listStyle: type,
                          })
                        }
                        className={`w-8 h-8 rounded border flex items-center justify-center select-none
                         ${
                           selectedComponent?.listStyle === type
                             ? "bg-gray-400 text-white border-gray-400"
                             : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                         }`}
                        type="button"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  }
                  <div className="flex gap-2">
                    {[
                      {
                        align: "left",
                        icon: <AlignLeft className="h-6 w-6" />,
                      },
                      {
                        align: "center",
                        icon: <AlignCenter className="h-6 w-6" />,
                      },
                      {
                        align: "right",
                        icon: <AlignRight className="h-6 w-6" />,
                      },
                    ].map(({ align, icon }) => (
                      <button
                        key={align}
                        onClick={() =>
                          onComponentUpdate(questionId, selectedComponent.id, {
                            textAlign: align,
                          })
                        }
                        className={`w-8 h-8 rounded border border-transparent flex items-center justify-center select-none
                           ${
                             selectedComponent?.textAlign === align
                               ? "bg-gray-400 text-white border-gray-400"
                               : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                           }`}
                        type="button"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex-1">
                  <div className="w-16 h-16 min-w-16 min-h-16 max-w-16 max-h-16 flex justify-center items-center overflow-hidden border-2 border-white rounded-xl shadow-md shadow-black/40">
                    <input
                      type="color"
                      value={selectedComponent?.fontColor || "#000000"}
                      onChange={(e) =>
                        onComponentUpdate(questionId, selectedComponent.id, {
                          fontColor: e.target.value,
                        })
                      }
                      className="w-[70px] h-[70px] min-w-[70px] min-h-[70px] max-w-[70px] max-h-[70px] -m-1 border-none p-0 focus:outline-none ring-0 outline-none"
                    />
                  </div>
                </label>
              </div>
              {/* <div> */}
              {/* Text Align */}
              {/* <label>
                  <span className="text-xs font-medium text-gray-700">
                    Text Align
                  </span>
                  <select
                    value={selectedComponent?.textAlign || "left"}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedComponent.id, {
                        textAlign: e.target.value,
                      })
                    }
                    className="block w-full rounded-md border border-gray-300 p-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </label> */}

              {/* List Style */}
              {/* <label>
                  <span className="text-xs font-medium text-gray-700">
                    List Style
                  </span>
                  <select
                    value={selectedComponent?.listStyle || "none"}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedComponent.id, {
                        listStyle: e.target.value,
                      })
                    }
                    className="block w-full rounded-md border border-gray-300 p-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="none">None</option>
                    <option value="bullet">Bullet Points</option>
                    <option value="number">Numbered List</option>
                  </select>
                </label> */}
              {/* </div> */}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ShortTextboxToolbar;
