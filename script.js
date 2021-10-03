// The rules:
// Any live cell with two or three live neighbours survives.
// Any dead cell with three live neighbours becomes a live cell.
// All other live cells die in the next generation. Similarly, all other dead cells stay dead.

let gameGrid = document.querySelector(".game-grid");
let startBtn = document.querySelector(".start-btn");
let pauseBtn = document.querySelector(".pause-btn");
let resetBtn = document.querySelector(".reset-btn");
let numGenerations = document.querySelector(".num-generations");
let generateNew = document.querySelector(".generate-new");
let speedRange = document.querySelector(".speed-range");
let selectDensity = document.querySelector(".select-density");
let selectCellSize = document.querySelector(".select-cell-size");

let generations = 0;
let running = false;
let speed = 100;
let numColumns = 100;
let numRows = 50;

// must fill with .fill(null) or else they'll be undefined
let cells = new Array(numRows).fill(null).map(() => new Array(numColumns).fill(null));
const createCells = () => {
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
}
createCells();

// Allow cells to be clickable
let flattened = cells.flat();
flattened.forEach(cell => {
  cell.addEventListener("click", () => {
    if (cell.classList.contains("alive")) {
      cell.classList.remove("alive");
      cell.classList.add("dead");
    } else {
      cell.classList.remove("dead");
      cell.classList.add("alive");
    }
  })
})


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
}

const checkStatus = () => {
  cells.map(row => {
    row.map(cell => {
      let getXY = cell.dataset.position.split(",")
      let x = Number(getXY[0]);
      let y = Number(getXY[1]);

      let neighbours = countNeighbours(x, y);
      // console.log(x, y);
      // console.log(neighbours);
      let livingNeighbours = 0;
      neighbours.map(neighbour => {
        // if ((cells[neighbour[0]][neighbour[1]]).classList.contains("check")) console.log("duplicate:", (cells[neighbour[0]][neighbour[1]]));
        // cells[neighbour[0]][neighbour[1]].classList.add("check");
        // console.log(cell);
        // console.log(neighbour[0], neighbour[1]);
        if (cells[neighbour[0]][neighbour[1]].classList.contains("alive")) {
          livingNeighbours++;
          // cells[neighbour[0]][neighbour[1]].classList.add("check");
        }
      })
      // console.log(cell);
      // console.log(livingNeighbours);

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
    })

  })
}

let lastRender = 0;
const newGeneration = currentTime => {
  if (!running) return;
  checkStatus();
  window.requestAnimationFrame(newGeneration);
  const msSinceLastRender = currentTime - lastRender
  if (msSinceLastRender < speed) return;
  lastRender = currentTime;

  cells.map(row => {
    row.map(cell => {
      cell.classList.remove("alive", "dead")
      if (cell.classList.contains("will-live")) {
        cell.classList.add("alive");
      } else cell.classList.add("dead")
      cell.classList.remove("will-live", "will-die");
    })
  })
  numGenerations.innerHTML = generations + " generations";
  generations++;
}

startBtn.addEventListener("click", () => {
  numGenerations.innerHTML = generations + " generations";
  running = true;
  newGeneration()
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
}
resetBtn.addEventListener("click", reset);

const determineCellSize = () => {
  let cellSize = Number(selectCellSize.value) + "px";
  flattened.forEach(cell => {
    cell.style.width = cellSize;
    cell.style.height = cellSize;
  })
}

const randomlyGenerate = (density = 0.65) => {
  generations = 0;
  numGenerations.innerHTML = generations + " generations";
  flattened.forEach(cell => {
    cell.classList.remove("alive", "dead");
    if (Math.random() > density) {
      cell.classList.add("alive");
    } else {
      cell.classList.add("dead");
    }
  })
}
generateNew.addEventListener("click", () => {
  if (running) {
    pauseBtn.classList.add("flash");
    setTimeout(() => {
      pauseBtn.classList.remove("flash");
    }, 250)
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
})


// TODO responsive design for smaller screens