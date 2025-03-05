'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaStar, FaThumbsUp, FaPause } from 'react-icons/fa';

interface FamilyMember {
  name: string;
  relation: string;
  emoji: string;
  encouragements: string[];
}

// Database van familieleden
const familyMembers: FamilyMember[] = [
  { 
    name: 'Emma', 
    relation: 'Mama', 
    emoji: '👩', 
    encouragements: [
      'Wat goed gedaan, Bram!',
      'Ik ben zo trots op jou!',
      'Wat een knappe rekenaar ben jij!'
    ]
  },
  { 
    name: 'Erik Sander', 
    relation: 'Papa', 
    emoji: '👨', 
    encouragements: [
      'Super goed gerekend, Bram!',
      'Je wordt een echte ski-kampioen!',
      'Wat reken jij snel, zeg!'
    ]
  },
  { 
    name: 'Joep', 
    relation: 'Broertje', 
    emoji: '👦', 
    encouragements: [
      'Wow, cool gedaan!',
      'Ik wil ook zo goed kunnen rekenen!',
      'Jij bent echt goed!'
    ]
  },
  { 
    name: 'Marja', 
    relation: 'Oma', 
    emoji: '👵', 
    encouragements: [
      'Wat knap van jou, lieverd!',
      'Oma is super trots op je!',
      'Je bent een echte slimmerik!'
    ]
  },
  { 
    name: 'Annemiek', 
    relation: 'Oma', 
    emoji: '👵', 
    encouragements: [
      'Wat ben jij toch slim!',
      'Dat heb je prima gedaan!',
      'Ik ben zo trots op mijn kleinzoon!'
    ]
  },
  { 
    name: 'Menno', 
    relation: 'Opa', 
    emoji: '👴', 
    encouragements: [
      'Knap hoor, Bram!',
      'Wat reken jij al goed!',
      'Zo word je later een echte professor!'
    ]
  },
  { 
    name: 'Maarten', 
    relation: 'Opa', 
    emoji: '👴', 
    encouragements: [
      'Goed gedaan, kerel!',
      'Die sommen maak jij wel heel snel!',
      'Wat ben je toch slim!'
    ]
  }
];

const locationReferences = [
  'in Utrecht',
  'op de Rietendakschool',
  'op de skipiste',
  'in de sneeuw',
  'op je snowboard'
];

interface FamilyEncouragementProps {
  show: boolean;
  onComplete: () => void;
  achievementType: 'streak' | 'level' | 'milestone';
}

const FamilyEncouragement: React.FC<FamilyEncouragementProps> = ({ 
  show, 
  onComplete,
  achievementType 
}) => {
  // Kies willekeurig een familielid
  const randomMember = familyMembers[Math.floor(Math.random() * familyMembers.length)];
  
  // Kies willekeurig een bericht
  const randomEncouragement = randomMember.encouragements[
    Math.floor(Math.random() * randomMember.encouragements.length)
  ];
  
  // Soms een locatie-referentie toevoegen (30% kans)
  const locationReference = Math.random() < 0.3 
    ? locationReferences[Math.floor(Math.random() * locationReferences.length)]
    : '';
  
  // Aangepast bericht voor verschillende soorten prestaties
  let specialMessage = '';
  if (achievementType === 'streak') {
    specialMessage = 'Je hebt een geweldige reeks goede antwoorden!';
  } else if (achievementType === 'level') {
    specialMessage = 'Je bent een niveau omhoog gegaan!';
  } else {
    specialMessage = 'Wat een bijzondere prestatie!';
  }
  
  // Automatisch sluiten na 4.5 seconden
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 4500);
      
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
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/30"
          onClick={onComplete}
        >
          <motion.div 
            className="bg-white rounded-xl p-6 shadow-xl max-w-sm text-center space-y-3"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
          >
            <div className="text-4xl">{randomMember.emoji}</div>
            <h3 className="text-xl font-bold text-mountain">
              {randomMember.name} ({randomMember.relation})
            </h3>
            <div className="flex justify-center space-x-1 text-gold">
              <FaStar />
              <FaHeart />
              <FaThumbsUp />
            </div>
            <p className="text-lg">{randomEncouragement}</p>
            {locationReference && (
              <p className="text-sm text-gray-600">Groetjes {locationReference}!</p>
            )}
            <p className="font-bold text-mountain">{specialMessage}</p>
            
            {/* Indicator dat het spel gepauzeerd is */}
            <div className="flex items-center justify-center space-x-2 text-gray-500 border-t border-gray-200 pt-3 mt-3">
              <FaPause />
              <span className="text-sm">Spel gepauzeerd</span>
            </div>
            
            <button 
              onClick={onComplete}
              className="mt-2 text-sm px-4 py-1 bg-mountain text-white rounded-full hover:bg-opacity-90 active:translate-y-0.5 transition-all"
            >
              Doorgaan
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FamilyEncouragement; 