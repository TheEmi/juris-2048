const board = (props, context) => {
  const { getState, setState } = context;
  function initBoard() {
    let cells = Array(4).fill(Array(4).fill(0));
    cells[0][0] = 2;
    cells[0][1] = 2;
    setState("cells", cells);
  }
  if (getState("cells", null) === null) {
    initBoard();
  }
  function findTransitionTarget(oldBoard, newBoard, direction) {
    const targets = [];

    // For each row/column, track where tiles move
    if (direction === "ArrowLeft" || direction === "ArrowRight") {
      // Handle horizontal movement
      for (let row = 0; row < 4; row++) {
        const oldRow = oldBoard[row];
        const newRow = newBoard[row];
        const transitions = findRowTransitions(
          oldRow,
          newRow,
          direction === "ArrowRight"
        );

        transitions.forEach((transition) => {
          targets.push({
            from: [row, transition.from],
            to: [row, transition.to],
          });
        });
      }
    } else {
      // Handle vertical movement
      for (let col = 0; col < 4; col++) {
        const oldCol = oldBoard.map((row) => row[col]);
        const newCol = newBoard.map((row) => row[col]);
        const transitions = findRowTransitions(
          oldCol,
          newCol,
          direction === "ArrowDown"
        );

        transitions.forEach((transition) => {
          targets.push({
            from: [transition.from, col],
            to: [transition.to, col],
          });
        });
      }
    }

    return targets;
  }

  function findRowTransitions(oldRow, newRow, reverse) {
    const transitions = [];

    // Get non-zero positions in old row
    const oldPositions = [];
    const oldValues = [];
    for (let i = 0; i < 4; i++) {
      if (oldRow[i] !== 0) {
        oldPositions.push(i);
        oldValues.push(oldRow[i]);
      }
    }

    // Get non-zero positions in new row
    const newPositions = [];
    const newValues = [];
    for (let i = 0; i < 4; i++) {
      if (newRow[i] !== 0) {
        newPositions.push(i);
        newValues.push(newRow[i]);
      }
    }

    // If moving right/down, reverse the arrays to process from the end
    if (reverse) {
      oldPositions.reverse();
      oldValues.reverse();
      newPositions.reverse();
      newValues.reverse();
    }

    let oldIndex = 0;
    let newIndex = 0;

    while (oldIndex < oldValues.length && newIndex < newValues.length) {
      const oldValue = oldValues[oldIndex];
      const newValue = newValues[newIndex];

      if (oldValue === newValue) {
        // Simple move without merge
        const oldPos = oldPositions[oldIndex];
        const newPos = newPositions[newIndex];
        if (oldPos !== newPos) {
          transitions.push({ from: oldPos, to: newPos });
        }
        oldIndex++;
        newIndex++;
      } else if (oldValue * 2 === newValue) {
        // Merge: two old tiles become one new tile
        const oldPos1 = oldPositions[oldIndex];
        const oldPos2 = oldPositions[oldIndex + 1];
        const newPos = newPositions[newIndex];

        if (oldPos1 !== newPos) {
          transitions.push({ from: oldPos1, to: newPos });
        }
        if (oldPos2 !== newPos) {
          transitions.push({ from: oldPos2, to: newPos });
        }

        oldIndex += 2;
        newIndex++;
      } else {
        // This shouldn't happen with correct 2048 logic
        oldIndex++;
      }
    }

    return transitions;
  }

  function startAnimation(transitions) {
    for (let i = 0; i < transitions.length; i++) {
      const transition = transitions[i];
      const from = transition.from;
      const to = transition.to;
      const cell = document.getElementById(`${from[0]}-${from[1]}`);
      const targetCell = document.getElementById(`k${to[0]}-${to[1]}`);
      //Get position of target cell
      const targetRect = targetCell.getBoundingClientRect();
      const cellRect = cell.getBoundingClientRect();
      //Set position of cell to target position
      const deltaX = targetRect.left - cellRect.left;
      const deltaY = targetRect.top - cellRect.top;
      cell.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }
  }
  // Slide and merge logic
  function slideBoard(direction) {
    setState("prevScore", getState("score", 0));
    let newBoard = getState("cells", []).map((row) => [...row]);
    function slide(row) {
      // Remove zeros
      let arr = row.filter((val) => val !== 0);
      // Merge tiles
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
          arr[i] *= 2;
          setState("score", getState("score", 0) + arr[i]);
          arr[i + 1] = 0;
        }
      }
      // Remove zeros again after merge
      arr = arr.filter((val) => val !== 0);
      // Pad with zeros
      while (arr.length < 4) arr.push(0);
      return arr;
    }

    function transpose(matrix) {
      return matrix[0].map((_, i) => matrix.map((row) => row[i]));
    }

    if (direction === "ArrowLeft") {
      newBoard = newBoard.map((row) => slide(row));
    } else if (direction === "ArrowRight") {
      newBoard = newBoard.map((row) => slide(row.reverse()).reverse());
    } else if (direction === "ArrowUp") {
      newBoard = transpose(newBoard);
      newBoard = newBoard.map((row) => slide(row));
      newBoard = transpose(newBoard);
    } else if (direction === "ArrowDown") {
      newBoard = transpose(newBoard);
      newBoard = newBoard.map((row) => slide(row.reverse()).reverse());
      newBoard = transpose(newBoard);
    }
    if (getState("cells", []).toString() === newBoard.toString()) return;

    // Find transition targets
    const transitions = findTransitionTarget(
      getState("cells", []),
      newBoard,
      direction
    );
    //Start animation based on transitions here
    startAnimation(transitions);
    //Defer adding new cell until animation completes
    setState("animating", true);
    setState("toBeBoard", newBoard);
    const timer = setTimeout(() => {
      setState("animating", false);
      addCell(newBoard);
    }, 100);
    setState("timer", timer);
    return newBoard;
  }
  if (!getState("slideBoard")) {
    setState("slideBoard", slideBoard);
  }
  function addCell(cells) {
    let emptyCells = [];
    for (let i = 0; i < cells.length; i++) {
      for (let j = 0; j < cells[i].length; j++) {
        if (cells[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    if (emptyCells.length === 0) return;
    const [row, col] =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    cells[row][col] = Math.random() < 0.9 ? 2 : 4;
    setState(
      "prevCells",
      getState("cells", []).map((row) => [...row])
    );
    setState("cells", cells);
  }
  if(!getState("addCell", null)) {
    setState("addCell", addCell);
  }

  return {
    div: {
      class: "grid grid-cols-4 gap-2 bg-gray-300 p-4 rounded-lg",
      children: () =>
        getState("cells", [])
          .map((row, rowIndex) =>
            row.map((value, colIndex) => ({
              div: {
                key: `k${rowIndex}-${colIndex}`,
                id: `k${rowIndex}-${colIndex}`,
                class:
                  "w-16 h-16 bg-gray-200 m-1 flex items-center justify-center text-2xl font-bold rounded",
                children: () => {
                  return value === 0
                    ? {}
                    : {
                        cell: { value: value, id: `${rowIndex}-${colIndex}` },
                      };
                },
              },
            }))
          )
          .flat(),
    },
  };
};
export default board;
