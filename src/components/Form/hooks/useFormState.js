import { useState, useEffect } from 'react';
import { doc, collection, setDoc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const useFormState = (formId) => {
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [showFormInfo, setShowFormInfo] = useState(false);

  //loaded tha form data
  useEffect(() => {
    if (!formId) return;
    loadFormData();
  }, [formId]);

  const loadFormData = async () => {
    try {
      const formDocRef = doc(db, "forms", formId);
      const formSnap = await getDoc(formDocRef);
      
      if (formSnap.exists()) {
        const data = formSnap.data();
        setFormTitle(data.formTitle || "");
        setFormDescription(data.formDescription || "");
        setFormImage(data.formImage || null);
      }

      const questionsCollRef = collection(formDocRef, "questions");
      const questionsSnap = await getDocs(questionsCollRef);

      if (!questionsSnap.empty) {
        const loadedQuestions = questionsSnap.docs.map(doc => ({
          id: parseInt(doc.id),
          ...doc.data()
        }));
        setQuestions(loadedQuestions);
        setActiveQuestionId(loadedQuestions[0].id);
      } else {
        setQuestions([{ id: 1, components: [] }]);
        setActiveQuestionId(1);
      }
    } catch (error) {
      console.error("Error loading form:", error);
      setQuestions([{ id: 1, components: [] }]);
      setActiveQuestionId(1);
    }
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(prev => {
      const filtered = prev.filter(q => q.id !== questionId);
      if (filtered.length === 0) {
        filtered.push({ id: 1, components: [] });
      }
      if (activeQuestionId === questionId) {
        setActiveQuestionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleReorderQuestions = (reorderedQuestions) => {
    setQuestions(reorderedQuestions);
  };

  const handleAddQuestion = () => {
    const newId = Math.max(0, ...questions.map(q => q.id)) + 1;
    setQuestions(prev => [...prev, { id: newId, components: [] }]);
    setActiveQuestionId(newId);
  };

  const saveToFirebase = async () => {
    try {
      if (!formId) {
        alert("No formId found!");
        return;
      }

      const formDocRef = doc(db, "forms", formId);
      
      await setDoc(formDocRef, {
        formTitle,
        formDescription,
        formImage
      }, { merge: true });

      for (const question of questions) {
        const questionDocRef = doc(collection(formDocRef, "questions"), question.id.toString());
        await setDoc(questionDocRef, question);
      }

      alert("Form saved successfully!");
    } catch (error) {
      console.error("Error saving form:", error);
      alert("Error saving form: " + error.message);
    }
  };

  return {
    formTitle,
    setFormTitle,
    formDescription,
    setFormDescription,
    formImage,
    setFormImage,
    questions,
    setQuestions,
    activeQuestionId,
    setActiveQuestionId,
    showFormInfo,
    setShowFormInfo,
    handleDeleteQuestion,
    handleReorderQuestions,
    handleAddQuestion,
    saveToFirebase
  };
};