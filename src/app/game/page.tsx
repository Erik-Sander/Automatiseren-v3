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

// Personalisatie: Speciale berichten per niveau
interface LevelQuestion extends Question {
  level: number; // Het niveau waarbij deze vraag hoort (0-4)
}

// Verschillende niveaus van moeilijkheid met kleurthema's
const DIFFICULTY_LEVELS = [
  { name: 'Beginnershelling', range: [1, 10], operations: ['+'], timeLimit: 6, theme: 'theme-green-piste' },
  { name: 'Blauwe piste', range: [1, 20], operations: ['+', '-'], timeLimit: 8, theme: 'theme-blue-piste' },
  { name: 'Rode piste', range: [1, 50], operations: ['+', '-'], timeLimit: 10, theme: 'theme-red-piste' },
  { name: 'Zwarte piste', range: [1, 100], operations: ['+', '-', 'x'], timeLimit: 10, theme: 'theme-black-piste' },
  { name: 'Off-piste', range: [10, 100], operations: ['+', '-', 'x', '÷'], timeLimit: 12, theme: 'theme-black-piste' }
];

// Niveau 0 (Beginnershelling): antwoorden <= 10
const LEVEL0_QUESTIONS: LevelQuestion[] = [
  { text: `Als jij 7 jaar bent en Joep is 3 jaar jonger, hoeveel is Joep dan?`, answer: 4, level: 0 },
  { text: `Je hebt 3 appels en krijgt er 4 bij. Hoeveel appels heb je nu?`, answer: 7, level: 0 },
  { text: `Er zitten 8 vogels in een boom. 3 vogels vliegen weg. Hoeveel vogels blijven er in de boom?`, answer: 5, level: 0 },
  { text: `Je hebt 9 potloden. Je verliest er 3. Hoeveel potloden heb je nog over?`, answer: 6, level: 0 },
  { text: `Als je 2 euro zakgeld krijgt en je koopt een ijsje van 1 euro, hoeveel geld houd je over?`, answer: 1, level: 0 },
  { text: `Je hebt 4 rode en 5 blauwe lego-blokjes. Hoeveel blokjes heb je in totaal?`, answer: 9, level: 0 },
  { text: `Als je op de Rietendakschool 3 vrienden hebt en thuis in Utrecht nog 5, hoeveel vrienden heb je dan in totaal?`, answer: 8, level: 0 },
  { text: `Je hebt 2 rode ballonnen en 5 blauwe ballonnen. Hoeveel ballonnen heb je in totaal?`, answer: 7, level: 0 },
  { text: `Je hebt 3 euro en krijgt 5 euro van oma. Hoeveel euro heb je nu?`, answer: 8, level: 0 },
  { text: `Je hebt 7 stickers. Je geeft er 3 aan je vriend. Hoeveel stickers houd je over?`, answer: 4, level: 0 },
];

// Niveau 1 (Blauwe piste): antwoorden tussen 11-20
const LEVEL1_QUESTIONS: LevelQuestion[] = [
  { text: `${CHILD_NAME}, hoeveel is 4 tafels van 5?`, answer: 20, level: 1 },
  { text: `Er zitten 6 kinderen in een bus. Bij de halte stappen 2 kinderen uit. Hoeveel kinderen zitten er nog in de bus?`, answer: 4, level: 1 },
  { text: `Als papa 42 jaar is en mama 39, hoeveel jaar schelen ze dan?`, answer: 3, level: 1 },
  { text: `Je hebt 10 snoepjes en geeft 2 aan je broertje en 2 aan je zusje. Hoeveel snoepjes houd je zelf?`, answer: 6, level: 1 },
  { text: `Er liggen 10 koekjes op tafel. Je eet er 4 op. Hoeveel koekjes blijven er over?`, answer: 6, level: 1 },
  { text: `Als je 15 knikkers hebt en je geeft er 7 aan Joep, hoeveel houd je zelf over?`, answer: 8, level: 1 },
  { text: `Er staan 7 koeien in de wei. Er komen 5 koeien bij. Hoeveel koeien staan er nu in de wei?`, answer: 12, level: 1 },
  { text: `In een doos zitten 6 rode en 7 blauwe ballen. Hoeveel ballen zitten er in totaal in de doos?`, answer: 13, level: 1 },
  { text: `In de klas zitten 8 jongens en 9 meisjes. Hoeveel kinderen zitten er in totaal in de klas?`, answer: 17, level: 1 },
  { text: `Je hebt 12 kleurpotloden. Je leent er 2 uit aan je vriend. Hoeveel kleurpotloden heb je nog over?`, answer: 10, level: 1 },
  { text: `Er staan 15 glazen op tafel. 4 glazen vallen en breken. Hoeveel glazen blijven er heel?`, answer: 11, level: 1 },
  { text: `Je hebt 7 euro. Een boek kost 14 euro. Hoeveel euro kom je tekort?`, answer: 7, level: 1 },
  { text: `Er zitten 20 kinderen in de klas. 6 kinderen zijn ziek. Hoeveel kinderen zijn er op school?`, answer: 14, level: 1 },
];

