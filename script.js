// The rules:
// Any live cell with two or three live neighbours survives.
// Any dead cell with three live neighbours becomes a live cell.
// All other live cells die in the next generation. Similarly, all other dead cells stay dead.

const gameGrid = document.querySelector(".game-grid");
const startBtn = document.querySelector(".start-btn");
const pauseBtn = document.querySelector(".pause-btn");
const resetBtn = document.querySelector(".reset-btn");
const numGenerations = document.querySelector(".num-generations");
const generateNew = document.querySelector(".generate-new");
const speedRange = document.querySelector(".speed-range");
const selectDensity = document.querySelector(".select-density");
const selectCellSize = document.querySelector(".select-cell-size");
const eraseBtn = document.querySelector(".erase-btn");
const invertBtn = document.querySelector(".invert-btn");

let generations = 0;
let running = false;
let speed = 100;
let numColumns = 107;
let numRows = 64;

// must fill with .fill(null) or else they'll be undefined
let cells;
const createCells = () => {
  cells = new Array(numRows).fill(null).map(() => new Array(numColumns).fill(null));
  for (let i = 0; i < numRows; i++) {
    let row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < numColumns; j++) {
      let cell = document.createElement("div");
      if (Math.random() > 0.65) {
        cell.classList.add("cell", "alive");
      } else {
        cell.classList.add("cell", "dead");
      }
      cell.dataset.position = [i, j];
      cells[i][j] = cell;
      row.appendChild(cell);
    }
    gameGrid.appendChild(row);
  }
};
createCells();

// Allow cells to be clickable
const makeClickable = () => {
  cells.forEach(row => {
    row.map(cell => {
      cell.addEventListener("click", () => {
        if (cell.classList.contains("alive")) {
          if (running) return;
          cell.classList.remove("alive");
          cell.classList.add("dead");
        } else {
          cell.classList.remove("dead");
          cell.classList.add("alive");
        }
      });
    });
  });
};
makeClickable();

// As the styling gives the border only to the left and bottom edges of each cell so as to avoid overlapping borders, this function just adds a top border to the top row of cells and a right border to the right column of cells
const styleOuterCells = () => {
  cells.map((row, i) => {
      row.map((cell, j) => {
        if (i === 0) cell.style.borderTop = "1px solid rgb(90, 63, 14)";
        if (j === row.length-1) cell.style.borderRight = "1px solid rgb(90, 63, 14)";
      });
    });
};
styleOuterCells();

const countNeighbours = (x, y) => {
  if (x === 0 && y === 0) {   // top left
    return [[x+1, y], [x, y+1], [x+1, y+1]];
  } else if (x === 0 && y === numColumns-1) {  // top right
    return [[x, y-1], [x+1, y], [x+1, y-1]];
  } else if (x === numRows-1 && y === 0) {   // bottom left
    return [[x-1, y+1], [x-1, y], [x, y+1]];
  } else if (x === numRows-1 && y === numColumns-1) {   // bottom right
    return [[x-1, y-1], [x, y-1], [x-1, y]];
  } else if (x === 0) {   // top row
    return [[x, y-1], [x+1, y], [x+1, y-1], [x, y+1], [x+1, y+1]];
  } else if (x === numRows-1) {   // bottom row
    return [[x-1, y-1], [x, y-1], [x-1, y+1], [x-1, y], [x, y+1]];
  } else if (y === 0) {   // left column
    return [[x-1, y+1], [x-1, y], [x+1, y], [x, y+1], [x+1, y+1]];
  } else if (y === numColumns-1) {    // right column
    return [[x-1, y-1], [x, y-1], [x-1, y], [x+1, y], [x+1, y-1]];
  } else {    // All non-edge cells
    return [[x-1, y-1], [x, y-1], [x-1, y+1], [x-1, y], [x+1, y], [x+1, y-1], [x, y+1], [x+1, y+1]];
  }
};

