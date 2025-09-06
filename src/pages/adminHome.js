import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "../firebase";
import { signOut } from 'firebase/auth';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { 
  Users, 
  FileText, 
  Search, 
  Filter,
  Calendar,
  User,
  Mail,
  AlertCircle,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useToast } from "../components/Toast";
import Store from './store'; // Import the Store component

const AdminHome = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [formCreators, setFormCreators] = useState([]);
  const [adminForms, setAdminForms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formsCollapsed, setFormsCollapsed] = useState(false);

  // Fetch user forms for the Dashboard tab
  useEffect(() => {
    const fetchUserFormsData = async () => {
      try {
        if (!auth.currentUser) {
          console.error("No user authenticated");
          setLoading(false);
          return;
        }

        const currentAdminUid = auth.currentUser.uid;

        // Get all forms grouped by user
        const formsSnapshot = await getDocs(collection(db, "forms"));
        
        // Create a map to group forms by userId
        const formsByUser = {};
        
        formsSnapshot.forEach((formDoc) => {
          const formData = formDoc.data();
          const userId = formData.userId;

          if (!formsByUser[userId]) {
            formsByUser[userId] = [];
          }
          formsByUser[userId].push({
            id: formDoc.id,
            ...formData
          });
        });
        
        // Get all users
        const usersSnapshot = await getDocs(collection(db, "users"));
        
        const creators = [];
        
        // Match users with their forms
        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          const userId = userDoc.id; 

          // If this user is an admin, check if it matches the currently signed-in admin
          if (userData.adminStatus && userId === currentAdminUid) {
            // Set adminForms to only the forms belonging to the current admin
            setAdminForms(formsByUser[userId] || []);
            continue; // Skip adding admin to creators list
          }

          // For non-admin users, build up the creators array
          const userForms = formsByUser[userId] || [];
          creators.push({
            id: userId,
            ...userData,
            forms: userForms,
            totalForms: userForms.length
          });
        }
        
        setFormCreators(creators);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
        addToast("Failed to load user data", "error");
      }
    };

    fetchUserFormsData();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteForm = async (formId, isAdminForm = false) => {
    const confirmed = window.confirm('Are you sure you want to delete this form?');
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "forms", formId));
      
      if (isAdminForm) {
        setAdminForms(prev => prev.filter(form => form.id !== formId));
      } else {
        setFormCreators(prev => prev.map(creator => ({
          ...creator,
          forms: creator.forms.filter(form => form.id !== formId),
          totalForms: creator.forms.filter(form => form.id !== formId).length
        })));
      }
      
      addToast('Form deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting form:', error);
      addToast('Error deleting form', 'error');
    }
  };

  const handleGeneralFormClick = () => {
    if (!auth.currentUser) {
      addToast("No user authenticated", "error");
      return;
    }

    const formId = Date.now().toString();
    navigate(`/forms/${formId}`);
  };

  const handleCloneTemplate = async (template) => {
    if (!auth.currentUser) {
      addToast("Please sign in", "error");
      return;
    }

    const userId = auth.currentUser.uid;
    const newFormId = Date.now().toString();

    try {
      // Get original form data
      const formDocRef = doc(db, "forms", template.id);
      const formSnap = await getDoc(formDocRef);
      if (!formSnap.exists()) throw new Error("Form not found");
      const formData = { id: template.id, ...formSnap.data() };

      // Get questions if any
      const questionsCollRef = collection(formDocRef, "questions");
      const questionsSnap = await getDocs(questionsCollRef);
      const questions = questionsSnap.docs.map((docSnap) => ({
        id: parseInt(docSnap.id, 10),
        ...docSnap.data(),
      }));

      // Create cloned form with admin as owner
      const newFormData = {
        formType: formData.formType || "General Form",
        formTitle: `${formData.formTitle || "Untitled Form"} (Admin Copy)`,
        formDescription: formData.formDescription || "",
        formImage: formData.formImage || null,
        category: formData.category || "other",
        createdAt: new Date(),
        likes: 0,
        userId, // Set admin as the owner
        isAdminCopy: true
      };

      console.log("Creating new form with data:", newFormData); // Debug log

      await setDoc(doc(db, "forms", newFormId), newFormData);

      // Clone questions
      for (const question of questions) {
        await setDoc(doc(db, "forms", newFormId, "questions", question.id.toString()), {
          ...question,
        });
      }

      // Track download/clone
      if (formData.downloads !== undefined) {
        await updateDoc(formDocRef, { 
          downloads: formData.downloads + 1 
        });
      } else {
        await updateDoc(formDocRef, { downloads: 1 });
      }

      addToast("Template cloned successfully", "success");
      navigate(`/forms/${newFormId}`);
    } catch (error) {
      console.error("Error cloning template:", error);
      addToast("Failed to clone template", "error");
    }
  };

  // Filter creators based on search and status
  const filteredCreators = formCreators.filter(creator => {
    const matchesSearch = creator.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (creator.displayName && creator.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' 
      ? true 
      : filterStatus === 'active'
        ? creator.isActive 
        : !creator.isActive;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-white text-2xl font-extrabold tracking-wide">
                Quayo
              </span>
              <div className="ml-6 flex space-x-4">
                <span className="text-white text-sm font-medium bg-white/10 px-3 py-1 rounded-md">
                  Admin Panel
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">{auth.currentUser?.email}</div>
              <button
                onClick={handleSignOut}
                className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold text-sm hover:bg-blue-100 transition-colors duration-300"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="flex justify-center mt-6 mb-8">
        <div className="inline-flex bg-white rounded-full shadow-lg p-1 border border-gray-200">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`relative px-6 py-3 font-semibold text-lg rounded-full transition-all duration-300 transform ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md scale-105"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="relative z-10">Dashboard</span>
            {activeTab === "dashboard" && (
              <span className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-pulse"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("formhub")}
            className={`relative px-6 py-3 font-semibold text-lg rounded-full transition-all duration-300 transform ${
              activeTab === "formhub"
                ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-md scale-105"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="relative z-10">Form Hub</span>
            {activeTab === "formhub" && (
              <span className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {activeTab === 'dashboard' ? (
          <>
            {/* Admin's Forms Section with collapsible header */}
            <div className="mb-12">
              <div 
                className="bg-white rounded-t-xl shadow-sm p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setFormsCollapsed(!formsCollapsed)}
              >
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-500" />
                  Your Forms
                </h2>
                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGeneralFormClick();
                    }}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mr-4"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Create New Form</span>
                  </button>
                  <div className="p-2 bg-blue-50 rounded-full text-blue-500">
                    {formsCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                  </div>
                </div>
              </div>

              {!formsCollapsed && (
                <div className="bg-white rounded-b-xl shadow-sm p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {adminForms.map((form) => (
                      <div 
                        key={form.id}
                        className="bg-white rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-6 w-6 text-blue-500" />
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {form.formTitle || 'Untitled Form'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {form.formDescription || 'No description'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteForm(form.id, true);
                              }}
                              className="p-2 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <Trash2 className="h-5 w-5 text-red-500" />
                            </button>
                          </div>
                          
                          {form.createdAt && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                  Created: {form.createdAt.toDate?.().toLocaleDateString() || 'N/A'}
                                </span>
                                <button
                                  onClick={() => navigate(`/forms/${form.id}`)}
                                  className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                  Edit Form →
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {adminForms.length === 0 && (
                      <div className="col-span-3 bg-gray-50 rounded-xl p-8 text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No Forms Created Yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Get started by creating your first form
                        </p>
                        <button
                          onClick={handleGeneralFormClick}
                          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <Plus className="h-5 w-5" />
                          <span>Create New Form</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-100 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Total Users
                </h3>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500 mr-3" />
                  <span className="text-2xl font-bold">
                    {formCreators.length}
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-100 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Total Forms
                </h3>
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-500 mr-3" />
                  <span className="text-2xl font-bold">
                    {formCreators.reduce((total, creator) => total + creator.totalForms, 0)}
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-100 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Active Users
                </h3>
                <div className="flex items-center">
                  <User className="h-8 w-8 text-blue-500 mr-3" />
                  <span className="text-2xl font-bold">
                    {formCreators.filter(creator => creator.isActive).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                User Forms
              </h2>
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Filter className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        className="w-full pl-9 pr-4 py-2 border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All Users</option>
                        <option value="active">Active Users</option>
                        <option value="inactive">Inactive Users</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Creators Grid or No Results */}
            {filteredCreators.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCreators.map((creator) => (
                  <div 
                    key={creator.id} 
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:border-blue-100"
                  >
                    {/* Creator Header */}
                    <div className="p-6 border-b">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                              {creator.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <h3 className="font-semibold text-gray-900">
                              {creator.displayName || creator.email?.split('@')[0] || 'User'}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {creator.email || 'No email'}
                            </span>
                          </div>
                        </div>
                        <div 
                          className={`px-3 py-1 rounded-full text-sm ${
                            creator.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {creator.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="mt-4 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-600">
                            {creator.totalForms} Forms
                          </span>
                        </div>
                        {creator.createdAt && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-gray-600">
                              Joined {creator.createdAt.toDate?.().toLocaleDateString() || 'N/A'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Forms List */}
                    <div className="p-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                        <FileText className="h-4 w-4 mr-1 text-blue-500" />
                        Recent Forms
                      </h4>
                      {creator.forms.length > 0 ? (
                        <div className="space-y-3">
                          {creator.forms.slice(0, 3).map((form) => (
                            <div 
                              key={form.id}
                              className="relative flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                            >
                              <FileText className="h-5 w-5 text-blue-500 mt-1" />
                              <div className="flex-grow">
                                <h5 className="font-medium text-gray-900">
                                  {form.formTitle || 'Untitled Form'}
                                </h5>
                                <p className="text-sm text-gray-500">
                                  {form.formDescription || 'No description'}
                                </p>
                                {form.createdAt && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Created: {form.createdAt.toDate?.().toLocaleDateString() || 'N/A'}
                                  </p>
                                )}
                                
                                {/* View/Delete Actions */}
                                <div className="flex items-center space-x-3 mt-2">
                                  <button
                                    onClick={() => navigate(`/forms/${form.id}`)}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                  >
                                    View Form →
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteForm(form.id);
                                    }}
                                    className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2 text-gray-400 py-4 bg-gray-50 rounded-lg">
                          <AlertCircle className="h-5 w-5" />
                          <span>No forms created yet</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="h-16 w-16 text-gray-300 mb-6" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No Users Found
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    We couldn't find any users matching your current search criteria. Try adjusting your filters or search term.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('all');
                      }}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Form Hub Content - Using the simplified Store component */
          <Store 
            userForms={adminForms}
            onUseTemplate={handleCloneTemplate}
            addToast={addToast}
          />
        )}
      </div>
    </div>
  );
};

export default AdminHome;