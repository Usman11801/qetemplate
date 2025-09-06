import { useState, useEffect, useCallback } from "react";
import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "../components/Toast";

const GRID_SIZE = 10;
const CONTAINER_WIDTH = 800;
const CONTAINER_HEIGHT = 600;

export const useFormState = (formId) => {
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState(null);
  const [category, setCategory] = useState("all");
  const [questions, setQuestions] = useState([]);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [showFormInfo, setShowFormInfo] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // New state for tracking save status

  // ----forEditComponent-----
  const [editingComponent, setEditingComponent] = useState(null); // store { type, id, questionId }
  const [showLineEditor, setShowLineEditor] = useState(false);
  const [showCheckboxEditor, setShowCheckboxEditor] = useState(false);
  const [showTrueFalseEditor, setShowTrueFalseEditor] = useState(false);
  const [showSingleChoiceEditor, setShowSingleChoiceEditor] = useState(false);
  const [showMultiChoiceEditor, setShowMultiChoiceEditor] = useState(false);
  const [showShortTextEditor, setShowShortTextEditor] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showToggleBoxEditor, setShowToggleBoxEditor] = useState(false);
  const [showRankingEditor, setShowRankingEditor] = useState(false);
  const [showDiscreteSliderEditor, setShowDiscreteSliderEditor] =
    useState(false);
  const [showMatchingPairsEditor, setShowMatchingPairsEditor] = useState(false);
  const [showNumericSliderEditor, setShowNumericSliderEditor] = useState(false);
  // console.log(editingComponent, "editingComponent");
  const MAX_COMPONENTS = 25;
  const MAX_QUESTIONS = 30;

  const { addToast } = useToast();

  const loadFormData = useCallback(async () => {
    try {
      if (!formId) return;
      const formDocRef = doc(db, "forms", formId);
      const formSnap = await getDoc(formDocRef);

      if (formSnap.exists()) {
        const data = formSnap.data();
        setFormTitle(data.formTitle || "");
        setFormDescription(data.formDescription || "");
        setFormImage(data.formImage || null);
        const loadedCategory = data.category || "all";
        setCategory(loadedCategory);
        console.log("useFormState - Loaded form data from Firebase:", {
          formTitle: data.formTitle,
          formDescription: data.formDescription,
          formImage: data.formImage,
          category: loadedCategory,
        });
      }

      const questionsCollRef = collection(formDocRef, "questions");
      const questionsSnap = await getDocs(questionsCollRef);

      if (!questionsSnap.empty) {
        const loadedQuestions = questionsSnap.docs.map((docSnap) => {
          const data = docSnap.data();
          const comps = (data.components || []).map((c) => {
            if (typeof c.width === "string")
              c.width = parseInt(c.width, 10) || 100;
            if (typeof c.height === "string")
              c.height = parseInt(c.height, 10) || 40;
            if (typeof c.opacity === "string")
              c.opacity = parseFloat(c.opacity) || 1;
            if (typeof c.opacity !== "number") c.opacity = 1;

            if (c.type === "text") {
              if (typeof c.text === "string") {
                c.text = {
                  text: c.text,
                  format: {
                    bold: false,
                    italic: false,
                    align: "left",
                    size: "text-base",
                    color: "text-gray-900",
                    font: "Arial",
                  },
                };
              }
              if (!c.text.format) {
                c.text.format = {
                  bold: false,
                  italic: false,
                  align: "left",
                  size: "text-base",
                  color: "text-gray-900",
                  font: "Arial",
                };
              } else {
                c.text.format = {
                  bold: c.text.format.bold || false,
                  italic: c.text.format.italic || false,
                  align: c.text.format.align || "left",
                  size: c.text.format.size || "text-base",
                  color: c.text.format.color || "text-gray-900",
                  font: c.text.format.font || "Arial",
                };
              }
            }
            return c;
          });

          const numericPoints = isNaN(parseInt(data.points)) ? 10 : parseInt(data.points);
          const numericAttempts = isNaN(parseInt(data.maxAttempts)) ? 3 : parseInt(data.maxAttempts);

          return {
            id: parseInt(docSnap.id, 10),
            points: numericPoints,
            maxAttempts: numericAttempts,
            // points: data.points ? String(data.points) : "10",
            // maxAttempts: data.maxAttempts ? String(data.maxAttempts) : "3",
            components: comps,
            backgroundColor: data.backgroundColor || "#FFFFFF",
            order: data.order || 0,
          };
        });

        loadedQuestions.sort((a, b) => a.order - b.order);
        setQuestions(loadedQuestions);
        setActiveQuestionId(loadedQuestions[0]?.id);
      } else {
        setQuestions([
          {
            id: 1,
            points: "10",
            maxAttempts: "3",
            components: [],
            backgroundColor: "#FFFFFF",
            order: 0,
          },
        ]);
        setActiveQuestionId(1);
      }
    } catch (err) {
      console.error("Error loading form:", err);
      setQuestions([
        {
          id: 1,
          points: "10",
          maxAttempts: "3",
          components: [],
          backgroundColor: "#FFFFFF",
          order: 0,
        },
      ]);
      setActiveQuestionId(1);
    }
  }, [formId]);

  useEffect(() => {
    loadFormData();
  }, [loadFormData]);

  const handleSetCategory = (newCategory) => {
    console.log("useFormState - Current category:", category);
    console.log("useFormState - Setting category to:", newCategory);
    setCategory(newCategory);
  };

  const getComponentDimensions = (type) => {
    switch (type) {
      case "image_upload":
        return { width: 160, height: 160 };
      case "true_false":
        return { width: 128, height: 56 };
      case "multiple_choice_single":
        return { width: 288, height: 200 };
      case "multiple_choice_multi":
        return { width: 288, height: 200 };
      case "text":
        return { width: 256, height: 64 };
      case "shape":
        return { width: 100, height: 100 };
      case "single_checkbox":
        return { width: 48, height: 48 };
      case "toggle_button":
        return { width: 100, height: 40 };
      case "numeric_slider":
        return { width: 320, height: 160 };
      case "discrete_slider":
        return { width: 320, height: 160 };
      case "ranking":
        return { width: 288, height: 200 };
      case "matching_pairs":
        return { width: 400, height: 200 };
      default:
        return { width: 128, height: 56 };
    }
  };

  const handleDrop = (item, x, y) => {
    if (!activeQuestionId) return;

    const currentQuestion = questions.find((q) => q.id === activeQuestionId);
    if (currentQuestion.components.length >= MAX_COMPONENTS) {
      addToast(
        `Maximum of ${MAX_COMPONENTS} components reached for this question`,
        "warning"
      );
      return;
    }

    const dims = item.dimensions || getComponentDimensions(item.type);
    console.log(item, "itemInHandleDrop");
    const snappedLeft = Math.round(x / GRID_SIZE) * GRID_SIZE;
    const snappedTop = Math.round(y / GRID_SIZE) * GRID_SIZE;

    const left = Math.max(
      0,
      Math.min(snappedLeft, CONTAINER_WIDTH - dims.width)
    );
    const top = Math.max(
      0,
      Math.min(snappedTop, CONTAINER_HEIGHT - dims.height)
    );
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== activeQuestionId) return q;

        if (typeof item.id !== "undefined") {
          return {
            ...q,
            components: q.components.map((c) =>
              c.id === item.id && c.type !== "line"
                ? { ...c, position: { left, top } }
                : c
            ),
          };
        } else {
          const nextId = Math.max(0, ...q.components.map((c) => c.id), 0) + 1;
          const newComp = createNewComponent(
            item.type,
            nextId,
            left,
            top,
            item
          );
          return {
            ...q,
            components: [...q.components, newComp],
          };
        }
      })
    );
  };

  const createNewComponent = (type, id, left, top, item = {}) => {
    switch (type) {
      case "true_false":
        return {
          id,
          type,
          position: { left, top },
          value: false,
          width: 128,
          height: 56,
          fontFamily: item.fontFamily || "Arial, sans-serif",
          fontSize: item.fontSize || 14,
          fontStyles: item.fontStyles || {
            bold: false,
            italic: false,
            underline: false,
            lineThrough: false,
          },
          leftBoxColor: item.leftBoxColor || "#22c55e",
          rightBoxColor: item.rightBoxColor || "#ef4444",
          borderRadius: item.borderRadius ?? 12,
          borderColor: item.borderColor || "#d1d5db",
          backgroundColor: item.backgroundColor || "#ffffff",
        };
      case "image_upload":
        return {
          id,
          type,
          position: { left, top },
          image: null,
          width: 160,
          height: 160,
        };
      case "text":
        return {
          id,
          type,
          position: { left, top },
          width: 260,
          height: 24 + 14,
          text: {
            text: "Double-click to edit",
            format: {
              bold: false,
              italic: false,
              align: "left",
              size: "text-base",
              color: "text-gray-900",
              font: "Arial",
            },
            fontFamily: "Arial, sans-serif",
            fontSize: 16,
            fontColor: "#000000",
            fontStyles: {
              bold: false,
              italic: false,
              underline: false,
              lineThrough: false,
            },
            textAlign: "left",
            lineSpacing: 1.2,
            letterSpacing: 0,
            listStyle: "none", // "none" | "bullet" | "number"
          },
        };
      case "multiple_choice_single":
        return {
          id,
          type,
          position: { left, top },
          options: ["Option 1", "Option 2"],
          correctIndex: 0,
          width: 288,
          height: 200,
          // styling defaults:
          fontFamily: "Arial, sans-serif",
          fontSize: 14,
          fontStyles: {
            bold: false,
            italic: false,
            underline: false,
            lineThrough: false,
          },
          optionSpacing: 8,
          optionBackgroundColor: "#f9fafb",
          optionBorderColor: "#d1d5db",
          optionBorderWidth: 1,
          optionBorderRadius: 8,
          backgroundColor: "#ffffff",
          selectType: "circle", // "circle" | "square" | "diamond"
        };
      case "multiple_choice_multi":
        return {
          id,
          type,
          position: { left, top },
          options: ["Option A", "Option B"],
          correctAnswers: [],
          width: 288,
          height: 200,
          fontSize: 14,
          fontStyles: {
            bold: false,
            italic: false,
            underline: false,
            lineThrough: false,
          },
          optionSpacing: 8,
          optionBackgroundColor: "#f9fafb",
          optionBorderColor: "#d1d5db",
          optionBorderWidth: 1,
          optionBorderRadius: 8,
          backgroundColor: "#ffffff",
          selectType: "square", // "circle" | "square" | "diamond"
        };
      case "custom_component":
        return {
          id,
          type,
          position: { left, top },
          subItems: [],
          relationships: [],
        };
      case "line":
        console.log(item, "item");
        return {
          id,
          type: "line",
          x1: left,
          y1: top,
          x2: left + 100,
          y2: top,
          shapeType: item.shapeType, // "dotted" | "dashed" | "solid"
          strokeWidth: item.strokeWidth,
          strokeColor: item.strokeColor,
          arrowType: item.arrowType, // 'none' | 'start' | 'end' | 'both'
          endpointColor: item.endpointColor,
          endpointShape: item.endpointShape, // 'circle' | 'square' | 'arrow'
          // item: item.extraItem,
        };
      case "short_text_answer":
        return {
          id,
          type,
          position: { left, top },
          correctAnswer: "",
          width: 260,
          height: 24 + 14,
          fontFamily: "Arial, sans-serif",
          fontSize: 16,
          fontColor: "#000000",
          fontStyles: {
            bold: false,
            italic: false,
            underline: false,
            lineThrough: false,
          },
          textAlign: "left",
          lineSpacing: 1.2,
          letterSpacing: 0,
          listStyle: "none", // "none" | "bullet" | "number"
        };
      case "single_checkbox":
        return {
          id,
          type,
          position: { left, top },
          correctValue: true,
          width: 48,
          height: 48,
          backgroundColor: item.backgroundColor || "#A7EC94",
          borderColor: item.borderColor,
          borderRadius: item.borderRadius,
          shapeType: item.shapeType || "tick", // "cross" | "tick" | "square"
          shapeTypeColor: item.shapeTypeColor || "#22c55e",
        };
      case "toggle_button":
        return {
          id,
          type,
          position: { left, top },
          toggled: false,
          width: 100,
          height: 40,
          opacity: 1,
          borderRadius: 4,
          borderWidth: 2,
          backgroundColor: "#ffffff",
          borderColor: "#000000",
          corners: 4,
        };
      case "numeric_slider":
        return {
          id,
          type,
          position: { left, top },
          minValue: 0,
          maxValue: 100,
          targetValue: 50,
          currentValue: 50,
          width: 320,
          height: 160,
          sliderColor: "#3b82f6",
          sliderBackgroundColor: "#e5e7eb",
          optionBackgroundColor: "#ffffff",
          showCurrentValue: true,
          optionBorderRadius: 8,
          optionBorderColor: "#d1d5db",
          optionSpacing: 4,
          fontStyles: {
            bold: false,
            italic: false,
            underline: false,
            lineThrough: false,
          },
          fontFamily: "Arial, sans-serif",
          fontSize: 14,
          thickness: 6,
        };
      case "discrete_slider":
        return {
          id,
          type,
          position: { left, top },
          options: ["Very Bad", "Bad", "Neutral", "Good", "Very Good"],
          selectedIndex: 2,
          width: 320,
          height: 160,
        };
      case "ranking":
        return {
          id,
          type,
          position: { left, top },
          items: ["Item 1", "Item 2"],
          correctOrder: [0, 1],
          width: 288,
          height: 200,
          fontSize: 14,
          fontStyles: {
            bold: false,
            italic: false,
            underline: false,
            lineThrough: false,
          },
          optionSpacing: 8,
          optionBackgroundColor: "#f9fafb",
          optionBorderColor: "#d1d5db",
          optionBorderWidth: 1,
          optionBorderRadius: 8,
          backgroundColor: "#ffffff",
        };
      case "matching_pairs":
        return {
          id,
          type,
          position: { left, top },
          pairs: [
            { left: "Item 1", right: "Match 1" },
            { left: "Item 2", right: "Match 2" },
          ],
          width: 300,
          height: 100,
          optionTextColor: "#000000",
          thickness: 6,
          fontFamily: "Arial, sans-serif",
          fontSize: 14,
          optionBackgroundColor: "#f9fafb",
          fontStyles: {
            bold: false,
            italic: false,
            underline: false,
            lineThrough: false,
          },
          optionBorderColor: "#d1d5db",
          optionBorderWidth: 1,
          optionBorderStyle :"solid",
        };
      case "shape":
        return {
          id,
          type: "shape",
          shapeType: item.shapeType || "circle",
          position: { left, top },
          width: 100,
          height: 100,
          backgroundColor: "#4A90E2",
          borderRadius: 0,
          opacity: 1,
          rotation: 0,
          borderWidth: 0,
          borderColor: "#000000",
          borderStyle: "solid",
        };
      default:
        return { id, type, position: { left, top } };
    }
  };

  const handleAddQuestion = async () => {
    if (questions.length >= MAX_QUESTIONS) {
      addToast(`Maximum of ${MAX_QUESTIONS} questions reached`, "warning");
      return;
    }
    handleDoubleClick();
    try {
      const newId = Math.max(0, ...questions.map((q) => q.id)) + 1;
      const newQuestion = {
        id: newId,
        points: "10",
        maxAttempts: "3",
        components: [],
        backgroundColor: "#FFFFFF",
        order: questions.length,
      };
      setQuestions((prev) => [...prev, newQuestion]);
      setActiveQuestionId(newId);

      if (formId) {
        const formDocRef = doc(db, "forms", formId);
        const questionDocRef = doc(
          collection(formDocRef, "questions"),
          newId.toString()
        );
        await setDoc(questionDocRef, newQuestion);
      }
    } catch (error) {
      console.error("Error adding question:", error);
      addToast("Failed to add question", "error");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      setQuestions((prev) => {
        const newQuestions = prev
          .filter((q) => q.id !== questionId)
          .map((q, index) => ({
            ...q,
            order: index,
          }));
        if (newQuestions.length === 0) {
          newQuestions.push({
            id: 1,
            points: "10",
            maxAttempts: "3",
            components: [],
            backgroundColor: "#FFFFFF",
            order: 0,
          });
          setActiveQuestionId(1);
        } else if (activeQuestionId === questionId) {
          setActiveQuestionId(newQuestions[0]?.id || null);
        }
        return newQuestions;
      });

      if (formId) {
        const formDocRef = doc(db, "forms", formId);
        const questionDocRef = doc(
          collection(formDocRef, "questions"),
          questionId.toString()
        );
        await deleteDoc(questionDocRef);

        const remainingQuestions = questions.filter((q) => q.id !== questionId);
        for (let i = 0; i < remainingQuestions.length; i++) {
          const q = remainingQuestions[i];
          const qDocRef = doc(
            collection(formDocRef, "questions"),
            q.id.toString()
          );
          await setDoc(qDocRef, { order: i }, { merge: true });
        }
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      addToast("Failed to delete question", "error");
    }
  };

  const handleReorderQuestions = async (reordered) => {
    try {
      const updatedQuestions = reordered.map((q, index) => ({
        ...q,
        order: index,
      }));

      setQuestions(updatedQuestions);

      if (formId) {
        const formDocRef = doc(db, "forms", formId);
        for (const question of updatedQuestions) {
          const questionDocRef = doc(
            collection(formDocRef, "questions"),
            question.id.toString()
          );

          const numericPoints = isNaN(parseInt(question.points)) ? 10 : parseInt(question.points);
          const numericAttempts = isNaN(parseInt(question.maxAttempts)) ? 3 : parseInt(question.maxAttempts);

          await setDoc(
            questionDocRef,
            {
              id: question.id,
              points: numericPoints,
              maxAttempts: numericAttempts,
              components: question.components,
              backgroundColor: question.backgroundColor || "#FFFFFF",
              order: question.order,
            },
            { merge: true }
          );
        }
      }
    } catch (error) {
      console.error("Error reordering questions:", error);
      addToast("Failed to reorder questions", "error");
    }
  };

  const handleQuestionUpdate = (questionId, updates) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    );
  };
  const handleComponentUpdate = (questionId, componentId, updates) => {
    console.log("Updating component:", componentId, "with:", updates);
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
            ...q,
            components: q.components.map((c) =>
              c.id === componentId ? { ...c, ...updates } : c
            ),
          }
          : q
      )
    );
    setEditingComponent((prev) => {
      if (prev && prev.id === componentId && prev.questionId === questionId) {
        return { ...prev, ...updates };
      }
      return prev;
    });
  };

  const handleDeleteComponent = (questionId, componentId) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
            ...q,
            components: q.components.filter((c) => c.id !== componentId),
          }
          : q
      )
    );
  };

  const saveToFirebase = async () => {
    try {
      if (!formId) {
        addToast("No formId found!", "error");
        return;
      }

      // Set saving state to show loading overlay
      setIsSaving(true);

      // First show an initial "Saving..." toast that won't auto-dismiss
      const savingToastId = Date.now();

      const formDocRef = doc(db, "forms", formId);
      console.log("useFormState - Saving to Firebase:", {
        formTitle,
        formDescription,
        formImage,
        category,
      });

      await setDoc(
        formDocRef,
        { formTitle, formDescription, formImage, category },
        { merge: true }
      );

      const questionsCollRef = collection(formDocRef, "questions");
      const questionsSnap = await getDocs(questionsCollRef);
      const existingQuestionIds = questionsSnap.docs.map((doc) =>
        parseInt(doc.id)
      );

      for (const question of questions) {
        // const numericPoints = parseInt(question.points, 10) || 10;
        // const numericAttempts = parseInt(question.maxAttempts, 10) || 3;

        const numericPoints = isNaN(parseInt(question.points)) ? 10 : parseInt(question.points);
        const numericAttempts = isNaN(parseInt(question.maxAttempts)) ? 3 : parseInt(question.maxAttempts);

        const processedComponents = question.components.map((component) => {
          let c = JSON.parse(JSON.stringify(component));

          if (typeof c.width === "string")
            c.width = parseInt(c.width, 10) || 100;
          if (typeof c.height === "string")
            c.height = parseInt(c.height, 10) || 40;
          if (typeof c.opacity === "string")
            c.opacity = parseFloat(c.opacity) || 1;
          if (typeof c.opacity !== "number") c.opacity = 1;

          if (c.type === "text") {
            if (!c.text || typeof c.text === "string") {
              c.text = {
                text: c.text || "",
                format: {
                  bold: false,
                  italic: false,
                  align: "left",
                  size: "text-base",
                  color: "text-gray-900",
                  font: "Arial",
                },
              };
            }
            c.text.format = {
              bold: c.text.format?.bold || false,
              italic: c.text.format?.italic || false,
              align: c.text.format?.align || "left",
              size: c.text.format?.size || "text-base",
              color: c.text.format?.color || "text-gray-900",
              font: c.text.format?.font || "Arial",
            };
          }
          return c;
        });

        const questionDocRef = doc(
          collection(formDocRef, "questions"),
          question.id.toString()
        );

        await setDoc(
          questionDocRef,
          {
            id: question.id,
            points: numericPoints,
            maxAttempts: numericAttempts,
            components: processedComponents,
            backgroundColor: question.backgroundColor || "#FFFFFF",
            order: question.order,
          },
          { merge: true }
        );
      }

      const currentQuestionIds = questions.map((q) => q.id);
      const questionsToDelete = existingQuestionIds.filter(
        (id) => !currentQuestionIds.includes(id)
      );
      for (const id of questionsToDelete) {
        const questionDocRef = doc(
          collection(formDocRef, "questions"),
          id.toString()
        );
        await deleteDoc(questionDocRef);
      }

      console.log("useFormState - Form saved successfully to Firebase!");

      // Finally update the saving state and show success toast
      setIsSaving(false);
      addToast("Form saved successfully!", "success");
    } catch (error) {
      console.error("useFormState - Error saving form:", error);

      // Show error toast and update saving state
      setIsSaving(false);
      addToast("Error saving form: " + error.message, "error");
    }
  };

  const saveFormDetails = async (updatedFields = {}) => {
    try {
      if (!formId) {
        addToast("No formId found!", "error");
        return;
      }

      const formDocRef = doc(db, "forms", formId);
      const docSnap = await getDoc(formDocRef);

      if (!docSnap.exists()) {
        addToast("Form not found!", "error");
        return;
      }

      const currentData = docSnap.data();

      const newFormData = {
        formTitle,
        formDescription,
        formImage,
        category,
        ...updatedFields,
      };

      const updates = {};

      if ((newFormData.formTitle ?? "") !== (currentData.formTitle ?? "")) {
        updates.formTitle = newFormData.formTitle ?? "";
      }
      if (
        (newFormData.formDescription ?? "") !==
        (currentData.formDescription ?? "")
      ) {
        updates.formDescription = newFormData.formDescription ?? "";
      }
      if (newFormData.formImage !== currentData.formImage) {
        updates.formImage = newFormData.formImage;
      }
      if ((newFormData.category ?? "") !== (currentData.category ?? "")) {
        updates.category = newFormData.category ?? "";
      }

      if (Object.keys(updates).length > 0) {
        await setDoc(formDocRef, updates, { merge: true });
        addToast("Form auto-saved successfully!", "success");
      } else {
        console.log("No changes detected in form details.");
      }
    } catch (error) {
      console.error("Error saving form details:", error);
      addToast("Failed to save form details", "error");
    }
  };

  // console.log(editingComponent, showLineEditor, showCheckboxEditor, "s");

  // const handleDoubleClick = (type, componentId) => {
  //   if (!type || !componentId) {
  //     setShowLineEditor(false);
  //     setShowCheckboxEditor(false);
  //     setShowTrueFalseEditor(false);
  //     setShowSingleChoiceEditor(false);
  //     setShowMultiChoiceEditor(false);
  //     setShowShortTextEditor(false);
  //     setShowTextEditor(false);
  //     setShowToggleBoxEditor(false);
  //     setShowRankingEditor(false);
  //     setShowNumericSliderEditor(false);
  //     setShowMatchingPairsEditor(false);
  //     setShowDiscreteSliderEditor(false);
  //     setEditingComponent(null);
  //     return;
  //   }
  //   const question = questions.find((q) => q.id === activeQuestionId);
  //   if (!question) return;

  //   const component = question.components.find((c) => c.id === componentId);
  //   if (!component) return;

  //   setEditingComponent({ ...component, questionId: question.id });

  //   if (type === "line") {
  //     setShowCheckboxEditor(false);
  //     setShowLineEditor(!showLineEditor);
  //   } else if (type === "single_checkbox") {
  //     setShowLineEditor(false);
  //     setShowCheckboxEditor(!showCheckboxEditor);
  //   } else if (type === "true_false") {
  //     setShowLineEditor(false);
  //     setShowCheckboxEditor(false);
  //     setShowTrueFalseEditor(!showTrueFalseEditor);
  //   } else if (type === "multiple_choice_single") {
  //     setShowLineEditor(false);
  //     setShowCheckboxEditor(false);
  //     setShowTrueFalseEditor(false);
  //     setShowSingleChoiceEditor(!showSingleChoiceEditor);
  //   } else if (type === "multiple_choice_multi") {
  //     setShowLineEditor(false);
  //     setShowCheckboxEditor(false);
  //     setShowTrueFalseEditor(false);
  //     setShowSingleChoiceEditor(false);
  //     setShowMultiChoiceEditor(!showMultiChoiceEditor);
  //   } else if (type === "short_text_answer") {
  //     setShowLineEditor(false);
  //     setShowCheckboxEditor(false);
  //     setShowTrueFalseEditor(false);
  //     setShowSingleChoiceEditor(false);
  //     setShowMultiChoiceEditor(false);
  //     setShowShortTextEditor(!showShortTextEditor);
  //   } else if (type === "toggle_button") {
  //     setShowLineEditor(false);
  //     setShowCheckboxEditor(false);
  //     setShowTrueFalseEditor(false);
  //     setShowSingleChoiceEditor(false);
  //     setShowMultiChoiceEditor(false);
  //     setShowShortTextEditor(false);
  //     setShowToggleBoxEditor(!showToggleBoxEditor);
  //   } else if (type === "ranking") {
  //     setShowLineEditor(false);
  //     setShowCheckboxEditor(false);
  //     setShowTrueFalseEditor(false);
  //     setShowSingleChoiceEditor(false);
  //     setShowMultiChoiceEditor(false);
  //     setShowShortTextEditor(false);
  //     setShowToggleBoxEditor(false);
  //     setShowNumericSliderEditor(false);
  //     setShowMatchingPairsEditor(false);
  //     setShowDiscreteSliderEditor(false);
  //     setShowRankingEditor(!showRankingEditor);
  //   } else if (type === "text") {
  //     setShowLineEditor(false);
  //     setShowCheckboxEditor(false);
  //     setShowTrueFalseEditor(false);
  //     setShowSingleChoiceEditor(false);
  //     setShowMultiChoiceEditor(false);
  //     setShowShortTextEditor(false);
  //     setShowToggleBoxEditor(false);
  //     setShowTextEditor(!showTextEditor);
  //   } else if (type === "numeric_slider") {
  //     setShowLineEditor(false);
  //     setShowCheckboxEditor(false);
  //     setShowTrueFalseEditor(false);
  //     setShowSingleChoiceEditor(false);
  //     setShowMultiChoiceEditor(false);
  //     setShowShortTextEditor(false);
  //     setShowToggleBoxEditor(false);
  //     setShowTextEditor(false);
  //     setShowRankingEditor(false);
  //     setShowMatchingPairsEditor(false);
  //     setShowDiscreteSliderEditor(false);
  //     setShowNumericSliderEditor(!showNumericSliderEditor);
  //   } else if (type === "discrete_slider") {
  //     setShowLineEditor(false);
  //     setShowCheckboxEditor(false);
  //     setShowTrueFalseEditor(false);
  //     setShowSingleChoiceEditor(false);
  //     setShowMultiChoiceEditor(false);
  //     setShowShortTextEditor(false);
  //     setShowToggleBoxEditor(false);
  //     setShowTextEditor(false);
  //     setShowRankingEditor(false);
  //     setShowMatchingPairsEditor(false);
  //     setShowNumericSliderEditor(false);
  //     setShowDiscreteSliderEditor(!showDiscreteSliderEditor);
  //   } else if (type === "matching_pairs") {
  //     setShowLineEditor(false);
  //     setShowCheckboxEditor(false);
  //     setShowTrueFalseEditor(false);
  //     setShowSingleChoiceEditor(false);
  //     setShowMultiChoiceEditor(false);
  //     setShowShortTextEditor(false);
  //     setShowToggleBoxEditor(false);
  //     setShowTextEditor(false);
  //     setShowRankingEditor(false);
  //     setShowNumericSliderEditor(false);
  //     setShowDiscreteSliderEditor(false);
  //     setShowMatchingPairsEditor(!showMatchingPairsEditor);
  //   } else {
  //     setShowLineEditor(false);
  //     setShowCheckboxEditor(false);
  //     setShowTrueFalseEditor(false);
  //     setShowNumericSliderEditor(false);
  //     setShowMatchingPairsEditor(false);
  //     setShowDiscreteSliderEditor(false);
  //     setShowRankingEditor(false);
  //     setEditingComponent(null);
  //   }
  // };


  const handleDoubleClick = (type, componentId) => {
    // If no type/id, hide everything and clear editing target
    if (!type || !componentId) {
      turnAllEditorsOff();
      setEditingComponent(null);
      return;
    }

    const question = questions.find((q) => q.id === activeQuestionId);
    if (!question) return;

    const component = question.components.find((c) => c.id === componentId);
    if (!component) return;

    setEditingComponent({ ...component, questionId: question.id });

    // Map each editor type to its setter and current state
    const editorSetters = {
      line: setShowLineEditor,
      single_checkbox: setShowCheckboxEditor,
      true_false: setShowTrueFalseEditor,
      multiple_choice_single: setShowSingleChoiceEditor,
      multiple_choice_multi: setShowMultiChoiceEditor,
      short_text_answer: setShowShortTextEditor,
      toggle_button: setShowToggleBoxEditor,
      ranking: setShowRankingEditor,
      text: setShowTextEditor,
      numeric_slider: setShowNumericSliderEditor,
      discrete_slider: setShowDiscreteSliderEditor,
      matching_pairs: setShowMatchingPairsEditor,
    };

    const editorStates = {
      line: showLineEditor,
      single_checkbox: showCheckboxEditor,
      true_false: showTrueFalseEditor,
      multiple_choice_single: showSingleChoiceEditor,
      multiple_choice_multi: showMultiChoiceEditor,
      short_text_answer: showShortTextEditor,
      toggle_button: showToggleBoxEditor,
      ranking: showRankingEditor,
      text: showTextEditor,
      numeric_slider: showNumericSliderEditor,
      discrete_slider: showDiscreteSliderEditor,
      matching_pairs: showMatchingPairsEditor,
    };

    // If the type isn't a known editor, just turn all off and clear
    if (!editorSetters[type]) {
      turnAllEditorsOff();
      setEditingComponent(null);
      return;
    }

    // Toggle logic: clicking the same type again should invert it
    const nextVisible = !editorStates[type];

    // First, hide all editors
    Object.values(editorSetters).forEach((set) => set(false));

    // Then, show only the chosen one if nextVisible is true
    editorSetters[type](nextVisible);
  };

  // Small helper to turn everything off
  function turnAllEditorsOff() {
    setShowLineEditor(false);
    setShowCheckboxEditor(false);
    setShowTrueFalseEditor(false);
    setShowSingleChoiceEditor(false);
    setShowMultiChoiceEditor(false);
    setShowShortTextEditor(false);
    setShowToggleBoxEditor(false);
    setShowRankingEditor(false);
    setShowTextEditor(false);
    setShowNumericSliderEditor(false);
    setShowDiscreteSliderEditor(false);
    setShowMatchingPairsEditor(false);
  }


  return {
    formTitle,
    setFormTitle,
    formDescription,
    setFormDescription,
    formImage,
    setFormImage,
    category,
    setCategory: handleSetCategory,
    questions,
    setQuestions,
    activeQuestionId,
    setActiveQuestionId,
    showFormInfo,
    setShowFormInfo,
    handleDrop,
    handleAddQuestion,
    handleDeleteQuestion,
    handleReorderQuestions,
    handleQuestionUpdate,
    handleComponentUpdate,
    handleDeleteComponent,
    saveToFirebase,
    saveFormDetails,
    isSaving,
    loadFormData,

    // ---toolbar----
    handleDoubleClick,
    editingComponent,
    showLineEditor,
    showCheckboxEditor,
    showTrueFalseEditor,
    showSingleChoiceEditor,
    showMultiChoiceEditor,
    showShortTextEditor,
    showToggleBoxEditor,
    showTextEditor,
    showRankingEditor,
    showDiscreteSliderEditor,
    showNumericSliderEditor,
    showMatchingPairsEditor,
  };
};

export default useFormState;
