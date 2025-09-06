import React, { useState, useRef } from "react";
import { auth } from "../../firebase";
import {
  FileText,
  Trash,
  Plus,
  Grid,
  List,
  Eye,
  Edit,
  Share2,
  Search,
  SlidersHorizontal,
  Clock,
  CheckSquare,
  Copy,
  Sparkles,
  Pin,
  Star,
  TrendingUp,
} from "lucide-react";

const MyFormsSection = ({
  userForms,
  handleGeneralFormClick,
  handleDelete,
  handleDuplicateForm,
  handleToggleHub,
  handlePinToSection, // Add this prop
  isAdmin,
  addToast,
  navigate,
}) => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredFormId, setHoveredFormId] = useState(null);
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

  // Filter and sort forms
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
        return matchesSearch && matchesCategory;
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
        }
        return 0;
      });

  // Pin form to section handler
  const handlePinFormToSection = async (formId, sectionId) => {
    if (!handlePinToSection) {
      addToast("Pin functionality not available", "error");
      return;
    }
    
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

      {/* Create New Form Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div
          className="backdrop-blur-md bg-white bg-opacity-30 rounded-xl shadow-lg border border-white border-opacity-20 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 w-full md:w-auto group card-hover-effect"
          onClick={handleGeneralFormClick}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-xl text-gray-900 group-hover:text-indigo-700 transition-colors">
                Create a New Form
              </h3>
              <p className="text-sm text-gray-700">
                Start building a new blank form from scratch
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-white border-opacity-40 rounded-lg bg-white bg-opacity-30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-300"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          </div>
          <div className="flex gap-2">
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
                <div className="absolute right-0 mt-2 w-64 bg-white bg-opacity-90 backdrop-blur-md border border-gray-200 rounded-lg shadow-xl z-20 p-4 animate-in slide-in-from-top-2 duration-200">
                  <h4 className="font-medium text-gray-800 mb-2">Sort by</h4>
                  <div className="space-y-2 mb-4">
                    {["newest", "oldest", "alphabetical"].map((option) => (
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
                        id="all"
                        name="category"
                        checked={selectedCategory === "all"}
                        onChange={() => setSelectedCategory("all")}
                        className="h-4 w-4 text-purple-600"
                      />
                      <label htmlFor="all" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        All categories
                      </label>
                    </div>
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          type="radio"
                          id={category}
                          name="category"
                          checked={selectedCategory === category}
                          onChange={() => setSelectedCategory(category)}
                          className="h-4 w-4 text-purple-600"
                        />
                        <label
                          htmlFor={category}
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

      {/* Forms Section Header */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800 inline-flex items-center">
        <span>Your Forms</span>
        <div className="ml-2 relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur opacity-30 pulse-animation"></div>
          <div className="relative bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full w-2 h-2"></div>
        </div>
        <span className="ml-3 text-sm font-normal text-gray-600">
          ({userForms.length}/3 forms)
        </span>
      </h2>

      {/* Forms Display */}
      {userForms.length === 0 ? (
        <div className="backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 p-8 text-center card-hover-effect">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center pulse-animation">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">No forms yet</h3>
          <p className="text-gray-600 mb-6">Create your first form to get started!</p>
          <button
            onClick={handleGeneralFormClick}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center mx-auto shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-95"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Form
          </button>
        </div>
      ) : (
        <>
          {filteredAndSortedForms(userForms).length === 0 ? (
            <div className="backdrop-blur-md bg-white bg-opacity-40 rounded-xl shadow-lg border border-white border-opacity-20 p-8 text-center">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">No matching forms</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedForms(userForms).map((form) => {
                const {
                  id,
                  formImage,
                  formTitle,
                  formDescription,
                  createdAt,
                  category,
                  isInHub,
                  pinnedToSection,
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
                      
                      {/* Hover overlay with animations */}
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
                            icon={<Edit className="h-4 w-4" />}
                            label="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/forms/${id}`);
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
                            icon={<Trash className="h-4 w-4" />}
                            label="Delete"
                            color="bg-red-500 bg-opacity-70 hover:bg-opacity-80 text-white"
                            onClick={(e) => handleDelete(e, id)}
                          />
                        </div>
                        {isAdmin && form.userId === auth.currentUser.uid && (
                          <>
                            <div className="relative group/button">
                              <QuickActionButton
                                icon={<CheckSquare className="h-4 w-4" />}
                                label={isInHub ? "Remove from Hub" : "Add to Hub"}
                                color={
                                  isInHub
                                    ? "bg-red-500 bg-opacity-70 hover:bg-opacity-80 text-white"
                                    : "bg-green-500 bg-opacity-70 hover:bg-opacity-80 text-white"
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleHub(id, isInHub);
                                }}
                              />
                            </div>
                            {isInHub && handlePinToSection && (
                              <div className="relative group/button" ref={pinMenuRef}>
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
                          </>
                        )}
                      </div>

                      {/* Hub indicator */}
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
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(
                            category
                          )}`}
                        >
                          {category
                            ? category.charAt(0).toUpperCase() + category.slice(1)
                            : "Other"}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {createdAt?.toDate
                            ? new Date(createdAt.toDate()).toLocaleDateString()
                            : new Date(createdAt).toLocaleDateString() || "N/A"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 bg-opacity-50 backdrop-blur-sm p-3 flex justify-between items-center border-t border-gray-100">
                      <button
                        className="text-indigo-600 text-sm font-medium hover:text-indigo-800 transition-colors duration-200 flex items-center hover:scale-105 active:scale-95"
                        onClick={() => navigate(`/forms/${id}`)}
                      >
                        Edit <Edit className="h-3 w-3 ml-1" />
                      </button>
                      <button
                        className="text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors duration-200 flex items-center hover:scale-105 active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToast("Share feature coming soon", "info");
                        }}
                      >
                        Share <Share2 className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // List view implementation
            <div className="space-y-4">
              {filteredAndSortedForms(userForms).map((form) => {
                const {
                  id,
                  formImage,
                  formTitle,
                  formDescription,
                  createdAt,
                  category,
                  isInHub,
                  pinnedToSection,
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
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {createdAt?.toDate
                            ? new Date(createdAt.toDate()).toLocaleString()
                            : new Date(createdAt).toLocaleString() || "N/A"}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="relative group">
                          <button
                            onClick={() => navigate(`/forms/${id}`)}
                            className="p-2 bg-indigo-100 hover:bg-indigo-200 rounded-full text-indigo-600 transition-all duration-200 hover:scale-110 active:scale-95"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="relative group">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/quiz-overview/${id}`);
                            }}
                            className="p-2 bg-purple-100 hover:bg-purple-200 rounded-full text-purple-600 transition-all duration-200 hover:scale-110 active:scale-95"
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
                            onClick={(e) => handleDelete(e, id)}
                            className="p-2 bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition-all duration-200 hover:scale-110 active:scale-95"
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                        {isAdmin && form.userId === auth.currentUser.uid && (
                          <>
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
                            {isInHub && handlePinToSection && (
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
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default MyFormsSection;