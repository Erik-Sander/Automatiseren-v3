'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSkiing, FaCoins, FaTimes, FaCheck, FaHome, FaStar, FaHeart } from 'react-icons/fa';
import Confetti from 'react-confetti';
import SkierComponent from '@/components/SkierComponent';
import ScoreBoard from '@/components/ScoreBoard';
import FamilyEncouragement from '@/components/FamilyEncouragement';
import PhotoReward from '@/components/PhotoReward';
import { generateQuestion } from '@/utils/mathUtils';

// Personalisatie: De naam van het kind
const CHILD_NAME = "Bram";

// Verschillende niveaus van moeilijkheid met kleurthema's
const DIFFICULTY_LEVELS = [
  { name: 'Beginnershelling', range: [1, 10], operations: ['+'], timeLimit: 10, theme: 'theme-green-piste' },
  { name: 'Blauwe piste', range: [1, 20], operations: ['+', '-'], timeLimit: 10, theme: 'theme-blue-piste' },
  { name: 'Rode piste', range: [1, 50], operations: ['+', '-'], timeLimit: 8, theme: 'theme-red-piste' },
  { name: 'Zwarte piste', range: [1, 100], operations: ['+', '-', 'x'], timeLimit: 8, theme: 'theme-black-piste' },
  { name: 'Off-piste', range: [10, 100], operations: ['+', '-', 'x', '÷'], timeLimit: 6, theme: 'theme-black-piste' }
];

// Personalisatie: Speciale berichten
const PERSONAL_QUESTIONS = [
  { text: `${CHILD_NAME}, hoeveel leerlingen zitten er in je klas als er 14 jongens en 12 meisjes zijn?`, answer: 26 },
  { text: `Als je op de Rietendakschool 3 vrienden hebt en thuis in Utrecht nog 5, hoeveel vrienden heb je dan in totaal?`, answer: 8 },
  { text: `Als jij 7 jaar bent en Joep is 3 jaar jonger, hoe oud is Joep dan?`, answer: 4 },
  { text: `${CHILD_NAME}, hoeveel is 4 tafels van 5?`, answer: 20 },
  { text: `Als papa 42 jaar is en mama 39, hoeveel jaar schelen ze dan?`, answer: 3 },
  { text: `Als je 15 knikkers hebt en je geeft er 7 aan Joep, hoeveel houd je zelf over?`, answer: 8 },
  { text: `Als oma Marja 68 jaar is en jij bent 7, hoeveel jaar is oma Marja ouder dan jij?`, answer: 61 },
  { text: `Je hebt 4 rode en 5 blauwe lego-blokjes. Hoeveel blokjes heb je in totaal?`, answer: 9 },
  { text: `Als je op de Rietendakschool om half 9 begint en om 3 uur uit bent, hoeveel uur zit je dan op school?`, answer: 6 },
  { text: `Als je 2 euro zakgeld krijgt en je koopt een ijsje van 1 euro 20, hoeveel geld houd je over?`, answer: 0.8 },
];

