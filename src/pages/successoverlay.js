// Create a new component file named SuccessOverlay.js

import React, { useEffect } from "react";
import { motion } from "framer-motion"; // Make sure framer-motion is installed
import { CheckCircle } from "lucide-react";

const SuccessOverlay = ({ show, message, onClose }) => {
  useEffect(() => {
    if (show) {
      // Automatically close after 2.5 seconds
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-white rounded-xl shadow-lg max-w-sm w-full mx-4 overflow-hidden"
      >
        <div className="p-6 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: [0.5, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="text-green-500 mb-4"
          >
            <CheckCircle size={64} />
          </motion.div>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
            Success!
          </h3>
          
          <p className="text-gray-600 text-center mb-4">
            {message}
          </p>
          
          <motion.div 
            className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5 }}
          >
            <div className="h-full bg-green-500"></div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessOverlay;