



import React, { useState, useRef, useEffect } from "react";
import BaseDraggable from "./BaseDraggable";

const PADDING = 5;
const BORDER = 2;
const DEFAULT_FS = 16;
const MIN_FS = 8;
const MAX_FS = 200;
const CHAR_LIMIT = 800; 

export default function FormattedTextItem({
  id,
  position,
  width: initialWidth = 260,
  height: initialHeight = 24 + PADDING * 2 + BORDER * 2,
  fontSize: initialFontSize = DEFAULT_FS,
  fontFamily = "Arial, sans-serif",
  fontColor = "#000000",
  fontStyles = { bold: false, italic: false, underline: false, lineThrough: false },
  textAlign = "left",
  lineSpacing = 1.2,
  letterSpacing = 0,
  listStyle = "none",
  correctAnswer = "",
  setCorrectAnswer,
  onUpdateComponent,
  onDelete,
  onDoubleClick,
  setText,
  toolbarFontSize: externalToolbarFontSize = null,
}) {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);

  const [dims, setDims] = useState({ width: initialWidth, height: initialHeight });
  const [resizeFontSize, setResizeFontSize] = useState(null);
  const [toolbarFontSize, setToolbarFontSize] = useState(externalToolbarFontSize);
  const appliedFontSize = resizeFontSize ?? toolbarFontSize ?? initialFontSize;
  const [charCount, setCharCount] = useState(0);

  const applyStyles = (el, fontSize) => {
    el.style.fontFamily = fontFamily;
    el.style.color = fontColor;
    el.style.fontWeight = fontStyles?.bold ? "bold" : "normal";
    el.style.fontStyle = fontStyles?.italic ? "italic" : "normal";

    const decorations = [];
    if (fontStyles?.underline) decorations.push("underline");
    if (fontStyles?.lineThrough) decorations.push("line-through");
    el.style.textDecoration = decorations?.length > 0 ? decorations.join(" ") : "none";

    el.style.textAlign = textAlign;
    el.style.lineHeight = lineSpacing;
    el.style.letterSpacing = `${letterSpacing}px`;

    el.style.fontSize = `${fontSize}px`;

    if (listStyle === "bullet" || listStyle === "number") {
      if (!el.querySelector("ul") && !el.querySelector("ol")) {
        const text = el.innerText.trim();
        if (text) {
          const wrapper = document.createElement(listStyle === "bullet" ? "ul" : "ol");
          wrapper.style.margin = "0 0 0 1.2em";
          wrapper.style.padding = "0";
          wrapper.style.listStyleType = listStyle === "bullet" ? "disc" : "decimal";

          const lines = text.split(/\n+/);
          wrapper.innerHTML = lines.map(line => `<li>${line}</li>`).join("");
          el.innerHTML = "";
          el.appendChild(wrapper);
        }
      }
    } else {
      if (el.querySelector("ul") || el.querySelector("ol")) {
        const plainText = el.innerText;
        el.innerHTML = plainText;
      }
    }
  };

  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      applyStyles(el, appliedFontSize);
    }
  }, [fontFamily, fontColor, fontStyles, textAlign, lineSpacing, letterSpacing, listStyle, appliedFontSize]);

    // set initial count if there's already text
    useEffect(() => {
      const initText = contentRef.current?.innerText || "";
      setCharCount(initText.length);
    }, []);

  useEffect(() => {
    setDims({ width: initialWidth, height: initialHeight });
    setResizeFontSize(null);
    setToolbarFontSize(externalToolbarFontSize);
    const el = contentRef.current;
    if (el) {
      el.innerText = correctAnswer;
      applyStyles(el, appliedFontSize);
      el.style.height = `${initialHeight - PADDING * 2 - BORDER * 2}px`;
    }
  }, []);

  const pushUpdate = (payload) => {
    onUpdateComponent(id, {
      width: dims.width,
      height: dims.height,
      fontSize: appliedFontSize,
      fontFamily,
      fontColor,
      fontStyles,
      textAlign,
      lineSpacing,
      letterSpacing,
      listStyle,
      x: position.left,
      y: position.top,
      ...payload,
    });
  };

  const recalcFloor = () => {
    const el = contentRef.current;
    if (!el) return;

    el.style.height = "auto";
    const contentH = el.scrollHeight;
    const boxH = Math.max(24, contentH) + PADDING * 2 + BORDER * 2;

    const newDims = { width: dims.width, height: Math.max(dims.height, boxH) };
    setDims(newDims);

    el.style.height = `${contentH}px`;
    pushUpdate({ width: newDims.width, height: newDims.height, fontSize: appliedFontSize });
  };

  const recalcFont = (dimsArg) => {
    const wrap = wrapperRef.current;
    const el = contentRef.current;
    if (!wrap || !el) return;

    const availH = wrap.clientHeight;
    const measure = (size) => {
      el.style.fontSize = `${size}px`;
      el.style.height = "auto";
      return el.scrollHeight;
    };

    const reportDims = dimsArg || dims;

    let newFont = DEFAULT_FS;
    const defaultH = measure(DEFAULT_FS);
    if (defaultH <= availH) {
      let lo = DEFAULT_FS, hi = MAX_FS, best = DEFAULT_FS;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (measure(mid) <= availH) { best = mid; lo = mid + 1; }
        else { hi = mid - 1; }
      }
      newFont = best;
    } else {
      let lo = MIN_FS, hi = DEFAULT_FS, best = MIN_FS;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (measure(mid) <= availH) { best = mid; lo = mid + 1; }
        else { hi = mid - 1; }
      }
      if (best > MIN_FS) newFont = best;
      else {
        const neededH = measure(MIN_FS);
        const newBoxH = neededH + PADDING * 2 + BORDER * 2;
        const newDims = { width: reportDims.width, height: newBoxH };
        setDims(newDims);
        setResizeFontSize(MIN_FS);
        el.style.fontSize = `${MIN_FS}px`;
        el.style.height = `${neededH}px`;
        pushUpdate({ width: newDims.width, height: newDims.height, fontSize: MIN_FS });
        return;
      }
    }

    setResizeFontSize(newFont);
    setToolbarFontSize(null);

    el.style.fontSize = `${newFont}px`;
    el.style.height = `${availH}px`;
    pushUpdate({ width: reportDims.width, height: reportDims.height, fontSize: newFont });
  };

   const handleInput = () => {
    const el = contentRef.current;
    if (!el) return;

    let text = el.innerText;
    if (text.length > CHAR_LIMIT) {
      text = text.slice(0, CHAR_LIMIT);
      el.innerText = text;

      // move caret to end
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    setCharCount(text.length);
    recalcFloor();
  };

  const handleResize = (_, newDims) => {
      const txt = contentRef.current.innerText.trim();
    setDims(newDims);
    pushUpdate({ width: newDims.width, height: newDims.height, fontSize: appliedFontSize });
        setText(id, txt);
    setTimeout(() => recalcFont(newDims), 0);

  };

const handleBlur = () => {
  const el = contentRef.current;
  let txt = el.innerText.trim();

  // enforce char‐limit
  if (txt.length > CHAR_LIMIT) {
    txt = txt.slice(0, CHAR_LIMIT);
    el.innerText = txt;
  }

  // update char counter & answer state
  setCharCount(txt.length);
  setCorrectAnswer(id, txt);
  setText(id, txt);   // ← mirror your resize behavior

  // push the latest dims/fontSize too
  pushUpdate({
    width: dims.width,
    height: dims.height,
    fontSize: appliedFontSize,
  });
};

  // Sync external toolbar font size changes if provided
  useEffect(() => {
    if (externalToolbarFontSize !== null && externalToolbarFontSize !== toolbarFontSize) {
      setToolbarFontSize(externalToolbarFontSize);
      setResizeFontSize(null);
    }
  }, [externalToolbarFontSize]);



  return (
    <BaseDraggable
      id={id}
      type="text"
      position={position}
      onDelete={onDelete}
      onResize={handleResize}
      minWidth={50}
      minHeight={24 + PADDING * 2 + BORDER * 2}
      style={{
        width: dims.width,
        height: dims.height,
        padding: PADDING,
        border: `${BORDER}px solid #ccc`,
        boxSizing: "border-box",
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: 2,
          background: "rgba(255,255,255,0)",
          fontSize: 10,
          padding: "2px 4px",
          borderRadius: 3,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {/* debug info */}
      </div>

      <div
        ref={wrapperRef}
        style={{ width: "100%", height: "100%", overflow: "hidden", boxSizing: "border-box" }}
        onDoubleClick={(e) => onDoubleClick?.("text", id, e)}
      >
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleBlur}
          style={{
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            fontSize: `${appliedFontSize}px`,
            fontFamily,
            color: fontColor,
            fontWeight: fontStyles?.bold ? "bold" : "normal",
            fontStyle: fontStyles?.italic ? "italic" : "normal",
            textDecoration:
              [
                fontStyles?.underline ? "underline" : "",
                fontStyles?.lineThrough ? "line-through" : "",
              ].filter(Boolean).join(" ") || "none",
            textAlign,
            lineHeight: lineSpacing,
            letterSpacing: `${letterSpacing}px`,
            outline: "none",
            overflow: "hidden",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            backgroundColor: "transparent",
            borderRadius: "0.5rem",
            padding: 3,
          }}
        />
      </div>
       {/* character counter */}
      <div
        style={{
          position: "absolute",
          bottom: 4,
          right: 6,
          fontSize: 10,
          color: "#ffffffcc",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {charCount}/{CHAR_LIMIT}
      </div>
    </BaseDraggable>
  );
}

