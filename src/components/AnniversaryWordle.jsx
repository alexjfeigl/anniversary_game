import React, { useState, useEffect, useCallback } from 'react';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const WORDS = {
  'DATES': 'DFW',
  'FIRST': 'London',
  'KNEEL': 'Maibara',
  'STARS': 'West Texas',
  'MARRY': 'New York'
};

const VALID_WORDS = new Set([...Object.keys(WORDS), 'ADIEU', 'AUDIO', 'RAISE', 'STARE', 'CRANE']);

const AnniversaryWordle = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [solvedWords, setSolvedWords] = useState(new Set());
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [gameState, setGameState] = useState('playing');
  const [notification, setNotification] = useState('');
  const [usedLetters, setUsedLetters] = useState(new Map());

  const words = Object.keys(WORDS);
  const currentWord = words[currentWordIndex];
  const currentHint = WORDS[currentWord];

  const evaluateGuess = (guess) => {
    const result = Array(WORD_LENGTH).fill('gray');
    const wordArray = currentWord.split('');
    const guessArray = guess.split('');
    
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessArray[i] === wordArray[i]) {
        result[i] = 'green';
        wordArray[i] = null;
        guessArray[i] = null;
      }
    }
    
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessArray[i] === null) continue;
      
      const index = wordArray.indexOf(guessArray[i]);
      if (index !== -1) {
        result[i] = 'yellow';
        wordArray[index] = null;
      }
    }
    
    return result;
  };

  const updateUsedLetters = (guess, evaluation) => {
    const newUsedLetters = new Map(usedLetters);
    
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      const currentStatus = newUsedLetters.get(letter);
      const newStatus = evaluation[i];
      
      if (!currentStatus || 
          (currentStatus === 'gray' && (newStatus === 'yellow' || newStatus === 'green')) ||
          (currentStatus === 'yellow' && newStatus === 'green')) {
        newUsedLetters.set(letter, newStatus);
      }
    }
    
    setUsedLetters(newUsedLetters);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 2000);
  };

  const moveToNextWord = useCallback(() => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setGuesses([]);
      setCurrentGuess('');
      setUsedLetters(new Map());
      setGameState('playing');
    }
  }, [currentWordIndex, words.length]);

  const handleKeyPress = useCallback((event) => {
    if (gameState !== 'playing') return;

    if (event.key === 'Enter') {
      if (currentGuess.length !== WORD_LENGTH) {
        showNotification('Not enough letters');
        return;
      }

      const evaluation = evaluateGuess(currentGuess.toUpperCase());
      const newGuesses = [...guesses, { word: currentGuess.toUpperCase(), evaluation }];
      setGuesses(newGuesses);
      updateUsedLetters(currentGuess.toUpperCase(), evaluation);
      setCurrentGuess('');

      if (currentGuess.toUpperCase() === currentWord) {
        const newSolvedWords = new Set(solvedWords);
        newSolvedWords.add(currentWord);
        setSolvedWords(newSolvedWords);
        
        if (newSolvedWords.size === words.length) {
          setGameState('complete');
        } else {
          setTimeout(moveToNextWord, 1500);
        }
      } else if (newGuesses.length >= MAX_ATTEMPTS) {
        setGameState('lost');
      }
    } else if (event.key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[a-zA-Z]$/.test(event.key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + event.key.toUpperCase());
    }
  }, [currentGuess, gameState, currentWord, guesses, solvedWords, moveToNextWord]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleVirtualKeyPress = (letter) => {
    if (gameState === 'playing' && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + letter);
    }
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Worldle</h1>
      <div className="mb-4">Hint: {currentHint}</div>
      <div className="mb-4 text-sm">
        Solved {solvedWords.size} of {words.length} words
      </div>

      {notification && (
        <div className="mb-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {notification}
          </div>
        </div>
      )}
      
      <div className="grid grid-rows-6 gap-1 mb-4">
        {Array(MAX_ATTEMPTS).fill(null).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-1">
            {Array(WORD_LENGTH).fill(null).map((_, colIndex) => {
              const guess = guesses[rowIndex];
              const letter = guess ? guess.word[colIndex] : 
                            (rowIndex === guesses.length ? currentGuess[colIndex] : '');
              const status = guess ? guess.evaluation[colIndex] : '';
              
              return (
                <div
                  key={colIndex}
                  className={`w-12 h-12 border-2 flex items-center justify-center text-xl font-bold
                    ${status === 'green' ? 'bg-green-500 text-white' :
                      status === 'yellow' ? 'bg-yellow-500 text-white' :
                      status === 'gray' ? 'bg-gray-500 text-white' :
                      'border-gray-300'}`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-10 gap-1 mb-4">
        {Array.from('QWERTYUIOP').map(letter => (
          <button
            key={letter}
            onClick={() => handleVirtualKeyPress(letter)}
            className={`w-8 h-8 text-sm font-bold rounded
              ${usedLetters.get(letter) === 'green' ? 'bg-green-500 text-white' :
                usedLetters.get(letter) === 'yellow' ? 'bg-yellow-500 text-white' :
                usedLetters.get(letter) === 'gray' ? 'bg-gray-500 text-white' :
                'bg-gray-200'}`}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-9 gap-1 mb-4">
        {Array.from('ASDFGHJKL').map(letter => (
          <button
            key={letter}
            onClick={() => handleVirtualKeyPress(letter)}
            className={`w-8 h-8 text-sm font-bold rounded
              ${usedLetters.get(letter) === 'green' ? 'bg-green-500 text-white' :
                usedLetters.get(letter) === 'yellow' ? 'bg-yellow-500 text-white' :
                usedLetters.get(letter) === 'gray' ? 'bg-gray-500 text-white' :
                'bg-gray-200'}`}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-9 gap-1 mb-4">
        <button
          onClick={() => setCurrentGuess(prev => prev + ' ')}
          className="w-8 h-8 text-sm font-bold rounded bg-gray-200 col-span-1"
        >
          ⏎
        </button>
        {Array.from('ZXCVBNM').map(letter => (
          <button
            key={letter}
            onClick={() => handleVirtualKeyPress(letter)}
            className={`w-8 h-8 text-sm font-bold rounded
              ${usedLetters.get(letter) === 'green' ? 'bg-green-500 text-white' :
                usedLetters.get(letter) === 'yellow' ? 'bg-yellow-500 text-white' :
                usedLetters.get(letter) === 'gray' ? 'bg-gray-500 text-white' :
                'bg-gray-200'}`}
          >
            {letter}
          </button>
        ))}
        <button
          onClick={() => setCurrentGuess(prev => prev.slice(0, -1))}
          className="w-8 h-8 text-sm font-bold rounded bg-gray-200 col-span-1"
        >
          ⌫
        </button>
      </div>

      {gameState === 'complete' && (
        <div className="mt-4 text-center whitespace-pre-line">
          Adventure Always.<br/>
          I'm proud to call you my adventure buddy and look forward to all the adventures we will have together.<br/>
          Happy 1 Year Anniversary, here's to a lifetime more.
        </div>
      )}
      
      {gameState === 'lost' && (
        <div className="mt-4 text-center">
          The word was {currentWord}
        </div>
      )}
    </div>
  );
};

export default AnniversaryWordle;