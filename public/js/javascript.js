

const tileDisplay = document.querySelector('.tile-container'); 
const messageDisplay = document.querySelector('.message-container'); 
const keyboard = document.querySelector('.key-container'); 

let wordle;

const getWordle = () => {
  fetch('http://localhost:8000/word')
  .then(response => response.json())
  .then(json => {
      wordle = json.toUpperCase();
  }).catch(err => console.log(err))
}

getWordle();

const keys = ['Q','W','E','R','T','Y','U','I','O','P','Å','A','S','D','F','G','H','J','K','L','Ø','Æ','ENTER','Z','X','C','V','B','N','M','BACK']

let guessRows = [
    ['','','','',''],
    ['','','','',''],
    ['','','','',''],
    ['','','','',''],
    ['','','','',''],
    ['','','','','']
]

let currentRow = 0;
let currentTile = 0;
let isGameOver = false;

guessRows.forEach((guessRow, guessRowIndex) => {
   const rowElement = document.createElement('div');
   rowElement.setAttribute('id', 'guessRow-' + guessRowIndex)
    guessRow.forEach((guess, guessIndex) => {
      const tileElement = document.createElement('div')
        tileElement.setAttribute('id', 'guessRow-' + guessRowIndex + '-tile-' + guessIndex);
        tileElement.classList.add('tile');
        rowElement.append(tileElement);
    })
   tileDisplay.append(rowElement);
})

keys.forEach(key => {
    const buttonElement = document.createElement('button')
    buttonElement.textContent = key;
    buttonElement.setAttribute('id', key);
    buttonElement.addEventListener('click', () => handleClick(key));
    keyboard.append(buttonElement);
})

const handleClick = (letter) => {
    if(!isGameOver) {
        if(letter === 'BACK') {
            deleteLetter();
            return;
        }
        if(letter === 'ENTER') {
            checkRow();
            return;
        }
        addLetter(letter)
    }
  }

const addLetter = (letter) => {
    if(currentTile < 5 && currentRow < 6) {
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile);
        tile.textContent = letter;
        guessRows[currentRow][currentTile] = letter;
        tile.setAttribute('data', letter)
        currentTile++
    }
}

const deleteLetter = () => {
    if(currentTile > 0) {
        currentTile--
        const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile);
        tile.textContent = '';
        guessRows[currentRow][currentTile] = '';
        tile.setAttribute('data', '')
    }
}

const checkRow = () => {
    const guess = guessRows[currentRow].join('')
    console.log(guess)
    if(currentTile > 4) {
        fetch(`http://localhost:8000/check/?word=${guess}`)
        .then(response => response.json())
        .then(json => {
            if(json == 'Entry word not found') {
                showMessage('Word not in list.')
                return;
            } else {

                flipTile()
                if(wordle == guess) {
                    showMessage('You got it!')
                    isGameOver = true;
                } else {
                    if(currentRow >= 5) {
                        isGameOver = true;
                        showMessage("Game Over..")
                        return;
                    }
                    if(currentRow < 5) {
                        currentRow++
                        currentTile = 0
                    }
                }
            }
        })

    }
}

const showMessage = message => {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageDisplay.append(messageElement);
    setTimeout(() => {
      messageDisplay.removeChild(messageElement);
    }, 2000);
  
}

const addColorToKey = (keyLetter, color) => {
    const key = document.getElementById(keyLetter)
    key.classList.add(color)
}

const flipTile = () => {
    
    let checkWordle = wordle;
    const guess = [];
    const rowTiles = document.getElementById('guessRow-' + currentRow).childNodes;
    
    rowTiles.forEach(tile => {
        guess.push({letter: tile.getAttribute('data'), color: 'grey-overlay'})
    })

    guess.forEach((guess, index) => {
      if (guess.letter == wordle[index]) {
          guess.color = 'green-overlay';
          checkWordle= checkWordle.replace(guess.letter, '');
      }
    })

    guess.forEach(guess => {
      if(checkWordle.includes(guess.letter)) {
        guess.color = 'yellow-overlay';
        checkWordle= checkWordle.replace(guess.letter, '');
      }
    })
    
    
    rowTiles.forEach((tile, index) => {

        setTimeout(() => {
            tile.classList.add(guess[index].color, 'flip')
            addColorToKey(guess[index].letter, guess[index].color)
           
        }, 500 * index)
    })
}

//Restart button
const restartHandler = () => {

    getWordle();

    guessRows.forEach(item => item = '');
    currentRow = 0;
    currentTile = 0;
    isGameOver = false;

    const tiles = document.querySelectorAll(".tile")
    console.log(tiles)
    tiles.forEach(tile => {
        tile.textContent = '';
        tile.classList.remove('green-overlay', 'yellow-overlay', 'grey-overlay', 'flip');
        tile.removeAttribute('data');
    })
  }

const restartButton = document.getElementById('restart-button')
restartButton.addEventListener('click', restartHandler);