import { XYZVector } from "./XYZVector.js";

/**
 * @class Matrix
 * Methods in this class may be mutating. For them, the 
 * non-mutating counterpart can be found in the
 * A matrix with elements [[a,b],[c,d]] must be seen as
 *   | a  c |
 *   | b  d |
 * (column major)
 * 
 * {@link XYZMatLab} class
 */
export class XYZMatrix {
	protected _matrix: Array<Array<number>>;
	protected _rows: number;
	protected _cols: number;
	constructor(elements: number[][]);
	constructor(rows: number, cols: number);
	constructor(x: number | number[][], y?: number) {
		if (y == undefined) {
			let matrix = <number[][]>x;
			let cols = matrix.length;
			let rows = matrix[0].length;
			this._matrix = matrix;
			this._rows = rows;
			this._cols = cols;
		}
		else {
			let rows = <number>x;
			let cols = y;
			let matrix: number[][] = new Array(rows);
			for (var i = 0; i < cols; i++) {
				matrix[i] = new Array(rows);
				for (var j = 0; j < rows; j++) {
					matrix[i][j] = 0;
				}
			}
			this._rows = rows;
			this._cols = cols;
			this._matrix = matrix;
		}
		if (this._rows == 0 || this._cols == 0) { 
			throw "Zero size not allowed";
		}
		else if (this._rows == 1 && this._cols == 1) {
			throw "This is a scalar!"
		}
	}

	identity = (): XYZMatrix => {
		for (var i = 0; i < this._cols; i++) {
			for (var j = 0; j < this._rows; j++) {
				i == j ? this._matrix[i][j] = 1 : this._matrix[i][j] = 0;
			}
		}
		return this;
	}

	transpose = (): XYZMatrix => {
		var tmp = new XYZMatrix(this._cols, this._rows);
		for (var i = 0; i < this._cols; i++) { // s
			for (var j = 0; j < this._rows; j++) {
				tmp.setElement(j, i, this._matrix[i][j]);
			}
		}
		this._matrix = tmp.getMatrix();
		this._rows = tmp.getRows();
		this._cols = tmp.getCols();
		return this;
	}

	makeCopy = (): XYZMatrix => {
		var other = new XYZMatrix(this._rows, this._cols);
		other._matrix = this._matrix;
		return other;
	}

	public get type(): string { return "matrix"; }

	getRows = (): number => { return this._rows; }
	getCols = (): number => { return this._cols; }
	getElement = (row: number, col: number): number => { return this._matrix[row][col]; }
	getMatrix = (): Array<Array<number>> => { return this._matrix; }
	makeFloat32Array = (): Float32Array => {
		let outArray = new Array<number>(this._rows * this._cols);
		// scans by rows first (column major)
		for (let col = 0; col < this._cols; col++) {
			for (let row = 0; row < this._rows; row++) {
				outArray[col*this._rows + row] = this._matrix[col][row];
			}
		}
		return new Float32Array(outArray);
	}

	setElement = (row: number, col: number, val: number): XYZMatrix => {
		this._matrix[col][row] = val;
		return this;
	}

	public multiplyBy = (other: XYZMatrix | XYZVector | number ): XYZMatrix | XYZVector => {
		if (typeof (other) == 'number') {
			var outMatrix = new XYZMatrix(this._rows, this._cols);
			for (var i = 0; i < this._cols; i++) { 
				for (var j = 0; j < this._rows; j++) {
					outMatrix.setElement(i, j, this._matrix[i][j] * other);
				}
			}
			return outMatrix;
		}
		else if (other.type == "vector") {
			let elements = Array<number>(this._rows)
			for (var i = 0; i < this._cols; i++) {
				elements[i] = 0;
				for (var j = 0; j < this._rows; j++) {
					elements[i] += this._matrix[j][i] * (<XYZVector>other).getElement(j);
				}
			}
			return new XYZVector(elements);
		}
		else if (other.type == "matrix") {
			let P = this._cols;
			let N = this._rows;
			let M = (<XYZMatrix>other).getCols();
			var outMatrix = new XYZMatrix(N, M);
			for (var i = 0; i < N; i++) { // row number
				for (var j = 0; j < M; j++) { // col number
					var sum = 0;
					for (var p = 0; p < P; p++) {
						sum = sum + this._matrix[p][i] * other.getElement(j, p);
					}
					outMatrix.setElement(i, j, sum);
				}
			}
			return outMatrix;
		}
		throw "Incompatible matrices"
	}
}