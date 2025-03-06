'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

// Constante voor de tijd per vraag
const TIME_PER_QUESTION = 30; // 30 seconden per vraag

// Type definities
interface Question {
  text: string;
  answer: number;
}

interface Encouragement {
  type: 'family' | 'photo';
  message?: string;
  achievementType?: 'streak' | 'level' | 'milestone' | 'score';
}

// Verschillende niveaus van moeilijkheid met kleurthema's
const DIFFICULTY_LEVELS = [
  { name: 'Beginnershelling', range: [1, 10], operations: ['+'], timeLimit: 6, theme: 'theme-green-piste' },
  { name: 'Blauwe piste', range: [1, 20], operations: ['+', '-'], timeLimit: 8, theme: 'theme-blue-piste' },
  { name: 'Rode piste', range: [1, 50], operations: ['+', '-'], timeLimit: 10, theme: 'theme-red-piste' },
  { name: 'Zwarte piste', range: [1, 100], operations: ['+', '-', 'x'], timeLimit: 10, theme: 'theme-black-piste' },
  { name: 'Off-piste', range: [10, 100], operations: ['+', '-', 'x', '÷'], timeLimit: 12, theme: 'theme-black-piste' }
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
  { text: `Als je 2 euro zakgeld krijgt en je koopt een ijsje van 1 euro, hoeveel geld houd je over?`, answer: 1 },
  { text: `Je hebt 3 appels en krijgt er 4 bij. Hoeveel appels heb je nu?`, answer: 7 },
  { text: `Er zitten 8 vogels in een boom. 3 vogels vliegen weg. Hoeveel vogels blijven er in de boom?`, answer: 5 },
  { text: `Je hebt 10 snoepjes en geeft 2 aan je broertje en 2 aan je zusje. Hoeveel snoepjes houd je zelf?`, answer: 6 },
  { text: `Er staan 7 koeien in de wei. Er komen 5 koeien bij. Hoeveel koeien staan er nu in de wei?`, answer: 12 },
  { text: `Je hebt 9 potloden. Je verliest er 3. Hoeveel potloden heb je nog over?`, answer: 6 },
  { text: `In een doos zitten 6 rode en 7 blauwe ballen. Hoeveel ballen zitten er in totaal in de doos?`, answer: 13 },
  { text: `Je hebt 4 boeken gelezen en je broertje heeft 5 boeken gelezen. Hoeveel boeken hebben jullie samen gelezen?`, answer: 9 },
  { text: `Er zitten 10 kinderen in een bus. Bij de halte stappen 3 kinderen uit. Hoeveel kinderen zitten er nog in de bus?`, answer: 7 },
  { text: `Je hebt 5 euro. Je koopt een boek van 3 euro. Hoeveel euro heb je nog over?`, answer: 2 },
  { text: `Er zijn 12 cupcakes. Je eet er 4 op. Hoeveel cupcakes zijn er nog over?`, answer: 8 },
  { text: `Je hebt 6 rode ballonnen en 8 blauwe ballonnen. Hoeveel ballonnen heb je in totaal?`, answer: 14 },
  { text: `Er zitten 15 kinderen in de klas. 7 kinderen dragen een bril. Hoeveel kinderen dragen geen bril?`, answer: 8 },
  { text: `Je hebt 20 stickers. Je geeft 8 stickers weg. Hoeveel stickers heb je nog over?`, answer: 12 },
  { text: `Er staan 9 glazen op tafel. 4 glazen vallen en breken. Hoeveel glazen staan er nog op tafel?`, answer: 5 },
  { text: `Je hebt 3 rode, 4 blauwe en 2 groene potloden. Hoeveel potloden heb je in totaal?`, answer: 9 },
];

