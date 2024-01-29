import { SyntheticEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { keyboard as keys } from "../../keys/keys";
import "./Main.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const currentTileRef = useRef(currentTile);
  const currentRowRef = useRef(currentRow);
  const wordRef = useRef(word);

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
    currentTileRef.current = currentTile;
  }, [currentTile]);
  
  useEffect(() => {
    currentRowRef.current = currentRow;
  }, [currentRow]);

  useEffect(() => {
    wordRef.current = word;
  }, [word]);

  useEffect(() => {
    getWordle();
    window.addEventListener("keyup", handleKeyPress);
  }, []);


  const handleClick = (letter: string) => {
    if (!isGameOver) {
      switch (letter) {
        case "BACK":
          return deleteLetter();
        case "ENTER":
          return checkRow();
      }
      addLetter(letter);
    }
  };

  const handleKeyPress = (evt: KeyboardEvent) => {
    let letter = evt.key.toUpperCase();
    if(letter == "BACKSPACE") {
      letter = "BACK";
    }
    if (!keys.includes(letter) || isGameOver) {
      return;
    }

    switch (letter) {
      case "BACK":
        return deleteLetter();
      case "ENTER":
        return checkRow();
      default:
        addLetter(letter);
        break;
    }
  };

  const addLetter = (letter: string) => {
    if (currentTileRef.current < 5 && currentRowRef.current < 6) {
      const tile = document.getElementById(
        "guessRow-" + currentRowRef.current + "-tile-" + currentTileRef.current
      );
      tile!.textContent = letter;
        console.log(currentRowRef.current);
      setGuessRows((guessRows) => {
        guessRows[currentRowRef.current][currentTileRef.current] = letter;
        return guessRows;
      });

      console.log(guessRows)

      tile!.setAttribute("data", letter);

      setCurrentTile((prevTile) => {
        if (prevTile < 5) return prevTile + 1;
        return prevTile;
      });
    }
  };

  const deleteLetter = () => {
    const prevTile = currentTileRef.current - 1;
  
    const deleteMethod = (tileToDelete: number) => {
      const tile = document.getElementById(
        "guessRow-" + currentRowRef.current + "-tile-" + tileToDelete
      );
      tile!.textContent = "";
      setGuessRows((guessRows) => {
        guessRows[currentRowRef.current][tileToDelete] = "";
        return guessRows;
      });
      tile!.setAttribute("data", "");
    };
  
    if (currentTileRef.current > 0) {
      setCurrentTile((prevTile) => {
        if (prevTile > 0) return prevTile - 1;
        return prevTile;
      });
      deleteMethod(prevTile);
    }
  };

  const checkRow = () => {
    const guess = guessRows[currentRowRef.current].join("");
    if (currentTileRef.current > 4) {
      axios
        .get(`https://localhost:7234/WordleGame/check?guess=${guess}`)
        .then((response) => response.data.response)
        .then((data) => {
          if (!data) {
            showMessage("Word not in list.");
            return;
          } else {
            flipTile();
            if (wordRef.current == guess) {
              showMessage("You got it!");
              setIsGameOver(true);
            } else {
              if (currentRowRef.current >= 5) {
                setIsGameOver(true);

                showMessage(`Game Over..`);
                return;
              }
              if (currentRowRef.current < 5) {
                console.log("hit: ", currentRowRef.current)
                setCurrentRow(prevRow => prevRow + 1);
                setCurrentTile(0);
              }
            }
          }
        });
    }
  };

  const showMessage = (message: string) => {
    switch (message) {
      case "Word not in list.":
        toast.warn(message, {
          autoClose: 2000,
        });
        return;
      case "You got it!":
        toast.success(message, {
          autoClose: false,
        });
        return;
      case "Game Over..":
        toast.error(`${message} The correct answer was ${word}`, {
          autoClose: false,
        });
        return;
    }
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
      "guessRow-" + currentRowRef.current
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
      }

      if (guess.letter == word[index]) {
        guess.color = "bg-green-300";
      }
    });

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
    const keys = document.querySelectorAll(".key-button");

    tiles.forEach((tile) => {
      tile.textContent = "";
      tile.classList.remove("bg-green-300", "bg-yellow-300", "bg-gray-300");
      tile.removeAttribute("data");
    });
    keys.forEach((key) => {
      key.classList.remove("bg-green-300", "bg-yellow-300", "bg-gray-300");
    });
  };
  console.log(word);
  return (
    <main
      id="main-container"
      className="flex flex-col justify-center items-center"
    >
      <ToastContainer position="top-left" />
      <div className="message-container"></div>
      <button
        id="restart-button"
        className="rounded-md bg-blue-200 p-3 m-3 hover:bg-red-200"
        onClick={restartHandler}
      >
        Restart
      </button>
      <div className="tile-container flex flex-col justify-center items-center text-center border w-72 border-black my-3 mx-auto rounded-md">
        {guessRows.map((rows, i) => {
          return (
            <div key={i} id={`guessRow-${i}`} className="flex">
              {rows.map((_tiles, j) => {
                return (
                  <div
                    key={j}
                    className="tile w-12 h-12 border-2 border-black flex justify-center items-center text-black m-1 rounded-md"
                    id={`guessRow-${i}-tile-${j}`}
                  ></div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="key-container grid grid-cols-11 w-72 justify-center items-center md:w-auto">
        {keys.map((elm) => {
          return (
            <button
              className="key-button h-10 rounded-md bg-gray-400 m-0.5 text-white text-sm"
              id={elm}
              key={elm}
              onClick={() => handleClick(elm)}
            >
              {elm}
            </button>
          );
        })}
      </div>
    </main>
  );
};

export default Main;
