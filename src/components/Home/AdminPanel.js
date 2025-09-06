import React, { useState, useRef } from "react";
import { auth } from "../../firebase";
import {
  FileText,
  Grid,
  List,
  Eye,
  Copy,
  CheckSquare,
  Search,
  SlidersHorizontal,
  Clock,
  Heart,
  Download,
  Settings,
  Star,
  RefreshCw,
  TrendingUp,
  Users,
  Activity,
  Sparkles,
  Pin,
  Target,
  Award,
  BookOpen,
  GraduationCap,
  Briefcase,
  Brain,
} from "lucide-react";

const AdminPanel = ({
  allForms,
  pinnedForms,
  publicFormsPool,
  handleToggleHub,
  handlePinToSection,
  handleDelete,
  handleDuplicateForm,
  loadMoreForms,
  hasMore,
  addToast,
  navigate,
}) => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredFormId, setHoveredFormId] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all"); // all, inHub, notInHub, pinned
  const [showPinMenu, setShowPinMenu] = useState(null);

  const filterMenuRef = useRef(null);
  const pinMenuRef = useRef(null);

  const categories = [
    "other",
    "general",
    "educational",
    "training",
    "certification",
    "skillbuilding",
  ];

  const sections = [
    { id: "featured", name: "Featured", icon: <Star className="h-4 w-4" />, color: "text-yellow-600", bgColor: "bg-yellow-50" },
    { id: "trending", name: "Trending", icon: <TrendingUp className="h-4 w-4" />, color: "text-green-600", bgColor: "bg-green-50" },
    { id: "forYou", name: "For You", icon: <Sparkles className="h-4 w-4" />, color: "text-purple-600", bgColor: "bg-purple-50" },
    { id: "newArrivals", name: "New Arrivals", icon: <Clock className="h-4 w-4" />, color: "text-blue-600", bgColor: "bg-blue-50" },
  ];

  // Handle click outside to close menus
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (pinMenuRef.current && !pinMenuRef.current.contains(event.target)) {
        setShowPinMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calculate enhanced statistics
  const stats = {
    totalForms: allForms.length,
    hubForms: allForms.filter(f => f.isInHub === true).length,
    pinnedForms: pinnedForms.length,
    totalLikes: allForms.reduce((sum, form) => sum + (form.likes || 0), 0),
    totalDownloads: allForms.reduce((sum, form) => sum + (form.downloads || 0), 0),
    activeUsers: new Set(allForms.map(f => f.userId)).size,
    recentForms: allForms.filter(f => {
      const createdAt = f.createdAt?.toDate ? f.createdAt.toDate() : new Date(f.createdAt || 0);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return createdAt > oneWeekAgo;
    }).length,
    sectionStats: sections.reduce((acc, section) => {
      acc[section.id] = allForms.filter(f => f.pinnedToSection === section.id).length;
      return acc;
    }, {}),
  };

  // Get category color scheme
  const getCategoryColor = (category) => {
    const colors = {
      general: "bg-blue-100 text-blue-800 border-blue-300",
      educational: "bg-purple-100 text-purple-800 border-purple-300",
      training: "bg-green-100 text-green-800 border-green-300",
      certification: "bg-yellow-100 text-yellow-800 border-yellow-300",
      skillbuilding: "bg-pink-100 text-pink-800 border-pink-300",
      other: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[category] || colors.other;
  };

  // Get random accent color for form cards
  const getRandomAccentColor = (id) => {
    const colors = [
      "from-purple-600 to-pink-600",
      "from-indigo-600 to-blue-600",
      "from-teal-600 to-cyan-600",
      "from-amber-600 to-orange-600",
      "from-pink-600 to-red-600",
      "from-blue-600 to-indigo-600",
    ];
    const index = parseInt(id.slice(-1), 16) % colors.length;
    return colors[index];
  };

  // Enhanced filter and sort forms
  const filteredAndSortedForms = (forms) =>
    forms
      .filter((form) => {
        const matchesSearch =
          (form.formTitle || "Untitled Form")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (form.formDescription || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" || form.category === selectedCategory;
        const matchesHubFilter =
          selectedFilter === "all" ||
          (selectedFilter === "inHub" && form.isInHub === true) ||
          (selectedFilter === "notInHub" && form.isInHub !== true) ||
          (selectedFilter === "pinned" && form.pinnedToSection);
        return matchesSearch && matchesCategory && matchesHubFilter;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return (
            new Date(b.createdAt?.toDate?.() || b.createdAt) -
            new Date(a.createdAt?.toDate?.() || a.createdAt)
          );
        } else if (sortBy === "oldest") {
          return (
            new Date(a.createdAt?.toDate?.() || a.createdAt) -
            new Date(b.createdAt?.toDate?.() || b.createdAt)
          );
        } else if (sortBy === "alphabetical") {
          return (a.formTitle || "Untitled Form").localeCompare(
            b.formTitle || "Untitled Form"
          );
        } else if (sortBy === "popularity") {
          return (b.likes || 0) - (a.likes || 0);
        } else if (sortBy === "downloads") {
          return (b.downloads || 0) - (a.downloads || 0);
        }
        return 0;
      });

  // Quick action button component
  const QuickActionButton = ({
    icon,
    label,
    onClick,
    color = "bg-white bg-opacity-20 hover:bg-opacity-30 text-white",
  }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-full ${color} transition-all duration-200 flex items-center justify-center tooltip-container backdrop-blur-sm transform hover:scale-110 active:scale-95`}
    >
      {icon}
      <span className="tooltip">{label}</span>
    </button>
  );

  // Export hub data function
  const exportHubData = () => {
    const exportData = {
      hubForms: allForms.filter(f => f.isInHub === true),
      pinnedForms: pinnedForms,
      sectionBreakdown: sections.reduce((acc, section) => {
        acc[section.id] = allForms.filter(f => f.pinnedToSection === section.id);
        return acc;
      }, {}),
      statistics: stats,
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `form-hub-data-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    addToast("Hub data exported successfully", "success");
  };

  // Pin form to section handler
  const handlePinFormToSection = async (formId, sectionId) => {
    try {
      await handlePinToSection(formId, sectionId);
      setShowPinMenu(null);
      
      if (sectionId) {
        const sectionName = sections.find(s => s.id === sectionId)?.name;
        addToast(`Form pinned to ${sectionName} section`, "success");
      } else {
        addToast("Pin removed from form", "info");
      }
    } catch (error) {
      addToast("Failed to pin form to section", "error");
    }
  };

  return (
    <>
      <style jsx>{`
        .tooltip-container {
          position: relative;
        }
        .tooltip {
          visibility: hidden;
          position: absolute;
          top: -35px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.9);
          color: white;
          text-align: center;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.3s, visibility 0.3s;
          z-index: 1000;
        }
        .tooltip::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: rgba(0, 0, 0, 0.9) transparent transparent transparent;
        }
        .tooltip-container:hover .tooltip {
          visibility: visible;
          opacity: 1;
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
        .card-hover-effect {
          transform: translateY(0) scale(1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover-effect:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>

      {/* Admin Dashboard Header */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800 inline-flex items-center">
        <span>Admin Dashboard</span>
        <div className="ml-2 relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur opacity-30 pulse-animation"></div>
          <div className="relative bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full w-2 h-2"></div>
        </div>
      </h2>
      
      {/* Enhanced Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
        <div className="backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 p-4 card-hover-effect">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Forms</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalForms}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 p-4 card-hover-effect">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">In Hub</p>
              <p className="text-xl font-bold text-gray-900">{stats.hubForms}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <Grid className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 p-4 card-hover-effect">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Pinned</p>
              <p className="text-xl font-bold text-gray-900">{stats.pinnedForms}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <Pin className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 p-4 card-hover-effect">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Likes</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalLikes}</p>
            </div>
            <div className="p-2 bg-pink-100 rounded-full">
              <Heart className="h-4 w-4 text-pink-600" />
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 p-4 card-hover-effect">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Downloads</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalDownloads}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <Download className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 p-4 card-hover-effect">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Active Users</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-full">
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 p-4 card-hover-effect">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Recent</p>
              <p className="text-xl font-bold text-gray-900">{stats.recentForms}</p>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-full">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 p-4 card-hover-effect">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Avg Rating</p>
              <p className="text-xl font-bold text-gray-900">4.8</p>
              <p className="text-xs text-gray-500">User feedback</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-full">
              <Star className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Section Breakdown */}
      <div className="backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 p-6 mb-8 card-hover-effect">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-purple-600" />
          Action Breakdown 
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((section) => (
            <div key={section.id} className={`${section.bgColor} rounded-lg p-4 text-center`}>
              <div className={`flex items-center justify-center mb-2 ${section.color}`}>
                {section.icon}
                <span className="ml-2 font-medium">{section.name}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.sectionStats[section.id] || 0}</p>
              <p className="text-xs text-gray-600">pinned forms</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Enhanced Quick Actions */}
      <div className="backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 p-6 mb-8 card-hover-effect">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-purple-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={exportHubData}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Download className="h-5 w-5" />
            Export Data
          </button>
          
          <button
            onClick={() => {
              addToast("Analytics feature coming soon", "info");
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Star className="h-5 w-5" />
            Analytics
          </button>
          
          <button
            onClick={() => {
              addToast("Bulk actions feature coming soon", "info");
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <CheckSquare className="h-5 w-5" />
            Bulk Actions
          </button>
          
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <RefreshCw className="h-5 w-5" />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Forms Management Section */}
      <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
        <Settings className="h-6 w-6 mr-2 text-purple-600" />
        Forms Management
      </h3>
      
      {/* Enhanced Search and Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search all forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-white border-opacity-40 rounded-lg bg-white bg-opacity-30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          </div>
          <div className="flex gap-2">
            {/* Enhanced Hub filter buttons */}
            <div className="flex bg-white bg-opacity-30 backdrop-blur-md border border-white border-opacity-40 rounded-lg overflow-hidden">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedFilter === "all"
                    ? "bg-purple-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter("inHub")}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedFilter === "inHub"
                    ? "bg-green-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                In Hub
              </button>
              <button
                onClick={() => setSelectedFilter("pinned")}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedFilter === "pinned"
                    ? "bg-yellow-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pinned
              </button>
              <button
                onClick={() => setSelectedFilter("notInHub")}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedFilter === "notInHub"
                    ? "bg-gray-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                Not in Hub
              </button>
            </div>
            
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 bg-white bg-opacity-30 backdrop-blur-md border border-white border-opacity-40 rounded-lg hover:bg-opacity-40 text-gray-800 transition-all duration-300 hover:scale-105"
            >
              {viewMode === "grid" ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
            </button>
            
            <div className="relative" ref={filterMenuRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="p-2 bg-white bg-opacity-30 backdrop-blur-md border border-white border-opacity-40 rounded-lg hover:bg-opacity-40 text-gray-800 transition-all duration-300 hover:scale-105"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white bg-opacity-90 backdrop-blur-md border border-gray-200 rounded-lg shadow-xl z-20 p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Sort by</h4>
                  <div className="space-y-2 mb-4">
                    {["newest", "oldest", "alphabetical", "popularity", "downloads"].map((option) => (
                      <div key={option} className="flex items-center">
                        <input
                          type="radio"
                          id={option}
                          name="sortBy"
                          checked={sortBy === option}
                          onChange={() => setSortBy(option)}
                          className="h-4 w-4 text-purple-600"
                        />
                        <label
                          htmlFor={option}
                          className="ml-2 text-sm text-gray-700 capitalize cursor-pointer"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">Category</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="all-categories"
                        name="category"
                        checked={selectedCategory === "all"}
                        onChange={() => setSelectedCategory("all")}
                        className="h-4 w-4 text-purple-600"
                      />
                      <label htmlFor="all-categories" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        All categories
                      </label>
                    </div>
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          type="radio"
                          id={`admin-${category}`}
                          name="category"
                          checked={selectedCategory === category}
                          onChange={() => setSelectedCategory(category)}
                          className="h-4 w-4 text-purple-600"
                        />
                        <label
                          htmlFor={`admin-${category}`}
                          className="ml-2 text-sm text-gray-700 capitalize cursor-pointer"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Forms Display */}
      {allForms.length === 0 ? (
        <div className="backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 p-8 text-center card-hover-effect">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center pulse-animation">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">No forms available</h3>
          <p className="text-gray-600 mb-6">There are no forms in the database.</p>
        </div>
      ) : (
        <>
          {filteredAndSortedForms(allForms).length === 0 ? (
            <div className="backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 p-8 text-center">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">No matching forms</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedForms(allForms).map((form) => {
                const {
                  id,
                  formImage,
                  formTitle,
                  formDescription,
                  createdAt,
                  category,
                  isInHub,
                  pinnedToSection,
                  userId,
                } = form;
                const isHovered = hoveredFormId === id;
                return (
                  <div
                    key={id}
                    className="relative backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 overflow-hidden transition-all duration-300 hover:shadow-xl group card-hover-effect"
                    onMouseEnter={() => setHoveredFormId(id)}
                    onMouseLeave={() => setHoveredFormId(null)}
                  >
                    <div
                      className={`h-32 w-full flex items-center justify-center cursor-pointer relative ${
                        formImage
                          ? ""
                          : `bg-gradient-to-r ${getRandomAccentColor(id)}`
                      }`}
                      onClick={() => navigate(`/forms/${id}`)}
                    >
                      {formImage ? (
                        <img
                          src={formImage}
                          alt={formTitle || "Form"}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <FileText className="h-12 w-12 text-white opacity-80 group-hover:opacity-100 transition-all duration-300" />
                      )}
                      
                      {/* Enhanced hover overlay */}
                      <div
                        className={`absolute top-2 right-2 flex items-center space-x-2 transition-all duration-200 ${
                          isHovered
                            ? "opacity-100 transform translate-y-0"
                            : "opacity-0 transform -translate-y-2"
                        }`}
                      >
                        <div className="relative group/button">
                          <QuickActionButton
                            icon={<Eye className="h-4 w-4" />}
                            label="Preview"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/quiz-overview/${id}`);
                            }}
                          />
                        </div>
                        <div className="relative group/button">
                          <QuickActionButton
                            icon={<Copy className="h-4 w-4" />}
                            label="Duplicate"
                            color="bg-blue-500 bg-opacity-70 hover:bg-opacity-80 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateForm(form);
                            }}
                          />
                        </div>
                        <div className="relative group/button">
                          <QuickActionButton
                            icon={<CheckSquare className="h-4 w-4" />}
                            label={isInHub ? "Remove from Hub" : "Add to Hub"}
                            color={isInHub 
                              ? "bg-red-500 bg-opacity-70 hover:bg-opacity-80 text-white"
                              : "bg-green-500 bg-opacity-70 hover:bg-opacity-80 text-white"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleHub(id, isInHub);
                            }}
                          />
                        </div>
                        {isInHub && (
                          <div className="relative group/button">
                            <QuickActionButton
                              icon={<Pin className="h-4 w-4" />}
                              label="Pin to Section"
                              color="bg-yellow-500 bg-opacity-70 hover:bg-opacity-80 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowPinMenu(showPinMenu === id ? null : id);
                              }}
                            />
                            {showPinMenu === id && (
                              <div className="absolute top-full right-0 mt-2 w-48 bg-white bg-opacity-95 backdrop-blur-md border border-gray-200 rounded-lg shadow-xl z-30 p-2">
                                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-2">
                                  Pin to Section
                                </h4>
                                {sections.map((section) => (
                                  <button
                                    key={section.id}
                                    onClick={() => handlePinFormToSection(id, section.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                      pinnedToSection === section.id
                                        ? "bg-purple-100 text-purple-700"
                                        : "hover:bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    <span className={section.color}>{section.icon}</span>
                                    {section.name}
                                    {pinnedToSection === section.id && (
                                      <Star className="h-3 w-3 ml-auto text-yellow-500 fill-current" />
                                    )}
                                  </button>
                                ))}
                                {pinnedToSection && (
                                  <button
                                    onClick={() => handlePinFormToSection(id, null)}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-200 mt-2"
                                  >
                                    Remove Pin
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Enhanced status indicators */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {isInHub && (
                          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center animate-pulse">
                            <Sparkles className="h-3 w-3 mr-1" />
                            In Hub
                          </div>
                        )}
                        {pinnedToSection && (
                          <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <Pin className="h-3 w-3 mr-1" />
                            {sections.find(s => s.id === pinnedToSection)?.name}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => navigate(`/forms/${id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg text-gray-800 line-clamp-1 group-hover:text-indigo-700 transition-colors">
                          {formTitle || "Untitled Form"}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
                        {formDescription || "No description."}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span
                          className={`px-2 py-1 rounded-full border ${getCategoryColor(
                            category
                          )}`}
                        >
                          {category
                            ? category.charAt(0).toUpperCase() + category.slice(1)
                            : "Other"}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {createdAt?.toDate
                            ? new Date(createdAt.toDate()).toLocaleDateString()
                            : new Date(createdAt).toLocaleDateString() || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {form.likes || 0} likes
                        </span>
                        <span className="flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          {form.downloads || 0} downloads
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 bg-opacity-50 backdrop-blur-sm p-3 flex justify-between items-center border-t border-gray-100">
                      <button
                        className="text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors duration-200 flex items-center hover:scale-105 active:scale-95"
                        onClick={() => navigate(`/forms/${id}`)}
                      >
                        View <Eye className="h-3 w-3 ml-1" />
                      </button>
                      <button
                        className="text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors duration-200 flex items-center hover:scale-105 active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateForm(form);
                        }}
                      >
                        Duplicate <Copy className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Enhanced List view implementation
            <div className="space-y-4">
              {filteredAndSortedForms(allForms).map((form) => {
                const {
                  id,
                  formImage,
                  formTitle,
                  formDescription,
                  createdAt,
                  category,
                  isInHub,
                  pinnedToSection,
                  userId,
                } = form;
                return (
                  <div
                    key={id}
                    className="relative backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 p-4 hover:shadow-xl transition-all duration-300 group card-hover-effect"
                    onMouseEnter={() => setHoveredFormId(id)}
                    onMouseLeave={() => setHoveredFormId(null)}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer ${
                          formImage
                            ? ""
                            : `bg-gradient-to-r ${getRandomAccentColor(id)}`
                        }`}
                        onClick={() => navigate(`/forms/${id}`)}
                      >
                        {formImage ? (
                          <img
                            src={formImage}
                            alt={formTitle || "Form"}
                            className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <FileText className="h-8 w-8 text-white opacity-80 group-hover:opacity-100 transition-all duration-300" />
                        )}
                      </div>
                      
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => navigate(`/forms/${id}`)}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg text-gray-800 group-hover:text-indigo-700 transition-colors">
                            {formTitle || "Untitled Form"}
                          </h3>
                          <div className="flex items-center gap-2">
                            {isInHub && (
                              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                                <Sparkles className="h-3 w-3 mr-1" />
                                In Hub
                              </div>
                            )}
                            {pinnedToSection && (
                              <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                                <Pin className="h-3 w-3 mr-1" />
                                {sections.find(s => s.id === pinnedToSection)?.name}
                              </div>
                            )}
                            <span
                              className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(
                                category
                              )}`}
                            >
                              {category
                                ? category.charAt(0).toUpperCase() + category.slice(1)
                                : "Other"}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 my-2 line-clamp-2">
                          {formDescription || "No description."}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {createdAt?.toDate
                              ? new Date(createdAt.toDate()).toLocaleString()
                              : new Date(createdAt).toLocaleString() || "N/A"}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              {form.likes || 0}
                            </span>
                            <span className="flex items-center">
                              <Download className="h-3 w-3 mr-1" />
                              {form.downloads || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="relative group">
                          <button
                            onClick={() => navigate(`/forms/${id}`)}
                            className="p-2 bg-indigo-100 hover:bg-indigo-200 rounded-full text-indigo-600 transition-all duration-200 hover:scale-110 active:scale-95"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="relative group">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateForm(form);
                            }}
                            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full text-blue-600 transition-all duration-200 hover:scale-110 active:scale-95"
                          >
                            <Copy className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="relative group">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleHub(id, isInHub);
                            }}
                            className={`p-2 ${
                              isInHub 
                                ? "bg-red-100 hover:bg-red-200 text-red-600" 
                                : "bg-green-100 hover:bg-green-200 text-green-600"
                            } rounded-full transition-all duration-200 hover:scale-110 active:scale-95`}
                          >
                            <CheckSquare className="h-5 w-5" />
                          </button>
                        </div>
                        {isInHub && (
                          <div className="relative group">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowPinMenu(showPinMenu === id ? null : id);
                              }}
                              className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-600 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                            >
                              <Pin className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Load More Button */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMoreForms}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-95"
              >
                Load More Forms
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default AdminPanel;