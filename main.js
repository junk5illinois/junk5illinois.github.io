// Initialize a 9x9 array
const puzzle = new Array(9).fill(null).map(
  () => new Array(9).fill(null)
);

// Error message div
const errorMsg = document.getElementById('error-msg');

/** Demo puzzles if user doesn't want to manually enter one */
const demos = [
  [[5,3,'','',7,'','','',''],
   [6,'','',1,9,5,'','',''],
   ['',9,8,'','','','',6,''],
   [8,'','','',6,'','','',3],
   [4,'','',8,'',3,'','',1],
   [7,'','','',2,'','','',6],
   ['',6,'','','','',2,8,''],
   ['','','',4,1,9,'','',5],
   ['','','','',8,'','',7,9]
  ],
  [['','','',8,'',3,'',1,7],
   ['','','','',9,6,8,'',''],
   ['',8,'',4,'','',3,'',''],
   ['',4,'','',6,5,'','',''],
   [7,'','',1,'',8,'','',''],
   ['','',2,'','','',6,'','',''],
   ['','','',7,'','','','',''],
   [6,5,4,'','','','','',''],
   ['',3,'','','','',1,'',9]
  ],
  [['','',6,3,'',7,'','',''],
   ['','',4,'','','','','',5],
   [1,'','','','',6,'',8,2],
   [2,'',5,'',3,'',1,'',6],
   ['','','',2,'','',3,'',''],
   [9,'','','',7,'','','',4],
   ['',5,'','','','','','',''],
   ['',1,'','','','','','',''],
   ['','',8,1,'',9,'',4,'']
  ],
  [['','',3,'','','',2,'',''],
   ['',6,'',9,8,'','',4,3],
   [4,9,'','',3,1,'','',6],
   [9,'',7,'','','',8,6,''],
   ['',4,'','',9,8,'','',''],
   ['','',5,4,'',7,1,'',9],
   [6,'','','','',3,9,'',5],
   [5,'',8,1,'','','',7,2],
   [2,'',9,'',5,6,'',3,8]
  ]
]

// Visualization options
let visSpeed;
/** Sets the visualization speed */
function handleVis() {
  let visOptions = document.getElementsByName('visualization');
  visOptions.forEach(item => {
    if (item.checked) {
      visSpeed = Number(item.value);
    }
  });
}


/** Prints a single number to cell i,j
 *  Delays at the end for visualization purposes */
async function printCell(num, i, j) {
  const inputBox = document.getElementById(`${i}${j}`);
  inputBox.value = num;
  inputBox.style.backgroundColor = num ? 'lightblue' : 'transparent';
  await new Promise(resolve => setTimeout(resolve, visSpeed));
}


/** Determine if a number is allowed in a cell or not */
function valid(row, col, num) {
// Check each row
  for (let i = 0; i < 9; i++) {
    if (puzzle[row][i] === num) {
      return false;
    }
  }

  // Check each column
  for (let i = 0; i < 9; i++) {
    if (puzzle[i][col] === num) {
      return false;
    }
  }

  // Check each 3x3 box
  const rowBox = Math.floor(row / 3) * 3;
  const colBox = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (puzzle[rowBox + i][colBox + j] === num) {
        return false;
      }
    }
  }
  return true;
}


/** Find the next cell that is empty */
function findNextEmptyCell() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (puzzle[r][c] === -1) {
        return [r, c];
      }
    }
  }
  return [false, false];
}


