import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { deleteUser } from "firebase/auth";
import { getUserData, deleteUserAccount } from "../services/userService";
import { useToast } from "../components/Toast";
import { 
  User, 
  Mail, 
  Calendar, 
  Trash2, 
  ArrowLeft, 
  Shield, 
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const UserProfile = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (auth.currentUser) {
        try {
          const data = await getUserData(auth.currentUser.uid);
          setUserData(data);
        } catch (error) {
          console.error("Error loading user data:", error);
          addToast("Failed to load user data", "error");
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    };
    loadUserData();
  }, [navigate, addToast]);

  const handleBackClick = () => {
    navigate("/home");
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;
    
    setDeleting(true);
    try {
      // Delete user data from Firestore using the service
      await deleteUserAccount(auth.currentUser.uid);
      
      // Delete the user account
      await deleteUser(auth.currentUser);
      
      addToast("Account deleted successfully", "success");
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      if (error.code === "auth/requires-recent-login") {
        addToast("Please sign in again to delete your account", "error");
      } else {
        addToast("Failed to delete account", "error");
      }
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-x-hidden">
      {/* Background Elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur-3xl"></div>
      <div className="absolute top-1/3 -left-40 w-96 h-96 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-15 blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 opacity-15 blur-3xl"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBackClick}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
            <div className="flex items-center">
              <div className="h-20 w-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-6">
                <User className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {userData?.displayName || "User"}
                </h2>
                <div className="flex items-center text-white text-opacity-90">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-300" />
                  <span>Account Active</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{auth.currentUser?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-900">
                      {userData?.createdAt ? 
                        new Date(userData.createdAt.toDate()).toLocaleDateString() : 
                        "Recently"
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Subscription Status</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {userData?.subscriptionStatus || "Free"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">Account Type</h3>
                  <p className="text-sm text-blue-700">
                    {userData?.role === 'admin' ? 'Administrator' : 'Standard User'}
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-900 mb-2">Last Login</h3>
                  <p className="text-sm text-green-700">
                    {userData?.lastLoginAt ? 
                      new Date(userData.lastLoginAt.toDate()).toLocaleString() : 
                      "Recently"
                    }
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-medium text-purple-900 mb-2">Provider</h3>
                  <p className="text-sm text-purple-700 capitalize">
                    {userData?.provider || "Email/Password"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Danger Zone
            </h3>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Delete Account</h4>
                <p className="text-gray-600 text-sm">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete your account? All your data, forms, and settings will be permanently removed.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
