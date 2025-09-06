import React, { useState } from "react";
import BaseDraggable from "./BaseDraggable";
import {
  SplitSquareHorizontal,
  Plus,
  X,
  Edit2,
  Check,
  ArrowRight,
} from "lucide-react";

const MatchingPairsComponent = ({
  onDoubleClick,
  id,
  position,
  pairs = [],
  onUpdate,
  onDelete,
  width = 400,
  height = 200,
  optionTextColor = "#000000",
  fontFamily = "Arial, sans-serif",
  fontSize = 14,
  optionBackgroundColor = "#f9fafb",
  fontStyles = {
    bold: false,
    italic: false,
    underline: false,
    lineThrough: false,
  },
  optionBorderColor = "#4b5563",
  optionBorderWidth = 1,
  optionBorderStyle = "solid",
  optionBorderRadius = "0.375rem",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [newLeft, setNewLeft] = useState("");
  const [newRight, setNewRight] = useState("");

  const baseHeight = 200;
  const baseFontSize = fontSize;
  const computedFontSize = Math.min(
    Math.max(baseFontSize * (1 + (height / baseHeight - 1) / 2), 12),
    48
  );

  const fontStyle = {
    fontWeight: fontStyles?.bold ? "bold" : "normal",
    fontStyle: fontStyles?.italic ? "italic" : "normal",
    textDecoration: `${fontStyles?.underline ? "underline" : ""} ${
      fontStyles?.lineThrough ? "line-through" : ""
    }`.trim(),
    fontFamily,
    fontSize,
    whiteSpace: "nowrap",
  };

  const handleAddPair = () => {
    if (!newLeft.trim() || !newRight.trim()) return;
    const newPairs = [...pairs, { left: newLeft, right: newRight }];
    onUpdate(id, { pairs: newPairs });
    setNewLeft("");
    setNewRight("");
    setIsAddingNew(false);
  };

  const handleEditCell = (index, side, value) => {
    const newPairs = [...pairs];
    newPairs[index] = {
      ...newPairs[index],
      [side]: value,
    };
    onUpdate(id, { pairs: newPairs });
    setEditingCell(null);
  };

  const handleDeletePair = (index) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    onUpdate(id, { pairs: newPairs });
  };

  const shufflePairs = () => {
    const rightSide = pairs.map((p) => p.right);
    for (let i = rightSide.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rightSide[i], rightSide[j]] = [rightSide[j], rightSide[i]];
    }
    const shuffledPairs = pairs.map((p, idx) => ({
      left: p.left,
      right: rightSide[idx],
    }));
    onUpdate(id, { pairs: shuffledPairs });
  };

  return (
    <BaseDraggable
      id={id}
      type="matching_pairs"
      position={position}
      width={width}
      height={height}
      onDelete={onDelete}
      onResize={(_cid, { width: newW, height: newH }) =>
        onUpdate(id, {
          width: newW,
          height: newH - 57,
        })
      }
      minWidth={250}
      minHeight={200}
      style={{
        width,
        height,
        background: optionBackgroundColor,
        border: "none",
        boxShadow: "none",
      }}
      className="group"
    >
      <div
        onDoubleClick={(e) => onDoubleClick?.("matching_pairs", id, e)}
        className="h-full flex flex-col bg-white rounded-lg border border-gray-200"
        // style={{ background: optionBackgroundColor }}
      >
        {/* Header */}

        {/* Headers */}
        {/* <div className="grid grid-cols-2 px-4 py-2 border-b text-gray-600 font-medium" style={{ fontSize: computedFontSize - 1 }}>
          <div>Left Items</div>
          <div>Right Items</div>
        </div> */}

        {/* Pairs Container */}
        <div className="flex-1 flex flex-col min-h-0">
          {pairs.map((pair, index) => (
            <div
              key={index}
              className="flex-1 flex min-h-0 border-b last:border-b-0 p-2"
            >
              {/* Left Item */}
              <div
                style={{
                  borderColor: optionBorderColor,
                  borderWidth: optionBorderWidth,
                  borderRadius: optionBorderRadius || "0.375rem",
                  backgroundColor: optionBackgroundColor,
                }}
                className="flex-1 flex items-center p-2   shadow-sm rounded-lg"
              >
                {editingCell === `${index}-left` ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      autoFocus
                      value={pair.left}
                      onChange={(e) => {
                        const newPairs = [...pairs];
                        newPairs[index].left = e.target.value;
                        onUpdate(id, { pairs: newPairs });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          handleEditCell(index, "left", pair.left);
                        if (e.key === "Escape") setEditingCell(null);
                      }}
                      className="flex-1 px-2 py-1 border-b border-blue-500  focus:outline-none  w-max"
                      style={{
                        fontSize: computedFontSize - 1,
                        color: optionTextColor,
                        ...fontStyle,
                      }}
                      data-nodrag="true"
                    />
                    <button
                      onClick={() => handleEditCell(index, "left", pair.left)}
                      className="p-1 rounded-full hover:bg-green-100 text-green-600"
                      data-nodrag="true"
                    >
                      <Check size={15 - 1} />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-2 w-full h-full">
                    <button
                      onClick={() =>
                        isEditing && setEditingCell(`${index}-left`)
                      }
                      className=" text-left p-1 rounded w-full h-full"
                      style={{
                        fontSize: computedFontSize - 1,
                        color: optionTextColor,
                        ...fontStyle,
                      }}
                      data-nodrag="true"
                    >
                      {pair.left}
                    </button>
                  </div>
                )}
              </div>

              {/* Connector */}
              {/* <ArrowRight className="text-gray-400" size={computedFontSize} /> */}
              <div className="flex items-center justify-center w-8 relative group">
                {isEditing && (
                  <button
                    onClick={() => handleDeletePair(index)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-full bg-red-600 hover:bg-red-400 text-white z-10 absolute"
                    data-nodrag="true"
                  >
                    <X size={15} />
                  </button>
                )}
                <span
                  style={{
                    borderColor: optionBorderColor,
                    borderWidth: optionBorderWidth * 0.4,
                    borderStyle: optionBorderStyle,
                  }}
                  className="border-t border-gray-600 w-full"
                ></span>
              </div>

              {/* Right Item */}
              <div
                style={{
                  borderColor: optionBorderColor,
                  borderWidth: optionBorderWidth,
                     borderRadius: optionBorderRadius || "0.375rem",
                      backgroundColor: optionBackgroundColor,
                }}
                className="flex-1 flex items-center p-2  shadow-sm rounded-lg"
              >
                {editingCell === `${index}-right` ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      autoFocus
                      value={pair.right}
                      onChange={(e) => {
                        const newPairs = [...pairs];
                        newPairs[index].right = e.target.value;
                        onUpdate(id, { pairs: newPairs });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          handleEditCell(index, "right", pair.right);
                        if (e.key === "Escape") setEditingCell(null);
                      }}
                      className="flex-1 px-2 py-1 border-b border-blue-500  focus:outline-none  w-max"
                      style={{
                        fontSize: computedFontSize - 1,
                        color: optionTextColor,
                        ...fontStyle,
                      }}
                      data-nodrag="true"
                    />
                    <button
                      onClick={() => handleEditCell(index, "right", pair.right)}
                      className="p-1 rounded-full hover:bg-green-100 text-green-600"
                      data-nodrag="true"
                    >
                      <Check size={computedFontSize - 1} />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center gap-2 w-full h-full">
                    <button
                      onClick={() =>
                        isEditing && setEditingCell(`${index}-right`)
                      }
                      className="text-left p-1 rounded w-full h-full"
                      style={{
                        fontSize: computedFontSize - 1,
                        color: optionTextColor,
                        ...fontStyle,
                      }}
                      data-nodrag="true"
                    >
                      {pair.right}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="border-t border-gray-300 bg-gray-50 p-2">
            {isAddingNew ? (
              <div className="flex items-center space-x-3">
                <input
                  value={newLeft}
                  onChange={(e) => setNewLeft(e.target.value)}
                  placeholder="New left…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddPair();
                    if (e.key === "Escape") {
                      setIsAddingNew(false);
                      setNewLeft("");
                      setNewRight("");
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition w-full"
                  style={{ fontSize: 15 }}
                  data-nodrag="true"
                />

                <ArrowRight
                  size={computedFontSize}
                  className="text-gray-400 flex-shrink-0 m-0"
                />

                <input
                  value={newRight}
                  onChange={(e) => setNewRight(e.target.value)}
                  placeholder="New right…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddPair();
                    if (e.key === "Escape") {
                      setIsAddingNew(false);
                      setNewLeft("");
                      setNewRight("");
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition w-full m-0"
                  style={{ fontSize: 16 }}
                  data-nodrag="true"
                />

                <button
                  onClick={handleAddPair}
                  disabled={!newLeft.trim() || !newRight.trim()}
                  className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  data-nodrag="true"
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setIsAddingNew(true);
                      setIsEditing(false);
                    }}
                    className="h-[40px] flex items-center gap-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition"
                    style={{ fontSize: 15 }}
                    data-nodrag="true"
                  >
                    <Plus size={16} />
                    <span>Add Pair</span>
                  </button>
                  {isEditing && (
                    <button
                      onClick={shufflePairs}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                      data-nodrag="true"
                      style={{ fontSize: 16 }}
                    >
                      Shuffle
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    setIsEditing((e) => !e);
                    setIsAddingNew(false);
                  }}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                  data-nodrag="true"
                >
                  {isEditing ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Edit2 size={16} className="text-gray-600" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseDraggable>
  );
};

export default MatchingPairsComponent;