/** Check if the given puzzle inputs are valid */
function validPuzzle() {
  // Check each row
  for (let i = 0; i < 9; i++) {
    const rowInput = puzzle[i].filter(num => num !== -1);
    if (rowInput.length !== _.unique(rowInput).length) {
      errorMsg.textContent = `Row ${i+1} contains duplicate values`;
      return false;
    }
  }

  // Check each column
  const flippedPuzzle = _.zip(...puzzle);
  for (let i = 0; i < 9; i++) {
    const colInput = flippedPuzzle[i].filter(num => num !== -1);
    if (colInput.length !== _.unique(colInput).length) {
      errorMsg.textContent = `Column ${i+1} contains duplicate values`;
      return false;
    }
  }

  // Check each 3x3 box
  for (let i of [0, 3, 6]) {
    for (let j of [0, 3, 6]) {
      let threeByThree = [];
      threeByThree.push(...puzzle[i].slice(j, j+3));
      threeByThree.push(...puzzle[i+1].slice(j, j+3));
      threeByThree.push(...puzzle[i+2].slice(j, j+3));
      const threeByThreeInput = threeByThree.filter(num => num !== -1);
      if (threeByThreeInput.length !== _.unique(threeByThreeInput).length) {
        const rowLocation = i === 0 ? 'top' :
                            i === 3 ? 'middle':
                            i === 6 ? 'bottom': '';
        const colLocation = j === 0 ? 'left' :
                            j === 3 ? 'center':
                            j === 6 ? 'right' : '';
        errorMsg.textContent = `The ${rowLocation} ${colLocation} 3x3 box contains duplicate values`;
        return false;
      }
    }
  }
  return true;
}


/** Use recursion to try every number in every empty cell */
async function solve() {
  const [r, c] = findNextEmptyCell();
  // If both r and c are false, we are done
  if (r === false && c === false) {
    return true;
  }

  // Try every number 1-9
  for (let num = 1; num < 10; num++) {
    if (visSpeed) await printCell(num, r, c);
    // If that number is valid, make that cell that number and recursively call solve()
    if (valid(r, c, num) === true) {
      puzzle[r][c] = num;
      const result = await solve();
      // When true is returned, we are done
      if (result === true) return true;
      // Otherwise, it led to a dead end so set the value back to -1
      puzzle[r][c] = -1;
      if (visSpeed) await printCell('', r, c);
    }
  }
  if (visSpeed) await printCell('', r, c);
  return false;
}


/** Prints the solution to the screen */
function printSolution() {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const inputBox = document.getElementById(`${i}${j}`);
      if (inputBox.value.trim() === '' || inputBox.style.backgroundColor === 'lightblue') {
        inputBox.value = puzzle[i][j];
        inputBox.style.backgroundColor = 'lightblue';
      }
    }
  }
}


/** Parses data and solves */
async function getDataAndSolve() {
  errorMsg.textContent = '';
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const strInput = document.getElementById(`${i}${j}`).value.trim();
      const numInput = Number(strInput);

      // Error checking
      if (isNaN(numInput)) {
        errorMsg.textContent = `${strInput} is not a number`;
        return;
      }
      if (strInput !== '' && (numInput < 1 || numInput > 9)) {
        errorMsg.textContent = `${numInput} is out of range`;
        return;
      }
      puzzle[i][j] = strInput === '' ? -1 : numInput;
    }
  }

  if (validPuzzle()) {
    // Disable user input while running
    const buttons = Array.from(document.getElementsByClassName('btn'));
    const tableInput = Array.from(document.getElementsByClassName('table-input'))
    buttons.forEach(button => button.disabled = true);
    tableInput.forEach(input => input.readOnly = true);

    // Solve the puzzle
    const result = await solve();
    result ? printSolution() : errorMsg.textContent = 'This puzzle has no solution';

    // Re-enable user input
    buttons.forEach(button => button.disabled = false);
    tableInput.forEach(input => input.readOnly = false);
  }
}

/** Prints a random demo puzzle to the screen */
let demoIndex = Math.floor(Math.random() * demos.length);
function printDemo() {
  errorMsg.textContent = '';
  const demo = demos[demoIndex];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const inputBox = document.getElementById(`${i}${j}`);
      inputBox.value = demo[i][j];
      inputBox.style.backgroundColor = "transparent";
    }
  }
  demoIndex = (demoIndex + 1) % demos.length;
}

/** Clears the puzzle */
function clearPuzzle() {
  errorMsg.textContent = '';
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const inputBox = document.getElementById(`${i}${j}`);
      inputBox.value = "";
      inputBox.style.backgroundColor = "transparent";
    }
  }
}