export default function Game() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isNextQuestionScheduled, setIsNextQuestionScheduled] = useState(false);
  
  // Game state
  const [question, setQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isTextQuestion, setIsTextQuestion] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<string[]>([]);
  
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Aanmoedigingen en beloningen
  const [showFamilyEncouragement, setShowFamilyEncouragement] = useState(false);
  const [showPhotoReward, setShowPhotoReward] = useState(false);
  const [achievementType, setAchievementType] = useState<'streak' | 'level' | 'milestone' | 'score'>('streak');
  const [photoAchievement, setPhotoAchievement] = useState('');
  const [encouragementQueue, setEncouragementQueue] = useState<Encouragement[]>([]);
  const [currentEncouragement, setCurrentEncouragement] = useState<Encouragement | null>(null);
  
  // Levens systeem
  const [coins, setCoins] = useState(0);
  const [skierSkill, setSkierSkill] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Nieuwe state variabele om bij te houden of er een nieuwe vraag gepland staat
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Wachtrij voor aanmoedigingen
  const [lastQuestionTime, setLastQuestionTime] = useState(0);
  const [timeRecords, setTimeRecords] = useState<number[]>([]);

  // Huidig thema
  const currentTheme = DIFFICULTY_LEVELS[level].theme;

  // Functie om de huidige state van het spel te loggen
  const logGameState = (label: string) => {
    console.log(`--- Game State [${label}] ---`);
    console.log("Level:", level);
    console.log("Score:", score);
    console.log("Streak:", streak);
    console.log("Lives:", lives);
    console.log("Question:", question);
    console.log("IsTextQuestion:", isTextQuestion);
    console.log("Feedback:", feedback);
    console.log("TimeLeft:", timeLeft);
    console.log("IsPaused:", isPaused);
    console.log("IsGameOver:", isGameOver);
    console.log("ShowFamilyEncouragement:", showFamilyEncouragement);
    console.log("ShowPhotoReward:", showPhotoReward);
    console.log("EncouragementQueue:", encouragementQueue);
    console.log("IsNextQuestionScheduled:", isNextQuestionScheduled);
    console.log("------------------------");
  };

  // Genereer een nieuwe vraag
  const newQuestion = useCallback(() => {
    // Log de aanroep van newQuestion met een stack trace
    console.log("newQuestion aangeroepen", new Error().stack);
    logGameState("newQuestion start");
    
    // Controleer of er een aanmoediging wordt getoond - zo ja, wacht met nieuwe vraag
    if (showFamilyEncouragement || showPhotoReward || isPaused) {
      console.log("Wacht met nieuwe vraag omdat er een aanmoediging wordt getoond of het spel gepauzeerd is");
      return;
    }
    
    // Controleer of er al een nieuwe vraag gepland staat
    if (isNextQuestionScheduled) {
      console.log("Wacht met nieuwe vraag omdat er al een gepland staat");
      return;
    }
    
    // Voorkom dat we een nieuwe vraag genereren als er al een vraag is en er geen feedback is
    if (question && feedback === null) {
      console.log("Wacht met nieuwe vraag omdat er al een actieve vraag is zonder feedback");
      return;
    }
    
    // Reset feedback om ervoor te zorgen dat de gebruiker een nieuwe vraag kan beantwoorden
    setFeedback(null);
    
    const currentLevel = DIFFICULTY_LEVELS[level];
    setLastQuestionTime(Date.now()); // Start de timer voor deze vraag
    
    // Bepaal of dit een tekstsom wordt (15% kans)
    // Verhoog de kans op tekstsommen bij hogere niveaus
    const baseTextQuestionChance = 0.15; // 15% basis kans
    const levelMultiplier = Math.min(1, 0.5 + (level * 0.1)); // Verhoog kans met niveau (max 100%)
    const textQuestionChance = baseTextQuestionChance * levelMultiplier;
    
    const isTextQuestionLocal = Math.random() < textQuestionChance;
    console.log(`Kans op tekstsom: ${(textQuestionChance * 100).toFixed(1)}%, Resultaat: ${isTextQuestionLocal ? 'Tekstsom' : 'Normale som'}`);
    
    let newQuestion: Question = { text: '', answer: 0 }; // Lokale variabele voor de nieuwe vraag
    
    if (isTextQuestionLocal) {
      // Kies een tekstsom uit de PERSONAL_QUESTIONS array
      // Filter vragen op basis van moeilijkheidsgraad
      let availableQuestions = PERSONAL_QUESTIONS.filter(q => !usedQuestions.includes(q.text));
      
      // Verdeel de vragen over de niveaus (eenvoudige implementatie)
      // Niveau 0-1: Vragen met antwoord <= 10
      // Niveau 2-3: Vragen met antwoord <= 50
      // Niveau 4: Alle vragen
      if (level < 2) {
        availableQuestions = availableQuestions.filter(q => q.answer <= 10);
      } else if (level < 4) {
        availableQuestions = availableQuestions.filter(q => q.answer <= 50);
      }
      
      if (availableQuestions.length === 0) {
        // Als er geen geschikte vragen zijn, reset de lijst
        setUsedQuestions([]);
        availableQuestions = PERSONAL_QUESTIONS;
        
        // Pas filtering opnieuw toe
        if (level < 2) {
          availableQuestions = availableQuestions.filter(q => q.answer <= 10);
        } else if (level < 4) {
          availableQuestions = availableQuestions.filter(q => q.answer <= 50);
        }
      }
      
      const personalQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
      newQuestion = personalQuestion;
      setQuestion(personalQuestion);
      setUsedQuestions(prev => [...prev, personalQuestion.text]);
      setIsTextQuestion(true); // Markeer als tekstvraag
      
      // Geef extra tijd voor tekstvragen
      const newTimeLeft = currentLevel.timeLimit * 3; // Driedubbele tijd voor tekstsommen
      console.log("Timer wordt gereset naar:", newTimeLeft, "seconden (tekstsom)");
      setTimeLeft(newTimeLeft);
    } else {
      // Genereer een normale rekensom
      const operation = currentLevel.operations[Math.floor(Math.random() * currentLevel.operations.length)];
      const range = currentLevel.range;
      
      let num1, num2, answer;
      
      // Zorg ervoor dat de getallen en het antwoord binnen het bereik vallen
      do {
        num1 = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
        num2 = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
        
        // Zorg ervoor dat delingen altijd netjes uitkomen
        if (operation === '÷') {
          // Zorg ervoor dat num2 niet 0 is en dat num1 deelbaar is door num2
          num2 = Math.max(1, num2);
          num1 = num2 * (Math.floor(Math.random() * 10) + 1); // Zorg voor een geheel getal als antwoord
        }
        
        // Bereken het antwoord op basis van de operatie
        switch (operation) {
          case '+': answer = num1 + num2; break;
          case '-': 
            // Zorg ervoor dat het antwoord niet negatief is
            if (num1 < num2) [num1, num2] = [num2, num1];
            answer = num1 - num2; 
            break;
          case 'x': answer = num1 * num2; break;
          case '÷': answer = num1 / num2; break;
          default: answer = 0;
        }
      } while (answer < 0 || answer > range[1] * 2 || !Number.isInteger(answer));
      
      // Maak de tekst voor de som
      const operationSymbol = operation === 'x' ? '×' : operation;
      const questionText = `${num1} ${operationSymbol} ${num2}`;
      
      newQuestion = { text: questionText, answer };
      setQuestion(newQuestion);
      setIsTextQuestion(false);
      
      // Normale tijd voor gewone sommen
      const newTimeLeft = currentLevel.timeLimit;
      console.log("Timer wordt gereset naar:", newTimeLeft, "seconden (normale som)");
      setTimeLeft(newTimeLeft);
    }
    
    setCorrectAnswer(newQuestion.answer.toString());
    
    // Genereer 4 opties voor multiple choice, waarvan 1 het juiste antwoord is
    const wrongAnswers: number[] = [];
    const correctAnswer = newQuestion.answer;
    
    // Zorg ervoor dat we altijd 3 unieke verkeerde antwoorden hebben
    let attempts = 0;
    while (wrongAnswers.length < 3 && attempts < 20) {
      attempts++;
      // Genereer een verkeerd antwoord (dicht bij het juiste)
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrongAnswer = correctAnswer + offset;
      
      // Zorg ervoor dat het verkeerde antwoord niet gelijk is aan het juiste antwoord
      // en dat het niet al in de lijst staat en dat het niet negatief is
      if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer) && wrongAnswer >= 0) {
        wrongAnswers.push(wrongAnswer);
      }
    }
    
    // Als we niet genoeg verkeerde antwoorden hebben, vul aan met standaard waarden
    while (wrongAnswers.length < 3) {
      const defaultWrong = correctAnswer + 1 + wrongAnswers.length;
      if (!wrongAnswers.includes(defaultWrong) && defaultWrong !== correctAnswer) {
        wrongAnswers.push(defaultWrong);
      }
    }
    
    const allOptions = [...wrongAnswers, correctAnswer].map(String);
    // Shuffle de opties
    setOptions(allOptions.sort(() => Math.random() - 0.5));
    setSelectedOption(null);
    
    console.log("Nieuwe vraag gegenereerd:", newQuestion.text, "Antwoord:", correctAnswer, "Opties:", allOptions);
    
    // Log de state na het genereren van een nieuwe vraag
    setTimeout(() => {
      logGameState("newQuestion end");
    }, 10);
  }, [level, usedQuestions, showFamilyEncouragement, showPhotoReward, isPaused, isNextQuestionScheduled, question, feedback]);

  // Start een nieuwe ronde
  useEffect(() => {
    console.log("useEffect [level] aangeroepen", new Error().stack);
    
    // Alleen een nieuwe vraag genereren als er geen aanmoediging wordt getoond en er geen vraag gepland staat
    // EN als er nog geen vraag is (om te voorkomen dat we bij het starten meerdere vragen genereren)
    if (!showFamilyEncouragement && !showPhotoReward && !isPaused && !isNextQuestionScheduled && !question) {
      console.log("Nieuwe vraag genereren bij level verandering");
      newQuestion();
    } else {
      console.log("Geen nieuwe vraag bij level verandering omdat er een aanmoediging wordt getoond of er al een vraag gepland staat of er al een vraag is");
    }
  }, [level, newQuestion, showFamilyEncouragement, showPhotoReward, isPaused, isNextQuestionScheduled, question]);

  // Voeg aanmoediging toe aan wachtrij
  const queueEncouragement = (type: 'family' | 'photo', message?: string, achType?: 'streak' | 'level' | 'milestone' | 'score') => {
    console.log("queueEncouragement aangeroepen", type, message, achType, new Error().stack);
    
    // Als er al een aanmoediging wordt getoond, niets doen
    if (showFamilyEncouragement || showPhotoReward) {
      console.log("Geen aanmoediging toegevoegd omdat er al een wordt getoond");
      return;
    }
    
    // Als de wachtrij al niet leeg is, niet nog een toevoegen
    if (encouragementQueue.length > 0) {
      console.log("Geen aanmoediging toegevoegd omdat de wachtrij niet leeg is");
      return;
    }
    
    // Wis eventuele bestaande aanmoedigingen in de wachtrij en voeg nieuwe toe
    console.log("Aanmoediging toegevoegd aan wachtrij");
    setEncouragementQueue([{ type, message, achievementType: achType }]);
  };

  // Verwerk wachtrij met aanmoedigingen
  useEffect(() => {
    console.log("useEffect [encouragementQueue] aangeroepen", encouragementQueue);
    
    if (encouragementQueue.length > 0 && !showFamilyEncouragement && !showPhotoReward) {
      logGameState("Processing encouragement queue");
      console.log("Verwerken van aanmoedigingsqueue:", encouragementQueue);
      
      const nextEncouragement = encouragementQueue[0];
      const newQueue = encouragementQueue.slice(1);
      setEncouragementQueue(newQueue);
      
      if (nextEncouragement.type === 'family') {
        console.log("Familie aanmoediging tonen:", nextEncouragement);
        setAchievementType(nextEncouragement.achievementType || 'streak');
        setShowFamilyEncouragement(true);
        setIsPaused(true); // Pauzeer het spel tijdens de aanmoediging
      } else if (nextEncouragement.type === 'photo') {
        console.log("Foto beloning tonen:", nextEncouragement);
        setPhotoAchievement(nextEncouragement.message || 'Geweldig gedaan!');
        setShowPhotoReward(true);
        setIsPaused(true); // Pauzeer het spel tijdens de beloning
      }
    }
  }, [encouragementQueue, showFamilyEncouragement, showPhotoReward]);

  // Timer voor elke vraag
  useEffect(() => {
    console.log("useEffect [timer] aangeroepen", new Error().stack);
    console.log("Huidige timeLeft waarde:", timeLeft);
    
    // Als er feedback is, het spel over is, of het spel gepauzeerd is, doe niets
    if (feedback !== null || isGameOver || isPaused) {
      console.log("Timer niet gestart: feedback, gameOver of paused");
      return;
    }
    
    console.log("Timer gestart/hervat met", timeLeft, "seconden");
    
    // Gebruik een ref om de huidige timeLeft waarde bij te houden
    const timeLeftRef = { current: timeLeft };
    
    const timer = setInterval(() => {
      timeLeftRef.current = timeLeftRef.current - 1;
      setTimeLeft(timeLeftRef.current);
      
      if (timeLeftRef.current <= 0) {
        clearInterval(timer);
        console.log("Tijd is op, antwoord wordt als fout gemarkeerd", new Error().stack);
        
        // Controleer of het spel niet gepauzeerd is voordat we het antwoord verwerken
        if (!isPaused && !showFamilyEncouragement && !showPhotoReward && !isNextQuestionScheduled) {
          // Markeer dat er een nieuwe vraag gepland staat om dubbele aanroepen te voorkomen
          setIsNextQuestionScheduled(true);
          
          // Gebruik setTimeout om ervoor te zorgen dat de state updates zijn verwerkt
          setTimeout(() => {
            console.log("setTimeout in timer afgelopen", new Error().stack);
            handleAnswer(false);
          }, 50);
        }
      }
    }, 1000);
    
    // Cleanup timer als component unmount of als een van de afhankelijkheden verandert
    return () => {
      console.log("Timer gestopt", new Error().stack);
      clearInterval(timer);
    };
  }, [feedback, isGameOver, isPaused, showFamilyEncouragement, showPhotoReward, isNextQuestionScheduled, timeLeft, question]);

  // Controleer antwoord
  const handleAnswer = (isCorrect: boolean) => {
    console.log("handleAnswer aangeroepen", isCorrect, new Error().stack);
    logGameState("handleAnswer start");
    
    // Als het spel gepauzeerd is, doe niets
    if (isPaused) {
      console.log("Antwoord genegeerd omdat het spel gepauzeerd is");
      return;
    }
    
    // Als er al een nieuwe vraag gepland staat, doe niets
    if (isNextQuestionScheduled) {
      console.log("Antwoord genegeerd omdat er al een nieuwe vraag gepland staat");
      return;
    }
    
    // Markeer dat er een nieuwe vraag gepland staat om dubbele aanroepen te voorkomen
    setIsNextQuestionScheduled(true);
    
    console.log("Antwoord verwerken:", isCorrect ? "correct" : "incorrect", "voor vraag:", question?.text);
    
    // Bereken de snelheid - hoe snel de vraag beantwoord is
    const answerTime = (Date.now() - lastQuestionTime) / 1000; // in seconden
    const currentLevel = DIFFICULTY_LEVELS[level];
    const expectedTime = isTextQuestion ? currentLevel.timeLimit * 3 : currentLevel.timeLimit;
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
      
      logGameState("handleAnswer after processing correct answer");
      
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
      
      logGameState("handleAnswer after processing incorrect answer");
      
      // Game over als levens op zijn
      if (newLives <= 0) {
        setTimeout(() => {
          setIsGameOver(true);
          logGameState("Game over");
        }, 1500);
        setIsNextQuestionScheduled(false); // Reset de planning flag
        return;
      }
      
      // Als speler te veel fouten maakt, ga naar een makkelijker niveau
      if (level > 0 && (score > 0 && score % 30 === 0)) {
        setLevel(prev => prev - 1);
      }
    }
    
    // Log de state na het verwerken van het antwoord
    setTimeout(() => {
      logGameState("handleAnswer after processing");
    }, 10);
    
    // Wacht langer voordat de volgende vraag komt, vooral voor tekstsommen
    // Geef extra tijd voor tekstsommen
    const waitTime = isTextQuestion ? 2000 : 1500; // Verkort naar 2 seconden voor tekstsommen, 1.5 seconden voor normale sommen
    
    console.log("Nieuwe vraag gepland over", waitTime, "ms", isTextQuestion ? "(tekstsom)" : "(normale som)");
    
    // Alleen een nieuwe vraag genereren als er geen aanmoediging wordt getoond
    const nextQuestionTimer = setTimeout(() => {
      console.log("Timer voor nieuwe vraag afgelopen", new Error().stack);
      logGameState("handleAnswer timer expired");
      
      // Controleer opnieuw of het spel niet gepauzeerd is voordat we een nieuwe vraag genereren
      if (!isPaused && !showFamilyEncouragement && !showPhotoReward) {
        if (isCorrect || (lives > 0 && !isCorrect)) {
          console.log("Genereer nieuwe vraag na antwoord");
          setIsNextQuestionScheduled(false); // Reset de planning flag
          setFeedback(null); // Reset feedback
          setQuestion(null); // Reset de huidige vraag zodat deze verdwijnt
          
          // Zorg ervoor dat we een korte pauze hebben voordat we een nieuwe vraag genereren
          // Dit geeft de timer useEffect de kans om op te ruimen
          setTimeout(() => {
            console.log("Genereer nieuwe vraag na korte pauze");
            newQuestion();
            
            // Log de state na het genereren van een nieuwe vraag
            setTimeout(() => {
              logGameState("After generating new question");
            }, 10);
          }, 50);
        }
      } else {
        console.log("Nieuwe vraag uitgesteld omdat het spel gepauzeerd is of er een aanmoediging wordt getoond");
        setIsNextQuestionScheduled(false); // Reset de planning flag
        
        // Log de state na het uitstellen van een nieuwe vraag
        logGameState("New question delayed");
      }
    }, waitTime);
    
    // Cleanup timer als component unmount
    return () => {
      console.log("Cleanup timer voor nieuwe vraag", new Error().stack);
      clearTimeout(nextQuestionTimer);
      setIsNextQuestionScheduled(false); // Reset de planning flag bij cleanup
    };
  };

  // Handle multiple choice selectie
  const handleOptionSelect = (option: string) => {
    // Als het spel gepauzeerd is of er al een antwoord is gegeven, doe niets
    if (isPaused || feedback !== null) {
      console.log("Optie selectie genegeerd omdat het spel gepauzeerd is of er al feedback is");
      return;
    }
    
    console.log("Optie geselecteerd:", option, "Correct antwoord:", correctAnswer, "Is tekstsom:", isTextQuestion);
    
    // Markeer de geselecteerde optie
    setSelectedOption(parseInt(option));
    
    // Controleer of het antwoord correct is
    const isCorrect = option === correctAnswer;
    
    // Verwerk het antwoord
    handleAnswer(isCorrect);
  };

  // Reset het spel
  const resetGame = () => {
    console.log("resetGame aangeroepen", new Error().stack);
    
    // Reset alle game state
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
    setFeedback(null);
    setIsNextQuestionScheduled(false);
    
    // Wacht even om ervoor te zorgen dat alle state updates zijn verwerkt
    setTimeout(() => {
      console.log("setTimeout in resetGame afgelopen", new Error().stack);
      console.log("Spel gereset, nieuwe vraag genereren");
      newQuestion();
    }, 100);
  };

  // Functies voor het afhandelen van aanmoedigingen
  const handleFamilyEncouragementComplete = () => {
    console.log("handleFamilyEncouragementComplete aangeroepen", new Error().stack);
    logGameState("handleFamilyEncouragementComplete start");
    
    console.log("Familie aanmoediging afgerond, feedback status:", feedback);
    setShowFamilyEncouragement(false);
    setIsPaused(false); // Hervat het spel
    
    // Wacht even voordat we een nieuwe vraag genereren om ervoor te zorgen dat de state updates zijn verwerkt
    setTimeout(() => {
      console.log("setTimeout in handleFamilyEncouragementComplete afgelopen", new Error().stack);
      logGameState("handleFamilyEncouragementComplete timeout");
      
      // Controleer of er feedback is (wat betekent dat er een antwoord is gegeven)
      // Als er GEEN feedback is, betekent dit dat we een nieuwe vraag moeten genereren
      if (feedback === null && !isNextQuestionScheduled) {
        console.log("Nieuwe vraag genereren na familie aanmoediging");
        newQuestion();
      } else {
        console.log("Geen nieuwe vraag nodig na familie aanmoediging, er is al feedback of er staat al een vraag gepland");
      }
    }, 100);
  };
  
  const handlePhotoRewardComplete = () => {
    console.log("handlePhotoRewardComplete aangeroepen", new Error().stack);
    logGameState("handlePhotoRewardComplete start");
    
    console.log("Foto beloning afgerond, feedback status:", feedback);
    setShowPhotoReward(false);
    setIsPaused(false); // Hervat het spel
    
    // Wacht even voordat we een nieuwe vraag genereren om ervoor te zorgen dat de state updates zijn verwerkt
    setTimeout(() => {
      console.log("setTimeout in handlePhotoRewardComplete afgelopen", new Error().stack);
      logGameState("handlePhotoRewardComplete timeout");
      
      // Controleer of er feedback is (wat betekent dat er een antwoord is gegeven)
      // Als er GEEN feedback is, betekent dit dat we een nieuwe vraag moeten genereren
      if (feedback === null && !isNextQuestionScheduled) {
        console.log("Nieuwe vraag genereren na foto beloning");
        newQuestion();
      } else {
        console.log("Geen nieuwe vraag nodig na foto beloning, er is al feedback of er staat al een vraag gepland");
      }
    }, 100);
  };

  // Effect voor het starten van het spel
  useEffect(() => {
    console.log("useEffect [isClient] aangeroepen");
    if (isClient && !question) {
      console.log("Spel wordt gestart...");
      logGameState("Game start");
      newQuestion();
    } else if (isClient && question) {
      console.log("Spel is al gestart, geen nieuwe vraag nodig");
    }
  }, [isClient, question]);

  // Effect voor het bijhouden van de timer
  useEffect(() => {
    console.log("useEffect [isPaused, isGameOver] aangeroepen", isPaused, isGameOver);
    
    if (isPaused || isGameOver) {
      logGameState("Game paused or over - clearing timer");
      console.log("Timer gestopt omdat het spel is gepauzeerd of voorbij is");
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime: number) => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          console.log("Tijd is op!");
          logGameState("Timer expired");
          handleAnswer(false); // Tijd is op, behandel als een fout antwoord
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPaused, isGameOver]);

  // Effect om te controleren of we aan de client-side zijn
  useEffect(() => {
    setIsClient(true);
  }, []);

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
                animate={{ width: `${(timeLeft / (isTextQuestion ? DIFFICULTY_LEVELS[level].timeLimit * 3 : DIFFICULTY_LEVELS[level].timeLimit)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            {/* Vraag met personalisatie */}
            <div className="mb-6 text-center">
              {/* Tekstvraag indicator - boven de vraag voor betere zichtbaarheid */}
              {isTextQuestion && (
                <div className={`mb-2 p-2 rounded-lg ${level === 3 || level === 4 ? 'bg-white bg-opacity-20' : 'bg-green-100'}`}>
                  <p className={`text-sm font-medium ${level === 3 || level === 4 ? 'text-white' : 'text-green-700'}`}>
                    <span role="img" aria-label="book">📖</span> <strong>Leesvraag</strong> - Neem rustig de tijd om te lezen!
                  </p>
                </div>
              )}
              
              {/* De vraag zelf - met extra opvallende styling voor tekstsommen */}
              <div className={`p-4 rounded-lg ${
                isTextQuestion 
                  ? (level === 3 || level === 4 
                      ? 'bg-white bg-opacity-20 border-2 border-white border-opacity-50' 
                      : 'bg-white shadow-md border-2 border-green-300')
                  : ''
              }`}>
                <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${
                  isTextQuestion 
                    ? (level === 3 || level === 4 ? 'text-white' : 'text-green-800')
                    : (level === 3 || level === 4 ? 'text-white' : '')
                }`}>
                  {question?.text}
                </h2>
                
                {/* Extra instructie voor tekstsommen */}
                {isTextQuestion && (
                  <p className={`text-sm italic mt-2 ${level === 3 || level === 4 ? 'text-gray-200' : 'text-gray-600'}`}>
                    Lees de vraag goed en neem je tijd om na te denken!
                  </p>
                )}
              </div>
              
              <p className={`text-sm mt-2 ${level === 3 || level === 4 ? 'text-gray-300' : 'text-gray-600'}`}>
                {DIFFICULTY_LEVELS[level].name}
              </p>
              
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
                    ${selectedOption !== null && option === correctAnswer ? 'border-green-500 bg-green-100' : ''}
                    ${selectedOption === parseInt(option) && option !== correctAnswer ? 'border-red-500 bg-red-100' : ''}
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
                      <span>Probeer nog eens. Het juiste antwoord is {correctAnswer}.</span>
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