// Niveau 2 (Rode piste): antwoorden tussen 21-50
const LEVEL2_QUESTIONS: LevelQuestion[] = [
  { text: `${CHILD_NAME}, hoeveel leerlingen zitten er in je klas als er 14 jongens en 12 meisjes zijn?`, answer: 26, level: 2 },
  { text: `Een voetbalteam heeft 11 spelers. Hoeveel spelers hebben 2 teams samen?`, answer: 22, level: 2 },
  { text: `Een boek heeft 42 pagina's. Je hebt al 15 pagina's gelezen. Hoeveel pagina's moet je nog lezen?`, answer: 27, level: 2 },
  { text: `In een bioscoop zijn 50 stoelen. Er zijn 32 mensen binnen. Hoeveel stoelen zijn er nog vrij?`, answer: 18, level: 2 },
  { text: `Een doos met 24 ijsjes kost 36 euro. Hoeveel kosten 8 ijsjes?`, answer: 12, level: 2 },
  { text: `Je spaart voor een spelcomputer van 50 euro. Je hebt al 25 euro gespaard. Hoeveel euro heb je nog nodig?`, answer: 25, level: 2 },
];

// Niveau 3 (Zwarte piste): antwoorden tussen 51-100
const LEVEL3_QUESTIONS: LevelQuestion[] = [
  { text: `Als oma Marja 68 jaar is en jij bent 7, hoeveel jaar is oma Marja ouder dan jij?`, answer: 61, level: 3 },
  { text: `Een trein heeft 8 wagons met elk 9 zitplaatsen. Hoeveel zitplaatsen zijn er in totaal?`, answer: 72, level: 3 },
  { text: `Een boek heeft 100 pagina's. Je hebt al 35 pagina's gelezen. Hoeveel pagina's moet je nog lezen?`, answer: 65, level: 3 },
  { text: `Een school heeft 3 groepen met elk 18 leerlingen. Hoeveel leerlingen zitten er in totaal op de school?`, answer: 54, level: 3 },
  { text: `Een auto rijdt 90 kilometer per uur. Hoeveel kilometer rijdt de auto in een half uur?`, answer: 45, level: 3 },
  { text: `Een grote doos bevat 6 kleine dozen. In elke kleine doos zitten 12 potloden. Hoeveel potloden zitten er in totaal in de grote doos?`, answer: 72, level: 3 },
  { text: `Als je op de Rietendakschool om half 9 begint en om half 3 uur uit bent, hoeveel uur zit je dan op school?`, answer: 6, level: 3 },
];

// Niveau 4 (Off-piste): moeilijkere vragen
const LEVEL4_QUESTIONS: LevelQuestion[] = [
  { text: `Een bakker bakt 120 broden. Hij verkoopt er 85. Hoeveel broden heeft hij over?`, answer: 35, level: 4 },
  { text: `Een trein vertrekt om 14:45 uur en komt aan om 16:30 uur. Hoe lang duurt de reis in minuten?`, answer: 105, level: 4 },
  { text: `Een boer heeft 48 koeien. Hij koopt er 25 bij en verkoopt er 18. Hoeveel koeien heeft hij nu?`, answer: 55, level: 4 },
  { text: `Een school heeft 4 groepen met elk 22 leerlingen. Hoeveel leerlingen zitten er in totaal op de school?`, answer: 88, level: 4 },
  { text: `Een fietser rijdt 20 kilometer per uur. Hoeveel kilometer fietst hij in 4,5 uur?`, answer: 90, level: 4 },
];

