/**
 * Genereert een willekeurig getal tussen min en max (inclusief)
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Genereer een rekensom en antwoord gebaseerd op het huidige niveau
 */
export const generateQuestion = (
  min: number,
  max: number,
  operations: string[]
): { question: string; answer: number } => {
  // Kies een willekeurige operatie uit de beschikbare opties voor dit niveau
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let num1: number, num2: number, answer: number, question: string;
  
  switch (operation) {
    case '+':
      num1 = randomInt(min, max);
      num2 = randomInt(min, max);
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
      break;
      
    case '-':
      // Zorg ervoor dat het antwoord niet negatief is (voor jonge kinderen)
      num1 = randomInt(min, max);
      num2 = randomInt(min, Math.min(max, num1));
      answer = num1 - num2;
      question = `${num1} - ${num2} = ?`;
      break;
      
    case 'x':
      // Beperk vermenigvuldigingen voor eenvoud
      num1 = randomInt(min, Math.min(max, 12));
      num2 = randomInt(min, Math.min(max, 12));
      answer = num1 * num2;
      question = `${num1} × ${num2} = ?`;
      break;
      
    case '÷':
      // Maak deelsommen die netjes opgaan
      num2 = randomInt(2, Math.min(max, 10));
      answer = randomInt(1, Math.min(max / num2, 10));
      num1 = num2 * answer; // Zorg ervoor dat er een geheel getal uitkomt
      question = `${num1} ÷ ${num2} = ?`;
      break;
      
    default:
      // Standaard terugvallen op optellen
      num1 = randomInt(min, max);
      num2 = randomInt(min, max);
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
  }
  
  return { question, answer };
};

/**
 * Genereer verkeerde antwoorden die plausibel zijn
 */
export const generateWrongAnswers = (
  correctAnswer: number,
  count: number,
  minDifference: number = 1,
  maxDifference: number = 5
): number[] => {
  const wrongAnswers: number[] = [];
  
  while (wrongAnswers.length < count) {
    // Genereer een offset tussen -maxDifference en +maxDifference, maar niet 0
    let offset = randomInt(minDifference, maxDifference) * (Math.random() < 0.5 ? -1 : 1);
    
    // Zorg ervoor dat het antwoord niet negatief is
    const wrongAnswer = Math.max(0, correctAnswer + offset);
    
    // Voeg toe als het nog niet in de lijst staat en niet gelijk is aan het juiste antwoord
    if (wrongAnswer !== correctAnswer && !wrongAnswers.includes(wrongAnswer)) {
      wrongAnswers.push(wrongAnswer);
    }
  }
  
  return wrongAnswers;
}; 