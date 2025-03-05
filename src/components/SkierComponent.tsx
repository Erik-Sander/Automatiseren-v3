'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaSkiing } from 'react-icons/fa';

// Skiër vaardigheidsniveaus met themakleur ondersteuning
const SKIER_LEVELS = [
  { name: 'beginner', color: 'text-green-500', size: 'text-5xl', speed: 5 },
  { name: 'gevorderd', color: 'text-blue-500', size: 'text-5xl', speed: 4 },
  { name: 'expert', color: 'text-red-500', size: 'text-6xl', speed: 3 },
  { name: 'professional', color: 'text-gray-800', size: 'text-6xl', speed: 2 },
  { name: 'olympisch', color: 'text-black', size: 'text-7xl', speed: 1 }
];

// Skisporen effect - aangepast per vaardigheidsniveau
const SkiTrail = ({ position, skill }: { position: number; skill: number }) => {
  // Pas kleur en animatie-eigenschappen aan op basis van skill level
  const getTrailColor = (skillLevel: number) => {
    switch(skillLevel) {
      case 0: return 'bg-green-200';
      case 1: return 'bg-blue-200';
      case 2: return 'bg-red-200';
      case 3:
      case 4: return 'bg-white';
      default: return 'bg-white';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0.7, width: 4, height: 15 }}
      animate={{ 
        opacity: 0, 
        width: 2, 
        height: 10 + (skill * 2), // Langere sporen voor hogere skill levels
        y: 10 + (skill * 2) // Verder doorlopen voor hogere skill levels
      }}
      transition={{ duration: 1.5 - (skill * 0.2) }} // Snellere animatie voor hogere skill levels
      className={`${getTrailColor(skill)} absolute bottom-0 rounded-full`}
      style={{ left: `${position}px` }}
    />
  );
};

interface SkierComponentProps {
  skill: number;
  isJumping: boolean;
}

const SkierComponent = ({ skill, isJumping }: SkierComponentProps) => {
  const [position, setPosition] = useState(50);
  const [direction, setDirection] = useState(1);
  const [trails, setTrails] = useState<number[]>([]);
  
  const currentLevel = SKIER_LEVELS[skill];
  
  // Bepaal de achtergrondkleur van de sneeuw op basis van skill level
  const getSnowHillColor = (skillLevel: number) => {
    switch(skillLevel) {
      case 0: return 'bg-green-100';
      case 1: return 'bg-blue-100';
      case 2: return 'bg-red-100';
      case 3:
      case 4: return 'bg-gray-200';
      default: return 'bg-white';
    }
  };
  
  // Skibeweging
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPosition(prev => {
        // Voeg skisporen toe op huidige positie
        setTrails(trails => [...trails.slice(-8), prev]);
        
        // Bereken nieuwe positie
        const newPos = prev + (direction * 3);
        
        // Verander richting als de skiër de rand bereikt
        if (newPos > 90 || newPos < 10) {
          setDirection(d => -d);
        }
        
        return newPos > 90 ? 90 : newPos < 10 ? 10 : newPos;
      });
    }, currentLevel.speed * 100);
    
    return () => clearInterval(moveInterval);
  }, [currentLevel.speed, direction]);
  
  // Bepaal animatiesnelheid en -effecten op basis van skill level
  const animationSpeed = 0.5 + ((5 - currentLevel.speed) * 0.1);
  
  return (
    <div className="relative w-full h-28">
      {/* Sneeuw helling met kleur die past bij het niveau */}
      <div className={`absolute bottom-0 w-full h-16 ${getSnowHillColor(skill)} rounded-t-full opacity-70`}></div>
      
      {/* Skisporen */}
      {trails.map((trailPos, index) => (
        <SkiTrail key={index} position={trailPos} skill={skill} />
      ))}
      
      {/* Skiër */}
      <motion.div
        className="absolute"
        style={{ left: `${position}%`, bottom: 0 }}
        animate={isJumping ? { 
          y: [0, -40 - (skill * 5), 0], // Hogere sprong voor hogere levels
          rotate: [0, skill > 1 ? 180 : 0, skill > 2 ? 360 : 0, 0]  // Complexere salto's voor hogere levels
        } : { 
          y: 0,
          rotate: 0
        }}
        transition={{
          duration: isJumping ? animationSpeed : 0.5, 
          ease: "easeOut",
        }}
      >
        <FaSkiing className={`${currentLevel.color} ${currentLevel.size}`} />
      </motion.div>
    </div>
  );
};

export default SkierComponent; 