export default function Game() {
  const router = useRouter();
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [question, setQuestion] = useState({ text: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<null | 'correct' | 'incorrect'>(null);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_LEVELS[0].timeLimit);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [skierSkill, setSkierSkill] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Levens systeem
  const [lives, setLives] = useState(3);
  const [usedQuestions, setUsedQuestions] = useState<string[]>([]);
  
  // Nieuwe state voor personalisatie
  const [showFamilyEncouragement, setShowFamilyEncouragement] = useState(false);
  const [showPhotoReward, setShowPhotoReward] = useState(false);
  const [achievementType, setAchievementType] = useState<'streak' | 'level' | 'milestone'>('streak');
  const [photoAchievement, setPhotoAchievement] = useState('');
  
  // Wachtrij voor aanmoedigingen
  const [encouragementQueue, setEncouragementQueue] = useState<{type: 'family' | 'photo', message?: string, achievementType?: 'streak' | 'level' | 'milestone'}[]>([]);
  
  // Flag om timer te pauzeren
  const [isPaused, setIsPaused] = useState(false);
  
  // Flag voor tekstvraag
  const [isTextQuestion, setIsTextQuestion] = useState(false);
  
  // Performance tracking voor aanmoedigingen
  const [lastQuestionTime, setLastQuestionTime] = useState(0);
  const [timeRecords, setTimeRecords] = useState<number[]>([]);

  // Huidig thema
  const currentTheme = DIFFICULTY_LEVELS[level].theme;

  // Genereer een nieuwe vraag
  const newQuestion = useCallback(() => {
    const currentLevel = DIFFICULTY_LEVELS[level];
    setLastQuestionTime(Date.now()); // Start de timer voor deze vraag
    
    let isTextQuestionLocal = false; // Lokale variabele om bij te houden of het een tekstvraag is
    
    // Af en toe (10% kans) een gepersonaliseerde vraag stellen
    if (Math.random() < 0.1 && level > 0) {
      // Kies een vraag die nog niet is gebruikt in deze sessie of reset wanneer alle gebruikt zijn
      let availableQuestions = PERSONAL_QUESTIONS.filter(q => !usedQuestions.includes(q.text));
      
      if (availableQuestions.length === 0) {
        // Alle vragen zijn al gebruikt, reset de lijst
        setUsedQuestions([]);
        availableQuestions = PERSONAL_QUESTIONS;
      }
      
      const personalQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
      setQuestion(personalQuestion);
      setUsedQuestions(prev => [...prev, personalQuestion.text]);
      setIsTextQuestion(true); // Markeer als tekstvraag
      isTextQuestionLocal = true; // Lokaal bijhouden
    } else {
      // Normale vraag genereren
      const { question: q, answer } = generateQuestion(
        currentLevel.range[0],
        currentLevel.range[1],
        currentLevel.operations
      );
      setQuestion({ text: q, answer });
      setIsTextQuestion(false); // Markeer als rekenvraag
      isTextQuestionLocal = false; // Lokaal bijhouden
    }
    
    setUserAnswer('');
    setFeedback(null);
    
    // Geef extra tijd voor tekstvragen - gebruik de lokale variabele
    if (isTextQuestionLocal) {
      setTimeLeft(currentLevel.timeLimit * 2); // Dubbele tijd voor tekstvragen
    } else {
      setTimeLeft(currentLevel.timeLimit);
    }
    
    // Genereer 4 opties voor multiple choice, waarvan 1 het juiste antwoord is
    const wrongAnswers: number[] = [];
    while (wrongAnswers.length < 3) {
      // Genereer een verkeerd antwoord (dicht bij het juiste)
      const wrongAnswer = question.answer + Math.floor(Math.random() * 10) - 5;
      if (wrongAnswer !== question.answer && !wrongAnswers.includes(wrongAnswer) && wrongAnswer >= 0) {
        wrongAnswers.push(wrongAnswer);
      }
    }
    
    const allOptions = [...wrongAnswers, question.answer];
    // Shuffle de opties
    setOptions(allOptions.sort(() => Math.random() - 0.5));
    setSelectedOption(null);
  }, [level, question.answer, usedQuestions]);

  // Start een nieuwe ronde
  useEffect(() => {
    newQuestion();
  }, [level, newQuestion]);

  // Voeg aanmoediging toe aan wachtrij
  const queueEncouragement = (type: 'family' | 'photo', message?: string, achType?: 'streak' | 'level' | 'milestone') => {
    // Als er al een aanmoediging wordt getoond, niets doen
    if (showFamilyEncouragement || showPhotoReward) {
      return;
    }
    
    // Als de wachtrij al niet leeg is, niet nog een toevoegen
    if (encouragementQueue.length > 0) {
      return;
    }
    
    // Wis eventuele bestaande aanmoedigingen in de wachtrij en voeg nieuwe toe
    setEncouragementQueue([{ type, message, achievementType: achType }]);
  };

  // Verwerk wachtrij met aanmoedigingen
  useEffect(() => {
    if (encouragementQueue.length > 0 && !showFamilyEncouragement && !showPhotoReward) {
      const nextEncouragement = encouragementQueue[0];
      
      // Pauzeer het spel
      setIsPaused(true);
      
      if (nextEncouragement.type === 'family') {
        setAchievementType(nextEncouragement.achievementType || 'streak');
        setShowFamilyEncouragement(true);
      } else if (nextEncouragement.type === 'photo') {
        setPhotoAchievement(nextEncouragement.message || 'Geweldig gedaan!');
        setShowPhotoReward(true);
      }
      
      // Verwijder het verwerkte item uit de wachtrij
      setEncouragementQueue([]);
    }
  }, [encouragementQueue, showFamilyEncouragement, showPhotoReward]);

  // Timer voor elke vraag
  useEffect(() => {
    if (feedback !== null || isGameOver || isPaused) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAnswer(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [feedback, isGameOver, isPaused]);

  // Controleer antwoord
  const handleAnswer = (isCorrect: boolean) => {
    // Bereken de snelheid - hoe snel de vraag beantwoord is
    const answerTime = (Date.now() - lastQuestionTime) / 1000; // in seconden
    const currentLevel = DIFFICULTY_LEVELS[level];
    const expectedTime = isTextQuestion ? currentLevel.timeLimit * 2 : currentLevel.timeLimit;
    const timeRatio = answerTime / expectedTime; // Lager is beter
    
    // Voeg de tijd toe aan onze geschiedenis voor gemiddelde berekening
    if (isCorrect) {
      setTimeRecords(prev => [...prev.slice(-9), timeRatio]); // Bewaar de laatste 10 tijden
    }
    
    // Bereken of dit een uitzonderlijk snelle prestatie was
    const isExceptionallyFast = timeRatio < 0.4 && answerTime > 0.5; // Sneller dan 40% van verwachte tijd maar niet te snel (om toeval uit te sluiten)
    const averageTimeRatio = timeRecords.length > 0 ? timeRecords.reduce((a, b) => a + b, 0) / timeRecords.length : 1;
    const isMuchFasterThanAverage = timeRecords.length > 3 && timeRatio < averageTimeRatio * 0.6;
    
    if (isCorrect) {
      setFeedback('correct');
      // Update score en streak
      const timeBonus = Math.ceil(timeLeft / 2);
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Bereken de score en coins bonus
      const streakMultiplier = Math.min(5, Math.ceil(newStreak / 3));
      const difficultyMultiplier = level + 1;
      const earnedPoints = 10 + timeBonus;
      const earnedCoins = difficultyMultiplier * streakMultiplier;
      
      setScore(prev => prev + earnedPoints);
      setCoins(prev => prev + earnedCoins);
      
      // Verwerk milestones (skill en niveau aanpassingen) maar toon slechts één aanmoediging
      let hasTriggerredEncouragement = false;

      // Verwerk milestones voor skiërvaardigheden
      if (newStreak % 5 === 0 && skierSkill < 4) {
        setSkierSkill(prev => prev + 1);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      // Verwerk milestones voor niveau
      if (newStreak % 10 === 0 && level < DIFFICULTY_LEVELS.length - 1) {
        setLevel(prev => prev + 1);
      }
      
      // Bepaal of er een aanmoediging moet komen en zo ja, welke (op volgorde van prioriteit)
      // 1. Hoogste prioriteit: Mijlpalen in muntjes - speciale foto beloning
      if (!hasTriggerredEncouragement && coins > 0 && (coins + earnedCoins) % 50 < earnedCoins) {
        // Muntjesmijlpaal bereikt
        queueEncouragement('photo', `Je hebt ${coins + earnedCoins} muntjes verzameld! Je bent een echte rekenheld!`);
        hasTriggerredEncouragement = true;
      } 
      // 2. Reeks van 10 bereikt - foto beloning
      else if (!hasTriggerredEncouragement && newStreak % 10 === 0) {
        queueEncouragement('photo', `Je hebt ${newStreak} vragen goed beantwoord op rij!`);
        hasTriggerredEncouragement = true;
      }
      // 3. Nieuw skiërsniveau bereikt - familie aanmoediging
      else if (!hasTriggerredEncouragement && newStreak % 5 === 0 && skierSkill < 4) {
        queueEncouragement('family', undefined, 'streak');
        hasTriggerredEncouragement = true;
      }
      // 4. Niveau omhoog - familie aanmoediging
      else if (!hasTriggerredEncouragement && newStreak % 10 === 0 && level < DIFFICULTY_LEVELS.length - 1) {
        queueEncouragement('family', undefined, 'level');
        hasTriggerredEncouragement = true;
      }
      // 5. Laagste prioriteit: Uitzonderlijk snel antwoord - familie aanmoediging (alleen af en toe)
      else if (!hasTriggerredEncouragement && (isExceptionallyFast || isMuchFasterThanAverage) && Math.random() < 0.3) {
        queueEncouragement('family', undefined, 'streak');
        hasTriggerredEncouragement = true;
      }
    } else {
      setFeedback('incorrect');
      setStreak(0);
      
      // Verminder een leven bij fout antwoord
      const newLives = lives - 1;
      setLives(newLives);
      
      // Game over als levens op zijn
      if (newLives <= 0) {
        setTimeout(() => {
          setIsGameOver(true);
        }, 1500);
        return;
      }
      
      // Als speler te veel fouten maakt, ga naar een makkelijker niveau
      if (level > 0 && (score > 0 && score % 30 === 0)) {
        setLevel(prev => prev - 1);
      }
    }
    
    // Wacht even voordat de volgende vraag komt
    setTimeout(() => {
      if (isCorrect || (lives > 0 && !isCorrect)) {
        newQuestion();
      }
    }, 1500);
  };

  // Handle multiple choice selectie
  const handleOptionSelect = (option: number) => {
    setSelectedOption(option);
    handleAnswer(option === question.answer);
  };

  // Reset het spel
  const resetGame = () => {
    setLevel(0);
    setScore(0);
    setCoins(0);
    setStreak(0);
    setSkierSkill(0);
    setIsGameOver(false);
    setEncouragementQueue([]);
    setIsPaused(false);
    setLives(3);
    setUsedQuestions([]);
    setTimeRecords([]);
    newQuestion();
  };

  // Functies voor het afhandelen van aanmoedigingen
  const handleFamilyEncouragementComplete = () => {
    setShowFamilyEncouragement(false);
    setIsPaused(false); // Hervat het spel
  };
  
  const handlePhotoRewardComplete = () => {
    setShowPhotoReward(false);
    setIsPaused(false); // Hervat het spel
  };

  return (
    <div className={`flex flex-col items-center min-h-screen w-full ${currentTheme} overflow-x-hidden`}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      {/* Header met score */}
      <div className="flex justify-between items-center w-full p-4 max-w-md mx-auto">
        <button 
          onClick={() => router.push('/')}
          className="bg-white text-mountain p-2 rounded-full shadow-md hover:shadow-lg active:translate-y-0.5 transition-all"
        >
          <FaHome className="text-lg" />
        </button>
        
        <ScoreBoard 
          level={DIFFICULTY_LEVELS[level].name}
          score={score}
          coins={coins}
          streak={streak}
        />
      </div>
      
      {/* Game container */}
      <div className={`snow-container ${currentTheme} p-4 md:p-6 w-full max-w-md relative mb-6 mx-auto`}>
        {!isGameOver ? (
          <>
            {/* Levens */}
            <div className="flex justify-center mb-2">
              {[...Array(3)].map((_, i) => (
                <FaHeart 
                  key={i} 
                  className={`mx-1 text-xl ${i < lives ? 'text-red-500' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          
            {/* Timer */}
            <div className="mb-4 w-full bg-white bg-opacity-50 rounded-full h-3 overflow-hidden">
              <motion.div 
                className={`h-3 rounded-full ${
                  level === 0 ? 'bg-green-600' :
                  level === 1 ? 'bg-blue-600' :
                  level === 2 ? 'bg-red-600' : 'bg-black'
                } ${isPaused ? 'opacity-50' : ''}`}
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / (isTextQuestion ? DIFFICULTY_LEVELS[level].timeLimit * 2 : DIFFICULTY_LEVELS[level].timeLimit)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            {/* Vraag met personalisatie */}
            <div className="mb-6 text-center">
              <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${level === 3 || level === 4 ? 'text-white' : ''}`}>
                {question.text}
              </h2>
              
              <p className={`text-sm ${level === 3 || level === 4 ? 'text-gray-300' : 'text-gray-600'}`}>
                {DIFFICULTY_LEVELS[level].name}
              </p>
              
              {/* Tekstvraag indicator */}
              {isTextQuestion && (
                <p className={`text-xs font-medium mt-1 ${level === 3 || level === 4 ? 'text-white' : 'text-green-700'}`}>
                  Leesvraag - Je hebt meer tijd!
                </p>
              )}
              
              {/* Niveau indicator - altijd zichtbaar in plaats van aanmoediging bij elke 3e vraag */}
              <p className={`text-xs font-medium mt-1 ${
                level === 0 ? 'text-green-700' :
                level === 1 ? 'text-blue-700' :
                level === 2 ? 'text-red-700' : 'text-white'
              }`}>
                {CHILD_NAME} speelt op de {DIFFICULTY_LEVELS[level].name}
              </p>
            </div>
            
            {/* Antwoord opties */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className={`
                    answer-btn
                    ${selectedOption !== null && option === question.answer ? 'border-green-500 bg-green-100' : ''}
                    ${selectedOption === option && option !== question.answer ? 'border-red-500 bg-red-100' : ''}
                    active:translate-y-0.5 active:shadow-sm hover:shadow-lg
                  `}
                  disabled={feedback !== null}
                  whileTap={{ scale: 0.98 }}
                >
                  {option}
                </motion.button>
              ))}
            </div>
            
            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-center p-3 rounded-lg mb-4 font-bold ${
                    feedback === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {feedback === 'correct' ? (
                    <div className="flex items-center justify-center">
                      <FaCheck className="text-green-600 mr-2" />
                      <span>Goed gedaan, {CHILD_NAME}!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <FaTimes className="text-red-600 mr-2" />
                      <span>Probeer nog eens. Het juiste antwoord is {question.answer}.</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className={`text-center p-6 ${level === 3 || level === 4 ? 'text-white' : ''}`}>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Game Over!</h2>
            <p className="mb-2">Je score: <span className="font-bold">{score}</span></p>
            <p className="mb-6">Muntjes verdiend: <span className="font-bold">{coins}</span></p>
            
            <div className="flex space-x-2 justify-center mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar key={i} className={`text-2xl ${i < skierSkill ? 'text-gold' : 'text-gray-300'}`} />
              ))}
            </div>
            
            <button 
              onClick={resetGame} 
              className="theme-btn px-4 py-2 rounded-lg font-bold transition-all shadow-md active:translate-y-0.5 active:shadow-sm hover:shadow-lg"
            >
              Opnieuw Spelen
            </button>
          </div>
        )}
      </div>
      
      {/* Skiër */}
      <div className="absolute bottom-0 w-full max-w-md mx-auto">
        <SkierComponent skill={skierSkill} isJumping={feedback === 'correct'} />
      </div>
      
      {/* Familie aanmoediging popup */}
      <FamilyEncouragement 
        show={showFamilyEncouragement}
        onComplete={handleFamilyEncouragementComplete}
        achievementType={achievementType}
      />
      
      {/* Foto beloning popup */}
      <PhotoReward
        show={showPhotoReward}
        onComplete={handlePhotoRewardComplete}
        achievement={photoAchievement}
      />
    </div>
  );
}