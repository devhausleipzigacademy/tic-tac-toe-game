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

const markers = {}

messages.innerHTML = "<h4>Click a cell to start playing</h3>"

///////////////////////////
//// State Transitions ////
///////////////////////////

function checkIfMarked(element) {
    return Object.values(markers).some( (obj) => { return obj.coordinate == element.id } )
}

function whichPlayer(coordinate) {
    const marker = markers[coordinate];
    return marker.player
}

function getAdjacents([row, column]){
    row = Number(row)
    column = Number(column)
    
    const left = [row, column - 1];
    const right = [row, column + 1];
    const above = [row + 1, column];
    const below = [row - 1, column];
    const topleft = [row + 1, column - 1];
    const topright = [row + 1, column + 1];
    const bottomleft = [row - 1, column - 1];
    const bottomright = [row - 1, column + 1];

    const adjacents = [left, right, above, below, topleft, topright, bottomleft, bottomright]
    .filter(
        (coordinate) => { 
            return !coordinate.some(
                (component) => {
                    return component < 0 || component > 2
            }
        ) }
    );

    return adjacents
}

function checkTicTacToe(player, coordinate, winLength = 3, currentLength = 0, memo = new Set()){

    console.log('checktictactoe called')
    parsedCoordinate = coordinate.replace('xy_', '').split('-')
    console.log(parsedCoordinate)

    const adjacents = getAdjacents(parsedCoordinate).filter( 
        (adjacent) => {
            const [row, column] = adjacent;
            return !(memo.has(`xy_${row}-${column}`)) //keep if adjacent is not in memo
        }
    )
    console.log(adjacents)
    console.log(memo)
    
    for(const adjacent of adjacents){
        const [row, column] = adjacent;
        memo.add(`xy_${row}-${column}`)

        if ( checkIfMarked(adjacent) ){
            if (whichPlayer(adjacent) == player){

                if( currentLength + 1 == winLength){
                    return true
                } else {
                    return checkTicTacToe(player, adjacent, winLength, currentLength + 1, memo);
                }

            }
        }
    
    }

    // if no winning chain found, return false
    return false;
}


gameGrid.addEventListener("click", (event) => {
    if( event.target.matches('.game-grid > .grid-square') ) {

        if( checkIfMarked(event.target) ) {
            console.log('already marked')
            return;
        }

        const coordinate = event.target.id;

        switch( currentPlayer ){
            case players.x:
                markers[coordinate] = {
                    "coordinate": coordinate,
                    "player": players.x
                }
                appendX(event.target)

                if( checkTicTacToe(players.x, coordinate) ){
                    console.log('Player X won!')
                }

                // switch players
                currentPlayer = players.o
                break;
            case players.o:
                markers[coordinate] = {
                    "coordinate": coordinate,
                    "player": players.o
                }
                appendO(event.target)

                if( checkTicTacToe(players.o, coordinate) ){
                    console.log('Player O won!')
                }

                // switch players
                currentPlayer = players.x
                break;
        }

        // check if game is won/lost


    }
})