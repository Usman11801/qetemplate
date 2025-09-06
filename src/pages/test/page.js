import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, Star, Lock } from 'lucide-react';

const Counter = () => {
  const [count, setCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const navigate = useNavigate();

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    
    if (newCount > 3 && !showUpgradeModal) {
      setShowUpgradeModal(true);
    }
  };

  const handleUpgrade = () => {
    navigate('/payment');
  };

  const handleCloseModal = () => {
    setShowUpgradeModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Feature Counter</h1>
          <p className="text-gray-600">
            This is a test page demonstrating Stripe integration. The counter below can only be incremented to 3 in the free tier.
          </p>
        </div>

        {/* Counter Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-gray-800">Your Counter</h2>
              <div className="flex items-center">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Free Tier
                </span>
              </div>
            </div>

            {/* Counter Display */}
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-6xl font-bold mb-6 text-blue-600">{count}</div>
              <button
                onClick={handleIncrement}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                <Plus size={20} />
                <span>Increment Counter</span>
              </button>
              
              {count > 3 && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-amber-800">Counter Limit Reached</h3>
                    <p className="text-amber-700 text-sm mt-1">
                      You've reached the maximum count (3) for the free tier. Upgrade to premium for unlimited counts!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feature Comparison */}
          <div className="bg-gray-50 p-6 border-t border-gray-100">
            <h3 className="font-medium text-gray-900 mb-4">Features</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Basic Counting</span>
                </div>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Count up to 3</span>
                </div>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Unlimited Counting</span>
                </div>
                <span className="text-gray-400">Premium</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Advanced Statistics</span>
                </div>
                <span className="text-gray-400">Premium</span>
              </div>
            </div>
            
            <button
              onClick={handleUpgrade}
              className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <Star className="h-5 w-5" />
              <span>Upgrade to Premium</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden transform transition-all animate-pop-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Upgrade to Premium</h3>
                <button 
                  onClick={handleCloseModal}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center p-4 bg-blue-50 rounded-lg mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">You've reached the limit!</h4>
                  <p className="text-blue-700 text-sm">
                    Upgrade to premium to access unlimited counting and more features.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Unlimited counters & counting</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Detailed analytics & exports</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Priority support</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="mb-4 flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">$9.99</span>
                <span className="text-gray-600 ml-1">/month</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Custom styles for animation */}
      <style jsx>{`
        @keyframes pop-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
          animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default Counter;