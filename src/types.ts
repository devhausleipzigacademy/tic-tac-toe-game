export type Player = {
	name: string;
	mark: string;
};

export type CellState = {
	mark: string | null;
};

export type GameState = Record<string, CellState>;

export type Coordinate = [number, number];

export type AdjFunc = (coord: Coordinate) => Array<Coordinate>;

export type Predicate<T> = (element: T) => boolean;

export type SeenMemo = Set<string>;
