
///////////////////////////////
//// Initialize Game State ////
///////////////////////////////

const root = document.documentElement;
const gameGrid = document.querySelector('.game-grid')
const messages = document.querySelector('#messages')

const players = {
    "x": "X",
    "o": "O"
}

let currentPlayer = players.x
let markers = {}
let frozen = false;

messages.innerHTML = "<h4>Click a cell to start playing</h3>"

document.querySelector("#music").loop = true;

const adjacencySelect = document.querySelector('#options-adjacency > select')
const adjacencyLinearBlock = document.querySelector('#linear-adjacency')
const adjacencyNonLinearBlock = document.querySelector('#non-linear-adjacency')


if(adjacencySelect.value == "linear"){
    adjacencyNonLinearBlock.classList.toggle('hide')
} else {
    adjacencyLinearBlock.classList.toggle('hide')
}

adjacencySelect.addEventListener('input', (event) => {
    adjacencyNonLinearBlock.classList.toggle('hide')
    adjacencyLinearBlock.classList.toggle('hide')
})

const optionsGridSize = document.querySelector("#options-grid-size > input")
optionsGridSize.addEventListener('input', (event) => {
        optionsGridSize.value = Math.max(3, Math.min(100, optionsGridSize.value));
})

const optionsWinLength = document.querySelector("#options-win-length > input")
optionsWinLength.addEventListener('input', (event) => {
    optionsWinLength.value = Math.max(3, Math.min(100, optionsWinLength.value));
})

function generateGridCells() {
    gameGrid.style.gridTemplateRows = `repeat(${optionsGridSize.value}, 1fr)`
    gameGrid.style.gridTemplateColumns = `repeat(${optionsGridSize.value}, 1fr)`

    for (let i = 0; i < optionsGridSize.value; i++) {
        for (let j = 0; j < optionsGridSize.value; j++) {
            const gridSquare = document.createElement('div');
            gridSquare.id = `xy_${i}-${j}`
            gridSquare.classList.add('grid-square')
            gridSquare.style.width = `${600/optionsGridSize.value}px`
            gridSquare.style.height = `${600/optionsGridSize.value}px`
            gridSquare.style.border = `${2/(8* (optionsGridSize.value - 3) + 1)}px solid #D3219B`
            
            gameGrid.appendChild(gridSquare)
        }
    }
}

generateGridCells()

const resetButton = document.querySelector('#button-reset');

resetButton.addEventListener('click', () => {
    removeChildren(gameGrid)
    generateGridCells()
    markers = {};
    frozen = false;
    messages.innerHTML = "<h4>Tic-Tac-Toe is easy, they said. It'll be no sweat, they said.</h4>"
})

function appendX(element) {
    const xLeft = document.createElement('div')
    const xRight = document.createElement('div')

    const width = `${600/optionsGridSize.value - 520/optionsGridSize.value}px`
    const height = `${600/optionsGridSize.value - 200/optionsGridSize.value}px`
    
    xLeft.classList.add('x-marker', 'x-left')
    xLeft.style.width = width;
    xLeft.style.height = height;

    xRight.classList.add('x-marker', 'x-right')
    xRight.style.width = width;
    xRight.style.height = height;

    element.appendChild(xLeft)
    element.appendChild(xRight)
}

function appendO(element) {
    const oInner = document.createElement('div')
    const oOuter = document.createElement('div')

    oInner.classList.add('o-marker', 'o-inner')
    oInner.style.width = `${600/optionsGridSize.value - 250/optionsGridSize.value}px`
    oInner.style.height = `${600/optionsGridSize.value - 250/optionsGridSize.value}px`

    oOuter.classList.add('o-marker', 'o-outer')
    oOuter.style.width = `${600/optionsGridSize.value - 150/optionsGridSize.value}px`
    oOuter.style.height = `${600/optionsGridSize.value - 150/optionsGridSize.value}px`

    oOuter.appendChild(oInner)
    element.appendChild(oOuter)
}

function removeChildren(element) {
    while (element.lastElementChild) {
        element.removeChild(element.lastElementChild);
    }
}

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
            return  !(row < 0 || row > optionsGridSize.value || column < 0 || column > optionsGridSize.value)
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

const adjFuncMap = {
    "option-adjacency-hor": horAdj,
    "option-adjacency-vert": vertAdj,
    "option-adjacency-backdia": backDiaAdj,
    "option-adjacency-fordia": forDiaAdj
}

const adjModeElementMap = {
    "linear": adjacencyLinearBlock,
    "non-linear": adjacencyNonLinearBlock
}

function computeActiveAdjFuncs(){
    const activeAdjFuncs = [];
    const adjFuncBools = adjModeElementMap[adjacencySelect.value].querySelectorAll('div')

    for(const adjFuncBool of adjFuncBools){
        if(adjFuncBool.querySelector('input').checked){
            activeAdjFuncs.push( adjFuncMap[adjFuncBool.id] )
        }
    }
    return activeAdjFuncs;
}

function recursiveCheck(player, coordinate, adjacencyFunction, winLength, currentLength = 1, memo = null){

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
            return winFlag; // shortcircuit looping through adjacents if win already found
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

function checkTicTacToe(player, coordinate, winLength = optionsWinLength.value){
    const activeAdjFuncs = computeActiveAdjFuncs();

    if( adjacencySelect.value == "linear"){
        for(const adjacencyFunction of activeAdjFuncs){
            if( recursiveCheck(player, coordinate, adjacencyFunction, winLength) ){
                return true;
            }
        }
        return false;
    } else {
        const compositeAdjacencyFunction = function(coordinate) {
            const adjacents = [];

            for(const adjFunc of activeAdjFuncs){
                adjacents.push(adjFunc(coordinate))
            }
            
            return adjacents.flat()
        }

        return recursiveCheck(player, coordinate, compositeAdjacencyFunction, winLength)
    }
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