// Alle vragen samengevoegd
const ALL_TEXT_QUESTIONS: LevelQuestion[] = [
  ...LEVEL0_QUESTIONS,
  ...LEVEL1_QUESTIONS,
  ...LEVEL2_QUESTIONS,
  ...LEVEL3_QUESTIONS,
  ...LEVEL4_QUESTIONS
];

export default function Game() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // Basis game state
  const [level, setLevel] = useState(0); // Begin bij niveau 0 (Beginnershelling)
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrongAnswersStreak, setWrongAnswersStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [coins, setCoins] = useState(0);
  const [skierSkill, setSkierSkill] = useState(0);
  
  // Vraag state
  const [question, setQuestion] = useState<LevelQuestion | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [isTextQuestion, setIsTextQuestion] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_LEVELS[0].timeLimit);
  const [lastQuestionTime, setLastQuestionTime] = useState(0);
  const [timeRecords, setTimeRecords] = useState<number[]>([]);
  
  // UI state
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Aanmoedigingen
  const [showFamilyEncouragement, setShowFamilyEncouragement] = useState(false);
  const [showPhotoReward, setShowPhotoReward] = useState(false);
  const [achievementType, setAchievementType] = useState<'streak' | 'level' | 'milestone' | 'score'>('streak');
  const [photoAchievement, setPhotoAchievement] = useState('');
  const [encouragementQueue, setEncouragementQueue] = useState<Encouragement[]>([]);
  
  // Huidig thema
  const currentTheme = DIFFICULTY_LEVELS[level].theme;
  
  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debug functie
  const logGameState = (label: string) => {
    console.log(`--- Game State [${label}] ---`);
    console.log("Level:", level);
    console.log("Score:", score);
    console.log("Streak:", streak);
    console.log("WrongAnswersStreak:", wrongAnswersStreak);
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
    console.log("------------------------");
  };
  
  // 1. GENEREER NIEUWE VRAAG
  const generateNewQuestion = () => {
    console.log("Genereer nieuwe vraag");
    
    // Reset UI state
    setFeedback(null);
    setSelectedOption(null);
    
    const currentLevel = DIFFICULTY_LEVELS[level];
    setLastQuestionTime(Date.now());
    
    // Bepaal of dit een tekstsom wordt (15% kans)
    const baseTextQuestionChance = 0.15; // 15% basis kans
    const levelMultiplier = Math.min(1, 0.5 + (level * 0.1)); // Verhoog kans met niveau (max 100%)
    const textQuestionChance = baseTextQuestionChance * levelMultiplier;
    
    const isTextQuestionLocal = Math.random() < textQuestionChance;
    console.log(`Kans op tekstsom: ${(textQuestionChance * 100).toFixed(1)}%, Resultaat: ${isTextQuestionLocal ? 'Tekstsom' : 'Normale som'}`);
    
    let newQuestion: LevelQuestion;
    
    if (isTextQuestionLocal) {
      // Kies een tekstsom die past bij het huidige niveau
      let availableQuestions = ALL_TEXT_QUESTIONS.filter(q => 
        !usedQuestions.includes(q.text) && q.level === level
      );
      
      // Als er geen vragen meer zijn voor dit niveau, reset de gebruikte vragen
      if (availableQuestions.length === 0) {
        console.log(`Geen ongebruikte tekstvragen meer voor niveau ${level}, reset gebruikte vragen`);
        setUsedQuestions([]);
        availableQuestions = ALL_TEXT_QUESTIONS.filter(q => q.level === level);
      }
      
      // Als er nog steeds geen vragen zijn voor dit niveau, gebruik vragen van een lager niveau
      if (availableQuestions.length === 0) {
        console.log(`Geen tekstvragen beschikbaar voor niveau ${level}, probeer lager niveau`);
        for (let l = level - 1; l >= 0; l--) {
          const lowerLevelQuestions = ALL_TEXT_QUESTIONS.filter(q => q.level === l);
          if (lowerLevelQuestions.length > 0) {
            availableQuestions = lowerLevelQuestions;
            console.log(`Gebruik tekstvragen van niveau ${l}`);
            break;
          }
        }
      }
      
      // Als er nog steeds geen vragen zijn, gebruik vragen van een hoger niveau
      if (availableQuestions.length === 0) {
        console.log(`Geen tekstvragen beschikbaar voor lagere niveaus, probeer hoger niveau`);
        for (let l = level + 1; l < DIFFICULTY_LEVELS.length; l++) {
          const higherLevelQuestions = ALL_TEXT_QUESTIONS.filter(q => q.level === l);
          if (higherLevelQuestions.length > 0) {
            availableQuestions = higherLevelQuestions;
            console.log(`Gebruik tekstvragen van niveau ${l}`);
            break;
          }
        }
      }
      
      // Als er nog steeds geen vragen zijn, gebruik een willekeurige vraag
      if (availableQuestions.length === 0) {
        console.log("Geen tekstvragen beschikbaar voor specifieke niveaus, gebruik willekeurige vraag");
        availableQuestions = ALL_TEXT_QUESTIONS;
      }
      
      const personalQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
      newQuestion = personalQuestion;
      setUsedQuestions(prev => [...prev, personalQuestion.text]);
      setIsTextQuestion(true);
      
      // Geef extra tijd voor tekstvragen
      const newTimeLeft = currentLevel.timeLimit * 3;
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
          num2 = Math.max(1, num2);
          num1 = num2 * (Math.floor(Math.random() * 10) + 1);
        }
        
        // Bereken het antwoord op basis van de operatie
        switch (operation) {
          case '+': answer = num1 + num2; break;
          case '-': 
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
      
      newQuestion = { text: questionText, answer, level };
      setIsTextQuestion(false);
      
      // Normale tijd voor gewone sommen
      const newTimeLeft = currentLevel.timeLimit;
      console.log("Timer wordt gereset naar:", newTimeLeft, "seconden (normale som)");
      setTimeLeft(newTimeLeft);
    }
    
    // Update de vraag en het correcte antwoord
    setQuestion(newQuestion);
    setCorrectAnswer(newQuestion.answer.toString());
    
    // Genereer 4 opties voor multiple choice
    const wrongAnswers: number[] = [];
    const correctAnswer = newQuestion.answer;
    
    // Genereer 3 unieke verkeerde antwoorden
    while (wrongAnswers.length < 3) {
      // Met 40% kans, genereer een antwoord met hetzelfde eindcijfer maar ander tiental
      if (wrongAnswers.length === 0 && Math.random() < 0.4) {
        // Bepaal het eindcijfer van het correcte antwoord
        const lastDigit = correctAnswer % 10;
        
        // Genereer een antwoord met hetzelfde eindcijfer maar een ander tiental
        // Kies willekeurig of we een tiental hoger of lager gaan
        const tenOffset = Math.random() < 0.5 ? 10 : -10;
        
        // Bereken het nieuwe antwoord
        const sameLastDigitWrongAnswer = correctAnswer + tenOffset;
        
        // Controleer of het nieuwe antwoord geldig is (niet negatief en niet gelijk aan het correcte antwoord)
        if (sameLastDigitWrongAnswer >= 0 && sameLastDigitWrongAnswer !== correctAnswer && !wrongAnswers.includes(sameLastDigitWrongAnswer)) {
          console.log(`Genereer verwarrend antwoord met zelfde eindcijfer: ${sameLastDigitWrongAnswer} (correct: ${correctAnswer})`);
          wrongAnswers.push(sameLastDigitWrongAnswer);
          continue;
        }
      }
      
      // Normale generatie van verkeerde antwoorden
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrongAnswer = correctAnswer + offset;
      
      if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer) && wrongAnswer >= 0) {
        wrongAnswers.push(wrongAnswer);
      }
    }
    
    // Combineer en shuffle de opties
    const allOptions = [...wrongAnswers, correctAnswer].map(String);
    setOptions(allOptions.sort(() => Math.random() - 0.5));
    
    console.log("Nieuwe vraag gegenereerd:", newQuestion.text, "Antwoord:", correctAnswer, "Opties:", allOptions);
    
    // Start de timer
    startTimer();
  };
  
  // 2. START TIMER
  const startTimer = () => {
    // Stop eerst eventuele bestaande timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    console.log(`Timer gestart met ${timeLeft} seconden`);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          // Stop de timer als de tijd op is
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          // Tijd is op, behandel als fout antwoord
          console.log("Tijd is op, antwoord wordt als fout gemarkeerd");
          handleAnswer(false);
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };
  
  // 3. VERWERK ANTWOORD
  const handleAnswer = (isCorrect: boolean) => {
    console.log("Antwoord verwerken:", isCorrect ? "correct" : "incorrect");
    
    // Stop de timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
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
    const isExceptionallyFast = timeRatio < 0.4 && answerTime > 0.5; // Sneller dan 40% van verwachte tijd maar niet te snel
    const averageTimeRatio = timeRecords.length > 0 ? timeRecords.reduce((a, b) => a + b, 0) / timeRecords.length : 1;
    const isMuchFasterThanAverage = timeRecords.length > 3 && timeRatio < averageTimeRatio * 0.6;
    
    if (isCorrect) {
      // Correct antwoord
      setFeedback('correct');
      
      // Reset de streak van foute antwoorden
      setWrongAnswersStreak(0);
      
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
      
      // Verwerk milestones
      let showEncouragement = false;
      
      // Verwerk milestones voor skiërvaardigheden
      if (newStreak % 5 === 0 && skierSkill < 4) {
        setSkierSkill(prev => prev + 1);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      // Verwerk milestones voor niveau
      if (newStreak % 10 === 0 && level < DIFFICULTY_LEVELS.length - 1) {
        setLevel(prev => prev + 1);
        console.log(`Level verhoogd naar ${level + 1} (${DIFFICULTY_LEVELS[level + 1].name}) na ${newStreak} correcte antwoorden op rij`);
        
        // Toon altijd een aanmoediging bij een level-up, ongeacht de 50% kans
        showFamilyEncouragementUI('level', DIFFICULTY_LEVELS[level + 1].name);
        showEncouragement = true;
      }
      
      // Bepaal of er een aanmoediging moet komen (alleen als er nog geen level-up aanmoediging is)
      if (!showEncouragement && !showFamilyEncouragement && !showPhotoReward) {
        // Verminder de frequentie van aanmoedigingen
        const shouldShowEncouragement = Math.random() < 0.5; // 50% kans om een aanmoediging te tonen
        
        if (shouldShowEncouragement) {
          // 1. Muntjesmijlpaal bereikt (alleen bij veelvouden van 50)
          if (coins > 0 && (coins + earnedCoins) % 50 < earnedCoins) {
            showPhotoEncouragementUI(`Je hebt ${coins + earnedCoins} muntjes verzameld! Je bent een echte rekenheld!`);
            showEncouragement = true;
          } 
          // 2. Reeks van 10 bereikt (alleen bij veelvouden van 10)
          else if (newStreak % 10 === 0 && newStreak > 0) {
            showPhotoEncouragementUI(`Je hebt ${newStreak} vragen goed beantwoord op rij!`);
            showEncouragement = true;
          }
          // 3. Nieuw skiërsniveau bereikt (alleen bij veelvouden van 5)
          else if (newStreak % 5 === 0 && newStreak > 0 && skierSkill < 4) {
            showFamilyEncouragementUI('streak', DIFFICULTY_LEVELS[level].name);
            showEncouragement = true;
          }
          // 4. Niveau omhoog is al eerder afgehandeld, dus deze conditie is niet meer nodig
          // 5. Uitzonderlijk snel antwoord (verlaagde kans)
          else if ((isExceptionallyFast || isMuchFasterThanAverage) && Math.random() < 0.1) {
            showFamilyEncouragementUI('streak', DIFFICULTY_LEVELS[level].name);
            showEncouragement = true;
          }
        }
      }
      
      // Plan de volgende vraag
      if (!showEncouragement) {
        setTimeout(() => {
          generateNewQuestion();
        }, 1500); // Wacht 1.5 seconden na een correct antwoord
      }
    } else {
      // Fout antwoord
      setFeedback('incorrect');
      setStreak(0);
      
      // Verhoog de streak van foute antwoorden
      const newWrongAnswersStreak = wrongAnswersStreak + 1;
      setWrongAnswersStreak(newWrongAnswersStreak);
      
      // Verminder een leven bij fout antwoord
      const newLives = lives - 1;
      setLives(newLives);
      
      // Game over als levens op zijn
      if (newLives <= 0) {
        console.log("Game over! Geen levens meer over.");
        setIsGameOver(true);
        return;
      }
      
      // Als speler te veel fouten maakt, ga naar een makkelijker niveau
      if (level > 0 && newWrongAnswersStreak >= 3) {
        setLevel(prev => prev - 1);
        setWrongAnswersStreak(0);
        console.log(`Level verlaagd naar ${level - 1} (${DIFFICULTY_LEVELS[level - 1].name}) na ${newWrongAnswersStreak} foute antwoorden op rij`);
      }
      
      // Plan de volgende vraag
      setTimeout(() => {
        generateNewQuestion();
      }, 2000); // Wacht 2 seconden na een fout antwoord
    }
  };
  
  // 4. TOON AANMOEDIGINGEN
  const showFamilyEncouragementUI = (type: 'streak' | 'level' | 'milestone' | 'score', levelName?: string) => {
    console.log("Familie aanmoediging tonen:", type, levelName ? `voor nieuwe piste: ${levelName}` : '');
    setAchievementType(type);
    // Sla de naam van de nieuwe piste op als het een level-up is
    if (type === 'level' && levelName) {
      setPhotoAchievement(levelName);
    }
    setShowFamilyEncouragement(true);
    setIsPaused(true);
  };
  
  const showPhotoEncouragementUI = (message: string) => {
    console.log("Foto beloning tonen:", message);
    setPhotoAchievement(message);
    setShowPhotoReward(true);
    setIsPaused(true);
  };
  
  // 5. AFHANDELEN VAN AANMOEDIGINGEN
  const handleFamilyEncouragementComplete = () => {
    console.log("Familie aanmoediging afgerond");
    setShowFamilyEncouragement(false);
    setIsPaused(false);
    
    // Genereer een nieuwe vraag na de aanmoediging
    setTimeout(() => {
      generateNewQuestion();
    }, 100);
  };
  
  const handlePhotoRewardComplete = () => {
    console.log("Foto beloning afgerond");
    setShowPhotoReward(false);
    setIsPaused(false);
    
    // Genereer een nieuwe vraag na de aanmoediging
    setTimeout(() => {
      generateNewQuestion();
    }, 100);
  };
  
  // 6. OPTIE SELECTIE
  const handleOptionSelect = (option: string) => {
    console.log("Optie geselecteerd:", option, "Correct antwoord:", correctAnswer, "Is tekstsom:", isTextQuestion);
    
    // Voorkom dat de speler meerdere keren kan klikken
    if (feedback !== null) {
      console.log("Antwoord al gegeven, negeer klik");
      return;
    }
    
    setSelectedOption(parseInt(option));
    
    // Controleer of het antwoord correct is
    const isCorrect = option === correctAnswer;
    handleAnswer(isCorrect);
  };
  
  // 7. RESET SPEL
  const resetGame = () => {
    console.log("Spel resetten");
    
    // Stop de timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset alle game state
    setLevel(0);
    setScore(0);
    setCoins(0);
    setStreak(0);
    setWrongAnswersStreak(0);
    setSkierSkill(0);
    setIsGameOver(false);
    setLives(3);
    setFeedback(null);
    setQuestion(null);
    setOptions([]);
    setIsTextQuestion(false);
    setUsedQuestions([]);
    setShowFamilyEncouragement(false);
    setShowPhotoReward(false);
    setEncouragementQueue([]);
    setIsPaused(false);
    
    // Start een nieuwe vraag
    setTimeout(() => {
      generateNewQuestion();
    }, 100);
  };
  
  // 8. INITIALISATIE
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Start het spel wanneer de client geladen is
  useEffect(() => {
    if (isClient && !question && !isGameOver) {
      console.log("Spel wordt gestart...");
      generateNewQuestion();
    }
  }, [isClient, question, isGameOver]);
  
  // 9. CLEANUP
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
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
        pisteName={photoAchievement}
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