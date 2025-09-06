import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useEffect, useState } from "react";

const CheckBoxToolBar = ({
  questionId,
  isLeftSidebarOpen,
  leftSidebarWidth = 0,
  isRightSidebarOpen,
  windowWidth,
  selectedLine,
  onComponentUpdate,
  onDeselect,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(windowWidth < 768);
  const [isMobile, setIsMobile] = useState(windowWidth < 768);
  console.log(selectedLine, "selectedLine");
  // Update states when window size changes
  useEffect(() => {
    setIsMobile(windowWidth < 768);
    if (windowWidth < 768 && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, [isCollapsed, onDeselect, windowWidth]);
  // Calculate offset for proper centering
  const calculatePosition = () => {
    // For mobile, just center in viewport
    if (windowWidth < 768) {
      return {
        left: "50%",
        transform: "translateX(-50%)",
      };
    }

    // For desktop, account for both sidebars
    let leftOffset = "50%";

    // Calculate sidebar offsets
    const leftSidebarOffset = isLeftSidebarOpen ? leftSidebarWidth / 2 : 0;
    const rightSidebarOffset = isRightSidebarOpen ? -32 : 0; // 64px / 2

    // Combine offsets
    const totalOffset = leftSidebarOffset + rightSidebarOffset;

    if (totalOffset !== 0) {
      leftOffset = `calc(50% + ${totalOffset}px)`;
    }

    return {
      left: leftOffset,
      transform: "translateX(-50%)",
    };
  };

  const position = calculatePosition();
  console.log(selectedLine, "selectedLine");
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
        className={`${isCollapsed ? "mb-8" : ""}`}
      >
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 relative">
          {/* Collapse toggle button */}
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="absolute -top-3 left-1/2 transform -translate-x-1/2 
              bg-white rounded-full p-1 shadow-md border border-gray-200"
          >
            {isCollapsed ? (
              <ChevronUp size={16} className="text-gray-600" />
            ) : (
              <ChevronDown size={16} className="text-gray-600" />
            )}
          </button>

          {/* <button
            onClick={onDeselect}
            className="absolute -top-3 right-0 transform 
              bg-red-500 rounded-full p-1 shadow-md border border-gray-200 text-white"
          >
            {" "}
            <X className="text-white" />{" "}
          </button> */}

          <div
            className={`overflow-hidden transition-all duration-300 w-[544px] p-2 ${
              isCollapsed ? "max-h-0 py-0" : "max-h-48 "
            }`}
          >
            <div
              style={{ minWidth: 200 }}
              className="flex flex-col justify-between gap-2"
            >
              {/* First Row */}
              <div className="flex justify-between gap-4">
                {/* State */}
                <label className="w-full">
                  <span className="text-xs font-medium text-gray-700">
                    State:
                  </span>
                  <select
                    value={selectedLine?.shapeType}
                    onChange={(e) => {
                      onComponentUpdate(questionId, selectedLine.id, {
                        shapeType: e.target.value,
                        correctValue: e.target.value !== "square",
                      });
                    }}
                    className="block h-[36px] w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-xs leading-tight text-gray-800 shadow-sm
               focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="cross">Cross</option>
                    <option value="tick">Tick</option>
                    <option value="square">Solid</option>
                  </select>
                </label>

                {/* Check Color */}
                <label className="w-full">
                  <span className="text-xs font-medium text-gray-700">
                    Check color:
                  </span>
                  <input
                    type="color"
                    value={selectedLine?.shapeTypeColor}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedLine.id, {
                        shapeTypeColor: e.target.value,
                      })
                    }
                    className="h-[36px] w-full rounded border border-gray-300 p-0 shadow-sm
               focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </label>
                {/* Border Radius */}
                <label className="w-full">
                  <span className="text-xs font-medium text-gray-700">
                    Border Radius:
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={selectedLine?.borderRadius}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedLine.id, {
                        borderRadius: +e.target.value,
                      })
                    }
                    className="block w-full  h-[36px] rounded-md border border-gray-300 bg-white py-2 px-3 text-xs leading-tight text-gray-800 shadow-sm
               focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </label>
              </div>

              {/* Second Row */}
              <div className="flex justify-between gap-4">
                {/* Border COlor */}
                <label className="w-full">
                  <span className="text-xs font-medium text-gray-700">
                    Border Color:
                  </span>
                  <input
                    type="color"
                    value={selectedLine?.borderColor}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedLine.id, {
                        borderColor: e.target.value,
                      })
                    }
                    className="h-[36px] w-full rounded border border-gray-300 p-0 shadow-sm
               focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </label>

                {/* Handle Color */}
                <label className="w-full">
                  <span className="text-xs font-medium text-gray-700">
                    Background Color:
                  </span>
                  <input
                    type="color"
                    value={selectedLine?.backgroundColor || "#A7EC94"}
                    onChange={(e) =>
                      onComponentUpdate(questionId, selectedLine.id, {
                        backgroundColor: e.target.value,
                      })
                    }
                    className="h-[36px] w-full rounded border border-gray-300 p-0 shadow-sm
               focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </label>
              </div>
              {/* <button onClick={onDeselect}>Deselect</button> */}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckBoxToolBar;
