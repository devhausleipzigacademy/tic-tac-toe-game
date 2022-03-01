///////////////
//// Utils ////
///////////////

function appendX(element) {
    const xLeft = document.createElement('div')
    const xRight = document.createElement('div')
    
    xLeft.classList.add('x-marker', 'x-left')
    xRight.classList.add('x-marker', 'x-right')

    element.appendChild(xLeft)
    element.appendChild(xRight)
}

function appendO(element) {
    const oInner = document.createElement('div')
    const oOuter = document.createElement('div')

    oInner.classList.add('o-marker', 'o-inner')
    oOuter.classList.add('o-marker', 'o-outer')

    oOuter.appendChild(oInner)
    element.appendChild(oOuter)
}

function removeChildren(element) {
    while (element.lastElementChild) {
        element.removeChild(element.lastElementChild);
    }
}

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

const players = {
    "x": "X",
    "o": "O"
}

let currentPlayer = players.x

const markers = []

messages.innerHTML = "<h4>Click a cell to start playing</h3>"

///////////////////////////
//// State Transitions ////
///////////////////////////

function checkIfMarked(element) {
    return markers.some( (coordinate) => { return coordinate == element.id } )
}

gameGrid.addEventListener("click", (event) => {
    if( event.target.matches('.game-grid > .grid-square') ) {
        if( checkIfMarked(event.target) ) {
            console.log('already marked')
            return;
        }
        switch( currentPlayer ){
            case players.x:
                markers.push(event.target.id)
                appendX(event.target)
                currentPlayer = players.o
                break;
            case players.o:
                markers.push(event.target.id)
                appendO(event.target)
                currentPlayer = players.x
                break;
        }
    }
})