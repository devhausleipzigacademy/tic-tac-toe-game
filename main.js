///////////////////////
//// Prepare Board ////
///////////////////////

const gameGrid = document.querySelector('.game-grid')
const messages = document.querySelector('#messages')

const rows = 3;
const columns = 3;

for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
        const gridSquare = document.createElement('div');
        gridSquare.id = `xy_${i}-${j}`
        gridSquare.classList.add('grid-square')
        gameGrid.appendChild(gridSquare)
    }
}


///////////////////////////////
//// Initialize Game State ////
///////////////////////////////



///////////////////////////
//// State Transitions ////
///////////////////////////