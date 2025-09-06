import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  OAuthProvider,
  signInAnonymously,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { createOrUpdateUser } from "../services/userService";
import { User, Mail, Key, ArrowRight, UserCircle2 } from "lucide-react";

const FormEntrance = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [formId, setFormId] = useState(null);
  const [activeTab, setActiveTab] = useState("new");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rejoinCode, setRejoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCopyPrompt, setShowCopyPrompt] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [activeSession, setActiveSession] = useState();
  // Fetch formId from sessionId on component mount
  useEffect(() => {
    const fetchFormId = async () => {
      console.log(sessionId, "sessionId");
      if (!sessionId) {
        setError("No session ID provided");
        setLoading(false);
        return;
      }

      try {
        const sessionRef = doc(db, "sessions", sessionId);
        const sessionSnap = await getDoc(sessionRef);

        if (!sessionSnap.exists()) {
          setError("Session not found");
          return;
        }

        const sessionData = sessionSnap.data();
        if (!sessionData.formId) {
          setError("Invalid session data");
          return;
        }
        console.log(sessionData, "sessionData");
        setFormId(sessionData.formId);
        setActiveSession(sessionData);
        // Check if user already has access
        const existingAccess = sessionStorage.getItem(
          `formAccess_${sessionId}`
        );
        if (existingAccess) {
          navigate(`/quiz/${sessionId}`);
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("Error loading session");
      } finally {
        setLoading(false);
      }
    };

    fetchFormId();

    // Listen for auth state changes (optional, for debugging)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User authenticated:", user.uid);
      }
    });

    return () => unsubscribe();
  }, [sessionId, navigate]);

  // Navigate after showing copy prompt
  useEffect(() => {
    if (showCopyPrompt && generatedCode) {
      const timer = setTimeout(() => {
        if (document.activeElement.tagName !== "BUTTON") {
          navigate(`/quiz/${sessionId}`);
        }
      }, 5000); // Give user 5 seconds to copy manually
      return () => clearTimeout(timer);
    }
  }, [showCopyPrompt, generatedCode, sessionId, navigate]);

  const generateRejoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const validateInputs = async () => {
    if (!formId) throw new Error("Session not properly loaded");
    if (!name.trim() || !email.trim()) {
      throw new Error("Please fill in all fields");
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error("Please enter a valid email address");
    }

    // Check if name/email combination already exists for this form
    // const respondentsRef = collection(db, "forms", formId, "respondents");
    const respondentsRef = collection(db, "respondents");
    const q = query(
      respondentsRef,
      where("formId", "==", formId),
      where("email", "==", email.toLowerCase()),
      where("name", "==", name.trim())
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error(
        "This name and email combination is already in use for this form"
      );
    }
  };

  // const handleGuestSignIn = async (e) => {
  //   e.preventDefault();
  //   if (loading || !formId) return;
  //   setLoading(true);
  //   setError("");

  //   try {
  //     await validateInputs();
  //     const newRejoinCode = generateRejoinCode();

  //     const respondentId = `${Date.now()}-${Math.random()
  //       .toString(36)
  //       .substr(2, 9)}`;
  //     const respondentRef = doc(db, "respondents", respondentId);

  //     const respondentData = {
  //       name: name.trim(),
  //       email: email.toLowerCase(),
  //       rejoinCode: newRejoinCode,
  //       createdAt: new Date(),
  //       type: "guest",
  //       sessionId: sessionId,
  //       formId: formId,
  //       status: "active",
  //     };

  //     await setDoc(respondentRef, respondentData);

  //     sessionStorage.setItem(`formAccess_${sessionId}`, newRejoinCode);
  //     sessionStorage.setItem(`respondentId_${sessionId}`, respondentId);
  //     sessionStorage.setItem(`formId_${sessionId}`, formId);

  //     setGeneratedCode(newRejoinCode);
  //     setShowCopyPrompt(true);
  //     setLoading(false);
  //   } catch (err) {
  //     console.error("Guest Sign In Error:", err);
  //     setError(err.message);
  //     setLoading(false);
  //   }
  // };

  const handleGuestSignIn = async (e) => {
    e.preventDefault();
    if (loading || !formId) return;
    setLoading(true);
    setError("");

    try {
      // 🔑 Sign in anonymously
      await signInAnonymously(auth);
      // const user = userCredential.user;
      // console.log(user.uid, 'Anonymous user signed in');
      await validateInputs();

      // return false

      const newRejoinCode = generateRejoinCode();

      // Use Firebase UID as respondentId
      // const respondentId = user.uid;
      const respondentId = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const respondentRef = doc(db, "respondents", respondentId);

      const respondentData = {
        // uid: respondentId,
        name: name.trim(),
        email: email.toLowerCase(),
        rejoinCode: newRejoinCode,
        createdAt: new Date(),
        type: "guest",
        sessionId,
        formId,
        status: "active",
      };

      // Create/Update Firestore doc
      await setDoc(respondentRef, respondentData, { merge: true });

      // Store locally for rejoin
      sessionStorage.setItem(`formAccess_${sessionId}`, newRejoinCode);
      sessionStorage.setItem(`respondentId_${sessionId}`, respondentId);
      sessionStorage.setItem(`formId_${sessionId}`, formId);

      setGeneratedCode(newRejoinCode);
      setShowCopyPrompt(true);
      setLoading(false);
    } catch (err) {
      console.error("Guest Sign In Error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const copyCodeToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      navigate(`/quiz/${sessionId}`);
    } catch (err) {
      console.error("Copy Error:", err);
      setError(
        "Failed to copy code. Please make note of your rejoin code: " +
        generatedCode
      );
      setTimeout(() => navigate(`/quiz/${sessionId}`), 3000);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading || !formId) return;
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const newRejoinCode = generateRejoinCode();

      await createOrUpdateUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        provider: "google",
      });

      const respondentId = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const respondentRef = doc(db, "respondents", respondentId);

      await setDoc(respondentRef, {
        name: result.user.displayName || "Google User",
        email: result.user.email.toLowerCase(),
        userId: result.user.uid,
        rejoinCode: newRejoinCode,
        createdAt: new Date(),
        type: "google",
        sessionId: sessionId,
        formId: formId,
        status: "active",
      });

      sessionStorage.setItem(`formAccess_${sessionId}`, newRejoinCode);
      sessionStorage.setItem(`respondentId_${sessionId}`, respondentId);
      sessionStorage.setItem(`formId_${sessionId}`, formId);

      setGeneratedCode(newRejoinCode);
      setShowCopyPrompt(true);
      setLoading(false);
    } catch (err) {
      console.error("Google Sign In Error:", err);
      setError("An error occurred during sign in. Please try again.");
      setLoading(false);
    }
  };

  const handleRejoinSubmit = async (e) => {
    e.preventDefault();
    if (loading || !formId) return;
    setLoading(true);
    setError("");

    try {
      const respondentsRef = collection(db, "respondents");
      const q = query(
        respondentsRef,
        where("rejoinCode", "==", rejoinCode.toUpperCase()),
        where("sessionId", "==", sessionId)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error("Invalid rejoin code for this session");
      }

      const respondentDoc = snapshot.docs[0];
      sessionStorage.setItem(
        `formAccess_${sessionId}`,
        rejoinCode.toUpperCase()
      );
      sessionStorage.setItem(`respondentId_${sessionId}`, respondentDoc.id);
      sessionStorage.setItem(`formId_${sessionId}`, formId);

      navigate(`/quiz/${sessionId}`);
    } catch (err) {
      console.error("Rejoin Error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    if (loading || !formId) return;
    setLoading(true);

    try {
      const provider = new OAuthProvider("microsoft.com");
      provider.setCustomParameters({
        prompt: "consent",
      });

      const result = await signInWithPopup(auth, provider);
      console.log("Logged in:", result);

      // Check if user exists with different provider
      // const methods = await fetchSignInMethodsForEmail(auth, result.user.email);
      // console.log(methods, "methods");
      // if (methods.length > 0 && !methods.includes("microsoft.com")) {
      //   // eslint-disable-next-line no-throw-literal
      //   throw {
      //     code: "auth/provider-conflict",
      //     message: `This email is already registered with ${methods[0]}. Please sign in with that method.`,
      //     existingProvider: methods[0],
      //   };
      // }

      const newRejoinCode = generateRejoinCode();

      await createOrUpdateUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        provider: "microsoft", // Changed from "google" to "microsoft"
      });

      const respondentId = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const respondentRef = doc(db, "respondents", respondentId);

      await setDoc(respondentRef, {
        name: result.user.displayName || "Microsoft User",
        email: result.user.email.toLowerCase(),
        userId: result.user.uid,
        rejoinCode: newRejoinCode,
        createdAt: new Date(),
        type: "microsoft",
        sessionId: sessionId,
        formId: formId,
        status: "active",
      });

      sessionStorage.setItem(`formAccess_${sessionId}`, newRejoinCode);
      sessionStorage.setItem(`respondentId_${sessionId}`, respondentId);
      sessionStorage.setItem(`formId_${sessionId}`, formId);

      setGeneratedCode(newRejoinCode);
      setShowCopyPrompt(true);
      setLoading(false);
    } catch (error) {
      console.error("Microsoft login error", error);
      setLoading(false);

      if (error.code === "auth/account-exists-with-different-credential") {
        setError(`This email is already registered.`);
      } else if (error.code === "auth/provider-conflict") {
        setError(error.message);
      } else {
        setError("An error occurred during sign in. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <UserCircle2 className="mx-auto h-20 w-20 text-blue-600" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to the Form
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let's get you started
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === "new"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
            onClick={() => setActiveTab("new")}
          >
            New Entry
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
              activeTab === "rejoin"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
            onClick={() => setActiveTab("rejoin")}
          >
            Rejoin
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {showCopyPrompt ? (
          <div className="bg-white p-8 rounded-xl shadow-lg text-center space-y-6">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Key className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Save Your Rejoin Code
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                You'll need this code to return to your form later
              </p>
            </div>
            <div className="bg-gray-50 py-3 px-4 rounded-lg text-2xl font-mono font-bold text-blue-600 tracking-wider">
              {generatedCode}
            </div>
            <button
              onClick={copyCodeToClipboard}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Copy Code & Continue
            </button>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            {activeTab === "new" ? (
              <>
                <form onSubmit={handleGuestSignIn} className="space-y-6">
                  {!activeSession?.enablePriceAward && (
                    <>
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Full Name
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="name"
                            type="text"
                            required
                            className="pl-10 appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="email"
                            type="email"
                            required
                            className="pl-10 appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        Continue as Guest
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">
                            Or continue with
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleMicrosoftLogin}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <img
                      className="h-5 w-5 mr-2"
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Microsoft_icon.svg/1200px-Microsoft_icon.svg.png"
                      alt="Microsoft logo"
                    />
                    Sign in with Microsoft
                  </button>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <img
                      className="h-5 w-5 mr-2"
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google logo"
                    />
                    Sign in with Google
                  </button>
                </form>
              </>
            ) : (
              <form onSubmit={handleRejoinSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="rejoinCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Rejoin Code
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="rejoinCode"
                      type="text"
                      required
                      className="pl-10 appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm uppercase"
                      placeholder="Enter your rejoin code"
                      value={rejoinCode}
                      onChange={(e) => setRejoinCode(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Checking...
                    </div>
                  ) : (
                    <>
                      Continue to Form
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormEntrance;
