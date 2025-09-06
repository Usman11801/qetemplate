import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Scan,
  Bold,
  Underline,
  Strikethrough,
  Italic,
} from "lucide-react";

const fontFamilies = [
  "Arial, sans-serif",
  "'Courier New', monospace",
  "'Times New Roman', serif",
  "'Comic Sans MS', cursive",
  "'Roboto', sans-serif",
];

const TrueFalseToolbar = ({
  questionId,
  isLeftSidebarOpen,
  leftSidebarWidth = 0,
  isRightSidebarOpen,
  windowWidth,
  selectedComponent,
  onComponentUpdate,
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
      return {
        left: "50%",
        transform: "translateX(-50%)",
      };
    }
    const leftSidebarOffset = isLeftSidebarOpen ? leftSidebarWidth / 2 : 0;
    const rightSidebarOffset = isRightSidebarOpen ? -32 : 0;
    const totalOffset = leftSidebarOffset + rightSidebarOffset;
    const leftOffset =
      totalOffset !== 0 ? `calc(50% + ${totalOffset}px)` : "50%";

    return {
      left: leftOffset,
      transform: "translateX(-50%)",
    };
  };

  const position = calculatePosition();

  // Helper to toggle font style boolean values
  const toggleStyle = (key) => {
    onComponentUpdate(questionId, selectedComponent.id, {
      fontStyles: {
        ...selectedComponent.fontStyles,
        [key]: !selectedComponent.fontStyles?.[key],
      },
    });
  };

  return (
    <div
      className="fixed bottom-6 z-50 transition-all duration-300"
      style={{
        left: position.left,
        transform: position.transform,
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
        {/* Collapse Toggle */}
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
          <div className="flex gap-3">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-black font-semibold mb-1">
                Text Options
              </p>
              {/* Font Family & Size */}
              <div className="flex gap-1">
                <label className="flex-1">
                  {/* <span className="text-xs font-medium text-gray-700">
                    Font Family
                  </span> */}
                  <select
                    value={selectedComponent?.fontFamily || fontFamilies[0]}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedComponent.id, {
                        fontFamily: e.target.value,
                      })
                    }
                    className="block w-full rounded-md border border-gray-300 p-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {fontFamilies.map((font) => (
                      <option key={font} value={font}>
                        {font.split(",")[0]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="w-10">
                  {/* <span className="text-xs font-medium text-gray-700">
                    Font Size
                  </span> */}
                  <input
                    type="number"
                    min={8}
                    max={48}
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
              {/* Font Styles */}
              <div className="flex gap-1">
                {["bold", "italic", "underline", "lineThrough"].map((style) => {
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
                      onClick={() => toggleStyle(style)}
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
                })}
              </div>
              {/* Font Color */}
              <label>
                <p className="text-sm text-black font-semibold mb-1">
                  Font Color
                </p>
                <div className="flex justify-center items-center w-3/4 h-10 overflow-hidden rounded-lg shadow-lg">
                  <input
                    type="color"
                    value={selectedComponent?.fontColor || "#000000"}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedComponent.id, {
                        fontColor: e.target.value,
                      })
                    }
                    className="w-[calc(100%+8px)] h-14 -m-1 border-none p-0 focus:outline-none ring-0 outline-none"
                  />
                </div>
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-black font-semibold mb-1">
                Option Colors
              </p>
              {/* Colors and Border Radius */}
              <div className="flex gap-2">
                <label className="flex items-center flex-1 gap-1">
                  <div className="w-10 h-10 min-w-10 min-h-10 max-w-10 max-h-10 flex justify-center items-center overflow-hidden border-2 border-white rounded-xl shadow-xl">
                    <input
                      type="color"
                      value={selectedComponent?.leftBoxColor || "#22c55e"}
                      onChange={(e) =>
                        onComponentUpdate(questionId, selectedComponent.id, {
                          leftBoxColor: e.target.value,
                        })
                      }
                      className="w-12 h-12 min-w-12 min-h-12 max-w-12 max-h-12 -m-1 border-none p-0 focus:outline-none ring-0 outline-none"
                    />
                  </div>
                  <span className="text-xs font-medium text-black leading-tight">
                    Left option
                  </span>
                </label>
                <label className="flex items-center flex-1 gap-1">
                  <div className="w-10 h-10 min-w-10 min-h-10 max-w-10 max-h-10 flex justify-center items-center overflow-hidden border-2 border-white rounded-xl shadow-xl">
                    <input
                      type="color"
                      value={selectedComponent?.rightBoxColor || "#ef4444"}
                      onChange={(e) =>
                        onComponentUpdate(questionId, selectedComponent.id, {
                          rightBoxColor: e.target.value,
                        })
                      }
                      className="w-12 h-12 min-w-12 min-h-12 max-w-12 max-h-12 -m-1 border-none p-0 focus:outline-none ring-0 outline-none"
                    />
                  </div>
                  <span className="text-xs font-medium text-black leading-tight">
                    Right option
                  </span>
                </label>
              </div>
              <label>
                <p className="text-sm text-black font-semibold mb-1">
                  Background Color
                </p>
                <div className="flex justify-center items-center w-3/4 h-10 overflow-hidden rounded-lg shadow-lg ">
                  <input
                    type="color"
                    value={selectedComponent?.backgroundColor || "#ffffff"}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedComponent.id, {
                        backgroundColor: e.target.value,
                      })
                    }
                    className="w-[calc(100%+8px)] h-14 -m-1 border-none p-0 focus:outline-none ring-0 outline-none"
                  />
                </div>
              </label>
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex-1">
                <p className="text-sm text-black font-semibold mb-1">
                  Corner Radius
                </p>
                <div className="flex items-center gap-2 px-2 w-full h-10 overflow-hidden rounded-md bg-gray-300">
                  <Scan />
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={selectedComponent?.borderRadius || 12}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedComponent.id, {
                        borderRadius: +e.target.value,
                      })
                    }
                    className="w-10 border-none  text-sm font-medium bg-transparent focus:outline-none"
                  />
                </div>
              </label>
              <label className="flex-1">
                <p className="text-sm text-black font-semibold mb-1">
                  Border Color
                </p>
                <div className="flex justify-center items-center w-full h-10 overflow-hidden rounded-lg shadow-lg ">
                  <input
                    type="color"
                    value={selectedComponent?.borderColor || "#d1d5db"}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedComponent.id, {
                        borderColor: e.target.value,
                      })
                    }
                    className="w-[calc(100%+8px)] h-14 -m-1 border-none p-0 focus:outline-none ring-0 outline-none"
                  />
                </div>
              </label>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TrueFalseToolbar;
