'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaSkiing, FaMedal, FaPlay, FaGraduationCap, FaHeart } from 'react-icons/fa';

// Personalisatie voor Bram
const CHILD_NAME = "Bram";
const CHILD_AGE = 7;
const CHILD_SCHOOL = "Rietendakschool";
const CHILD_CITY = "Utrecht";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Welkomstberichten die afwisselend getoond kunnen worden
  const welcomeMessages = [
    `Hallo ${CHILD_NAME}! Klaar om te rekenen?`,
    `Welkom terug, ${CHILD_NAME}!`,
    `Ben je klaar voor een ski-avontuur, ${CHILD_NAME}?`,
    `Tijd om je rekenskills te oefenen, ${CHILD_NAME}!`
  ];
  
  // Kies een willekeurig welkomstbericht
  const [welcomeMessage] = useState(welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]);

  useEffect(() => {
    // Simuleer een korte laadtijd om de animaties te tonen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const startGame = () => {
    router.push('/game');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full mountain-bg">
      <div className="w-full max-w-md mx-auto px-4">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <FaSkiing className="text-8xl text-mountain" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-4 text-xl font-bold"
            >
              Laden...
            </motion.p>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="snow-container p-6 md:p-8 w-full text-center"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaSkiing className="text-5xl md:text-6xl mx-auto text-mountain mb-4" />
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Ski Rekenmeester</h1>
            
            {/* Persoonlijk welkomstbericht */}
            <h2 className="text-xl md:text-2xl text-mountain mb-4">
              {welcomeMessage}
            </h2>
            
            <p className="text-lg md:text-xl mb-6">
              Ga op ski-avontuur en train je rekenvaardigheden!
            </p>
            
            <div className="flex flex-col space-y-3">
              <motion.button
                onClick={startGame}
                className="btn-primary flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaPlay />
                <span>Start het spel</span>
              </motion.button>
              
              <div className="flex justify-between space-x-3">
                <motion.button
                  onClick={() => router.push('/highscores')}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaMedal />
                  <span>Topscores</span>
                </motion.button>
                
                <motion.button
                  onClick={() => router.push('/learning')}
                  className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaGraduationCap />
                  <span>Leren</span>
                </motion.button>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mt-8 flex items-center justify-center">
              <FaHeart className="text-red-500 mr-2" /> 
              <span>Gemaakt met liefde voor {CHILD_NAME} ({CHILD_AGE})</span>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
} 