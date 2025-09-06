// src/pages/Sessions.js
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, storage } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  where,
  deleteField,
  writeBatch,
} from "firebase/firestore";
import {
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  Check,
  ArrowLeft,
  ChartBar,
  Calendar,
  Clock,
  Users,
  Eye,
  Link as LinkIcon,
  Award,
  RefreshCw,
  Layers,
  Settings,
  QrCode,
} from "lucide-react";
import { useToast } from "../components/Toast";
import QRCode from "react-qr-code";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

// SessionCard component remains unchanged
const SessionCard = ({
  session,
  isActive,
  onClick,
  onDelete,
  responseCount,
}) => {
  const deadlineText = session.deadline
    ? new Date(session.deadline.toDate()).toLocaleString()
    : "No deadline";

  const dateCreated = new Date(session.createdAt.toDate());
  const formattedDate = dateCreated.toLocaleDateString();
  const formattedTime = dateCreated.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`p-6 rounded-lg border shadow-sm transition-all duration-300 cursor-pointer ${
        isActive
          ? "border-blue-500 bg-blue-50 scale-102 shadow-md"
          : "border-gray-200 hover:border-blue-300 hover:shadow bg-white"
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="w-full">
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Calendar size={14} className="mr-1" />
            <span>{formattedDate}</span>
            <Clock size={14} className="ml-3 mr-1" />
            <span>{formattedTime}</span>
          </div>

          <div className="flex justify-between items-center mb-3">
            <h3 className="text-gray-800 font-medium truncate">
              Session ID: {session.sessionId.split("-").pop()}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.sessionId);
              }}
              className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
              aria-label="Delete session"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="space-y-2 mt-3">
            <div className="flex items-center text-xs text-gray-600">
              <Award size={14} className="mr-2" />
              <span>Leaderboard:</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  session.leaderboardEnabled
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {session.leaderboardEnabled ? "On" : "Off"}
              </span>
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <Award size={14} className="mr-2" />
              <span>Show Answers:</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  session.enableShowAnswers
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {session.enableShowAnswers ? "On" : "Off"}
              </span>
            </div>
            <div className="flex items-center text-xs text-gray-600">
              <Award size={14} className="mr-2" />
              <span>Quiz Award:</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  session.enablePriceAward
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {session.enablePriceAward ? "On" : "Off"}
              </span>
            </div>
            {session.deadline && (
              <div className="flex items-center text-xs text-gray-600">
                <Clock size={14} className="mr-2" />
                <span>Deadline: {deadlineText}</span>
              </div>
            )}

            <div className="flex items-center text-xs text-gray-600">
              <Eye size={14} className="mr-2" />
              <span>Component Hints:</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  session.showComponentHints
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {session.showComponentHints ? "On" : "Off"}
              </span>
            </div>

            <div className="flex items-center text-xs text-gray-600">
              <Layers size={14} className="mr-2" />
              <span>Sequential Mode:</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  session.sequentialQuestionMode
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {session.sequentialQuestionMode ? "On" : "Off"}
              </span>
            </div>

            <div className="flex items-center text-xs text-gray-600">
              <Users size={14} className="mr-2" />
              <span>Responses:</span>
              <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                {responseCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Sessions = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deadlineInput, setDeadlineInput] = useState("");
  const [responseCounts, setResponseCounts] = useState({});
  const [priceData, setPriceData] = useState({
    image: null,
    message: "",
    minPoints: "",
    awardees: "",
  });

  useEffect(() => {
    const loadSessions = async () => {
      if (!formId) {
        console.log("No formId provided");
        return;
      }
      try {
        setLoading(true);
        const sessionsRef = collection(db, "sessions");
        // Use a query to filter sessions by formId
        const q = query(sessionsRef, where("formId", "==", formId));
        const querySnapshot = await getDocs(q);
        const loadedSessions = querySnapshot.docs
          .map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }))
          .sort(
            (a, b) =>
              b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
          );
        setSessions(loadedSessions);
        if (loadedSessions.length > 0) {
          console.log(loadedSessions, "loadedSessions");

          setActiveSession(loadedSessions[0]);
          setPriceData(loadedSessions?.[0]?.awardDetails);
          if (loadedSessions[0].deadline) {
            const isoStr = new Date(
              loadedSessions[0].deadline.toDate()
            ).toISOString();
            setDeadlineInput(isoStr.slice(0, 16));
          } else {
            setDeadlineInput("");
          }
        }
      } catch (error) {
        console.error("Error loading sessions:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSessions();
  }, [formId]);

  useEffect(() => {
    const responsesRef = collection(db, "sessions");
    const q = query(responsesRef, where("formId", "==", formId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.sessionId) {
          setActiveSession(data);
          setPriceData(data?.awardDetails);
        }
      });
    });
    return unsubscribe;
  }, [formId]);

  useEffect(() => {
    const responsesRef = collection(db, "responses");
    const q = query(responsesRef, where("formId", "==", formId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.sessionId) {
          counts[data.sessionId] = (counts[data.sessionId] || 0) + 1;
        }
      });
      setResponseCounts(counts);
    });
    return unsubscribe;
  }, [formId]);
  const createSession = async () => {
    try {
      // Optimized session counting - only query sessions for this specific formId
      const sessionsQuery = query(
        collection(db, "sessions"),
        where("formId", "==", formId)
      );
      const querySnapshot = await getDocs(sessionsQuery);
      const currentSessionsCount = querySnapshot.size;

      const SESSION_LIMIT = 5; // Set the session limit to 5
      if (currentSessionsCount >= SESSION_LIMIT) {
        addToast(
          `Maximum of ${SESSION_LIMIT} sessions reached for this form!`,
          "warning"
        );
        return;
      }

      const uniqueSessionId = `${formId}-${Date.now()}`;
      const sessionDocRef = doc(db, "sessions", uniqueSessionId);
      
      // Fetch form data and questions in parallel for better performance
      const [formSnap, questionsSnap] = await Promise.all([
        getDoc(doc(db, "forms", formId)),
        getDocs(collection(db, "forms", formId, "questions"))
      ]);
      
      if (!formSnap.exists()) throw new Error("Form not found");
      const formDataSnapshot = formSnap.data();

      let loadedQuestions = [];
      if (!questionsSnap.empty) {
        loadedQuestions = questionsSnap.docs
          .map((docSnap) => ({
            id: parseInt(docSnap.id, 10),
            ...docSnap.data(),
          }))
          .sort((a, b) => a.id - b.id);
      }
      formDataSnapshot.questions = loadedQuestions;

      const sessionData = {
        formId,
        sessionId: uniqueSessionId,
        sessionLink: `/quiz/${uniqueSessionId}`,
        createdAt: Timestamp.now(),
        leaderboardEnabled: false,
        deadline: null,
        showComponentHints: false,
        sequentialQuestionMode: true, // Default to sequential mode
        formSnapshot: formDataSnapshot,
        enableShowAnswers: false,
        enablePriceAward: false,
      };
      
      // Use batch write for better performance
      const batch = writeBatch(db);
      batch.set(sessionDocRef, sessionData);
      await batch.commit();
      
      setSessions((prev) => [{ ...sessionData, id: uniqueSessionId }, ...prev]);
      setActiveSession({ ...sessionData, id: uniqueSessionId });
      setDeadlineInput("");
      addToast("Session created successfully", "success");
    } catch (error) {
      console.error("Error creating session:", error);
      addToast("Failed to create session", "error");
    }
  };

  const handleUpdateSessionSnapshot = async () => {
    if (!activeSession) return;
    try {
      const formDocRef = doc(db, "forms", activeSession.formId);
      const formSnap = await getDoc(formDocRef);
      if (!formSnap.exists()) throw new Error("Form not found");
      const formDataSnapshot = formSnap.data();

      const questionsSnap = await getDocs(
        collection(db, "forms", activeSession.formId, "questions")
      );
      let loadedQuestions = [];
      if (!questionsSnap.empty) {
        loadedQuestions = questionsSnap.docs
          .map((docSnap) => ({
            id: parseInt(docSnap.id, 10),
            ...docSnap.data(),
          }))
          .sort((a, b) => a.id - b.id);
      }
      formDataSnapshot.questions = loadedQuestions;

      const sessionDocRef = doc(db, "sessions", activeSession.sessionId);
      await updateDoc(sessionDocRef, { formSnapshot: formDataSnapshot });
      setActiveSession((prev) => ({ ...prev, formSnapshot: formDataSnapshot }));
      addToast("Session updated with latest form changes", "success");
    } catch (error) {
      console.error("Error updating session snapshot:", error);
      addToast("Failed to update session snapshot", "error");
    }
  };

  const handleSequentialModeToggle = async () => {
    if (!activeSession) return;
    try {
      const sessionDocRef = doc(db, "sessions", activeSession.sessionId);
      const newValue = !activeSession.sequentialQuestionMode;
      await updateDoc(sessionDocRef, { sequentialQuestionMode: newValue });
      setActiveSession((prev) => ({
        ...prev,
        sequentialQuestionMode: newValue,
      }));
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === activeSession.sessionId
            ? { ...s, sequentialQuestionMode: newValue }
            : s
        )
      );
      addToast(
        `Question mode set to ${newValue ? "sequential" : "continuous"}`,
        "success"
      );
    } catch (error) {
      console.error("Error toggling sequential mode:", error);
      addToast("Failed to update question mode setting", "error");
    }
  };
  const handleEnableShowAnswers = async () => {
    if (!activeSession) return;
    try {
      const sessionDocRef = doc(db, "sessions", activeSession.sessionId);
      const newValue = !activeSession.enableShowAnswers;
      await updateDoc(sessionDocRef, { enableShowAnswers: newValue });
      setActiveSession((prev) => ({
        ...prev,
        enableShowAnswers: newValue,
      }));
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === activeSession.sessionId
            ? { ...s, enableShowAnswers: newValue }
            : s
        )
      );
      addToast(`Show Answers ${newValue ? "enabled" : "disabled"}`, "success");
    } catch (error) {
      console.error("Error toggling sequential mode:", error);
      addToast("Failed to update question mode setting", "error");
    }
  };
  const handleEnablePrceAward = async () => {
    if (!activeSession) return;

    try {
      const sessionDocRef = doc(db, "sessions", activeSession.sessionId);
      const newValue = !activeSession.enablePriceAward;

      // Prepare the update data
      const updateData = {
        enablePriceAward: newValue,
      };

      // If disabling, delete awardDetails (and image if present)
      if (!newValue && activeSession.awardDetails?.image) {
        try {
          const oldImageUrl = activeSession.awardDetails.image;
          const oldImageRef = ref(storage, oldImageUrl);
          await deleteObject(oldImageRef);
        } catch (err) {
          console.warn("Failed to delete old image from storage:", err);
        }

        updateData.awardDetails = deleteField();
      }

      // Update Firestore
      await updateDoc(sessionDocRef, updateData);

      // Update local active session
      setActiveSession((prev) => {
        const updated = {
          ...prev,
          enablePriceAward: newValue,
        };
        if (!newValue) {
          delete updated.awardDetails;
        }
        return updated;
      });

      // Update sessions list
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === activeSession.sessionId
            ? {
                ...s,
                enablePriceAward: newValue,
                ...(newValue ? {} : { awardDetails: undefined }),
              }
            : s
        )
      );

      console.log(newValue, "checking New value");
      addToast(`Price award ${newValue ? "enabled" : "disabled"}`, "success");
    } catch (error) {
      console.error("Error toggling price award mode:", error);
      addToast("Failed to update price award setting", "error");
    }
  };
  const deleteSession = async (sessionId) => {
    try {
      await deleteDoc(doc(db, "sessions", sessionId));
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      if (activeSession?.sessionId === sessionId) {
        setActiveSession(sessions[0] || null);
      }
      addToast("Session deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting session:", error);
      addToast("Failed to delete session", "error");
    }
  };

  const copyLink = async () => {
    if (!activeSession) return;
    const fullUrl = `${window.location.origin}/quiz/${activeSession.sessionId}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const goToQuiz = () => {
    if (!activeSession) return;
    navigate(`/quiz/${activeSession.sessionId}`);
  };

  const goToResults = () => {
    if (!activeSession) return;
    navigate(`/results/${formId}`);
  };

  const goBackToCreation = () => {
    navigate(`/forms/${formId}`);
  };

  const handleLeaderboardToggle = async () => {
    if (!activeSession) return;
    try {
      const sessionDocRef = doc(db, "sessions", activeSession.sessionId);
      const newValue = !activeSession.leaderboardEnabled;
      await updateDoc(sessionDocRef, { leaderboardEnabled: newValue });
      setActiveSession((prev) => ({ ...prev, leaderboardEnabled: newValue }));
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === activeSession.sessionId
            ? { ...s, leaderboardEnabled: newValue }
            : s
        )
      );
      addToast(`Leaderboard ${newValue ? "enabled" : "disabled"}`, "success");
    } catch (error) {
      console.error("Error toggling leaderboard:", error);
      addToast("Failed to update leaderboard setting", "error");
    }
  };

  const handleComponentHintsToggle = async () => {
    if (!activeSession) return;
    try {
      const sessionDocRef = doc(db, "sessions", activeSession.sessionId);
      const newValue = !activeSession.showComponentHints;
      await updateDoc(sessionDocRef, { showComponentHints: newValue });
      setActiveSession((prev) => ({ ...prev, showComponentHints: newValue }));
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === activeSession.sessionId
            ? { ...s, showComponentHints: newValue }
            : s
        )
      );
      addToast(
        `Component hints ${newValue ? "enabled" : "disabled"}`,
        "success"
      );
    } catch (error) {
      console.error("Error toggling component hints:", error);
      addToast("Failed to update component hints setting", "error");
    }
  };

  const handleDeadlineChange = (e) => {
    setDeadlineInput(e.target.value);
  };

  const updateDeadline = async () => {
    if (!activeSession) return;
    try {
      const sessionDocRef = doc(db, "sessions", activeSession.sessionId);
      let deadlineTimestamp = null;
      if (deadlineInput) {
        deadlineTimestamp = Timestamp.fromDate(new Date(deadlineInput));
      }
      await updateDoc(sessionDocRef, { deadline: deadlineTimestamp });
      setActiveSession((prev) => ({ ...prev, deadline: deadlineTimestamp }));
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === activeSession.sessionId
            ? { ...s, deadline: deadlineTimestamp }
            : s
        )
      );
      addToast("Deadline updated successfully", "success");
    } catch (error) {
      console.error("Error updating deadline:", error);
      addToast("Failed to update deadline", "error");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPriceData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const uploadImageToStorage = useCallback(async (file) => {
    try {
      const fileRef = ref(storage, `form-images/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }, []);

  const handleSavePriceAward = async () => {
    if (!activeSession.sessionId || !priceData) return;

    // TODO: Ye Code is liye likha he keun ke activeSession or priceData realtime update nahi horahe hain
    const sessionDocRef = doc(db, "sessions", activeSession.sessionId);
    const sessionSnap = await getDoc(sessionDocRef);
    const sessionData = sessionSnap.data()?.awardDetails || {};
    try {
      // let imageUrl = "";
      const updateBody = {};

      if (priceData.image instanceof File) {
        if (sessionData?.image) {
          const oldImageRef = ref(storage, sessionData?.image);
          await deleteObject(oldImageRef).catch((err) =>
            console.warn("Failed to delete old image:", err)
          );
        }
        updateBody[`awardDetails.image`] = await uploadImageToStorage(
          priceData.image
        );
      } else if (
        typeof priceData.image === "string" &&
        sessionData.image !== priceData.image
      ) {
        // Already a URL (e.g., user did not change it)
        // imageUrl = priceData.image;
        updateBody[`awardDetails.image`] = priceData.image;
      }

      if (priceData.awardees !== sessionData.awardees) {
        updateBody[`awardDetails.awardees`] = priceData.awardees;
      }

      if (priceData.message !== sessionData.message) {
        updateBody[`awardDetails.message`] = priceData.message;
      }

      if (priceData.minPoints !== sessionData.minPoints) {
        updateBody[`awardDetails.minPoints`] = priceData.minPoints;
      }

      if (Object.keys(updateBody).length === 0) {
        addToast("No changes detected.", "info");
        return;
      }

      const sessionDocRef = doc(db, "sessions", activeSession.sessionId);
      await updateDoc(sessionDocRef, updateBody);

      addToast("Award details saved successfully", "success");
    } catch (error) {
      console.error("Error saving award details:", error);
      addToast("Award details failed to save", "error");
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between mb-8">
          <button
            onClick={goBackToCreation}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white rounded-lg shadow-sm hover:shadow hover:bg-gray-50 transition-all duration-300"
          >
            <ArrowLeft size={18} />
            <span>Back to Creation</span>
          </button>

          <button
            onClick={goToResults}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 transform"
          >
            <ChartBar size={18} />
            <span>View Results</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Session Management
              </h1>
              <div className="flex items-center">
                <p className="text-gray-600">Form ID: </p>
                <span className="ml-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-mono">
                  {formId}
                </span>
              </div>
            </div>

            <button
              onClick={createSession}
              className="flex items-center gap-2 px-5 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm hover:shadow transition-all duration-300"
            >
              <Plus size={20} />
              <span>Create New Session</span>
            </button>
          </div>

          {activeSession ? (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              {/* Active Session Header */}
              <div className="mb-5 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <h2 className="font-medium text-gray-800">
                      Active Session
                    </h2>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar size={14} className="mr-1" />
                    <span>
                      {new Date(
                        activeSession.createdAt.toDate()
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center mt-1">
                  <LinkIcon size={14} className="mr-1 text-gray-500" />
                  <p className="text-sm font-mono text-gray-700">
                    {activeSession.sessionId}
                  </p>
                </div>
              </div>

              {/* Cards Section - Fixed spacing */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Share Quiz Card - 7 columns */}
                <div className="md:col-span-7">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <LinkIcon size={16} className="mr-2" />
                      <span>Share Your Quiz</span>
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={copyLink}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-all"
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        <span>{copied ? "Copied!" : "Copy Link"}</span>
                      </button>
                      <button
                        onClick={goToQuiz}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                      >
                        <ExternalLink size={18} />
                        <span>Go to Quiz</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Share the quiz with others or go directly to the quiz
                    </p>
                  </div>
                </div>

                {/* Update Session Card - 5 columns */}
                <div className="md:col-span-5">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 h-full flex flex-col">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <RefreshCw size={16} className="mr-2" />
                      <span>Update Session</span>
                    </h3>
                    <button
                      onClick={handleUpdateSessionSnapshot}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
                    >
                      <RefreshCw size={18} />
                      <span>Update with Latest Changes</span>
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Sync session with any form modifications
                    </p>
                  </div>
                </div>

                {/* QR Code Card - Full width of its own row */}
                <div className="md:col-span-12">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <QrCode size={16} className="mr-2" />
                      <span>Quick Access QR Code</span>
                    </h3>
                    <div className="flex flex-col items-center">
                      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
                        <QRCode
                          value={`${window.location.origin}/quiz/${activeSession.sessionId}`}
                          size={128}
                          style={{ height: "auto", maxWidth: "128px" }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Scan this QR code to access the quiz directly on your
                        device.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Settings */}
              <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                  <Settings size={16} className="mr-2" />
                  <span>Session Settings</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Leaderboard Toggle */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 flex items-center">
                        <Award size={16} className="mr-2" />
                        <span>Leaderboard</span>
                      </label>
                      <button
                        onClick={handleLeaderboardToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          activeSession.leaderboardEnabled
                            ? "bg-indigo-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            activeSession.leaderboardEnabled
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Ranking of participants will be displayed
                    </p>
                  </div>

                  {/* Component Hints Toggle */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 flex items-center">
                        <Eye size={16} className="mr-2" />
                        <span>Component Hints</span>
                      </label>
                      <button
                        onClick={handleComponentHintsToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          activeSession.showComponentHints
                            ? "bg-indigo-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            activeSession.showComponentHints
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Hints about required components are visible
                    </p>
                  </div>

                  {/* Sequential Mode Toggle */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 flex items-center">
                        <Layers size={16} className="mr-2" />
                        <span>Sequential Mode</span>
                      </label>
                      <button
                        onClick={handleSequentialModeToggle}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          activeSession.sequentialQuestionMode
                            ? "bg-indigo-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            activeSession.sequentialQuestionMode
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Questions appear one at a time
                    </p>
                  </div>
                  {/* See Answer Mode Toggle */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 flex items-center">
                        <Layers size={16} className="mr-2" />
                        <span>see the correct answers</span>
                      </label>
                      <button
                        onClick={handleEnableShowAnswers}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          activeSession?.enableShowAnswers
                            ? "bg-indigo-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            activeSession?.enableShowAnswers
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Questions appear one at a time
                    </p>
                  </div>
                  {/* Set price Toggle */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 flex items-center">
                        <Layers size={16} className="mr-2" />
                        <span>Set a price</span>
                      </label>
                      <button
                        onClick={handleEnablePrceAward}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          activeSession?.enablePriceAward
                            ? "bg-indigo-500"
                            : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                            activeSession?.enablePriceAward
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Send prizes who achieve points
                    </p>
                  </div>

                  {/* Deadline setting */}
                  {activeSession.enablePriceAward && (
                    <div className="bg-blue-50 md:col-span-3 p-6 rounded-lg  shadow">
                      <h2 className="text-lg font-semibold mb-4">
                        Set a price details
                      </h2>

                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Upload Section */}
                        <label
                          htmlFor="imageUpload"
                          className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-lg p-6 w-full md:w-1/3 text-center bg-white hover:bg-blue-100 transition"
                        >
                          {priceData?.image ? (
                            <img
                              src={
                                typeof priceData.image === "string"
                                  ? priceData.image
                                  : URL.createObjectURL(priceData.image)
                              }
                              alt="Preview"
                              className=" w-full h-fit object-cover rounded mb-2"
                            />
                          ) : (
                            <>
                              <div className="text-blue-500 text-4xl mb-2">
                                📷
                              </div>
                              <p className="font-medium">Upload a picture</p>
                              <p className="text-sm text-gray-500">
                                This will appear on award email
                              </p>
                            </>
                          )}
                          <input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                        {/* Email Message */}
                        <textarea
                          placeholder="Write an email message"
                          value={priceData?.message}
                          onChange={(e) =>
                            setPriceData((prev) => ({
                              ...prev,
                              message: e.target.value,
                            }))
                          }
                          className="w-full md:w-2/3 min-h-[150px] p-4 border border-gray-300 rounded-lg resize-none outline-blue-400 bg-white"
                        />
                      </div>

                      {/* Input Fields */}
                      <div className="flex flex-col md:flex-row gap-4 mt-6">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Set min points
                          </label>
                          <input
                            type="number"
                            placeholder="e.g 20"
                            value={priceData?.minPoints}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-blue-400 bg-white"
                            onChange={(e) =>
                              setPriceData((prev) => ({
                                ...prev,
                                minPoints: e.target.value,
                              }))
                            }
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Min points required to get a prize
                          </p>
                        </div>

                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Number of awardees{" "}
                            <span className="text-gray-400 text-xs">
                              (Optional)
                            </span>
                          </label>
                          <input
                            type="number"
                            placeholder="e.g 05"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-blue-400 bg-white"
                            value={priceData?.awardees}
                            onChange={(e) =>
                              setPriceData((prev) => ({
                                ...prev,
                                awardees: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <button
                        className="float-end px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors mt-6"
                        onClick={handleSavePriceAward}
                      >
                        Save
                      </button>
                    </div>
                  )}
                  <div className="md:col-span-3 bg-blue-50 rounded-lg p-4  ">
                    <label className="text-sm text-gray-700 flex items-center mb-2">
                      <Clock size={16} className="mr-2" />
                      <span>Set Deadline</span>
                    </label>
                    <div className="flex items-start gap-3">
                      <input
                        type="datetime-local"
                        value={deadlineInput}
                        onChange={handleDeadlineChange}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={updateDeadline}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                      >
                        Update
                      </button>
                    </div>
                    {activeSession.deadline && (
                      <p className="text-xs text-gray-600 mt-2 flex items-center">
                        <Calendar size={14} className="mr-1" />
                        <span>
                          Current Deadline:{" "}
                          {new Date(
                            activeSession.deadline.toDate()
                          ).toLocaleString()}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No active session selected</p>
              <p className="text-sm text-gray-400 mt-2">
                Create a new session or select one from below
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-6">
            <Users size={20} className="mr-2" />
            <span>All Sessions ({sessions.length})</span>
          </h2>

          {sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session) => (
                <SessionCard
                  key={session.sessionId}
                  session={session}
                  isActive={activeSession?.sessionId === session.sessionId}
                  onClick={() => setActiveSession(session)}
                  onDelete={deleteSession}
                  responseCount={responseCounts[session.sessionId] || 0}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Plus size={24} className="text-blue-500" />
              </div>
              <p className="text-gray-500">No sessions created yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Create your first session using the button above
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sessions;
