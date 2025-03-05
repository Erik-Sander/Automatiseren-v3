'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaCameraRetro, FaPause } from 'react-icons/fa';

interface PhotoRewardProps {
  show: boolean;
  onComplete: () => void;
  achievement: string;
}

// Verschillende foto's van Bram die willekeurig getoond kunnen worden
const PHOTO_PATHS = [
  '/images/personal/bram_foto.jpg',  // Vervang dit door de echte foto
];

const PhotoReward: React.FC<PhotoRewardProps> = ({ show, onComplete, achievement }) => {
  // Kies een willekeurige foto
  const [photoIndex] = useState(Math.floor(Math.random() * PHOTO_PATHS.length));
  const photoSrc = PHOTO_PATHS[photoIndex];
  
  // Controleer of de foto bestaat
  const [photoError, setPhotoError] = useState(false);
  
  // Automatisch sluiten na 6 seconden
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
          onClick={onComplete}
        >
          <motion.div 
            className="bg-white rounded-xl p-4 shadow-xl max-w-sm text-center"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
          >
            <div className="relative mb-3 overflow-hidden rounded-lg">
              {photoError ? (
                // Toon placeholder als de foto niet geladen kan worden
                <div className="w-full h-48 md:h-64 bg-gray-200 flex items-center justify-center">
                  <FaCameraRetro className="text-4xl text-gray-400" />
                </div>
              ) : (
                // Probeer de echte foto te laden
                <div className="w-full h-48 md:h-64 bg-gray-200 relative">
                  <Image 
                    src={photoSrc}
                    alt="Bram op de ski's"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg"
                    onError={() => setPhotoError(true)}
                  />
                </div>
              )}
              
              {/* Badge voor prestatie */}
              <div className="absolute top-2 right-2 bg-gold text-white rounded-full p-2">
                <FaTrophy className="text-xl" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-mountain mb-2">
              Geweldig, {achievement.includes('Bram') ? '' : 'Bram'}!
            </h3>
            
            <p className="text-lg mb-4">
              {achievement}
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-gray-500 border-t border-gray-200 pt-3">
              <FaPause />
              <span className="text-sm">Spel gepauzeerd</span>
            </div>
            
            <button 
              onClick={onComplete}
              className="mt-3 text-sm px-4 py-1 bg-mountain text-white rounded-full hover:bg-opacity-90 active:translate-y-0.5 transition-all w-full"
            >
              Doorgaan met spelen
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhotoReward; 