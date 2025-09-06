import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase";
import { createOrUpdateUser } from "../services/userService";
import { doc, setDoc } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Animation states
  const [activeInput, setActiveInput] = useState(null);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      await createOrUpdateUser({
        ...userCredential.user,
        provider: "email",
      });
      navigate("/");
    } catch (err) {
      if (err?.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      }else if(err?.code === 'auth/invalid-credential'){
        setError('Invalid credentials');
      } 
      else {
        const raw = typeof err?.message === 'string' ? err.message : 'Something went wrong. Please try again.';
        const msg = raw.replace(/^Firebase:\s*/, '').replace(/\s*\(auth.*\)\s*$/, '');
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      await createOrUpdateUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        provider: "google",
      });

      navigate("/");
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setError("An error occurred during sign in. Try again!");
    } finally {
      setLoading(false);
    }
  };

  // Animation for background shapes
  const [shapes, setShapes] = useState([]);

  useEffect(() => {
    // Generate random shapes for background animation
    const newShapes = [];
    for (let i = 0; i < 15; i++) {
      newShapes.push({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 20 + Math.random() * 50,
        duration: 15 + Math.random() * 30,
        delay: Math.random() * 5,
      });
    }
    setShapes(newShapes);
  }, []);
  // const handleMicrosoftLogin = async () => {
  //   if (loading || !formId) return;
  //   setLoading(true);

  //   try {
  //     const provider = new OAuthProvider("microsoft.com");
  //     provider.setCustomParameters({
  //       prompt: "consent",
  //     });

  //     const result = await signInWithPopup(auth, provider);
  //     console.log("Logged in:", result);
  //     const newRejoinCode = generateRejoinCode();

  //     await createOrUpdateUser({
  //       uid: result.user.uid,
  //       email: result.user.email,
  //       displayName: result.user.displayName,
  //       photoURL: result.user.photoURL,
  //       provider: "microsoft", // Changed from "google" to "microsoft"
  //     });

  //     const respondentId = `${Date.now()}-${Math.random()
  //       .toString(36)
  //       .substr(2, 9)}`;
  //     const respondentRef = doc(db, "respondents", respondentId);

  //     await setDoc(respondentRef, {
  //       name: result.user.displayName || "Microsoft User",
  //       email: result.user.email.toLowerCase(),
  //       userId: result.user.uid,
  //       rejoinCode: newRejoinCode,
  //       createdAt: new Date(),
  //       type: "microsoft",
  //       sessionId: sessionId,
  //       formId: formId,
  //       status: "active",
  //     });

  //     sessionStorage.setItem(`formAccess_${sessionId}`, newRejoinCode);
  //     sessionStorage.setItem(`respondentId_${sessionId}`, respondentId);
  //     sessionStorage.setItem(`formId_${sessionId}`, formId);

  //     setGeneratedCode(newRejoinCode);
  //     setShowCopyPrompt(true);
  //     setLoading(false);
  //   } catch (error) {
  //     console.error("Microsoft login error", error);
  //     setLoading(false);

  //     if (error.code === "auth/account-exists-with-different-credential") {
  //       setError(`This email is already registered.`);
  //     } else if (error.code === "auth/provider-conflict") {
  //       setError(error.message);
  //     } else {
  //       setError("An error occurred during sign in. Please try again.");
  //     }
  //   }
  // };
  const handleMicrosoftLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      // const provider = new GoogleAuthProvider();
      const provider = new OAuthProvider("microsoft.com");
      provider.setCustomParameters({
        prompt: "consent",
      });

      const result = await signInWithPopup(auth, provider);
      console.log(result, "result");
      await createOrUpdateUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        provider: "microsoft", // Changed from "google" to "microsoft"
      });

      navigate("/");
    } catch (err) {
      console.error("Microsoft Sign-In Error:", err);
      console.log(err.code, "error code");
      if (err.code === "auth/account-exists-with-different-credential") {
        setError(`This email is already registered.`);
      } else if (err.code === "auth/provider-conflict") {
        setError(err.message);
      } else {
        setError("An error occurred during sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Animated background shapes */}
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="absolute rounded-full bg-white opacity-10 animate-float"
          style={{
            top: `${shape.top}%`,
            left: `${shape.left}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            animationDuration: `${shape.duration}s`,
            animationDelay: `${shape.delay}s`,
          }}
        />
      ))}

      {/* Glowing orb effect */}
      <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-30 blur-3xl -top-20 -right-20"></div>
      <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 opacity-20 blur-3xl bottom-10 -left-10"></div>

      <div className="max-w-md w-full space-y-8 backdrop-blur-lg bg-white bg-opacity-10 p-8 rounded-2xl shadow-2xl border border-white border-opacity-20 relative z-10 transition-all duration-500 hover:shadow-purple-500/20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 blur opacity-70 animate-pulse"></div>
              <h1 className="relative bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent text-5xl font-extrabold">
                Q
              </h1>
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold text-white">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-center text-sm text-white text-opacity-80">
            {isSignUp
              ? "Join our community and start managing your projects"
              : "We're excited to see you again"}
          </p>
        </div>

        {error && (
          <div className="bg-red-900 bg-opacity-40 border-l-4 border-red-500 p-4 rounded-md backdrop-blur-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-300"
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
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleEmailAuth}>
          <div className="rounded-md space-y-4">
            <div className="relative">
              <label
                htmlFor="email"
                className={`block text-sm font-medium transition-all duration-300 ${activeInput === "email" ? "text-pink-300" : "text-gray-200"
                  }`}
              >
                Email address
              </label>
              <div
                className={`mt-1 relative transition-all duration-300 ${activeInput === "email" ? "transform -translate-y-1" : ""
                  }`}
              >
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-lg block w-full px-3 py-3 border-2 bg-white bg-opacity-10 backdrop-blur-md placeholder-gray-400 text-white focus:ring-0 focus:bg-opacity-20 focus:border-pink-500 transition-all duration-300 sm:text-sm"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setActiveInput("email")}
                  onBlur={() => setActiveInput(null)}
                />
                <div
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500 ${activeInput === "email" ? "w-full" : "w-0"
                    }`}
                ></div>
              </div>
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className={`block text-sm font-medium transition-all duration-300 ${activeInput === "password" ? "text-pink-300" : "text-gray-200"
                  }`}
              >
                Password
              </label>
              <div
                className={`mt-1 relative transition-all duration-300 ${activeInput === "password" ? "transform -translate-y-1" : ""
                  }`}
              >
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-lg block w-full px-3 py-3 border-2 bg-white bg-opacity-10 backdrop-blur-md placeholder-gray-400 text-white focus:ring-0 focus:bg-opacity-20 focus:border-pink-500 transition-all duration-300 sm:text-sm"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setActiveInput("password")}
                  onBlur={() => setActiveInput(null)}
                />
                <div
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500 ${activeInput === "password" ? "w-full" : "w-0"
                    }`}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              className="text-sm text-pink-300 hover:text-pink-100 font-medium transition-colors duration-300"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "← Back to sign in" : "Need an account? Sign up →"}
            </button>
            {!isSignUp && (
              <button
                type="button"
                className="text-sm text-pink-300 hover:text-pink-100 font-medium transition-colors duration-300"
                onClick={() => {
                  /* Handle forgot password */
                }}
              >
                Forgot password?
              </button>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg
                  className={`h-5 w-5 text-purple-300 group-hover:text-pink-200 transition-all duration-300 ${loading ? "opacity-0" : "opacity-100"
                    }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              {loading
                ? "Processing..."
                : isSignUp
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </div>
        </form>

        <div className="relative flex items-center mt-8">
          <div className="flex-grow border-t border-gray-400 border-opacity-30"></div>
          <span className="flex-shrink mx-4 text-gray-300 text-sm">
            or continue with
          </span>
          <div className="flex-grow border-t border-gray-400 border-opacity-30"></div>
        </div>

        <div className="mt-6 flex justify-center flex-col gap-4">
          <button
            type="button"
            onClick={handleMicrosoftLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-white border-opacity-30 bg-white bg-opacity-10 backdrop-blur-md shadow-sm text-sm font-medium rounded-lg text-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1"
          >
            <img
              className="h-5 w-5 mr-2"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Microsoft_icon.svg/1200px-Microsoft_icon.svg.png"
              alt="Microsoft logo"
            />
            Sign in with Microsoft
          </button>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-white border-opacity-30 bg-white bg-opacity-10 backdrop-blur-md shadow-sm text-sm font-medium rounded-lg text-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1"
          >
            <img
              className="h-5 w-5 mr-2"
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
            />
            {isSignUp ? "Sign up with Google" : "Sign in with Google"}
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-white text-opacity-70">
        By continuing, you agree to Qemplate's{" "}
        <button
          onClick={() => {
            /* Handle Terms of Service click */
          }}
          className="font-medium text-pink-300 hover:text-pink-200 transition-colors duration-300"
        >
          Terms of Service
        </button>{" "}
        and{" "}
        <button
          onClick={() => {
            /* Handle Privacy Policy click */
          }}
          className="font-medium text-pink-300 hover:text-pink-200 transition-colors duration-300"
        >
          Privacy Policy
        </button>
      </div>

      {/* Add CSS for custom animations */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) rotate(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px) rotate(10deg);
          }
          100% {
            transform: translateY(0) translateX(0) rotate(0);
          }
        }
        .animate-float {
          animation-name: float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
