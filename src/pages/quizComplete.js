import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const QuizComplete = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [showAnswers, setShowAnswer] = useState(false);
  useEffect(() => {
    const handleGetSession = async () => {
      const sessionRef = doc(db, "sessions", sessionId);
      const sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) {
        throw new Error("Session not found");
      }
      const sessionData = sessionSnap.data();

      setShowAnswer(sessionData.enableShowAnswers || false);
    };
    handleGetSession();
    const timer = setTimeout(() => {
      if (sessionId) {
        if (showAnswers) {
          navigate(`/quiz/${sessionId}/correctAnswer`);
        } else {
          sessionStorage.removeItem(`formAccess_${sessionId}`);
          sessionStorage.removeItem(`respondentId_${sessionId}`);
          sessionStorage.removeItem(`formId_${sessionId}`);
          navigate("/");
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, sessionId, showAnswers]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-auto space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Quiz Completed Successfully!
        </h1>

        <p className="text-gray-600">
          Thank you for participating. Your responses have been recorded.
        </p>

        <div className="animate-pulse text-sm text-gray-500">
          {showAnswers
            ? "Redirecting to show answer in a few seconds..."
            : "Redirecting to home in a few seconds..."}
        </div>
      </div>
    </div>
  );
};

export default QuizComplete;
