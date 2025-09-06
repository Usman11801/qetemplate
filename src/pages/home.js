import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  limit,
  startAfter,
} from "firebase/firestore";
import { getUserData } from "../services/userService";
import {
  FileText,
  Plus,
  User,
  LogOut,
  Settings,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { useToast } from "../components/Toast";

// Import our new components
import MyFormsSection from "../components/Home/MyFormsSection";
import AdminPanel from "../components/Home/AdminPanel";
import Store from "./store";
import Header from "../components/Home/Header";

const Home = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  // User and authentication state
  const [userData, setUserData] = useState(null);
  const [userForms, setUserForms] = useState([]);
  const [hubForms, setHubForms] = useState([]);
  const [allForms, setAllForms] = useState([]);
  const [pinnedForms, setPinnedForms] = useState([]);
  const [publicFormsPool, setPublicFormsPool] = useState([]);
  const [isSuperUser, setIsSuperUser] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState("myForms");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const profileMenuRef = useRef(null);

  // Check if user is admin
  const isAdmin = auth.currentUser?.email === process.env.REACT_APP_ADMIN_EMAIL_1 || 
                  auth.currentUser?.email === process.env.REACT_APP_ADMIN_EMAIL_2;

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (auth.currentUser) {
        try {
          const data = await getUserData(auth.currentUser.uid);
          setUserData(data);
          if (auth.currentUser.email === process.env.REACT_APP_ADMIN_EMAIL_1) {
            setIsSuperUser(true);
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          addToast("Failed to load user data", "error");
        }
      }
    };
    loadUserData();
  }, [addToast]);

  // Load user's forms
  useEffect(() => {
    if (!auth.currentUser) return;
    const formsRef = collection(db, "forms");
    const q = query(formsRef, where("userId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const formsArray = [];
        querySnapshot.forEach((docSnap) => {
          const formData = { id: docSnap.id, ...docSnap.data() };
          formsArray.push(formData);
        });
        setUserForms(formsArray);
      },
      (error) => {
        console.error("Error fetching user forms:", error);
        addToast("Failed to load your forms", "error");
      }
    );
    return () => unsubscribe();
  }, [addToast]);

  // Load ALL forms and split them intelligently for hub functionality
  useEffect(() => {
    const formsRef = collection(db, "forms");
    const unsubscribe = onSnapshot(
      formsRef,
      (querySnapshot) => {
        const allFormsArray = [];
        const pinnedFormsArray = [];
        const hubFormsArray = [];
        const publicPoolArray = [];

        querySnapshot.forEach((docSnap) => {
          const formData = { id: docSnap.id, ...docSnap.data() };
          allFormsArray.push(formData);

          // Categorize forms for hub functionality
          if (formData.isInHub === true) {
            hubFormsArray.push(formData);
            
            // If form is pinned to a specific section, add to pinned array
            if (formData.pinnedToSection) {
              pinnedFormsArray.push(formData);
            } else {
              // If in hub but not pinned, add to public pool
              publicPoolArray.push(formData);
            }
          }
        });

        setAllForms(allFormsArray);
        setHubForms(hubFormsArray);
        setPinnedForms(pinnedFormsArray);
        setPublicFormsPool(publicPoolArray);
        
        console.log("Forms data updated:", {
          total: allFormsArray.length,
          hubForms: hubFormsArray.length,
          pinnedForms: pinnedFormsArray.length,
          publicPool: publicPoolArray.length
        });
      },
      (error) => {
        console.error("Error fetching forms:", error);
        addToast("Failed to load forms", "error");
      }
    );
    return () => unsubscribe();
  }, [addToast]);

  // Load more forms for admin pagination
  const loadMoreForms = async () => {
    if (!lastVisible || !hasMore) return;
    try {
      const formsRef = collection(db, "forms");
      const q = query(formsRef, startAfter(lastVisible), limit(20));
      const querySnapshot = await getDocs(q);
      const newForms = [];
      querySnapshot.forEach((docSnap) => {
        newForms.push({ id: docSnap.id, ...docSnap.data() });
      });
      setAllForms((prev) => [...prev, ...newForms]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === 20);
    } catch (error) {
      console.error("Error loading more forms:", error);
      addToast("Failed to load more forms", "error");
    }
  };

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      addToast("Signed out successfully", "success");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      addToast("Failed to sign out", "error");
    }
  };

  // Create new form
  const handleGeneralFormClick = async () => {
    if (!auth.currentUser) {
      addToast("Please sign in to create a form", "error");
      return;
    }
    if (userForms.length >= 3) {
      addToast("Maximum of 3 forms reached!", "warning");
      return;
    }
    const userId = auth.currentUser.uid;
    const formId = Date.now().toString();
    try {
      await setDoc(doc(db, "forms", formId), {
        userId,
        formType: "General Form",
        formTitle: "",
        formDescription: "",
        formImage: null,
        category: "other",
        createdAt: new Date(),
        likes: 0,
        downloads: 0,
        isInHub: false,
        pinnedToSection: null,
      });
      addToast("Form created successfully", "success");
      navigate(`/forms/${formId}`);
    } catch (error) {
      console.error("Error creating form:", error);
      addToast("Failed to create form", "error");
    }
  };

  // Delete form
  const handleDelete = async (event, id) => {
    event.stopPropagation();
    try {
      await deleteDoc(doc(db, "forms", id));
      setUserForms((prevForms) => prevForms.filter((form) => form.id !== id));
      setAllForms((prevForms) => prevForms.filter((form) => form.id !== id));
      setHubForms((prevForms) => prevForms.filter((form) => form.id !== id));
      setPinnedForms((prevForms) => prevForms.filter((form) => form.id !== id));
      setPublicFormsPool((prevForms) => prevForms.filter((form) => form.id !== id));
      addToast("Form deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting form:", error);
      addToast("Failed to delete form", "error");
    }
  };

  // Duplicate form
  const handleDuplicateForm = async (form) => {
    if (!auth.currentUser) {
      addToast("Please sign in to duplicate a form", "error");
      return;
    }
    if (userForms.length >= 3) {
      addToast("Maximum of 3 forms reached!", "warning");
      return;
    }
    const userId = auth.currentUser.uid;
    const newFormId = Date.now().toString();
    try {
      const formDocRef = doc(db, "forms", form.id);
      const formSnap = await getDoc(formDocRef);
      if (!formSnap.exists()) throw new Error("Form not found");
      const formData = { id: form.id, ...formSnap.data() };
      const questionsCollRef = collection(formDocRef, "questions");
      const questionsSnap = await getDocs(questionsCollRef);
      const questions = questionsSnap.docs.map((docSnap) => ({
        id: parseInt(docSnap.id, 10),
        ...docSnap.data(),
      }));
      const newFormData = {
        formType: formData.formType || "General Form",
        formTitle: formData.formTitle || "",
        formDescription: formData.formDescription || "",
        formImage: formData.formImage || null,
        category: formData.category || "other",
        createdAt: new Date(),
        likes: 0,
        downloads: 0,
        userId,
        isInHub: false,
        pinnedToSection: null,
      };
      await setDoc(doc(db, "forms", newFormId), newFormData);
      for (const question of questions) {
        await setDoc(
          doc(db, "forms", newFormId, "questions", question.id.toString()),
          { ...question }
        );
      }
      addToast("Form duplicated successfully", "success");
      navigate(`/forms/${newFormId}`);
    } catch (error) {
      console.error("Error duplicating form:", error);
      addToast("Failed to duplicate form", "error");
    }
  };

  // Use template
  const handleUseTemplate = async (quiz) => {
    if (!auth.currentUser) {
      addToast("Please sign in to add this quiz", "error");
      navigate("/login");
      return;
    }
    const formsRef = collection(db, "forms");
    const q = query(formsRef, where("userId", "==", auth.currentUser.uid));
    const userFormsSnap = await getDocs(q);
    if (userFormsSnap.size >= 3) {
      addToast("Maximum of 3 forms reached!", "warning");
      return;
    }
    const userId = auth.currentUser.uid;
    const newFormId = Date.now().toString();
    try {
      const formDocRef = doc(db, "forms", quiz.id);
      const formSnap = await getDoc(formDocRef);
      if (!formSnap.exists()) throw new Error("Form not found");
      const formData = { id: quiz.id, ...formSnap.data() };
      const questionsCollRef = collection(formDocRef, "questions");
      const questionsSnap = await getDocs(questionsCollRef);
      const questions = questionsSnap.docs.map((docSnap) => ({
        id: parseInt(docSnap.id, 10),
        ...docSnap.data(),
      }));
      const newFormData = {
        formType: formData.formType || "General Form",
        formTitle: formData.formTitle || "",
        formDescription: formData.formDescription || "",
        formImage: formData.formImage || null,
        category: formData.category || "other",
        createdAt: new Date(),
        likes: 0,
        downloads: 0,
        userId,
        isInHub: false,
        pinnedToSection: null,
      };
      await setDoc(doc(db, "forms", newFormId), newFormData);
      for (const question of questions) {
        await setDoc(
          doc(db, "forms", newFormId, "questions", question.id.toString()),
          { ...question }
        );
      }
      try {
        const downloads = formData.downloads || 0;
        await updateDoc(formDocRef, { downloads: downloads + 1 });
      } catch (downloadError) {
        console.error("Error updating downloads count:", downloadError);
      }
      addToast("Quiz added to your forms successfully", "success");
      navigate("/");
    } catch (error) {
      console.error("Error adding quiz to forms:", error);
      addToast("Failed to add quiz to your forms", "error");
    }
  };

  // Toggle hub status (admin function)
  const handleToggleHub = async (formId, currentIsInHub) => {
    try {
      const newStatus = currentIsInHub === undefined ? true : !currentIsInHub;
      const updateData = { 
        isInHub: newStatus,
        // If removing from hub, also remove any section pinning
        ...(newStatus === false && { pinnedToSection: null })
      };
      
      await updateDoc(doc(db, "forms", formId), updateData);
      addToast(
        `Form ${newStatus ? "added to" : "removed from"} hub`,
        "success"
      );
    } catch (error) {
      console.error("Error updating hub status:", error);
      addToast("Failed to update hub status", "error");
    }
  };

  // Pin form to specific section (NEW IMPLEMENTATION)
  const handlePinToSection = async (formId, sectionId) => {
    try {
      const updateData = {
        pinnedToSection: sectionId,
        // Ensure form is in hub when pinning to a section
        isInHub: true
      };
      
      await updateDoc(doc(db, "forms", formId), updateData);
      
      if (sectionId) {
        addToast(`Form pinned to section successfully`, "success");
      } else {
        addToast("Pin removed from form", "info");
      }
    } catch (error) {
      console.error("Error pinning form to section:", error);
      addToast("Failed to pin form to section", "error");
    }
  };

  const getTabSliderStyle = () => {
    if (isAdmin) {
      switch (activeTab) {
        case 'myForms':
          return { transform: 'translateX(0%)', width: '33.333%' };
        case 'quizHub':
          return { transform: 'translateX(100%)', width: '33.333%' };
        case 'adminPanel':
          return { transform: 'translateX(200%)', width: '33.333%' };
        default:
          return { transform: 'translateX(0%)', width: '33.333%' };
      }
    } else {
      switch (activeTab) {
        case 'myForms':
          return { transform: 'translateX(0%)', width: '50%' };
        case 'quizHub':
          return { transform: 'translateX(100%)', width: '50%' };
        default:
          return { transform: 'translateX(0%)', width: '50%' };
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-x-hidden">
      {/* Background Elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur-3xl"></div>
      <div className="absolute top-1/3 -left-40 w-96 h-96 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-15 blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 opacity-15 blur-3xl"></div>

      {/* Header Component */}
      <Header 
        userData={userData}
        isProfileMenuOpen={isProfileMenuOpen}
        setIsProfileMenuOpen={setIsProfileMenuOpen}
        profileMenuRef={profileMenuRef}
        handleSignOut={handleSignOut}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-10">
          <div className="relative p-1.5 rounded-full shadow-lg border border-white border-opacity-30 bg-white/30 backdrop-blur-lg">
            <div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 via-red-500 to-yellow-500 rounded-full transition-all duration-500 ease-in-out"
              style={{
                ...getTabSliderStyle(),
                padding: '6px',
                margin: '-6px',
                zIndex: 0,
              }}
            >
              <div className="w-full h-full bg-white rounded-full shadow-inner"></div>
            </div>
            <div className="relative z-10 flex">
              <button
                onClick={() => setActiveTab("myForms")}
                className={`px-6 sm:px-8 py-3 rounded-full font-medium text-sm transition-colors duration-300 ${
                  activeTab === "myForms" ? "text-purple-800" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                My Forms
              </button>
              <button
                onClick={() => setActiveTab("quizHub")}
                className={`px-6 sm:px-8 py-3 rounded-full font-medium text-sm transition-colors duration-300 ${
                  activeTab === "quizHub" ? "text-purple-800" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Form Hub
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab("adminPanel")}
                  className={`px-6 sm:px-8 py-3 rounded-full font-medium text-sm transition-colors duration-300 ${
                    activeTab === "adminPanel" ? "text-purple-800" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Admin Panel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === "myForms" && (
          <MyFormsSection
            userForms={userForms}
            handleGeneralFormClick={handleGeneralFormClick}
            handleDelete={handleDelete}
            handleDuplicateForm={handleDuplicateForm}
            handleToggleHub={handleToggleHub}
            handlePinToSection={handlePinToSection}
            isAdmin={isAdmin}
            addToast={addToast}
            navigate={navigate}
          />
        )}

        {activeTab === "quizHub" && (
          <Store
            pinnedForms={pinnedForms}
            publicFormsPool={publicFormsPool}
            onUseTemplate={handleUseTemplate}
            maxUserForms={3}
            addToast={addToast}
            isSuperUser={isSuperUser}
            onToggleHub={handleToggleHub}
          />
        )}

        {activeTab === "adminPanel" && isAdmin && (
          <AdminPanel
            allForms={allForms}
            pinnedForms={pinnedForms}
            publicFormsPool={publicFormsPool}
            handleToggleHub={handleToggleHub}
            handlePinToSection={handlePinToSection}
            handleDelete={handleDelete}
            handleDuplicateForm={handleDuplicateForm}
            loadMoreForms={loadMoreForms}
            hasMore={hasMore}
            addToast={addToast}
            navigate={navigate}
          />
        )}

        {/* Floating Action Button */}
        {activeTab === "myForms" && (
          <div className="fixed bottom-8 right-8 z-50 group">
            <button
              onClick={handleGeneralFormClick}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Create new form"
            >
              <Plus className="h-8 w-8" />
            </button>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-black bg-opacity-80 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-lg mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Create New Form
            </span>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;