import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Heart,
  Star,
  TrendingUp,
  Clock,
  Eye,
  Grid3X3,
  Sparkles,
  Award,
  BookOpen,
  GraduationCap,
  Briefcase,
  Brain,
  HelpCircle,
  Layout,
  Plus,
  Settings,
  X,
  Check,
  Move,
} from "lucide-react";

const EnhancedFormHub = ({ 
  forms,
  onUseTemplate, 
  maxUserForms = 3, 
  addToast,
  userEmail,
  auth,
  db,
  navigate,
  doc,
  setDoc,
  collection,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  serverTimestamp,
}) => {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("all");
  
  // Data states
  const [featuredForms, setFeaturedForms] = useState([]);
  const [recommendedForms, setRecommendedForms] = useState([]);
  const [trendingForms, setTrendingForms] = useState([]);
  const [newForms, setNewForms] = useState([]);
  const [categoryForms, setCategoryForms] = useState({});
  const [userActivity, setUserActivity] = useState([]);
  
  // UI states
  const [heroIndex, setHeroIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showExploreDrawer, setShowExploreDrawer] = useState(false);
  const [userLikes, setUserLikes] = useState({});
  
  // Admin states
  const [editingSection, setEditingSection] = useState(null);
  const [draggedForm, setDraggedForm] = useState(null);
  
  // Refs
  const heroIntervalRef = useRef(null);
  const scrollRefs = {
    recommended: useRef(null),
    trending: useRef(null),
    new: useRef(null),
  };

  // Check if user is admin
  const isAdmin = userEmail === process.env.REACT_APP_ADMIN_EMAIL_1 || userEmail === process.env.REACT_APP_ADMIN_EMAIL_2;

  // Categories with beautiful icons and colors
  const categories = [
    { id: "general", name: "General Knowledge", icon: <BookOpen size={20} />, color: "from-blue-500 to-cyan-500" },
    { id: "educational", name: "Educational", icon: <GraduationCap size={20} />, color: "from-purple-500 to-pink-500" },
    { id: "training", name: "Training", icon: <Briefcase size={20} />, color: "from-green-500 to-emerald-500" },
    { id: "certification", name: "Certification", icon: <Award size={20} />, color: "from-yellow-500 to-orange-500" },
    { id: "skillbuilding", name: "Skill Building", icon: <Brain size={20} />, color: "from-red-500 to-rose-500" },
    { id: "other", name: "Fun & Others", icon: <Sparkles size={20} />, color: "from-indigo-500 to-purple-500" },
  ];

  // Filter forms based on selected category and search term
  const getFilteredForms = (formsList) => {
    let filtered = formsList;
    
    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(form => form.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(form => 
        form.formTitle?.toLowerCase().includes(term) ||
        form.formDescription?.toLowerCase().includes(term) ||
        form.category?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };

  // Fetch user activity for personalization
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const activityRef = collection(db, "userActivity");
    const q = query(
      activityRef, 
      where("userId", "==", auth.currentUser.uid),
      orderBy("timestamp", "desc"),
      limit(50)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activities = [];
      snapshot.forEach((doc) => {
        activities.push({ id: doc.id, ...doc.data() });
      });
      setUserActivity(activities);
    });
    
    return () => unsubscribe();
  }, [auth, db, collection, query, where, orderBy, limit, onSnapshot]);

  // Fetch featured forms
  const fetchFeaturedForms = useCallback(async () => {
    try {
      const formsRef = collection(db, "forms");
      const q = query(
        formsRef,
        where("isInHub", "==", true),
        where("featuredPosition", "!=", null),
        orderBy("featuredPosition"),
        limit(4)
      );
      
      const snapshot = await getDocs(q);
      const forms = [];
      snapshot.forEach((doc) => {
        forms.push({ id: doc.id, ...doc.data() });
      });
      
      // If less than 4 featured, fill with top liked forms
      if (forms.length < 4) {
        const fillQ = query(
          formsRef,
          where("isInHub", "==", true),
          where("featuredPosition", "==", null),
          orderBy("likes", "desc"),
          limit(4 - forms.length)
        );
        const fillSnapshot = await getDocs(fillQ);
        fillSnapshot.forEach((doc) => {
          forms.push({ id: doc.id, ...doc.data() });
        });
      }
      
      setFeaturedForms(forms);
    } catch (error) {
      console.error("Error fetching featured forms:", error);
    }
  }, [db, collection, query, where, orderBy, limit, getDocs]);

  // Fetch personalized recommendations
  const fetchRecommendedForms = useCallback(async () => {
    try {
      const forms = [];
      
      // First, get admin-recommended forms
      const adminRef = collection(db, "forms");
      const adminQ = query(
        adminRef,
        where("isInHub", "==", true),
        where("adminRecommended", "==", true),
        limit(2)
      );
      const adminSnapshot = await getDocs(adminQ);
      adminSnapshot.forEach((doc) => {
        forms.push({ id: doc.id, ...doc.data(), isAdminPick: true });
      });
      
      // Then, get personalized recommendations based on user activity
      if (userActivity.length > 0) {
        // Get user's preferred categories
        const categoryCount = {};
        userActivity.forEach((activity) => {
          categoryCount[activity.category] = (categoryCount[activity.category] || 0) + 1;
        });
        
        const topCategories = Object.entries(categoryCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 2)
          .map(([cat]) => cat);
        
        // Fetch forms from preferred categories
        if (topCategories.length > 0) {
          const personalQ = query(
            adminRef,
            where("isInHub", "==", true),
            where("category", "in", topCategories),
            where("adminRecommended", "!=", true),
            orderBy("likes", "desc"),
            limit(4)
          );
          const personalSnapshot = await getDocs(personalQ);
          personalSnapshot.forEach((doc) => {
            if (forms.length < 6) {
              forms.push({ id: doc.id, ...doc.data() });
            }
          });
        }
      }
      
      // Fill remaining slots with popular forms
      if (forms.length < 6) {
        const fillQ = query(
          adminRef,
          where("isInHub", "==", true),
          orderBy("likes", "desc"),
          limit(6 - forms.length)
        );
        const fillSnapshot = await getDocs(fillQ);
        fillSnapshot.forEach((doc) => {
          const formData = { id: doc.id, ...doc.data() };
          if (!forms.find(f => f.id === doc.id)) {
            forms.push(formData);
          }
        });
      }
      
      setRecommendedForms(forms);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  }, [userActivity, db, collection, query, where, orderBy, limit, getDocs]);

  // Fetch trending forms
  const fetchTrendingForms = useCallback(async () => {
    try {
      const formsRef = collection(db, "forms");
      const q = query(
        formsRef,
        where("isInHub", "==", true),
        orderBy("viewCount", "desc"),
        limit(8)
      );
      
      const snapshot = await getDocs(q);
      const forms = [];
      snapshot.forEach((doc) => {
        forms.push({ id: doc.id, ...doc.data() });
      });
      
      setTrendingForms(forms);
    } catch (error) {
      console.error("Error fetching trending forms:", error);
    }
  }, [db, collection, query, where, orderBy, limit, getDocs]);

  // Fetch new arrivals
  const fetchNewForms = useCallback(async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const formsRef = collection(db, "forms");
      const q = query(
        formsRef,
        where("isInHub", "==", true),
        where("createdAt", ">=", thirtyDaysAgo),
        orderBy("createdAt", "desc"),
        limit(8)
      );
      
      const snapshot = await getDocs(q);
      const forms = [];
      snapshot.forEach((doc) => {
        forms.push({ id: doc.id, ...doc.data() });
      });
      
      setNewForms(forms);
    } catch (error) {
      console.error("Error fetching new forms:", error);
    }
  }, [db, collection, query, where, orderBy, limit, getDocs]);

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchFeaturedForms(),
        fetchRecommendedForms(),
        fetchTrendingForms(),
        fetchNewForms(),
      ]);
      setLoading(false);
    };
    
    fetchAllData();
  }, [fetchFeaturedForms, fetchRecommendedForms, fetchTrendingForms, fetchNewForms]);

  // Hero carousel auto-rotation
  useEffect(() => {
    if (featuredForms.length > 1) {
      heroIntervalRef.current = setInterval(() => {
        setHeroIndex((prev) => (prev + 1) % featuredForms.length);
      }, 8000);
      
      return () => clearInterval(heroIntervalRef.current);
    }
  }, [featuredForms]);

  // Track form view
  const trackFormView = async (formId, category) => {
    if (!auth.currentUser) return;
    
    try {
      // Update view count
      await updateDoc(doc(db, "forms", formId), {
        viewCount: increment(1),
        lastViewedAt: serverTimestamp(),
      });
      
      // Track user activity
      await setDoc(doc(collection(db, "userActivity")), {
        userId: auth.currentUser.uid,
        formId,
        action: "view",
        category,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  // Handle form like
  const handleLike = async (formId) => {
    if (!auth.currentUser) {
      addToast("Please sign in to like forms", "error");
      navigate("/login");
      return;
    }
    
    const userId = auth.currentUser.uid;
    const likeRef = doc(db, "forms", formId, "likes", userId);
    const formRef = doc(db, "forms", formId);
    
    try {
      const likeSnap = await getDoc(likeRef);
      const formSnap = await getDoc(formRef);
      if (!formSnap.exists()) throw new Error("Form not found");
      
      const currentLikes = formSnap.data().likes || 0;
      
      if (likeSnap.exists()) {
        await deleteDoc(likeRef);
        await updateDoc(formRef, { likes: Math.max(currentLikes - 1, 0) });
        setUserLikes(prev => ({ ...prev, [formId]: false }));
      } else {
        await setDoc(likeRef, { likedAt: serverTimestamp() });
        await updateDoc(formRef, { likes: currentLikes + 1 });
        setUserLikes(prev => ({ ...prev, [formId]: true }));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      addToast("Failed to update like", "error");
    }
  };

  // Admin functions
  const updateFeaturedPosition = async (formId, position) => {
    if (!isAdmin) return;
    
    try {
      await updateDoc(doc(db, "forms", formId), {
        featuredPosition: position,
      });
      addToast("Featured position updated", "success");
      fetchFeaturedForms();
    } catch (error) {
      console.error("Error updating featured position:", error);
      addToast("Failed to update position", "error");
    }
  };

  const toggleAdminRecommended = async (formId, currentState) => {
    if (!isAdmin) return;
    
    try {
      await updateDoc(doc(db, "forms", formId), {
        adminRecommended: !currentState,
      });
      addToast(`Form ${!currentState ? "added to" : "removed from"} recommendations`, "success");
      fetchRecommendedForms();
    } catch (error) {
      console.error("Error updating recommendation:", error);
      addToast("Failed to update recommendation", "error");
    }
  };

  // Carousel scroll functions
  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 320; // Card width + gap
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Form card component
  const FormCard = ({ form, size = "normal", showAdminControls = false }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
      <div
        className={`
          relative group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl
          transform transition-all duration-500 hover:-translate-y-1
          ${size === "large" ? "min-w-[400px]" : "min-w-[300px]"}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          trackFormView(form.id, form.category);
          navigate(`/quiz-overview/${form.id}`);
        }}
      >
        {/* Image/Gradient Background */}
        <div className={`relative ${size === "large" ? "h-48" : "h-40"} overflow-hidden`}>
          {form.formImage ? (
            <img
              src={form.formImage}
              alt={form.formTitle}
              className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className={`
              w-full h-full bg-gradient-to-br
              ${categories.find(c => c.id === form.category)?.color || "from-gray-400 to-gray-600"}
              flex items-center justify-center
            `}>
              {categories.find(c => c.id === form.category)?.icon && (
                <div className="text-white/20 transform scale-[4]">
                  {categories.find(c => c.id === form.category)?.icon}
                </div>
              )}
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Admin controls */}
          {showAdminControls && isAdmin && (
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {editingSection === "featured" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateFeaturedPosition(form.id, form.featuredPosition ? null : 1);
                  }}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                >
                  <Star className={`h-4 w-4 ${form.featuredPosition ? "fill-yellow-500 text-yellow-500" : "text-gray-600"}`} />
                </button>
              )}
              {editingSection === "recommended" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAdminRecommended(form.id, form.adminRecommended);
                  }}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                >
                  <Check className={`h-4 w-4 ${form.adminRecommended ? "text-green-500" : "text-gray-600"}`} />
                </button>
              )}
            </div>
          )}
          
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 capitalize">
              {form.category}
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
            {form.formTitle || "Untitled Form"}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {form.formDescription || "No description available"}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(form.id);
                }}
                className="flex items-center gap-1 hover:text-red-500 transition-colors"
              >
                <Heart className={`h-4 w-4 ${userLikes[form.id] ? "fill-red-500 text-red-500" : ""}`} />
                <span>{form.likes || 0}</span>
              </button>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{form.viewCount || 0}</span>
              </div>
            </div>
            
            {/* Use template button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUseTemplate(form);
              }}
              className="
                px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600
                text-white text-sm font-medium rounded-lg
                hover:from-purple-700 hover:to-indigo-700
                transform transition-all duration-300 hover:scale-105
              "
            >
              Use
            </button>
          </div>
          
          {/* Admin badge */}
          {form.isAdminPick && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600">
                <Sparkles className="h-3 w-3" />
                Staff Pick
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Hero section component
  const HeroSection = () => {
    if (featuredForms.length === 0) return null;
    
    const currentForm = featuredForms[heroIndex];
    
    return (
      <div className="relative h-[400px] rounded-3xl overflow-hidden mb-12">
        {/* Background with parallax effect */}
        <div className="absolute inset-0">
          {currentForm.formImage ? (
            <img
              src={currentForm.formImage}
              alt={currentForm.formTitle}
              className="w-full h-full object-cover transform scale-110"
              style={{
                transform: `scale(1.1) translateY(${heroIndex * 10}px)`,
                transition: "transform 1s ease-out",
              }}
            />
          ) : (
            <div className={`
              w-full h-full bg-gradient-to-br
              ${categories.find(c => c.id === currentForm.category)?.color || "from-purple-600 to-indigo-600"}
            `} />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white mb-6">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">Featured Template</span>
              </div>
              
              <h1 className="text-5xl font-bold text-white mb-4">
                {currentForm.formTitle || "Amazing Form Template"}
              </h1>
              
              <p className="text-xl text-white/90 mb-8 line-clamp-2">
                {currentForm.formDescription || "Start creating amazing forms with this template"}
              </p>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onUseTemplate(currentForm)}
                  className="
                    px-8 py-3 bg-white text-gray-900 font-semibold rounded-xl
                    hover:bg-gray-100 transform transition-all duration-300 hover:scale-105
                    shadow-lg hover:shadow-xl
                  "
                >
                  Use This Template
                </button>
                
                <button
                  onClick={() => {
                    trackFormView(currentForm.id, currentForm.category);
                    navigate(`/quiz-overview/${currentForm.id}`);
                  }}
                  className="
                    px-6 py-3 bg-white/20 backdrop-blur-md text-white font-medium rounded-xl
                    hover:bg-white/30 transition-all duration-300 border border-white/30
                  "
                >
                  Preview
                </button>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-6 mt-6 text-white/80">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  <span>{currentForm.likes || 0} likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <span>{currentForm.viewCount || 0} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
          {featuredForms.map((_, index) => (
            <button
              key={index}
              onClick={() => setHeroIndex(index)}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${index === heroIndex ? "w-8 bg-white" : "bg-white/50 hover:bg-white/70"}
              `}
            />
          ))}
        </div>
        
        {/* Navigation arrows */}
        {featuredForms.length > 1 && (
          <>
            <button
              onClick={() => setHeroIndex((prev) => (prev - 1 + featuredForms.length) % featuredForms.length)}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={() => setHeroIndex((prev) => (prev + 1) % featuredForms.length)}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </>
        )}
        
        {/* Admin edit button */}
        {isAdmin && isAdminMode && (
          <button
            onClick={() => setEditingSection(editingSection === "featured" ? null : "featured")}
            className="absolute top-6 right-6 p-2 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-colors"
          >
            <Settings className="h-5 w-5 text-white" />
          </button>
        )}
      </div>
    );
  };

  // Section header component
  const SectionHeader = ({ icon, title, subtitle, onSeeAll, showAdminEdit = false }) => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {showAdminEdit && isAdmin && isAdminMode && (
          <button
            onClick={() => setEditingSection(editingSection === title.toLowerCase() ? null : title.toLowerCase())}
            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
        )}
        
        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            See All
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );

  // Carousel section component
  const CarouselSection = ({ title, subtitle, icon, forms, scrollRef, showAdminEdit = false }) => (
    <div className="mb-12">
      <SectionHeader
        icon={icon}
        title={title}
        subtitle={subtitle}
        showAdminEdit={showAdminEdit}
      />
      
      <div className="relative">
        {/* Left scroll button */}
        <button
          onClick={() => scrollCarousel(scrollRef, "left")}
          className="
            absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
            p-3 bg-white rounded-full shadow-lg hover:shadow-xl
            transition-all duration-300 hover:scale-110
          "
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>
        
        {/* Carousel container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {forms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              showAdminControls={editingSection === title.toLowerCase()}
            />
          ))}
        </div>
        
        {/* Right scroll button */}
        <button
          onClick={() => scrollCarousel(scrollRef, "right")}
          className="
            absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
            p-3 bg-white rounded-full shadow-lg hover:shadow-xl
            transition-all duration-300 hover:scale-110
          "
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>
  );

  // Categories grid component
  const CategoriesGrid = () => (
    <div className="mb-12">
      <SectionHeader
        icon={<Grid3X3 />}
        title="Explore by Category"
        subtitle="Find the perfect template for your needs"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              setSelectedCategory(category.id);
              setShowExploreDrawer(true);
            }}
            className={`
              group relative overflow-hidden rounded-2xl p-8
              bg-gradient-to-br ${category.color}
              transform transition-all duration-500 hover:scale-105 hover:shadow-2xl
            `}
          >
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="text-white/80 mb-4 transform group-hover:scale-110 transition-transform duration-500">
                {React.cloneElement(category.icon, { size: 48 })}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
              <p className="text-white/80 text-sm">
                Explore {Math.floor(Math.random() * 20) + 5} templates
              </p>
            </div>
            
            <div className="absolute bottom-4 right-4 text-white/60 transform translate-x-2 group-hover:translate-x-0 transition-transform duration-500">
              <ChevronRight className="h-6 w-6" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Explore drawer component
  const ExploreDrawer = () => (
    <div
      className={`
        fixed inset-y-0 left-0 w-96 bg-white shadow-2xl z-50
        transform transition-transform duration-500 ease-out
        ${showExploreDrawer ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Browse Forms</h2>
            <button
              onClick={() => setShowExploreDrawer(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        
        {/* Categories */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Categories
          </h3>
          
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                transition-all duration-300
                ${selectedCategory === "all" 
                  ? "bg-purple-100 text-purple-700" 
                  : "hover:bg-gray-100 text-gray-700"}
              `}
            >
              <Layout className="h-5 w-5" />
              <span className="font-medium">All Templates</span>
            </button>
            
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                  transition-all duration-300
                  ${selectedCategory === category.id 
                    ? "bg-purple-100 text-purple-700" 
                    : "hover:bg-gray-100 text-gray-700"}
                `}
              >
                {React.cloneElement(category.icon, { size: 20 })}
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Forms Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Forms ({getFilteredForms(forms).length})
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            {getFilteredForms(forms).map((form) => (
              <div
                key={form.id}
                onClick={() => {
                  onUseTemplate(form);
                  setShowExploreDrawer(false);
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all duration-300 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                    {form.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                      {form.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {form.description || "No description available"}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {form.category}
                      </span>
                      {form.isPublic && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading amazing templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Admin mode toggle */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`
              px-6 py-3 rounded-full font-medium shadow-lg
              transform transition-all duration-300 hover:scale-105
              ${isAdminMode 
                ? "bg-purple-600 text-white" 
                : "bg-white text-purple-600 border-2 border-purple-600"}
            `}
          >
            {isAdminMode ? "Exit Admin Mode" : "Enter Admin Mode"}
          </button>
        </div>
      )}
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero section */}
        <HeroSection />
        
        {/* For You section */}
        <CarouselSection
          title="For You"
          subtitle="Personalized recommendations based on your interests"
          icon={<Sparkles />}
          forms={getFilteredForms(recommendedForms)}
          scrollRef={scrollRefs.recommended}
          showAdminEdit={true}
        />
        
        {/* Trending section */}
        <CarouselSection
          title="Trending Now"
          subtitle="Most popular templates this week"
          icon={<TrendingUp />}
          forms={getFilteredForms(trendingForms)}
          scrollRef={scrollRefs.trending}
        />
        
        {/* New Arrivals section */}
        <CarouselSection
          title="New Arrivals"
          subtitle="Fresh templates added recently"
          icon={<Clock />}
          forms={getFilteredForms(newForms)}
          scrollRef={scrollRefs.new}
        />
        
        {/* Categories grid */}
        <CategoriesGrid />
      </div>
      
      {/* Explore drawer */}
      <ExploreDrawer />
      
      {/* Overlay for drawer */}
      {showExploreDrawer && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowExploreDrawer(false)}
        />
      )}
    </div>
  );
};

export default EnhancedFormHub;