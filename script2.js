/** when new game loads
 * create a new sequence
 *
 *
 *
 * when I click a color:
 * change my cursor to that color/to me dragging the color
 *
 * when I place the color in a slot:
 * change cursor back to normal
 *
 * I can also drag and drop colors into their spots
 *
 *
 *
 *
 *
 *
 * when I press check and all four slots are filled
 * on the current row:
 * check against the sequence and return clues
 *
 * when I press check and it's right, show a winning message
 *
 *
 * when I press new game
 * create a new sequence and reset to blank **/
// declare audio files
const newGameSound = new Audio("audio/newGameSound.wav");
newGameSound.volume = 0.4;
const riflePiecesSound = new Audio("audio/riflePiecesSound.wav");
riflePiecesSound.volume = 0.8;
const placeSound = new Audio("audio/placeSound.wav");
placeSound.volume = 0.5;
const checkSound = new Audio("audio/check.wav");
const winSound = new Audio("audio/win.wav");
const loseSound = new Audio();

// moving and dragging a piece

function createEventListeners() {
  const piecePoolArr = document.getElementsByClassName("piece");

  function pieceMove(e) {
    const oldPiece = document.elementFromPoint(e.clientX, e.clientY);
    if (
      oldPiece.id != "spotA" &&
      oldPiece.id != "spotB" &&
      oldPiece.id != "spotC" &&
      oldPiece.id != "spotD" &&
      oldPiece.parentElement.id != "piece-pool"
    ) {
      return;
    }

    //create a new piece to move around
    let piece = document.createElement("div");
    piece.classList.add("piece");
    piece.setAttribute("id", "movingPiece");
    //retrieve the background color of the old piece

    const { backgroundColor: pieceColor } = getComputedStyle(oldPiece);
    piece.style.backgroundColor = pieceColor;

    piece.style.position = "absolute";
    piece.style.zIndex = 1000;

    //now that we have made the new piece, set its position and its moveability
    let shiftX = e.clientX - oldPiece.getBoundingClientRect().left + 10;
    let shiftY = e.clientY - oldPiece.getBoundingClientRect().top + 10;

    //remove old piece if it is not in piece pool
    if (oldPiece.parentElement.id != "piece-pool") {
      let newSpot = document.createElement("div");
      newSpot.classList.add("guess-spot", "droppable");
      newSpot.id = oldPiece.id;
      placeSound.play();
      document.getElementById("current").append(newSpot);
      oldPiece.remove();
    } else {
      riflePiecesSound.play();
    }

    document.body.append(piece);

    function moveAt(pageX, pageY) {
      piece.style.left = pageX - shiftX + "px";
      piece.style.top = pageY - shiftY + "px";
    }

    moveAt(e.pageX, e.pageY);

    // function for as we are moving and dragging the object
    let currentDroppable = null; //closest object on top of the moving piece

    function onMouseMove(e) {
      //when I move the mouse, move the piece to that spot
      moveAt(e.pageX, e.pageY);

      piece.hidden = true;
      let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
      piece.hidden = false;

      if (!elemBelow) return;

      let droppableBelow = elemBelow.closest(".droppable");

      if (currentDroppable != droppableBelow) {
        // if the piece has been moved onto a different element
        if (currentDroppable) {
          // if it was on a valid droppable spot, remove the highlight
          removeHighlight(currentDroppable);
        }
        currentDroppable = droppableBelow; // if it is on a new valid droppable spot, add a highlight
        if (currentDroppable) {
          highlight(currentDroppable);
        }
      }
    }

    document.addEventListener("mousemove", onMouseMove);

    //when I lift the cursor, execute
    piece.onmouseup = function () {
      document.removeEventListener("mousemove", onMouseMove);

      if (currentDroppable) {
        let guessPiece = document.createElement("div");

        guessPiece.style.backgroundColor = pieceColor;
        guessPiece.style.position = "relative";
        guessPiece.style.zIndex = 900;
        guessPiece.style.margin = "11px 8px 10px 4px";
        guessPiece.style.justifySelf = "center";

        guessPiece.classList.add(
          "piece",
          `${oldPiece.classList[1]}`,
          "droppable"
        );

        //set position for the new guess piece using the grid
        guessPiece.id = `${currentDroppable.id}`;

        guessPiece.addEventListener("mousedown", pieceMove);
        currentDroppable.remove();
        document.getElementById("current").append(guessPiece);
        placeSound.play();
        removeHighlight(currentDroppable);
      }
      piece.remove();
      piece.onmouseup = null;
    };
  }
  for (let i = 0; i < piecePoolArr.length; i++) {
    piecePoolArr[i].addEventListener("mousedown", pieceMove);
  }
  //function for processing a completed guess
  let guessCount = 0;

  document.getElementById("check").onclick = function () {
    //set to next row
    let spotPosition = ["spotA", "spotB", "spotC", "spotD"];

    //first check to make sure that all slots are filled
    const lineGuess = document.getElementById("current");

    for (let i = 0; i < 4; i++) {
      if (!lineGuess.children[i].classList.contains("piece")) {
        return;
      }
    }
    checkSound.play();
    //create an array from the guesses
    let guessArr = [];

    for (let i = 0; i < 4; i++) {
      let currentSpot = document.getElementById(spotPosition[i]);
      if (currentSpot.classList.contains("red")) {
        guessArr.push(0);
      } else if (currentSpot.classList.contains("yellow")) {
        guessArr.push(1);
      } else if (currentSpot.classList.contains("blue")) {
        guessArr.push(2);
      } else if (currentSpot.classList.contains("green")) {
        guessArr.push(3);
      } else if (currentSpot.classList.contains("black")) {
        guessArr.push(4);
      } else if (currentSpot.classList.contains("white")) {
        guessArr.push(5);
      }
    }

    //check guess array against answer
    let cluesArr = [];
    let correctAnswer = true;
    let colorsGuessed = [];
    for (let i = 0; i < 4; i++) {
      if (guessArr[i] == answerSequence[i]) {
        if (colorsGuessed.includes(guessArr[i])) {
          //find the first 0 in the array and remove it
          let index = cluesArr.indexOf(0);
          cluesArr.splice(index);
        }
        cluesArr.push(1);
      } else if (answerSequence.includes(guessArr[i])) {
        if (!colorsGuessed.includes(guessArr[i])) {
          cluesArr.push(0);
        }
        correctAnswer = false;
      } else {
        correctAnswer = false;
      }
      colorsGuessed.push(guessArr[i]);
    }
    shuffleArray(cluesArr);

    //add black and white pegs
    for (let i = 0; i < cluesArr.length; i++) {
      let clueContainer = document.getElementById("current-clue-container");
      let clueSpot = clueContainer.children[i];
      clueSpot.style.width = "15px";
      clueSpot.style.height = "15px";
      if (cluesArr[i] == 1) {
        clueSpot.style.backgroundColor = "var(--black)";
        //create black peg
      } else {
        clueSpot.style.backgroundColor = "var(--white)";
        //create white peg
      }
    }

    //check if we've won
    guessCount++;

    if (correctAnswer) {
      let tries = document.getElementById("tries");
      if (guessCount == 1) {
        tries.innerHTML = "1 try.";
      } else {
        tries.innerHTML = guessCount + " tries.";
      }
      document.getElementById("win-box").style.display = "initial";
      document.getElementById("overlay").style.display = "initial";
      return;
    } else if (guessCount == 10) {
      document.getElementById("lose-box").style.display = "initial";
      document.getElementById("overlay").style.display = "initial";
      return;
    }

    //set next line to current line and currentcluecontainer to next line

    let oldGuessLine = document.getElementById("current");
    let oldClueLine = document.getElementById("current-clue-container");

    oldGuessLine.removeAttribute("id");
    oldClueLine.removeAttribute("id");

    let newGuessLine =
      oldGuessLine.parentElement.previousElementSibling.firstElementChild;
    newGuessLine.id = "current";

    let newClueLine =
      oldClueLine.parentElement.previousElementSibling.firstElementChild;
    newClueLine.id = "current-clue-container";

    //remove droppable and event listeners from old children, add droppable to new children
    for (let i = 0; i < 4; i++) {
      oldGuessLine.children[i].classList.remove("droppable");
      oldGuessLine.children[i].classList.add(oldGuessLine.children[i].id);
      oldGuessLine.children[i].removeAttribute("id");
      oldGuessLine.children[i].removeEventListener("mousedown", pieceMove);
      newGuessLine.children[i].classList.add("droppable");
      newGuessLine.children[i].id = spotPosition[i];
    }

    //move checkmark
    const checkMark = document.getElementById("check-button");
    const { marginTop: checkMarkMargin } = window.getComputedStyle(checkMark);
    checkMark.style.marginTop = parseInt(checkMarkMargin) - 67 + "px";
    // document.getElementById("check-button").style.marginTop =
    //   currentCheckMargin - 67 + "px";
  };
}

