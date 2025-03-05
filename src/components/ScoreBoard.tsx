'use client';

import React from 'react';
import { FaStar, FaCoins, FaTrophy } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface ScoreBoardProps {
  level: string;
  score: number;
  coins: number;
  streak: number;
}

// Kleurenthema's voor de niveaus
const getLevelColors = (levelName: string) => {
  switch (levelName) {
    case 'Beginnershelling':
      return { bg: 'bg-green-600', text: 'text-white' };
    case 'Blauwe piste':
      return { bg: 'bg-blue-600', text: 'text-white' };
    case 'Rode piste':
      return { bg: 'bg-red-600', text: 'text-white' };
    case 'Zwarte piste':
    case 'Off-piste':
      return { bg: 'bg-gray-900', text: 'text-white' };
    default:
      return { bg: 'bg-mountain', text: 'text-white' };
  }
};

const ScoreBoard = ({ level, score, coins, streak }: ScoreBoardProps) => {
  const levelColors = getLevelColors(level);
  
  return (
    <div className="flex items-center space-x-2 md:space-x-4">
      {/* Niveau */}
      <div className={`flex flex-col items-center ${levelColors.bg} ${levelColors.text} rounded-lg p-2 text-xs shadow-md`}>
        <FaTrophy className="text-gold mb-1" />
        <span>{level}</span>
      </div>
      
      {/* Score */}
      <motion.div 
        className="flex flex-col items-center bg-white bg-opacity-90 text-gray-800 rounded-lg p-2 text-xs shadow-md"
        animate={{ scale: [1, score > 0 && score % 50 === 0 ? 1.2 : 1, 1] }}
        transition={{ duration: 0.5 }}
      >
        <span className="font-bold">{score}</span>
        <span>Score</span>
      </motion.div>
      
      {/* Muntjes */}
      <motion.div 
        className="flex flex-col items-center bg-gold text-gray-800 rounded-lg p-2 text-xs shadow-md"
        animate={{ rotate: coins > 0 && coins % 10 === 0 ? [0, 360] : 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          <FaCoins className="mr-1" />
          <span className="font-bold">{coins}</span>
        </div>
        <span>Muntjes</span>
      </motion.div>
      
      {/* Reeks */}
      <div className="hidden md:flex flex-col items-center bg-white bg-opacity-80 text-gray-800 rounded-lg p-2 text-xs shadow-md">
        <div className="flex items-center">
          <FaStar className={`mr-1 ${streak > 0 ? 'text-gold' : 'text-gray-300'}`} />
          <span className="font-bold">{streak}</span>
        </div>
        <span>Reeks</span>
      </div>
    </div>
  );
};

export default ScoreBoard; 