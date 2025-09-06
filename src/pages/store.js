import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
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
  serverTimestamp,
} from "firebase/firestore";
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
  X,
  Loader,
  SlidersHorizontal,
  Menu,
  Download,
  Users,
  Play,
  ArrowRight,
  Zap,
  Target,
  PenTool,
} from "lucide-react";

const Store = ({
  pinnedForms = [],
  publicFormsPool = [],
  onUseTemplate,
  maxUserForms = 3,
  addToast,
  isSuperUser,
  onToggleHub,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Get current user email
  const userEmail = auth.currentUser?.email;
  
  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showExploreDrawer, setShowExploreDrawer] = useState(false);
  const [userLikes, setUserLikes] = useState({});
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  
  // Refs
  const featuredIntervalRef = useRef(null);
  const filterMenuRef = useRef(null);
  const lastManualNavigationRef = useRef(0);

  // Check if user is admin
  const isAdmin = userEmail === "aaronjeet.ss@gmail.com" || userEmail === "joelbiju04@gmail.com";

  // Categories with beautiful icons and colors
  const categories = [
    { 
      id: "general", 
      name: "General Knowledge", 
      icon: <BookOpen size={20} />, 
      color: "from-blue-500 to-cyan-500", 
      bgColor: "bg-blue-50", 
      iconColor: "text-blue-600",
      description: "Test your general knowledge"
    },
    { 
      id: "educational", 
      name: "Educational", 
      icon: <GraduationCap size={20} />, 
      color: "from-purple-500 to-pink-500", 
      bgColor: "bg-purple-50", 
      iconColor: "text-purple-600",
      description: "Academic and learning focused"
    },
    { 
      id: "training", 
      name: "Training", 
      icon: <Target size={20} />, 
      color: "from-green-500 to-emerald-500", 
      bgColor: "bg-green-50", 
      iconColor: "text-green-600",
      description: "Professional development"
    },
    { 
      id: "certification", 
      name: "Certification", 
      icon: <Award size={20} />, 
      color: "from-yellow-500 to-orange-500", 
      bgColor: "bg-yellow-50", 
      iconColor: "text-yellow-600",
      description: "Certification preparation"
    },
    { 
      id: "skillbuilding", 
      name: "Skill Building", 
      icon: <Brain size={20} />, 
      color: "from-red-500 to-rose-500", 
      bgColor: "bg-red-50", 
      iconColor: "text-red-600",
      description: "Enhance your abilities"
    },
    { 
      id: "other", 
      name: "Fun & Others", 
      icon: <Sparkles size={20} />, 
      color: "from-indigo-500 to-purple-500", 
      bgColor: "bg-indigo-50", 
      iconColor: "text-indigo-600",
      description: "Entertainment and more"
    },
  ];

  // Shuffle forms for random distribution
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Remove duplicates based on form ID
  const removeDuplicates = (array) => {
    const seen = new Set();
    return array.filter(form => {
      if (seen.has(form.id)) {
        return false;
      }
      seen.add(form.id);
      return true;
    });
  };

  // HYBRID DATA-SOURCING MODEL: Intelligent section population with pinned forms + random fill
  const sectionsData = useMemo(() => {
    console.log("Computing sections data with:", {
      pinnedForms: pinnedForms.length,
      publicPool: publicFormsPool.length
    });

    if (pinnedForms.length === 0 && publicFormsPool.length === 0) {
      return {
        featured: [],
        forYou: [],
        trending: [],
        newArrivals: []
      };
    }

    // Combine all forms for processing
    const allAvailableForms = [...pinnedForms, ...publicFormsPool];

    // Helper function to populate a section
    const populateSection = (sectionId, targetSize, sortCriteria) => {
      // Step 1: Get forms pinned to this specific section
      const pinned = pinnedForms.filter(form => form.pinnedToSection === sectionId);
      
      // Step 2: Get public forms and sort them according to criteria
      let availablePublic = [...publicFormsPool];
      
      switch (sortCriteria) {
        case 'likes':
          availablePublic.sort((a, b) => (b.likes || 0) - (a.likes || 0));
          break;
        case 'downloads':
          availablePublic.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
          break;
        case 'newest':
          availablePublic.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return dateB - dateA;
          });
          break;
        case 'random':
        default:
          availablePublic = shuffleArray(availablePublic);
      }

      // Step 3: Combine pinned (priority) + public to fill remaining slots
      const combined = [...pinned, ...availablePublic];
      
      // Step 4: Remove duplicates and slice to target size
      const result = removeDuplicates(combined).slice(0, targetSize);
      
      console.log(`Section ${sectionId}:`, {
        pinned: pinned.length,
        available: availablePublic.length,
        final: result.length,
        targetSize
      });
      
      return result;
    };

    return {
      featured: populateSection('featured', 4, 'likes'), // Featured: pinned + most liked
      trending: populateSection('trending', 8, 'downloads'), // Trending: pinned + most downloaded  
      forYou: populateSection('forYou', 6, 'random'), // For You: pinned + random selection
      newArrivals: populateSection('newArrivals', 8, 'newest') // New: pinned + newest
    };
  }, [pinnedForms, publicFormsPool]);

  // Set loading to false once data is processed
  useEffect(() => {
    setLoading(false);
  }, [sectionsData]);

  // Featured carousel rotation with proper manual navigation support
  useEffect(() => {
    if (sectionsData.featured.length > 1) {
      const startInterval = () => {
        featuredIntervalRef.current = setInterval(() => {
          // Only auto-advance if no recent manual navigation
          const timeSinceManual = Date.now() - lastManualNavigationRef.current;
          if (timeSinceManual > 8000) { // 8 seconds after manual navigation
            setFeaturedIndex((prev) => (prev + 1) % sectionsData.featured.length);
          }
        }, 6000);
      };
      
      startInterval();
      
      return () => {
        if (featuredIntervalRef.current) {
          clearInterval(featuredIntervalRef.current);
        }
      };
    }
  }, [sectionsData.featured.length]);

  // 🎯 FIX 1: Improved carousel navigation handlers
  const handlePrevious = useCallback(() => {
    if (sectionsData.featured.length <= 1) return;
    
    console.log('Previous button clicked, current index:', featuredIndex);
    
    // Clear interval and record manual navigation
    if (featuredIntervalRef.current) {
      clearInterval(featuredIntervalRef.current);
    }
    lastManualNavigationRef.current = Date.now();
    
    setFeaturedIndex(prev => {
      const newIndex = prev === 0 ? sectionsData.featured.length - 1 : prev - 1;
      console.log('Setting new index:', newIndex);
      return newIndex;
    });
    
    // Restart interval after delay
    setTimeout(() => {
      if (sectionsData.featured.length > 1) {
        featuredIntervalRef.current = setInterval(() => {
          const timeSinceManual = Date.now() - lastManualNavigationRef.current;
          if (timeSinceManual > 8000) {
            setFeaturedIndex((prev) => (prev + 1) % sectionsData.featured.length);
          }
        }, 6000);
      }
    }, 100);
  }, [sectionsData.featured.length]); // Removed featuredIndex from dependencies

  const handleNext = useCallback(() => {
    if (sectionsData.featured.length <= 1) return;
    
    console.log('Next button clicked, current index:', featuredIndex);
    
    // Clear interval and record manual navigation
    if (featuredIntervalRef.current) {
      clearInterval(featuredIntervalRef.current);
    }
    lastManualNavigationRef.current = Date.now();
    
    setFeaturedIndex(prev => {
      const newIndex = (prev + 1) % sectionsData.featured.length;
      console.log('Setting new index:', newIndex);
      return newIndex;
    });
    
    // Restart interval after delay
    setTimeout(() => {
      if (sectionsData.featured.length > 1) {
        featuredIntervalRef.current = setInterval(() => {
          const timeSinceManual = Date.now() - lastManualNavigationRef.current;
          if (timeSinceManual > 8000) {
            setFeaturedIndex((prev) => (prev + 1) % sectionsData.featured.length);
          }
        }, 6000);
      }
    }, 100);
  }, [sectionsData.featured.length]); // Removed featuredIndex from dependencies

  const handleDotClick = useCallback((index) => {
    if (sectionsData.featured.length <= 1) return;
    
    console.log('Dot clicked, index:', index, 'current index:', featuredIndex);
    
    // Clear interval and record manual navigation
    if (featuredIntervalRef.current) {
      clearInterval(featuredIntervalRef.current);
    }
    lastManualNavigationRef.current = Date.now();
    
    setFeaturedIndex(index);
    
    // Restart interval after delay
    setTimeout(() => {
      if (sectionsData.featured.length > 1) {
        featuredIntervalRef.current = setInterval(() => {
          const timeSinceManual = Date.now() - lastManualNavigationRef.current;
          if (timeSinceManual > 8000) {
            setFeaturedIndex((prev) => (prev + 1) % sectionsData.featured.length);
          }
        }, 6000);
      }
    }, 100);
  }, [sectionsData.featured.length]); // Removed featuredIndex from dependencies

  // Load user likes from Firebase
  useEffect(() => {
    if (!auth.currentUser) return;

    const allForms = [...pinnedForms, ...publicFormsPool];
    if (allForms.length === 0) return;

    const loadUserLikes = async () => {
      const likesData = {};
      
      for (const form of allForms) {
        try {
          const likeRef = doc(db, "forms", form.id, "likes", auth.currentUser.uid);
          const likeSnap = await getDoc(likeRef);
          likesData[form.id] = likeSnap.exists();
        } catch (error) {
          console.error("Error loading like for form:", form.id, error);
          likesData[form.id] = false;
        }
      }
      
      setUserLikes(likesData);
    };

    loadUserLikes();
  }, [pinnedForms, publicFormsPool]);

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
        addToast("Removed from favorites", "info");
      } else {
        await setDoc(likeRef, { likedAt: serverTimestamp() });
        await updateDoc(formRef, { likes: currentLikes + 1 });
        setUserLikes(prev => ({ ...prev, [formId]: true }));
        addToast("Added to favorites", "success");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      addToast("Failed to update like", "error");
    }
  };

  // Filter and sort forms for explore functionality
  const getFilteredForms = () => {
    const allForms = [...pinnedForms, ...publicFormsPool];
    let filtered = allForms.filter((form) => {
      const matchesSearch = searchTerm === "" || 
        (form.formTitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (form.formDescription || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || form.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        break;
      case "oldest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateA - dateB;
        });
        break;
      case "popular":
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
    }

    return removeDuplicates(filtered);
  };

  // Get category color scheme
  const getCategoryScheme = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category || categories[5]; // Default to 'other' if not found
  };

  // Featured section with enhanced design
  const FeaturedSection = () => {
    if (sectionsData.featured.length === 0) return null;
    
    const currentForm = sectionsData.featured[featuredIndex];
    const categoryScheme = getCategoryScheme(currentForm.category);
    
    return (
      <div className="mb-12 relative">
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 rounded-2xl overflow-hidden shadow-2xl relative">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white opacity-10 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-white opacity-5 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white opacity-5 animate-spin duration-20000"></div>
          </div>
          
          <div 
            key={featuredIndex} 
            className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center min-h-[400px] carousel-content"
          >
            <div className="md:w-3/5 text-white mb-8 md:mb-0 md:pr-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 text-white text-sm font-medium mb-6 rounded-full backdrop-blur-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 animate-pulse" />
                Featured Template
                <Sparkles className="h-4 w-4 text-yellow-300" />
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {currentForm.formTitle || "Untitled Form"}
              </h3>
              
              <p className="text-lg mb-6 opacity-90 leading-relaxed">
                {currentForm.formDescription || "A premium form template ready for you to use and customize. Create engaging quizzes and forms with this beautifully designed template."}
              </p>
              
              <div className="flex items-center space-x-6 mb-8">
                <button
                  onClick={() => handleLike(currentForm.id)}
                  className="flex items-center text-white hover:text-red-300 transition-all duration-300 group"
                >
                  <Heart
                    className={`h-5 w-5 mr-2 transition-all duration-300 group-hover:scale-110 ${
                      userLikes[currentForm.id] ? "fill-current text-red-300" : ""
                    }`}
                  />
                  <span className="font-medium">{currentForm.likes || 0} likes</span>
                </button>
                <div className="flex items-center text-white opacity-80">
                  <Download className="h-5 w-5 mr-2" />
                  <span className="font-medium">{currentForm.downloads || 0} uses</span>
                </div>
                <div className="flex items-center text-white opacity-80">
                  <Users className="h-5 w-5 mr-2" />
                  <span className="font-medium capitalize">{currentForm.category || "other"}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => onUseTemplate(currentForm)}
                  className="bg-white text-purple-700 px-8 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
                >
                  <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Use This Template
                </button>
                <button
                  onClick={() => navigate(`/quiz-overview/${currentForm.id}`)}
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-purple-700 transition-all duration-300 flex items-center justify-center group backdrop-blur-sm transform hover:-translate-y-1 active:scale-95"
                >
                  <Eye className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  Preview
                </button>
              </div>
            </div>
            
            <div className="md:w-2/5 relative">
              <div 
                key={`preview-${featuredIndex}`} 
                className="bg-white rounded-2xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-500 backdrop-blur-sm bg-opacity-95 carousel-transition"
              >
                <div className="aspect-w-4 aspect-h-3 bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden h-48">
                  {currentForm.formImage ? (
                    <img
                      src={currentForm.formImage}
                      alt="Template preview"
                      className="object-cover w-full h-full rounded-xl transition-transform duration-500 hover:scale-110"
                    />
                  ) : (
                    <div className={`flex items-center justify-center h-full w-full bg-gradient-to-r ${categoryScheme.color} rounded-xl`}>
                      <div className="text-white/40 transform scale-[4] animate-pulse">
                        {categoryScheme.icon}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span className={`px-3 py-1 rounded-full ${categoryScheme.bgColor} ${categoryScheme.iconColor} font-medium capitalize flex items-center`}>
                    <span className="mr-1">{React.cloneElement(categoryScheme.icon, { size: 14 })}</span>
                    {currentForm.category || "other"}
                  </span>
                  <button
                    onClick={() => navigate(`/quiz-overview/${currentForm.id}`)}
                    className="text-purple-600 hover:text-purple-700 font-bold flex items-center group transition-all duration-300"
                  >
                    Preview 
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
              
              {/* Floating action indicators */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center animate-bounce">
                <Zap className="h-3 w-3 mr-1" />
                Hot
              </div>
            </div>
          </div>
          
          {/* 🎯 FIX 1: Improved Navigation dots with better click handling */}
          {sectionsData.featured.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex justify-center gap-3 z-20">
              {sectionsData.featured.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDotClick(index);
                  }}
                  className={`transition-all duration-500 rounded-full hover:scale-125 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 ${
                    index === featuredIndex 
                      ? "w-8 h-3 bg-white shadow-lg" 
                      : "w-3 h-3 bg-white bg-opacity-60 hover:bg-opacity-90"
                  }`}
                  style={{ zIndex: 60 }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* 🎯 FIX 1: Improved Manual navigation arrows with better positioning & click handling */}
          {sectionsData.featured.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 z-20 shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                style={{ zIndex: 60 }}
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-4 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 z-20 shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                style={{ zIndex: 60 }}
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // 🎭 FIX 2: Enhanced form card component with smooth hover transitions
  const FormCard = ({ form, index = 0, sectionId = "default" }) => {
    const categoryScheme = getCategoryScheme(form.category);
    const uniqueCardId = `${sectionId}-${form.id}`;
    const isHovered = hoveredCard === uniqueCardId;
    
    return (
      <div 
        className="backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 overflow-hidden transition-all duration-500 hover:shadow-2xl group relative transform hover:-translate-y-2 hover:scale-105"
        onMouseEnter={() => setHoveredCard(uniqueCardId)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          animationDelay: `${index * 100}ms`
        }}
      >
        {/* Hover glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${categoryScheme.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-xl`}></div>
        
        <div 
          className={`h-40 w-full flex items-center justify-center cursor-pointer relative overflow-hidden ${
            form.formImage ? "" : `bg-gradient-to-r ${categoryScheme.color}`
          }`}
          onClick={() => navigate(`/quiz-overview/${form.id}`)}
        >
          {form.formImage ? (
            <img
              src={form.formImage}
              alt={form.formTitle || "Form"}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="text-white/40 transform scale-[3] transition-all duration-500 group-hover:scale-[3.5] group-hover:text-white/60">
              {categoryScheme.icon}
            </div>
          )}
          
          {/* 🎭 FIX 2: Improved overlay with smooth transitions */}
          <div 
            className={`absolute inset-0 bg-black flex items-center justify-center transition-all duration-500 ease-out ${
              isHovered ? "bg-opacity-60" : "bg-opacity-0 pointer-events-none"
            }`}
          >
            <div 
              className={`flex gap-3 transition-all duration-500 ease-out transform ${
                isHovered 
                  ? "translate-y-0 opacity-100 scale-100" 
                  : "translate-y-8 opacity-0 scale-90 pointer-events-none"
              }`}
              style={{
                transitionDelay: isHovered ? '150ms' : '0ms'
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/quiz-overview/${form.id}`);
                }}
                className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center shadow-lg backdrop-blur-sm"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUseTemplate(form);
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center shadow-lg backdrop-blur-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Use
              </button>
            </div>
          </div>

          {/* Category badge */}
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-full ${categoryScheme.bgColor} ${categoryScheme.iconColor} text-xs font-medium flex items-center transition-all duration-300 transform ${
            isHovered ? "scale-110" : "scale-100"
          }`}>
            <span className="mr-1">{React.cloneElement(categoryScheme.icon, { size: 12 })}</span>
            {form.category || "other"}
          </div>

          {/* Pin indicator for pinned forms */}
          {form.pinnedToSection && (
            <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center animate-pulse">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Pinned
            </div>
          )}
        </div>
        
        <div className="p-5 relative z-10">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg text-gray-800 line-clamp-1 group-hover:text-indigo-700 transition-colors duration-300">
              {form.formTitle || "Untitled Form"}
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10 leading-relaxed">
            {form.formDescription || "No description available"}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {form.createdAt?.toDate
                ? new Date(form.createdAt.toDate()).toLocaleDateString()
                : "Recently"}
            </span>
            <span className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              {form.downloads || 0} uses
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 bg-opacity-50 backdrop-blur-sm p-4 flex justify-between items-center border-t border-gray-100 relative z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike(form.id);
            }}
            className="flex items-center text-gray-600 hover:text-red-500 transition-all duration-300 group/like transform hover:scale-105 active:scale-95"
          >
            <Heart className={`h-4 w-4 mr-2 transition-all duration-300 group-hover/like:scale-110 ${
              userLikes[form.id] ? "fill-red-500 text-red-500" : ""
            }`} />
            <span className="text-sm font-medium">{form.likes || 0}</span>
          </button>
          <div className="flex items-center text-sm text-gray-500">
            <Eye className="h-4 w-4 mr-1" />
            <span>{form.downloads || 0}</span>
          </div>
        </div>
      </div>
    );
  };

  // Section component with staggered animations and unique card IDs
  const Section = ({ title, icon, forms, description, sectionId = "default" }) => (
    <div className="mb-12">
      <div className="flex items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white shadow-lg">
            {icon}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {forms.map((form, index) => (
          <FormCard key={`${sectionId}-${form.id}`} form={form} index={index} sectionId={sectionId} />
        ))}
      </div>
    </div>
  );

// Skeleton Loading Component CMONN
const SkeletonCard = () => (
  <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
        <div className="h-4 bg-gray-200 rounded mb-2 w-2/3"></div>
        <div className="flex items-center gap-4 mt-2">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
          <div className="h-3 bg-gray-200 rounded w-14"></div>
        </div>
      </div>
    </div>
    <div className="flex gap-2 mt-3">
      <div className="flex-1 h-8 bg-gray-200 rounded"></div>
      <div className="flex-1 h-8 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const ExploreDrawer = React.memo(({
  showExploreDrawer,
  setShowExploreDrawer,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  selectedCategory,
  setSelectedCategory,
  categories,
  allForms,
  getCategoryScheme,
  navigate,
  onUseTemplate
}) => {
  // earch input that never re-renders
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Initialize search when drawer opens
  useEffect(() => {
    if (showExploreDrawer) {
      setLocalSearchTerm(searchTerm);
      setDebouncedSearchTerm(searchTerm);
    }
  }, [showExploreDrawer, searchTerm]);

  // 🔍 FIXED: Improved debounced search with loading state
  const handleSearchChange = useCallback((value) => {
    setLocalSearchTerm(value);
    setIsSearching(true);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
      setSearchTerm(value);
      setIsSearching(false);
    }, 300);
  }, [setSearchTerm]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Stable filtering logic
  const getFilteredForms = useCallback(() => {
    let filtered = allForms.filter((form) => {
      const matchesSearch = debouncedSearchTerm === "" || 
        (form.formTitle || "").toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (form.formDescription || "").toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || form.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        break;
      case "oldest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateA - dateB;
        });
        break;
      case "popular":
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
    }

    return filtered;
  }, [allForms, debouncedSearchTerm, selectedCategory, sortBy]);

  const filteredForms = getFilteredForms();
  
  return (
    <>
      {/* 🎭 FIXED: Improved backdrop transition with ease-in-out */}
      <div
        className={`fixed inset-0 bg-black z-[90] transition-opacity duration-400 ease-in-out ${
          showExploreDrawer ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowExploreDrawer(false)}
      />
      
      {/* 🎭 FIXED: Smooth drawer slide transition with proper ease-in-out */}
      <div
        className={`fixed inset-y-0 left-0 w-96 bg-white shadow-2xl z-[100] transform transition-transform duration-400 ease-in-out ${
          showExploreDrawer ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header - STABLE SECTION */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Explore Forms</h2>
              <button
                onClick={() => setShowExploreDrawer(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 hover:scale-110 active:scale-95"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            {/* Search Component foxus redcy */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search forms..."
                value={localSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                autoComplete="off"
                autoFocus={showExploreDrawer}
              />
              {/* Loading indicator */}
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader className="h-4 w-4 text-purple-500 animate-spin" />
                </div>
              )}
            </div>
            
            {/* Sort options - STABLE */}
            <div className="mt-4 flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
          
          {/* Categories - STABLE SECTION */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Categories
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                  selectedCategory === "all"
                    ? "bg-purple-100 text-purple-700 shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Templates
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                    selectedCategory === category.id
                      ? `${category.bgColor} ${category.iconColor} shadow-sm`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Results - DYNAMIC SECTION WITH SKELETON LOADING */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                {isSearching ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  `${filteredForms.length} Results`
                )}
              </h3>
              
              <div className="space-y-4">
                {/* FIXED: Show skeleton loading while searching */}
                {isSearching ? (
                  <>
                    {[...Array(6)].map((_, index) => (
                      <SkeletonCard key={`skeleton-${index}`} />
                    ))}
                  </>
                ) : (
                  <>
                    {/* Actual results wivth staggered animations */}
                    {filteredForms.map((form, index) => {
                      const categoryScheme = getCategoryScheme(form.category);
                      
                      return (
                        <div
                          key={form.id}
                          className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200 cursor-pointer group hover:shadow-md hover:scale-[1.02] animate-fadeInUp"
                          style={{ animationDelay: `${index * 50}ms` }}
                          onClick={() => {
                            setShowExploreDrawer(false);
                            navigate(`/quiz-overview/${form.id}`);
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${categoryScheme.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                              <div className="text-white">
                                {categoryScheme.icon}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-200">
                                  {form.formTitle || "Untitled Form"}
                                </h4>
                                {form.pinnedToSection && (
                                  <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center ml-2 animate-pulse">
                                    <Star className="h-3 w-3 mr-1 fill-current" />
                                    Pinned
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {form.formDescription || "No description"}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="capitalize">{form.category || "other"}</span>
                                <span>•</span>
                                <span>{form.likes || 0} likes</span>
                                <span>•</span>
                                <span>{form.downloads || 0} uses</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUseTemplate(form);
                                setShowExploreDrawer(false);
                              }}
                              className="flex-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
                            >
                              Use Template
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/quiz-overview/${form.id}`);
                                setShowExploreDrawer(false);
                              }}
                              className="flex-1 px-3 py-1.5 border border-purple-600 text-purple-600 text-sm rounded-lg hover:bg-purple-50 transition-all duration-200 transform hover:scale-105 active:scale-95"
                            >
                              Preview
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* nO FORM state */}
                    {filteredForms.length === 0 && !isSearching && (
                      <div className="text-center py-8 text-gray-500 animate-fadeInUp">
                        <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No forms found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.showExploreDrawer === nextProps.showExploreDrawer &&
    prevProps.sortBy === nextProps.sortBy &&
    prevProps.selectedCategory === nextProps.selectedCategory &&
    JSON.stringify(prevProps.allForms) === JSON.stringify(nextProps.allForms) &&
    prevProps.categories === nextProps.categories
  );
});

ExploreDrawer.displayName = 'ExploreDrawer';

  const CategoriesGrid = () => {
    const allForms = [...pinnedForms, ...publicFormsPool];
    
    return (
      <div className="mb-12">
        <div className="flex items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white shadow-lg">
              <Grid3X3 size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Explore by Category</h2>
              <p className="text-gray-600 mt-1">Find the perfect template for your needs</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const categoryFormCount = allForms.filter(f => f.category === category.id).length;
            
            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setShowExploreDrawer(true);
                }}
                className="group relative overflow-hidden rounded-2xl p-8 bg-white backdrop-blur-md bg-opacity-60 border border-white border-opacity-20 shadow-lg hover:shadow-2xl transform transition-all duration-500 hover:-translate-y-2 hover:scale-105"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`p-6 rounded-full ${category.bgColor} mb-6 transform group-hover:scale-110 transition-all duration-500 group-hover:rotate-6`}>
                    <div className={category.iconColor}>
                      {React.cloneElement(category.icon, { size: 40 })}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-700 transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  <p className="text-sm font-medium text-gray-500">
                    {categoryFormCount} template{categoryFormCount !== 1 ? 's' : ''} available
                  </p>
                </div>
                
                <div className="absolute bottom-4 right-4 text-gray-400 transform translate-x-2 group-hover:translate-x-0 transition-transform duration-500">
                  <ChevronRight className="h-6 w-6" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Form Hub...</p>
          <p className="text-gray-500 text-sm mt-2">Discovering amazing templates for you</p>
        </div>
      </div>
    );
  }

  // Empty state - need a helpful message for admins
  if (pinnedForms.length === 0 && publicFormsPool.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 p-8 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center animate-pulse">
            <Grid3X3 className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">
            No Forms in Hub Yet
          </h3>
          <p className="text-gray-600 mb-4">
            {isAdmin 
              ? "As an admin, you can add forms to the hub from the 'My Forms' tab or Admin Panel by clicking the 'Add to Hub' button on any form."
              : "Forms will appear here once they are added to the hub. Check back later for amazing templates!"}
          </p>
          {isAdmin && (
            <button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors"
            >
              Go to My Forms
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in-up {
          animation: slideInUp 0.6s ease-out forwards;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out forwards;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .duration-20000 {
          animation-duration: 20s;
        }

        /* Custom skeleton pulse animation */
        @keyframes skeleton-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        
        .animate-pulse {
          animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes carouselSlide {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .carousel-content {
          animation: carouselSlide 0.5s ease-out;
        }

        .carousel-transition {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Top action bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search amazing templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-10 pr-4 border border-white border-opacity-40 rounded-xl bg-white bg-opacity-30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-300"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
          </div>
          <button
            onClick={() => setShowExploreDrawer(true)}
            className="p-3 bg-white bg-opacity-30 backdrop-blur-md border border-white border-opacity-40 rounded-xl hover:bg-opacity-40 text-gray-800 transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="md:hidden">Filters</span>
          </button>
          <button
            onClick={() => setShowExploreDrawer(true)}
            className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
          >
            <Menu className="h-5 w-5" />
            <span>Browse All</span>
          </button>
        </div>
      </div>
      
      {/* Featured section */}
      {sectionsData.featured.length > 0 && <FeaturedSection />}
      
      {/* For You section */}
      {sectionsData.forYou.length > 0 && (
        <Section
          title="For You"
          icon={<Sparkles size={24} />}
          forms={sectionsData.forYou}
          description="Personalized recommendations based on your interests"
          sectionId="forYou"
        />
      )}
      
      {/* Trending section */}
      {sectionsData.trending.length > 0 && (
        <Section
          title="Trending Now"
          icon={<TrendingUp size={24} />}
          forms={sectionsData.trending}
          description="Most popular templates this week"
          sectionId="trending"
        />
      )}
      
      {/* New Arrivals section */}
      {sectionsData.newArrivals.length > 0 && (
        <Section
          title="New Arrivals"
          icon={<Clock size={24} />}
          forms={sectionsData.newArrivals}
          description="Fresh templates just added to the hub"
          sectionId="newArrivals"
        />
      )}
      
      {/* Categories grid */}
      <CategoriesGrid />
      
      {/* Explore drawer */}
      <ExploreDrawer 
        showExploreDrawer={showExploreDrawer}
        setShowExploreDrawer={setShowExploreDrawer}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        allForms={[...pinnedForms, ...publicFormsPool]}
        getCategoryScheme={getCategoryScheme}
        navigate={navigate}
        onUseTemplate={onUseTemplate}
      />
    </div>
  );
};

export default Store;