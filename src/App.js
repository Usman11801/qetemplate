import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { getUserData } from "./services/userService";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

// Toasts
import { ToastProvider } from "./components/Toast";

// Debug component
import ResponsiveDebug from "./components/ResponsiveDebug";

// Loading page
import Loading from "./pages/loading";

// Pages
import Login from "./pages/login";
import Home from "./pages/home";
import Form from "./pages/form";
import Sessions from "./pages/sessions";
import Quiz from "./pages/quiz";
import FormEntrance from "./pages/userentrance";
import QuizComplete from "./pages/quizComplete";
import ResultsDashboard from "./pages/results";
import AdminHome from "./pages/adminHome";
import QuizOverview from "./pages/QuizOverview";
import UserProfile from "./pages/userProfile";
import UserSettings from "./pages/userSettings";

// Chatbot
import ChatbotPage from "./components/ChatBox";

// Payment Pages
import PaymentPage from "./stripe/paymentpage"; // Payment page in src/stripe
import PaymentSuccess from "./pages/paymentsuccess"; // Success page in src/files
import CorrectAnswers from "./pages/correctAnswers";

// Protected route for admin/creator routes
const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          const userData = await getUserData(authUser.uid);
          setUser(userData);

          const fromRedirect = location.state?.fromRedirect;

          if (!fromRedirect) {
            if (userData?.adminStatus) {
              if (location.pathname === "/") {
                navigate("/admin", {
                  replace: true,
                  state: { fromRedirect: true },
                });
              }
            } else {
              if (location.pathname.startsWith("/admin")) {
                navigate("/", {
                  replace: true,
                  state: { fromRedirect: true },
                });
              }
            }
          }
        } else {
          setUser(null);
          navigate("/login", { replace: true }); // Redirect to login instead of landing
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, location]);

  if (loading)
    return (
      <Loading fullScreen type="default" theme="light" text="Loading ..." />
    );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Route for quiz that checks session storage for access token
const QuizRoute = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      const pathname = window.location.pathname;
      const sessionId = pathname.split("/quiz/")[1]?.split("/")[0];

      if (sessionId) {
        const accessToken = sessionStorage.getItem(`formAccess_${sessionId}`);

        if (!accessToken) {
          navigate(`/form-entrance/${sessionId}`);
        } else {
          setHasAccess(true);
        }
      }
      setLoading(false);
    };

    checkAccess();
  }, [navigate]);

  if (loading)
    return (
      <Loading fullScreen type="default" theme="light" text="Loading ..." />
    );
  if (!hasAccess) return null;
  return children;
};

// Protected route for authenticated users (non-admin specific)
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          const userData = await getUserData(authUser.uid);
          setUser(userData);
        } else {
          setUser(null);
          navigate("/login", { replace: true }); // Redirect to login instead of landing
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading)
    return (
      <Loading fullScreen type="default" theme="light" text="Loading ..." />
    );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Auth checker for home route
const HomeRedirect = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          const userData = await getUserData(authUser.uid);

          if (userData?.adminStatus) {
            navigate("/admin", { replace: true });
          } else {
            navigate("/home", { replace: true });
          }
        } else {
          navigate("/login", { replace: true }); // Redirect to login instead of landing
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        navigate("/login", { replace: true }); // Redirect to login instead of landing
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading)
    return (
      <Loading fullScreen type="default" theme="light" text="Loading ..." />
    );
  return null;
};

function App() {
  // Better mobile detection including tablets and touch devices
  const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   ('ontouchstart' in window) || 
                   (navigator.maxTouchPoints > 0);
  const backend = isMobile ? TouchBackend : HTML5Backend;

  // Add error boundary and debugging
  useEffect(() => {
    console.log('App component mounted');
    console.log('Firebase config:', {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? 'Set' : 'Missing',
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing',
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ? 'Set' : 'Missing',
    });
  }, []);

  try {
    return (
      <DndProvider backend={backend}>
        <ToastProvider>
          <Router>
            <Routes>
            {/* Root Route - Redirects based on auth state */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route
              path="/form-entrance/:sessionId"
              element={<FormEntrance />}
            />

            {/* Admin/User Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <UserSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forms/:formId"
              element={
                <AdminRoute>
                  <Form />
                </AdminRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminHome />
                </AdminRoute>
              }
            />
            <Route
              path="/sessions/:formId"
              element={
                <AdminRoute>
                  <Sessions />
                </AdminRoute>
              }
            />
            <Route
              path="/results/:formId"
              element={
                <AdminRoute>
                  <ResultsDashboard />
                </AdminRoute>
              }
            />

            {/* Quiz Routes */}
            <Route
              path="/quiz/:sessionId"
              element={
                <QuizRoute>
                  <Quiz />
                </QuizRoute>
              }
            />
            <Route
              path="/quiz/:sessionId/complete"
              element={<QuizComplete />}
            />
            <Route
              path="/quiz/:sessionId/correctAnswer"
              element={<CorrectAnswers />}
            />

            {/* Quiz Overview Route */}
            <Route
              path="/quiz-overview/:formId"
              element={
                <ProtectedRoute>
                  <QuizOverview />
                </ProtectedRoute>
              }
            />

            {/* Chatbot Route */}
            <Route path="/chatbot" element={<ChatbotPage />} />

            {/* Payment Routes */}
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-success"
              element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              }
            />

            {/* Redirect landing page requests to login */}
            <Route path="/landing" element={<Navigate to="/login" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <ResponsiveDebug />
      </ToastProvider>
    </DndProvider>
    );
  } catch (error) {
    console.error('App initialization error:', error);
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Error Loading App</h1>
        <p>There was an error initializing the application.</p>
        <p>Error: {error.message}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }
}

export default App;
