import { useEffect, useState } from "react";
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
  const [guessRows, setGuessRows] = useState([
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
  ]);
  const messageDisplay = document.querySelector(".message-container");

  const getWordle = () => {
    axios
      .get("https://localhost:7234/WordleGame/getWord")
      .then((response) => {
        const word = response.data.word as string;
        setWord(word.toUpperCase());
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getWordle();
  }, []);

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

      setGuessRows((guessRows) => {
        guessRows[currentRow][currentTile] = letter;
        return guessRows;
      });

      tile!.setAttribute("data", letter);

      if (currentTile < 5) setCurrentTile(currentTile + 1);
    }
  };

  const deleteLetter = () => {
    const prevTile = currentTile - 1;
    const deleteMethod = (tileToDelete: number) => {
      const tile = document.getElementById(
        "guessRow-" + currentRow + "-tile-" + tileToDelete
      );
      tile!.textContent = "";
      guessRows[currentRow][tileToDelete] = "";
      tile!.setAttribute("data", "");
    };

    if (currentTile > 0) {
      setCurrentTile(prevTile);
      if (currentTile >= 0) deleteMethod(prevTile);
    }
  };

  const checkRow = () => {
    const guess = guessRows[currentRow].join("");
    if (currentTile > 4) {
      axios
        .get(`https://localhost:7234/WordleGame/check?guess=${guess}`)
        .then((response) => response.data.response)
        .then((data) => {
          if (!data) {
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
    const key = document.getElementById(keyLetter);
    if (key?.classList.contains("bg-yellow-300") && color == "bg-gray-300")
      return;
    if (key?.classList.contains("bg-green-300")) return;

    if (key?.classList.contains("bg-gray-300")) {
      key!.classList.replace("bg-gray-300", color);
      return;
    }

    if (key?.classList.contains("bg-yellow-300")) {
      key!.classList.replace("bg-yellow-300", color);
      return;
    }

    key!.classList.add(color);
  };

  const flipTile = () => {
    let checkWordle = word;
    const guess: Guess[] = [];
    const rowTiles = document.getElementById(
      "guessRow-" + currentRow
    )!.childNodes;

    rowTiles.forEach((tile) => {
      if (tile instanceof HTMLElement) {
        guess.push({
          letter: tile.getAttribute("data") as string,
          color: "bg-gray-300",
        });
      }
    });

    guess.forEach((guess, index) => {
      if (checkWordle.includes(guess.letter)) {
        guess.color = "bg-yellow-300";
        // checkWordle = checkWordle.replace(guess.letter, "");
      }

      if (guess.letter == word[index]) {
        guess.color = "bg-green-300";
      }
    });

    // guess.forEach((guess, index) => {

    //   // checkWordle = checkWordle.replace(guess.letter, "");
    // });

    console.log(guess);
    console.log(checkWordle);

    rowTiles.forEach((tile: any, index: number) => {
      setTimeout(() => {
        tile.classList.add(guess[index].color, "flip");
        addColorToKey(guess[index].letter, guess[index].color);
      }, 500 * index);
    });
  };

  //Restart button
  const restartHandler = () => {
    getWordle();

    setGuessRows((guessRows) => {
      guessRows.forEach((row) => row.forEach((tile) => (tile = "")));
      return guessRows;
    });
    setCurrentRow(0);
    setCurrentTile(0);
    setIsGameOver(false);

    const tiles = document.querySelectorAll(".tile");
    tiles.forEach((tile) => {
      tile.textContent = "";
      tile.classList.remove("bg-green-300", "bg-yellow-300", "bg-gray-300");
      tile.removeAttribute("data");
    });
  };

  return (
    <>
      <div className="message-container"></div>
      <button id="restart-button" className="" onClick={restartHandler}>
        Restart
      </button>
      <div className="tile-container flex flex-col justify-center items-center text-center border w-72 border-black my-3 mx-auto">
        {guessRows.map((rows, i) => {
          return (
            <div key={i} id={`guessRow-${i}`} className="flex">
              {rows.map((_tiles, j) => {
                return (
                  <div
                    key={j}
                    className="tile w-12 h-12 border-2 border-black flex justify-center items-center text-black m-1"
                    id={`guessRow-${i}-tile-${j}`}
                  ></div>
                );
              })}
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
