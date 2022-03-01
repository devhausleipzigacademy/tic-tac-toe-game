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

document.querySelector("#music").loop = true;

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

let frozen = false;

messages.innerHTML = "<h4>Click a cell to start playing</h3>"

///////////////////////////
//// State Transitions ////
///////////////////////////

function checkIfMarked(id) {
    return Object.values(markers).some( (obj) => { return obj.id == id } )
}

function whichPlayer(id) {
    const marker = markers[id];
    return marker.player
}

function filterInvalid(array) {
    return array.filter(
        (coordinate) => {
            const [row, column] = coordinate;
            return  !(row < 0 || row > rows || column < 0 || column > columns)
        }
    )
}

function horAdj([row, column]){   
    const left = [row, column - 1];
    const right = [row, column + 1];
    const adjacents = [left, right]
    return filterInvalid(adjacents)
}

function vertAdj([row, column]){   
    const above = [row - 1, column];
    const below = [row + 1, column];
    const adjacents = [above, below]
    return filterInvalid(adjacents)
}

function backDiaAdj([row, column]){   
    const topleft = [row - 1, column - 1];
    const bottomright = [row + 1, column + 1];
    const adjacents = [topleft, bottomright]
    return filterInvalid(adjacents)
}

function forDiaAdj([row, column]){   
    const topright = [row - 1, column + 1];
    const bottomleft = [row + 1, column - 1];
    const adjacents = [topright, bottomleft]
    return filterInvalid(adjacents)
}

const adjacencyFunctions = [horAdj, vertAdj, backDiaAdj, forDiaAdj]

function recursiveCheck(player, coordinate, adjacencyFunction, winLength = 3, currentLength = 1, memo = null){

    if( currentLength == winLength ) {
        return true;
    }

    if(memo == null){
        memo = new Set()
    }

    let winFlag = false;

    let [row, column] = coordinate;
    let id = `xy_${row}-${column}`
    memo.add(id)

    const adjacents = adjacencyFunction(coordinate).filter( 
        (adjacent) => {
            let [row, column] = adjacent;
            let id = `xy_${row}-${column}`
            return !(memo.has(id)) //keep if adjacent is not in memo
        }
    )

    for(const adjacent of adjacents){
        if(winFlag){
            return winFlag; // shortcut looping through adjacents if win already found
        }

        let [row, column] = adjacent;
        let id = `xy_${row}-${column}`

        if ( checkIfMarked(id) ){
            memo.add(id)
            if (whichPlayer(id) == player){
                winFlag = winFlag || recursiveCheck(player, adjacent, adjacencyFunction, winLength, currentLength + 1, memo);
            }
        }
    }

    return winFlag;
}

function checkTicTacToe(player, coordinate){

    for(const adjacencyFunction of adjacencyFunctions){
        if( recursiveCheck(player, coordinate, adjacencyFunction) ){
            return true;
        }
    }

    return false;
}

gameGrid.addEventListener("click", (event) => {
    if( event.target.matches('.game-grid > .grid-square') && !frozen ) {

        if( checkIfMarked(event.target.id) ) {
            console.log('already marked')
            return;
        }

        const id = event.target.id;
        let coordinate;

        switch( currentPlayer ){
            case players.x:
                markers[id] = {
                    "id": id,
                    "player": players.x
                }
                appendX(event.target)
                coordinate = id.replace('xy_', '').split('-').map( (elem) => Number(elem) )
                
                if( checkTicTacToe(players.x, coordinate) ){
                    frozen = true;
                    messages.innerHTML = '<h3>Player X won!</h3>'
                }

                // switch players
                currentPlayer = players.o
                break;
            case players.o:
                markers[id] = {
                    "id": id,
                    "player": players.o
                }
                appendO(event.target)
                coordinate = id.replace('xy_', '').split('-').map( (elem) => Number(elem) )
                if( checkTicTacToe(players.o, coordinate) ){
                    frozen = true;
                    messages.innerHTML = '<h3>Player O won!</h3>'
                }

                // switch players
                currentPlayer = players.x
                break;
        }

    }
})