import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50"
    >
      <div className="text-center">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl mb-6 mx-auto w-fit"
        >
          <MapPin className="h-8 w-8 text-white" />
        </motion.div>
        
        <motion.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl font-bold text-white mb-2"
        >
          CivicMap
        </motion.h2>
        
        <motion.p
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white/60"
        >
          Loading your civic platform...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;