import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { getUserData } from "../services/userService";
import { useToast } from "../components/Toast";
import { 
  Settings, 
  Bell, 
  Palette, 
  CreditCard, 
  ArrowLeft, 
  CheckCircle,
  XCircle,
  Crown,
  Zap,
  Lock,
  Globe
} from "lucide-react";

const UserSettings = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [privacy, setPrivacy] = useState('public');

  useEffect(() => {
    const loadUserData = async () => {
      if (auth.currentUser) {
        try {
          const data = await getUserData(auth.currentUser.uid);
          setUserData(data);
          
          // Load user settings
          if (data.settings) {
            setNotifications(data.settings.notifications ?? true);
            setTheme(data.settings.theme ?? 'light');
            setLanguage(data.settings.language ?? 'en');
            setPrivacy(data.settings.privacy ?? 'public');
          }
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

  const handleSaveSettings = async () => {
    if (!auth.currentUser) return;
    
    setSaving(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        settings: {
          notifications,
          theme,
          language,
          privacy,
          updatedAt: new Date()
        }
      });
      
      addToast("Settings saved successfully", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      addToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpgradeSubscription = () => {
    navigate("/payment");
  };

  const handleManageSubscription = () => {
    // This would typically redirect to Stripe customer portal
    addToast("Subscription management coming soon", "info");
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Customize your experience and manage your subscription</p>
        </div>

        {/* Subscription Management */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center">
                  <Crown className="h-6 w-6 mr-2" />
                  Subscription Management
                </h2>
                <p className="text-purple-100">
                  Current Plan: <span className="font-semibold capitalize">{userData?.subscriptionStatus || 'Free'}</span>
                </p>
              </div>
              <div className="text-right">
                {userData?.subscriptionStatus === 'active' ? (
                  <div className="flex items-center text-green-300">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center text-yellow-300">
                    <XCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm">Free Plan</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Current Features
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Up to 3 forms</li>
                    <li>• Basic analytics</li>
                    <li>• Standard support</li>
                    {userData?.subscriptionStatus === 'active' && (
                      <>
                        <li>• Unlimited forms</li>
                        <li>• Advanced analytics</li>
                        <li>• Priority support</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                {userData?.subscriptionStatus === 'active' ? (
                  <button
                    onClick={handleManageSubscription}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </button>
                ) : (
                  <button
                    onClick={handleUpgradeSubscription}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center justify-center"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Premium
                  </button>
                )}
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {userData?.subscriptionStatus === 'active' 
                      ? "Your premium subscription is active"
                      : "Unlock unlimited features with premium"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              General Settings
            </h3>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-indigo-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive updates about your forms and account</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Palette className="h-5 w-5 text-purple-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Theme</h4>
                  <p className="text-sm text-gray-600">Choose your preferred color scheme</p>
                </div>
              </div>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Language</h4>
                  <p className="text-sm text-gray-600">Select your preferred language</p>
                </div>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            {/* Privacy */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Privacy Level</h4>
                  <p className="text-sm text-gray-600">Control who can see your forms</p>
                </div>
              </div>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="friends">Friends Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
