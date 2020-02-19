/**
 * @class Matrix
 * Methods in this class may be mutating. For them, the 
 * non-mutating counterpart can be found in the
 * {@link MatLab} class
 */
class Matrix {
	private _matrix: Array<Array<number>>;
	private _rows: number;
	private _cols: number;
	constructor(rows: number, cols: number) {
		let matrix: number[][] = new Array(rows);
		for (var i = 0; i < rows; i++) {
			matrix[i] = new Array(cols);
			for (var j = 0; j < cols; j++) {
				matrix[i][j] = 0;
			}
		}
		this._rows = rows;
		this._cols = cols;
		this._matrix = matrix;
	}

	identity = (): Matrix => {
		for (var i = 0; i < this._rows; i++) {
			for (var j = 0; j < this._cols; j++) {
				i == j ? this._matrix[i][j] = 1 : this._matrix[i][j] = 0;
			}
		}
		return this;
	}

	transpose = (): Matrix => {
		var tmp = new Matrix(this._cols, this._rows);
		for (var i = 0; i < this._rows; i++) { // s
			for (var j = 0; j < this._cols; j++) {
				tmp.setElement(j, i, this._matrix[i][j]);
			}
		}
		this._matrix = tmp.getMatrix();
		this._rows = tmp.getRows();
		this._cols = tmp.getCols();
		return this;
	}

	makeCopy = (): Matrix => {
		var other = new Matrix(this._rows, this._cols);
		other._matrix = this._matrix;
		return other;
	}

	getRows = (): number => { return this._rows; }
	getCols = (): number => { return this._cols; }
	getElement = (row: number, col: number): number => { return this._matrix[row][col]; }
	getMatrix = (): Array<Array<number>> => { return this._matrix; }
	getFloat32Array = (): Float32Array => {
		let outArray: Array<number> = [];
		for (let i = 0; i < this._rows; i++) {
			outArray = outArray.concat(this._matrix[i]);
		}
		return new Float32Array(outArray);
	}

	setElement = (row: number, col: number, val: number) => { this._matrix[row][col] = val; }

	multiplyBy = (other: Matrix): Matrix => {
		if (other.getRows() == this._cols) {
			let P = this._cols;
			let N = this._rows;
			let M = other.getCols();
			var outMatrix = new Matrix(N, M);
			for (var i = 0; i < N; i++) { // row number
				for (var j = 0; j < M; j++) { // col number
					var sum = 0;
					for (var p = 0; p < P; p++) {
						sum = sum + this._matrix[i][p] * other.getElement(p, j);
					}
					outMatrix.setElement(i, j, sum);
				}
			}
			this._matrix = outMatrix.getMatrix();
			this._rows = outMatrix.getRows();
			this._cols = outMatrix.getCols();
			return outMatrix;
		}
		throw "Incompatible matrices"
	}
}
class MatLab {
	static multiplyMatrices = (a: Matrix, b: Matrix): Matrix => {
		let outMatrix = a.makeCopy();
		return outMatrix.multiplyBy(b);
	}

	static transpose = (a: Matrix): Matrix => {
		var outMatrix = a.makeCopy();
		outMatrix.transpose();
		return outMatrix;
	}
}