//highlight functions for holding a piece over
//a piece spot
function highlight(elem) {
  if (elem.classList.contains("piece")) {
    elem.style.border = "4px solid gold";
    elem.style.margin = "7px 4.5px 7px 0.5px";
  } else {
    elem.style.border = "8px solid gold";
    elem.style.margin = "9px 2.5px";
  }
}
function removeHighlight(elem) {
  elem.style.border = "";
  if (elem.classList.contains("piece")) {
    elem.style.margin = "11px 8px 10px 4px";
  } else {
    elem.style.margin = "";
  }
}

/**if all four slots are filled
 * run test
 *
 * loop through each slot
 * if slot is right color and right place according to answer
 * add a black peg
 * if slot is right color wrong place
 * add a white peg
 *
 * if all four are right color right place
 * show winning message
 *
 * else go to the next line
 */

//function for creating a random sequence
//duplicates is a boolean argument
function createSequence() {
  let answerSequence = [];
  //6 colors, each one randomly
  if (sessionStorage.getItem("duplicates") == "true") {
    for (let i = 0; i < 4; i++) {
      answerSequence.push(Math.floor(Math.random() * 6));
    }
  } else {
    let alreadyTaken = [];
    for (let i = 0; i < 4; i++) {
      let number = Math.floor(Math.random() * 6);
      while (alreadyTaken.includes(number)) {
        number = Math.floor(Math.random() * 6);
      }
      answerSequence.push(number);
      alreadyTaken.push(number);
    }
  }
  return answerSequence;
}

//function for shuffling an array
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    // Generate random number
    var j = Math.floor(Math.random() * (i + 1));

    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

//execution code for adding event listeners to each
//piece element

//code for refreshing page and resetting duplicates for new game button

let buttons = document.getElementsByClassName("new-game");
for (var i = 0; i < buttons.length; i++) {
  var button = buttons[i];
  button.onclick = function () {
    sessionStorage.setItem(
      "duplicates",
      `${document.getElementById("duplicates-box").checked}`
    );
    sessionStorage.setItem("first", false);
    newGameSound.play();
    setTimeout(() => {
      location.reload();
    }, 2000);
  };
}

//execution code
createEventListeners();

let answerSequence = createSequence();

if (!sessionStorage.getItem("first")) {
  document.getElementById("start-box").style.display = "initial";
  document.getElementById("overlay").style.display = "initial";
}
