import { XYZVector } from "./XYZVector.js";
import { XYZVec2 } from "../data-types/XYZVec2.js";
import { XYZVec3 } from "../data-types/XYZVec3.js";
import { XYZVec4 } from "../data-types/XYZVec4.js";

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
	protected _elements: Array<Array<number>>;
	protected _numOfRows: number;
	protected _numOfCols: number;
	constructor(elements: number[][]);
	constructor(rows: number, cols: number);
	constructor(x: number | number[][], y?: number) {
		if (y == undefined) {
			let matrix = <number[][]>x;
			let cols = matrix.length;
			let rows = matrix[0].length;
			this._elements = matrix;
			this._numOfRows = rows;
			this._numOfCols = cols;
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
			this._numOfRows = rows;
			this._numOfCols = cols;
			this._elements = matrix;
		}
		if (this._numOfRows == 0 || this._numOfCols == 0) {
			throw "Zero size not allowed";
		}
		else if (this._numOfRows == 1 && this._numOfCols == 1) {
			throw "This is a scalar!"
		}
	}

	identity = (): XYZMatrix => {
		for (var i = 0; i < this._numOfCols; i++) {
			for (var j = 0; j < this._numOfRows; j++) {
				i == j ? this._elements[i][j] = 1 : this._elements[i][j] = 0;
			}
		}
		return this;
	}

	transpose = (): XYZMatrix => {
		var outMatrix = new XYZMatrix(this._numOfCols, this._numOfRows);
		for (var i = 0; i < this._numOfCols; i++) { // s
			for (var j = 0; j < this._numOfRows; j++) {
				outMatrix.setElement(i, j, this._elements[i][j]);
			}
		}
		return outMatrix;
	}

	makeCopy = (): XYZMatrix => {
		var other = new XYZMatrix(this._numOfRows, this._numOfCols);
		other._elements = this._elements;
		return other;
	}

	public get type(): string { return "matrix"; }

	getNumOfRows = (): number => { return this._numOfRows; }
	getNumOfCols = (): number => { return this._numOfCols; }
	getElement = (row: number, col: number): number => { return this._elements[col][row]; }
	getMatrix = (): Array<Array<number>> => { return this._elements; }
	makeFloat32Array = (): Float32Array => {
		let outArray = new Array<number>(this._numOfRows * this._numOfCols);
		// scans by rows first (column major)
		for (let col = 0; col < this._numOfCols; col++) {
			for (let row = 0; row < this._numOfRows; row++) {
				outArray[col * this._numOfRows + row] = this._elements[col][row];
			}
		}
		return new Float32Array(outArray);
	}

	setElement = (row: number, col: number, val: number): XYZMatrix => {
		this._elements[col][row] = val;
		return this;
	}

	public multiplyByScalar = (other: number): XYZMatrix => {
		var outMatrix = new XYZMatrix(this._numOfRows, this._numOfCols);
		for (var i = 0; i < this._numOfCols; i++) {
			for (var j = 0; j < this._numOfRows; j++) {
				outMatrix.setElement(i, j, this._elements[i][j] * other);
			}
		}
		return outMatrix;
	}

	public multiplyByVector = (other: XYZVector): XYZVector | XYZVec2 | XYZVec3 | XYZVec4 => {
		let elements = Array<number>(this._numOfRows)
		for (var i = 0; i < this._numOfCols; i++) {
			elements[i] = 0;
			for (var j = 0; j < this._numOfRows; j++) {
				elements[i] += this.getElement(i, j) * other.getElement(j);
			}
		}
		switch (other.type) {
			case "vec2":
				return new XYZVec2(elements);
			case "vec3":
				return new XYZVec3(elements);
			case "vec4":
				return new XYZVec4(elements);
			default:
				return new XYZVector(elements);
		}
	}

	public multiplyByMatrix = (other: XYZMatrix): XYZMatrix => {
		let P = this._numOfCols;
		let N = this._numOfRows;
		let M = other.getNumOfCols();
		var outMatrix = new XYZMatrix(N, M);
		for (var i = 0; i < N; i++) { // row number
			for (var j = 0; j < M; j++) { // col number
				var sum = 0;
				for (var p = 0; p < P; p++) {
					sum = sum + this.getElement(i, p) * other.getElement(p, j);
				}
				outMatrix.setElement(i, j, sum);
			}
		}
		return outMatrix;
	}
}