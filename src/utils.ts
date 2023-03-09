import { Coordinate, Predicate } from "./types";

export function mod(n: number, m: number) {
	return ((n % m) + m) % m;
}

export function randomNumber(range: number) {
	return Math.floor(Math.random() * range);
}

export function randomCoordinate(xRange: number, yRange: number): Coordinate {
	return [randomNumber(xRange), randomNumber(yRange)];
}

export function removeChildren(element: Element) {
	while (element.lastElementChild) {
		element.removeChild(element.lastElementChild);
	}
}

export function coordToId([x, y]: Coordinate): string {
	return `${x}-${y}`;
}

export function idToCoord(id: string): Coordinate {
	return id.split("-").map(Number) as Coordinate;
}

export function filterInvalid<T>(
	array: Array<T>,
	predicate: Predicate<T>
): Array<T> {
	return array.filter((element) => {
		return predicate(element);
	});
}
