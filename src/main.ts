import { AdjFunc, Coordinate, Predicate, SeenMemo } from "./types";
import { coordToId, filterInvalid, idToCoord, removeChildren } from "./utils";

///////////////////////////////
//// Initialize Game State ////
///////////////////////////////

const root = document.documentElement;
const gameGrid = document.querySelector(".game-grid") as HTMLElement;
const messages = document.querySelector("#messages") as HTMLElement;

const players: Record<string, string> = {
	x: "X",
	o: "O"
};

type Marker = {
	id: string;
	player: string;
};

let currentPlayer = players.x;
let markers: Record<string, Marker> = {};
let frozen = false;

messages.innerHTML = "<h4>Click a cell to start playing</h3>";

const music = document.querySelector("#music") as HTMLAudioElement;
music.loop = true;

const adjacencySelect = document.querySelector(
	"#options-adjacency > select"
) as HTMLSelectElement;

const adjacencyLinearBlock = document.querySelector(
	"#linear-adjacency"
) as HTMLElement;

const adjacencyNonLinearBlock = document.querySelector(
	"#non-linear-adjacency"
) as HTMLElement;

if (adjacencySelect.value == "linear") {
	adjacencyNonLinearBlock.classList.toggle("hide");
} else {
	adjacencyLinearBlock.classList.toggle("hide");
}

adjacencySelect.addEventListener("input", (event) => {
	adjacencyNonLinearBlock.classList.toggle("hide");
	adjacencyLinearBlock.classList.toggle("hide");
});

const optionsGridSize = document.querySelector(
	"#options-grid-size > input"
) as HTMLInputElement;
optionsGridSize.addEventListener("input", (event) => {
	optionsGridSize.value = String(
		Math.max(3, Math.min(100, Number(optionsGridSize.value)))
	);
});

const optionsWinLength = document.querySelector(
	"#options-win-length > input"
) as HTMLInputElement;
optionsWinLength.addEventListener("input", (event) => {
	optionsWinLength.value = String(
		Math.max(3, Math.min(100, Number(optionsWinLength.value)))
	);
});

function generateGridCells() {
	gameGrid.style.gridTemplateRows = `repeat(${optionsGridSize.value}, 1fr)`;
	gameGrid.style.gridTemplateColumns = `repeat(${optionsGridSize.value}, 1fr)`;

	for (let i = 1; i <= Number(optionsGridSize.value); i++) {
		for (let j = 1; j <= Number(optionsGridSize.value); j++) {
			const gridSquare = document.createElement("div");
			gridSquare.id = `${i}-${j}`;
			gridSquare.classList.add("grid-square");
			gridSquare.style.width = `${600 / Number(optionsGridSize.value)}px`;
			gridSquare.style.height = `${
				600 / Number(optionsGridSize.value)
			}px`;
			gridSquare.style.border = `${
				2 / (8 * (Number(optionsGridSize.value) - 3) + 1)
			}px solid #D3219B`;

			gameGrid.appendChild(gridSquare);
		}
	}
}

generateGridCells();

const resetButton = document.querySelector("#button-reset") as HTMLElement;

resetButton.addEventListener("click", () => {
	removeChildren(gameGrid);
	generateGridCells();
	markers = {};
	frozen = false;
	messages.innerHTML =
		"<h4>Tic-Tac-Toe is easy, they said. It'll be no sweat, they said.</h4>";
});

function appendX(element: Element) {
	const xLeft = document.createElement("div");
	const xRight = document.createElement("div");

	const width = `${
		600 / Number(optionsGridSize.value) -
		520 / Number(optionsGridSize.value)
	}px`;
	const height = `${
		600 / Number(optionsGridSize.value) -
		200 / Number(optionsGridSize.value)
	}px`;

	xLeft.classList.add("x-marker", "x-left");
	xLeft.style.width = width;
	xLeft.style.height = height;

	xRight.classList.add("x-marker", "x-right");
	xRight.style.width = width;
	xRight.style.height = height;

	element.appendChild(xLeft);
	element.appendChild(xRight);
}

function appendO(element: Element) {
	const oInner = document.createElement("div");
	const oOuter = document.createElement("div");

	oInner.classList.add("o-marker", "o-inner");
	oInner.style.width = `${
		600 / Number(optionsGridSize.value) -
		250 / Number(optionsGridSize.value)
	}px`;
	oInner.style.height = `${
		600 / Number(optionsGridSize.value) -
		250 / Number(optionsGridSize.value)
	}px`;

	oOuter.classList.add("o-marker", "o-outer");
	oOuter.style.width = `${
		600 / Number(optionsGridSize.value) -
		150 / Number(optionsGridSize.value)
	}px`;
	oOuter.style.height = `${
		600 / Number(optionsGridSize.value) -
		150 / Number(optionsGridSize.value)
	}px`;

	oOuter.appendChild(oInner);
	element.appendChild(oOuter);
}

///////////////////////////
//// State Transitions ////
///////////////////////////

function checkIfMarked(id: string): boolean {
	return Object.values(markers).some((obj) => {
		return obj.id == id;
	});
}

function whichPlayer(id: string) {
	const marker = markers[id];
	return marker.player;
}

const horAdj: AdjFunc = function ([row, column]) {
	const left: Coordinate = [row, column - 1];
	const right: Coordinate = [row, column + 1];
	return [left, right];
};

