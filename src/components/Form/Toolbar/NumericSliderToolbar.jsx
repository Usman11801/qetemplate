import { motion } from "framer-motion";
import {
  AlignVerticalSpaceAround,
  Bold,
  ChevronDown,
  ChevronUp,
  Italic,
  Scan,
  Strikethrough,
  Underline,
} from "lucide-react";
import { useEffect, useState } from "react";
import ToggleButton from "../../ToggleButton";

const NumericSliderToolbar = ({
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

  const isVisible = selectedComponent?.showCurrentValue ?? true;

  const setIsVisible = (newValue) => {
    onComponentUpdate(questionId, selectedComponent.id, {
      showCurrentValue: newValue,
    });
  };

  const fontFamilies = [
    "Arial, sans-serif",
    "'Courier New', monospace",
    "'Times New Roman', serif",
    "'Comic Sans MS', cursive",
    "'Roboto', sans-serif",
  ];

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
  const toggleFontStyle = (key) => {
    onComponentUpdate(questionId, selectedComponent.id, {
      fontStyles: {
        ...selectedComponent.fontStyles,
        [key]: !selectedComponent.fontStyles?.[key],
      },
    });
  };

  const position = calculatePosition();

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
          <div className="flex  gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-black font-semibold mb-1">
                Text Options
              </p>
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
              {/* Font Style Toggles */}
              <div className="flex gap-1">
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
                          onClick={() => toggleFontStyle(style)}
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
                {/* <label>
                <p className="text-xs text-black font-semibold mb-1">
                  TextColor
                </p> */}
                <div className="flex justify-center items-center w-8 h-8 rounded border overflow-hidden  shadow-lg">
                  <input
                    type="color"
                    value={selectedComponent?.optionTextColor || "#000000"}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedComponent.id, {
                        optionTextColor: e.target.value,
                      })
                    }
                    className="w-[calc(100%+8px)] h-14 -m-1 border-none p-0 focus:outline-none ring-0 outline-none"
                  />
                </div>
                {/* </label> */}
              </div>
              <div className="flex gap-4 items-center">
                <label>
                  <p className="text-xs text-black font-semibold mb-1">
                    Corner Radius
                  </p>
                  <div className="flex items-center gap-2 px-2 w-full h-10 overflow-hidden rounded-md bg-gray-300">
                    <Scan className="h-5 w-5" />
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={selectedComponent?.optionBorderRadius || 8}
                      onChange={(e) =>
                        onComponentUpdate(questionId, selectedComponent.id, {
                          optionBorderRadius: +e.target.value,
                        })
                      }
                      className="w-10 border-none  text-sm font-medium bg-transparent focus:outline-none"
                    />
                  </div>
                </label>

                <ToggleButton
                  isVisible={isVisible}
                  setIsVisible={setIsVisible}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex  gap-4">
                {/* <label>
                  <p className="text-xs text-black font-semibold mb-1">
                    Option Spacing
                  </p>
                  <div className="flex items-center gap-2 px-2 w-full h-10 overflow-hidden rounded-md bg-gray-300">
                    <AlignVerticalSpaceAround className="h-4 w-4" />
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={selectedComponent?.optionSpacing || 8}
                      onChange={(e) =>
                        onComponentUpdate(questionId, selectedComponent.id, {
                          optionSpacing: +e.target.value,
                        })
                      }
                      className="w-10 border-none  text-sm font-medium bg-transparent focus:outline-none"
                    />
                  </div>
                </label> */}
                <label>
                  <p className="text-xs text-black font-semibold mb-1">
                    Slider Background Color
                  </p>
                  <div className="flex justify-center items-center w-full h-10 overflow-hidden rounded-lg shadow-lg ">
                    <input
                      type="color"
                      value={
                        selectedComponent?.sliderBackgroundColor || "#e5e7eb"
                      }
                      onChange={(e) =>
                        onComponentUpdate(questionId, selectedComponent.id, {
                          sliderBackgroundColor: e.target.value,
                        })
                      }
                      className="w-[calc(100%+8px)] h-14 -m-1 border-none p-0 focus:outline-none ring-0 outline-none"
                    />
                  </div>
                </label>

                {/* Slider Color */}
                <label className="flex-1">
                  <p className="text-xs text-black font-semibold mb-1">
                    Slider Color
                  </p>
                  <div className="flex justify-center items-center w-full h-10 overflow-hidden rounded-lg shadow">
                    <input
                      type="color"
                      value={selectedComponent?.sliderColor || "#3b82f6"}
                      onChange={(e) =>
                        onComponentUpdate(questionId, selectedComponent.id, {
                          sliderColor: e.target.value,
                        })
                      }
                      className="w-[calc(100%+8px)] h-14 -m-1 border-none p-0 focus:outline-none ring-0 outline-none"
                    />
                  </div>
                </label>
                <label>
                  <p className="text-xs text-black font-semibold mb-1">
                    Items Background Color
                  </p>
                  <div className="flex justify-center items-center w-full h-10 overflow-hidden rounded-lg shadow-lg">
                    <input
                      type="color"
                      value={
                        selectedComponent?.optionBackgroundColor || "#f9fafb"
                      }
                      onChange={(e) =>
                        onComponentUpdate(questionId, selectedComponent.id, {
                          optionBackgroundColor: e.target.value,
                        })
                      }
                      className="w-[calc(100%+8px)] h-14 -m-1 border-none p-0 focus:outline-none ring-0 outline-none"
                    />
                  </div>
                </label>
                {/* Min Value */}
              </div>
              <div className="flex gap-4">
                {/* <label className="flex-1">
                  <p className="text-xs text-black font-semibold mb-1">
                    Border Color
                  </p>
                  <div className="flex justify-center items-center w-full h-10 overflow-hidden rounded-lg shadow-lg ">
                    <input
                      type="color"
                      value={selectedComponent?.optionBorderColor || "#d1d5db"}
                      onChange={(e) =>
                        onComponentUpdate(questionId, selectedComponent.id, {
                          optionBorderColor: e.target.value,
                        })
                      }
                      className="w-[calc(100%+8px)] h-14 -m-1 border-none p-0 focus:outline-none ring-0 outline-none"
                    />
                  </div>
                </label> */}
                <label className="flex-1">
                  <p className="text-xs text-black font-semibold mb-1">Min</p>
                  <input
                    type="number"
                    value={selectedComponent?.minValue || 0}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedComponent.id, {
                        minValue: +e.target.value,
                      })
                    }
                    className="block w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </label>

                {/* Max Value */}
                <label className="flex-1">
                  <p className="text-xs text-black font-semibold mb-1">Max</p>
                  <input
                    type="number"
                    value={selectedComponent?.maxValue || 100}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedComponent.id, {
                        maxValue: +e.target.value,
                      })
                    }
                    className="block w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </label>

                {/* Target Value */}
                <label className="flex-1">
                  <p className="text-xs text-black font-semibold mb-1">
                    Target
                  </p>
                  <input
                    type="number"
                    min={selectedComponent?.minValue || 0}
                    max={selectedComponent?.maxValue || 100}
                    value={selectedComponent?.targetValue || 50}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedComponent.id, {
                        targetValue: +e.target.value,
                      })
                    }
                    className="block w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </label>
                <label className="flex-1">
                  <p className="text-xs text-black font-semibold mb-1">
                    Thickness
                  </p>
                  <input
                    type="number"
                    max={20}
                    value={selectedComponent?.thickness || 0}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedComponent.id, {
                        thickness: +e.target.value,
                      })
                    }
                    className="block w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NumericSliderToolbar;
