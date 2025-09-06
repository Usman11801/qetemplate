import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Star, Sparkles } from 'lucide-react';

const SuccessPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  
  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/'); // Redirect to homepage or previous page
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [navigate]);
  
  const handleContinue = () => {
    navigate('/'); // Redirect to homepage or previous page
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      {/* Animated success card */}
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-500 relative">
        {/* Confetti-like elements in background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full bg-${['blue', 'purple', 'pink', 'yellow', 'green'][i % 5]}-${[300, 400, 500][i % 3]} animate-float-${i % 5 + 1}`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0.6,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Top Section with Check Mark */}
        <div className="text-center p-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 animate-success-pop">
            <Check className="h-10 w-10 text-green-500" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-indigo-100">
            Thank you for upgrading to premium!
          </p>
        </div>
        
        {/* Success details */}
        <div className="p-6">
          <div className="mb-6 flex items-center justify-center space-x-1">
            <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
            <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
            <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
            <Star className="h-6 w-6 text-yellow-500" fill="currentColor" />
            <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
              Your Premium Subscription is Active!
            </h3>
            <p className="text-gray-600 text-center">
              You now have unlimited access to all premium features.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg mb-6">
            <div className="flex">
              <Sparkles className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-800">Your account has been upgraded</h4>
                <p className="text-sm text-green-700 mt-1">
                  All premium features have been unlocked. Enjoy unlimited counting!
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
          >
            <span>Continue to App</span>
            <ChevronRight size={18} />
          </button>
          
          <p className="text-center text-gray-500 text-sm mt-4">
            Auto-redirecting in {countdown} seconds...
          </p>
        </div>
      </div>
      
      {/* Order summary card */}
      <div className="max-w-md w-full mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-gray-700 font-medium mb-3">Order Summary</h3>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600">Premium Subscription</span>
          <span className="font-medium">$9.99/month</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Billing Cycle</span>
          <span>Monthly</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Next Billing Date</span>
          <span>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between py-2 font-medium text-blue-600 mt-2">
          <span>Receipt</span>
          <span className="underline cursor-pointer">View Details</span>
        </div>
      </div>
      
      {/* Animation styles */}
      <style jsx>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(180deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(-180deg); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-40px) rotate(90deg); }
        }
        @keyframes float-4 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-90deg); }
        }
        @keyframes float-5 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(45deg); }
        }
        
        .animate-float-1 { animation: float-1 3s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 3.5s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 4s ease-in-out infinite; }
        .animate-float-4 { animation: float-4 4.5s ease-in-out infinite; }
        .animate-float-5 { animation: float-5 5s ease-in-out infinite; }
        
        @keyframes success-pop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-success-pop {
          animation: success-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default SuccessPage;