/**
 * @class Matrix
 * Methods in this class may be mutating. For them, the 
 * non-mutating counterpart can be found in the
 * {@link XYZMatLab} class
 */
export class XYZMatrix {
	protected _matrix: Array<Array<number>>;
	protected _rows: number;
	protected _cols: number;
	constructor(elements: number[][]);
	constructor(rows: number, cols: number);
	constructor(x: number | number[][], y?: number) {
		if (!y) {
			let matrix = <number[][]>x;
			let rows = matrix.length;
			let cols = matrix[0].length;
			this._matrix = matrix;
			this._rows = rows;
			this._cols = cols;
		}
		else {
			let rows = <number>x;
			let cols = y;
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
	}

	identity = (): XYZMatrix => {
		for (var i = 0; i < this._rows; i++) {
			for (var j = 0; j < this._cols; j++) {
				i == j ? this._matrix[i][j] = 1 : this._matrix[i][j] = 0;
			}
		}
		return this;
	}

	transpose = (): XYZMatrix => {
		var tmp = new XYZMatrix(this._cols, this._rows);
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

	makeCopy = (): XYZMatrix => {
		var other = new XYZMatrix(this._rows, this._cols);
		other._matrix = this._matrix;
		return other;
	}

	getRows = (): number => { return this._rows; }
	getCols = (): number => { return this._cols; }
	getElement = (row: number, col: number): number => { return this._matrix[row][col]; }
	getMatrix = (): Array<Array<number>> => { return this._matrix; }
	getFloat32Array = (): Float32Array => {
		let outArray = new Array<number>(this._rows * this._cols);
		// scans by rows first (column major)
		for (let i = 0; i < this._cols; i++) {
			for (let j = 0; j < this._rows; j++) {
				outArray[i*this._cols + j] = this._matrix[j][i];
			}
		}
		return new Float32Array(outArray);
	}

	setElement = (row: number, col: number, val: number): XYZMatrix => {
		this._matrix[row][col] = val;
		return this;
	}

	multiplyBy = (other: XYZMatrix | number ): XYZMatrix | XYZVector => {
		if (typeof (other) == 'number') {
			if (this instanceof XYZVector) {
				var outVector = new XYZVector(new Array<number>(this._rows));
				for (var i = 0; i < this._rows; i++) { // col number
					outVector.setElement(i, 0, this._matrix[i][0] * other);
				}
				this._matrix = outVector.getMatrix();
				return outVector;
			}
			else {
				var outMatrix = new XYZMatrix(this._rows, this._cols);
				for (var i = 0; i < this._rows; i++) { // row number
					for (var j = 0; j < this._cols; j++) { // col number
						outMatrix.setElement(i, j, this._matrix[i][j] * other);
					}
				}
				this._matrix = outMatrix.getMatrix();
				return outMatrix;
			}
		}
		else if (other.getRows() == this._cols) {
			let P = this._cols;
			let N = this._rows;
			let M = other.getCols();
			var outMatrix = new XYZMatrix(N, M);
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

export class XYZVector extends XYZMatrix {
	constructor(elements: number[]) {
		super (elements.length, 1);
		for (var i = 0; i < this.getRows(); i++) {
			this.setElement(i, 0, elements[i]);
		}
	}

	makeCopy = (): XYZVector => {
		let size = this.getRows()
		let newMatrix = Array<number>(size);
		for (let i = 0; i < size; i++) {
			newMatrix[i] = this.getElement(i, 0);
		}
		var other = new XYZVector(newMatrix);
		return other;
	}

	dot = (other: XYZVector): number => {
		if (this._rows == other._rows) {
			let tr = other.makeCopy().transpose();
			let prod = tr.multiplyBy(this);
			return prod.getElement(0, 0);
		}
		else throw "Vector with different sizes!"
	}

	cross = (other: XYZVector): XYZVector => {
		if (this._rows == 3 && other._rows == 3) {
			let a0 = this.getElement(0,0);
			let a1 = this.getElement(1,0);
			let a2 = this.getElement(2,0);

			let b0 = other.getElement(0,0);
			let b1 = other.getElement(1,0);
			let b2 = other.getElement(2,0);

			let x = a1*b2 - b1*a2;
			let y = a2*b0 - b2*a0;
			let z = a0*b1 - b0*a1;			
			return new XYZVector([x, y, z]);
		}
		else throw "Wrong vector dimensions"
	}

	norm = (): number => {
		return Math.sqrt(this.dot(this));
	}

	normalize = (): XYZVector => {
		let norm = this.norm()
		if (norm > 0) {
			return <XYZVector>this.multiplyBy(1.0/this.norm());
		}
		throw "A zero vector cannot be normalized" 
	}

	getDirection = (): XYZVector => {
		let tmp = this.makeCopy();
		return tmp.normalize();
	}
}

export class XYZMatLab {
	static multiply = (a: XYZMatrix, b: XYZMatrix | number): XYZMatrix => {
		let outMatrix = a.makeCopy();
		return outMatrix.multiplyBy(b);
	}

	static transpose = (a: XYZMatrix): XYZMatrix | XYZVector => {
		var outMatrix = a.makeCopy();
		outMatrix.transpose();
		return outMatrix;
	}

	static makeTranslationMatrix = (vector: XYZVector): XYZMatrix => {
		let matTranslation = (new XYZMatrix(4,4)).identity();
		matTranslation.setElement(0,3,vector.getElement(0,0));
		matTranslation.setElement(1,3,vector.getElement(1,0));
		matTranslation.setElement(2,3,vector.getElement(2,0));
		return matTranslation;
	}
}