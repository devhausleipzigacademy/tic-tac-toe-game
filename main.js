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

const test1 = document.querySelector('#xy_1-1')
appendO(test1)

const test2 = document.querySelector('#xy_0-0')
appendX(test2)



///////////////////////////////
//// Initialize Game State ////
///////////////////////////////

// 



///////////////////////////
//// State Transitions ////
///////////////////////////