const vertAdj: AdjFunc = function ([row, column]) {
	const above: Coordinate = [row - 1, column];
	const below: Coordinate = [row + 1, column];
	return [above, below];
};

const backDiaAdj: AdjFunc = function ([row, column]) {
	const topleft: Coordinate = [row - 1, column - 1];
	const bottomright: Coordinate = [row + 1, column + 1];
	return [topleft, bottomright];
};

const forDiaAdj: AdjFunc = function ([row, column]) {
	const topright: Coordinate = [row - 1, column + 1];
	const bottomleft: Coordinate = [row + 1, column - 1];
	return [topright, bottomleft];
};

const adjFuncMap: Record<string, AdjFunc> = {
	"option-adjacency-hor": horAdj,
	"option-adjacency-vert": vertAdj,
	"option-adjacency-backdia": backDiaAdj,
	"option-adjacency-fordia": forDiaAdj
};

const adjModeElementMap: Record<string, HTMLElement> = {
	linear: adjacencyLinearBlock,
	"non-linear": adjacencyNonLinearBlock
};

function computeActiveAdjFuncs() {
	const activeAdjFuncs = [];
	const adjFuncBools =
		adjModeElementMap[adjacencySelect.value].querySelectorAll("div");

	for (const adjFuncBool of Array.from(adjFuncBools)) {
		const input = adjFuncBool.querySelector("input") as HTMLInputElement;
		if (input.checked) {
			activeAdjFuncs.push(adjFuncMap[adjFuncBool.id]);
		}
	}
	return activeAdjFuncs;
}

const nByN: Predicate<Coordinate> = function (coord) {
	const [column, row] = coord;
	return !(
		row < 1 ||
		row > Number(optionsGridSize.value) ||
		column < 1 ||
		column > Number(optionsGridSize.value)
	);
};

const neverSeen = function (memo: SeenMemo): Predicate<Coordinate> {
	return (coord) => {
		const id = coordToId(coord);
		memo = memo as SeenMemo;
		return !memo.has(id); //keep if adjacent is not in memo
	};
};

function recursiveCheck(
	player: string,
	coordinate: Coordinate,
	adjacencyFunction: AdjFunc,
	winLength: number,
	currentLength: number = 1,
	memo: SeenMemo | null = null
): boolean {
	console.log("coordinate: ", coordinate);
	console.log("currenLength: ", currentLength);

	if (currentLength == winLength) {
		return true;
	}

	if (memo == null) {
		memo = new Set();
	}

	let winFlag = false;
	let id = coordToId(coordinate);
	memo.add(id);

	const adjacents = adjacencyFunction(coordinate);
	const newAdjacents = filterInvalid<Coordinate>(adjacents, neverSeen(memo));
	const newValidAdjacents = filterInvalid<Coordinate>(newAdjacents, nByN);

	console.log(newValidAdjacents);

	for (const adjacent of newValidAdjacents) {
		if (winFlag) {
			return winFlag; // shortcircuit looping through adjacents if win already found
		}

		let id = coordToId(adjacent);

		if (checkIfMarked(id)) {
			memo.add(id);

			if (whichPlayer(id) == player) {
				winFlag =
					winFlag ||
					recursiveCheck(
						player,
						adjacent,
						adjacencyFunction,
						winLength,
						currentLength + 1,
						memo
					);
			}
		}
	}

	return winFlag;
}

function checkTicTacToe(
	player: string,
	coordinate: Coordinate,
	winLength = Number(optionsWinLength.value)
): boolean {
	const activeAdjFuncs = computeActiveAdjFuncs();

	if (adjacencySelect.value == "linear") {
		for (const adjacencyFunction of activeAdjFuncs) {
			if (
				recursiveCheck(player, coordinate, adjacencyFunction, winLength)
			) {
				return true;
			}
		}
		return false;
	} else {
		const compositeAdjacencyFunction: AdjFunc = function (coordinate) {
			const adjacents = [];

			for (const adjFunc of activeAdjFuncs) {
				adjacents.push(adjFunc(coordinate));
			}

			return adjacents.flat();
		};

		return recursiveCheck(
			player,
			coordinate,
			compositeAdjacencyFunction,
			winLength
		);
	}
}

gameGrid.addEventListener("click", (event) => {
	const target = event.target as HTMLElement;

	if (target.matches(".grid-square") && !frozen) {
		if (checkIfMarked(target.id)) {
			console.log("already marked");
			return;
		}
		console.log("updating board");

		const id = target.id;
		let coordinate;

		switch (currentPlayer) {
			case players.x:
				markers[id] = {
					id: id,
					player: players.x
				};
				appendX(target);
				coordinate = idToCoord(id);

				if (checkTicTacToe(players.x, coordinate)) {
					frozen = true;
					messages.innerHTML = "<h3>Player X won!</h3>";
				}

				// switch players
				currentPlayer = players.o;
				break;
			case players.o:
				markers[id] = {
					id: id,
					player: players.o
				};
				appendO(target);
				coordinate = idToCoord(id);
				if (checkTicTacToe(players.o, coordinate)) {
					frozen = true;
					messages.innerHTML = "<h3>Player O won!</h3>";
				}

				// switch players
				currentPlayer = players.x;
				break;
		}
	}
});
