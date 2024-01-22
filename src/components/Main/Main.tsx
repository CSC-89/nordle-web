import React, { useEffect, useState } from "react";
import axios from "axios";
import { keyboard as keys } from "../../keys/keys";
import "./Main.css";

type Guess = {
  letter: string;
  color: string;
};

const Main = () => {
  const [word, setWord] = useState<string>("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentRow, setCurrentRow] = useState(0);
  const [currentTile, setCurrentTile] = useState(0);
  const tileDisplay = document.querySelector(".tile-container");
  const messageDisplay = document.querySelector(".message-container");
  const keyboard = document.querySelector(".key-container");

  const getWordle = () => {
    axios
      .get("https://localhost:7234/WordleGame")
      .then((response) => setWord(response.data.word))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getWordle();
  }, []);

  console.log(word);

  let guessRows = [
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
  ];

  const handleClick = (letter: string) => {
    if (!isGameOver) {
      if (letter === "BACK") {
        deleteLetter();
        return;
      }
      if (letter === "ENTER") {
        checkRow();
        return;
      }
      addLetter(letter);
    }
  };

  const addLetter = (letter: string) => {
    if (currentTile < 5 && currentRow < 6) {
      const tile = document.getElementById(
        "guessRow-" + currentRow + "-tile-" + currentTile
      );
      tile!.textContent = letter;
      guessRows[currentRow][currentTile] = letter;
      tile!.setAttribute("data", letter);
      setCurrentTile(currentTile + 1);
    }
  };

  const deleteLetter = () => {
    if (currentTile > 0) {
      setCurrentTile(currentTile - 1);
      const tile = document.getElementById(
        "guessRow-" + currentRow + "-tile-" + currentTile
      );
      tile!.textContent = "";
      guessRows[currentRow][currentTile] = "";
      tile!.setAttribute("data", "");
    }
  };

  const checkRow = () => {
    const guess = guessRows[currentRow].join("");
    console.log(guess);
    if (currentTile > 4) {
      fetch(`https://localhost:7234/WordleGame/check/?word=${guess}`)
        .then((response) => response.json())
        .then((json) => {
          if (json == "Entry word not found") {
            showMessage("Word not in list.");
            return;
          } else {
            flipTile();
            if (word == guess) {
              showMessage("You got it!");
              setIsGameOver(true);
            } else {
              if (currentRow >= 5) {
                setIsGameOver(true);

                showMessage("Game Over..");
                return;
              }
              if (currentRow < 5) {
                setCurrentRow(currentRow + 1);
                setCurrentTile(0);
              }
            }
          }
        });
    }
  };

  const showMessage = (message: string) => {
    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    messageDisplay!.append(messageElement);
    setTimeout(() => {
      messageDisplay!.removeChild(messageElement);
    }, 2000);
  };

  const addColorToKey = (keyLetter: string, color: string) => {
      const key = document.getElementById(keyLetter)
      key!.classList.add(color)
  }

  const flipTile = () => {
    let checkWordle = word;
    const guess: Guess[] = [];
    const rowTiles = document.getElementById(
      "guessRow-" + currentRow
    )!.childNodes as any;

    rowTiles.forEach((tile: any) => {
      guess.push({ letter: tile.getAttribute("data"), color: "grey-overlay" });
    });

    guess.forEach((guess, index) => {
      if (guess.letter == word[index]) {
        guess.color = "green-overlay";
        checkWordle = checkWordle.replace(guess.letter, "");
      }
    });

    guess.forEach((guess) => {
      if (checkWordle.includes(guess.letter)) {
        guess.color = "yellow-overlay";
        checkWordle = checkWordle.replace(guess.letter, "");
      }
    });

    rowTiles.forEach((tile: any, index: number) => {
      setTimeout(() => {
        tile.classList.add(guess[index].color, "flip");
        addColorToKey(guess[index].letter, guess[index].color);
      }, 500 * index);
    });
  };

  // //Restart button
  // const restartHandler = () => {

  //     getWordle();

  //     guessRows.forEach(item => item = '');
  //     currentRow = 0;
  //     currentTile = 0;
  //     isGameOver = false;

  //     const tiles = document.querySelectorAll(".tile")
  //     console.log(tiles)
  //     tiles.forEach(tile => {
  //         tile.textContent = '';
  //         tile.classList.remove('green-overlay', 'yellow-overlay', 'grey-overlay', 'flip');
  //         tile.removeAttribute('data');
  //     })
  //   }

  // const restartButton = document.getElementById('restart-button')
  // restartButton.addEventListener('click', restartHandler);
  return (
    <>
      <div className="tile-container flex flex-col justify-center items-center text-center border w-72 border-black my-3 mx-auto">
        {guessRows.map((elm, i) => {
          return (
            <div key={i} id={`guessRow-${i}`} className="flex">
              <div
                className="tile w-12 h-12 border-2 border-black flex justify-center items-center text-black m-1"
                id={`guessRow-${i}-tile-0`}
              ></div>
              <div
                className="tile w-12 h-12 border-2 border-black flex justify-center items-center text-black m-1"
                id={`guessRow-${i}-tile-1`}
              ></div>
              <div
                className="tile w-12 h-12 border-2 border-black flex justify-center items-center text-black m-1"
                id={`guessRow-${i}-tile-2`}
              ></div>
              <div
                className="tile w-12 h-12 border-2 border-black flex justify-center items-center text-black m-1"
                id={`guessRow-${i}-tile-3`}
              ></div>
              <div
                className="tile w-12 h-12 border-2 border-black flex justify-center items-center text-black m-1"
                id={`guessRow-${i}-tile-4`}
              ></div>
            </div>
          );
        })}
      </div>

      <div className="key-container w-screen">
        {keys.map((elm) => {
          return (
            <button
              className="w-6 h-6 rounded-md bg-gray-400 m-1 text-white text-sm"
              id={elm}
              key={elm}
              onClick={() => handleClick(elm)}
            >
              {elm}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default Main;
