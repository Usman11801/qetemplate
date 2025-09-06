import React from "react";
import { auth } from "../../firebase";
import {
  User,
  LogOut,
  Settings,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

const Header = ({ 
  userData, 
  isProfileMenuOpen, 
  setIsProfileMenuOpen, 
  profileMenuRef, 
  handleSignOut 
}) => {
  return (
    <header className="relative z-20 shadow-lg">
      <div className="bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur opacity-70 animate-pulse"></div>
                  <span className="relative text-white text-2xl font-extrabold tracking-wide z-10">
                    Qemplate
                  </span>
                </div>
                <div className="ml-2 relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur opacity-60 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full w-2 h-2"></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-white bg-white bg-opacity-10 hover:bg-opacity-20 px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-600">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium hidden md:block">
                    {userData?.displayName ||
                      auth.currentUser?.email?.split("@")[0] ||
                      "User"}
                  </span>
                  <ChevronDown className="h-4 w-4 hidden md:block" />
                </button>
                
                {isProfileMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white bg-opacity-90 backdrop-blur-md border border-white border-opacity-20 ring-1 ring-black ring-opacity-5"
                    style={{ 
                      zIndex: 999,
                      animation: "dropdownFade 0.2s ease-out forwards",
                      transformOrigin: "top right"
                    }}
                  >
                    <div className="border-b border-gray-100 py-2 px-4">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {userData?.displayName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {auth.currentUser?.email}
                      </p>
                    </div>
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 transition-all duration-200 flex items-center"
                    >
                      <User className="h-4 w-4 mr-2 text-indigo-500" />
                      Your Profile
                    </a>
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 transition-all duration-200 flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-2 text-indigo-500" />
                      Settings
                    </a>
                    <a
                      href="#help"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 transition-all duration-200 flex items-center"
                    >
                      <HelpCircle className="h-4 w-4 mr-2 text-indigo-500" />
                      Help & Support
                    </a>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-200 flex items-center border-t border-gray-100 mt-1"
                    >
                      <LogOut className="h-4 w-4 mr-2 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
      
      <style jsx>{`
        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </header>
  );
};

export default Header;