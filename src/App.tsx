import React, { useEffect } from 'react';
import _ from "lodash"
import logo from './logo.svg';
import './App.css';
import { words} from "./words"
interface Position {
  pos: number,
  c: string,
  correct: boolean
}

interface GameState {
  positions: Position[]
  guesses: string[],
  deadLetters: string[],
}

const hasP = (pos: Position, word: string) =>
  pos.correct ? word[pos.pos] === pos.c : word[pos.pos] !== pos.c && word.includes(pos.c);

const getAvailableWords = (gameState: GameState): string[] => {
  const filteredDeadLetters = gameState.deadLetters.length > 0 ? words.filter(
      w => gameState.deadLetters.every(l => w.indexOf(l) === -1)
    ) : words
  const filteredPositions = gameState.positions.length > 0 ? filteredDeadLetters.filter(
    (w) =>
      gameState.positions.every((p) => hasP(p, w))
  ) : filteredDeadLetters
  return filteredPositions
};

const fiveTimes = [0, 1, 2, 3, 4];

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("")

const subtractArr = (arr1: string[], arr2: string[]) => arr1.filter(c => !arr2.includes(c))

const similarity = (word1: string, word2: string, letters: string[], ignoredLetters: string[]) => {
  const lettersToUse = letters.filter((l) => word1.includes(l) && !ignoredLetters.includes(l));
  const lettersContaining = lettersToUse.filter((l) => word2.includes(l));
  const lettersInCorrectPlace = lettersToUse.filter(
    (l) => word2[word1.indexOf(l)] === l
  );
  return lettersContaining.length
    ? 10 + lettersContaining.length + lettersInCorrectPlace.length
    : 0;
};

const scoreWords = (gameState: GameState) => {
  const wordsToScore = words.filter(w => !gameState.guesses.includes(w))
  const availableWords = getAvailableWords(gameState);
  const guessedLetters = _.uniq(gameState.positions.filter(pos => pos.correct).map(pos => pos.c))
  const ignornedLetters = guessedLetters.length > 4 ? [] : guessedLetters
  const availableLetters = subtractArr(alphabet, gameState.deadLetters)
  const score = wordsToScore.reduce((acc, word) => {
    acc[word] = availableWords.reduce(
      (acc, innerWord) => acc + similarity(word, innerWord, availableLetters, ignornedLetters),
      0
    );
    acc[word] = availableWords.includes(word) ? (acc[word] + 50): acc[word]
    return acc;
  }, {} as Record<string, number>);
  return score
};

const makeGuess = (gameState: GameState): [string, number][] => {
  if (gameState.positions.length === 0 && gameState.deadLetters.length === 0) {
    return [
      ["aloes", 69452],
      ["tares", 68967],
      ["nares", 68666],
      ["rates", 68664],
      ["tales", 68495],
      ["cares", 68309],
      ["lanes", 68309],
      ["lores", 68297],
      ["roles", 68207],
      ["earls", 68049],
    ]
  }
  const scoredWords = scoreWords(gameState)
  const pairs = _.sortBy(_.toPairs(scoredWords), (pair: [string, number]) => -1 * pair[1])
  console.log(pairs.slice(0,10))
  return pairs
}

const getGameState = (guesses: string[], wordToGuess: string): GameState => {
  const letters = _.uniq(guesses.flatMap(g => g.split("")))
  const positions: Position[] = guesses.flatMap(g => g.split("").map((l, p) => {
    const correct = wordToGuess[p] === l
      return {
        pos: p,
        c: l,
        correct
      }
  })).filter(pos => wordToGuess.includes(pos.c))

  return {
    guesses,
    positions,
    deadLetters: letters.filter(l => !wordToGuess.includes(l))
  }
}
interface Win {
  guesses: string[],
  wordToGuess: string
}

function App() {
  const [wordToGuess, setWordToGuess] = React.useState<string>("knoll")
  const [lastGuess, setLastGuess] = React.useState<[string,number][]>([])
  const [guesses, setGuesses] = React.useState<string[]>([])
  const [wins, setWins] = React.useState<Win[]>([])
  const guessWord = () => {
    const gameState: GameState = getGameState(guesses, wordToGuess)
    const guess = makeGuess(gameState)
    const top10 = guess.slice(0, 10)
    setLastGuess(top10)
    setGuesses([...guesses, top10[0][0]])
  }
  const restartGame = () => {
    setWins([
      ...wins,
      {
        guesses,
        wordToGuess,
      }
    ])
    setWordToGuess(_.sample(words) || "sugar")
    setLastGuess([])
    setGuesses([])
  }
  const win = _.last(guesses) === wordToGuess
  const paddedGuesses = [
    ...guesses,
    ..._.range(0,6).map(n => "     ")
  ].slice(0, 6)
  React.useEffect(() => {
    win ? restartGame() : guessWord()
  });
  return (
    <div className="App">
      <header className="App-header">
        <div className="gameBoard">
          {paddedGuesses.map((guess: string) => {
            return (
              <div className="guessRow">
                {guess.split("").map((letter, loc) => (
                  <div className={`guessLetter ${wordToGuess[loc] === letter ? "correct" : wordToGuess.includes(letter) ? "almost" : "incorrect"}`}>
                    {letter.toUpperCase()}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
        {win && <button className="button nextGameButton" onClick={restartGame} > Next Game </button>}
        {!win && <button className="button" onClick={guessWord} > Make Guess </button>}
        <div className="winsContainer">
        {wins.map(win => (
          <div className="win">
            {`${win.wordToGuess}: ${win.guesses.length}`}
          </div>
        ))}
        </div>
        {lastGuess.map(guess => (
          <div>
            {`${guess[0]}: ${guess[1]}`}
          </div>
        ))}
      </header>
    </div>
  );
}

export default App;