const checkStatus = () => {
  cells.map(row => {
    row.map(cell => {
      let getXY = cell.dataset.position.split(",");
      let x = Number(getXY[0]);
      let y = Number(getXY[1]);
      let neighbours = countNeighbours(x, y);
      let livingNeighbours = 0;
      neighbours.map(neighbour => {
        if (cells[neighbour[0]][neighbour[1]].classList.contains("alive")) {
          livingNeighbours++;
        }
      });
      // All live cells with 2 or 3 living neighbours survives
      if (cell.classList.contains("alive") && livingNeighbours > 1 && livingNeighbours < 4) {
        // console.log(cell);
        cell.classList.add("will-live");
      // Any dead cell with three live neighbours becomes a live cell.
      } else if (cell.classList.contains("dead") && livingNeighbours === 3) {
        // console.log(cell);
        cell.classList.add("will-live");
      // Otherwise, the cell will die or stay dead
      } else cell.classList.add("will-die");
    });
  });
};

let lastRender = 0;
const newGeneration = currentTime => {
  if (!running) return;
  checkStatus();
  window.requestAnimationFrame(newGeneration);
  const msSinceLastRender = currentTime - lastRender;
  if (msSinceLastRender < speed) return;
  lastRender = currentTime;

  cells.map(row => {
    row.map(cell => {
      cell.classList.remove("alive", "dead");
      if (cell.classList.contains("will-live")) {
        cell.classList.add("alive");
      } else cell.classList.add("dead");
      cell.classList.remove("will-live", "will-die");
    });
  });
  numGenerations.innerHTML = generations + " generations";
  generations++;
};

startBtn.addEventListener("click", () => {
  if (running) return;
  numGenerations.innerHTML = generations + " generations";
  running = true;
  newGeneration();
});

function pause() {
  running = false;
  // remove the generation that was added since the last render or it will be added again when restarting
  generations--;
  startBtn.innerHTML = "Continue";
}
pauseBtn.addEventListener("click", pause);

const reset = () => {
  startBtn.innerHTML = "Start";
  generations = 0;
  numGenerations.innerHTML = generations + " generations";
  randomlyGenerate();
  if (!running) return;
  running = false;
};
resetBtn.addEventListener("click", reset);

// Left off here, going to change number of cells based on cell size so they keep the same overall height and width
const determineCellSize = () => {
  gameGrid.innerHTML = "";
  let cellSize = Number(selectCellSize.value) || 7;
  let totalWidth = 750;

  numColumns = parseInt(totalWidth / cellSize);
  numRows = parseInt(totalWidth / cellSize * 0.6);

  createCells();
  makeClickable();
  cells.forEach(row => {
    row.map(cell => {
    cell.style.width = cellSize + "px";
    cell.style.height = cellSize + "px";
    });
  });
};

const randomlyGenerate = (density = 0.65) => {
  generations = 0;
  numGenerations.innerHTML = generations + " generations";
  cells.forEach(row => {
    row.map(cell => {
      cell.classList.remove("alive", "dead");
      if (Math.random() > density) {
        cell.classList.add("alive");
      } else {
        cell.classList.add("dead");
      }
    });
  });
};
generateNew.addEventListener("click", () => {
  if (running) {
    pauseBtn.classList.add("flash");
    setTimeout(() => {
      pauseBtn.classList.remove("flash");
    }, 250);
    return;
  }
  determineCellSize();
  // change density based on the value selected, with default being medium density at 0.65
  let density;
  if (selectDensity.value === "high") density = 0.55;
  if (selectDensity.value === "low") density = 0.8;
  randomlyGenerate(density);
  startBtn.innerHTML = "Start";
});

speedRange.addEventListener("input", () => {
  speed = speedRange.value;
});

const eraseAll = () => {
  if (running) return;
  cells.forEach(row => {
    row.map(cell => {
      cell.classList.remove("alive");
      cell.classList.add("dead");
    });
  });
};
eraseBtn.addEventListener("click", eraseAll);

const invert = () => {
  if (running) return;
  cells.forEach(row => {
    row.map(cell => {
      if (cell.classList.contains("alive")) {
        cell.classList.remove("alive");
        cell.classList.add("dead");
      } else {
        cell.classList.add("alive");
        cell.classList.remove("dead");
      }
    });
  });
};
invertBtn.addEventListener("click", invert);
