class squareMatrix {
	private _matrix: Array<Array<number>>;
	private _size: number;
	constructor(size: number) {
		if (size == 3 || size == 4) {
			let elements: number[][] = new Array(size);
			for (var i = 0; i < size; i++) {
				elements[i] = new Array(size);
				for (var j = 0; j < size; j++) {
					elements[i][j] = 0;
				}
			}
			this._size = size;
			this._matrix = elements;
		}
		else {
			throw "Invalid matrix size";
		}

	}

	identity = () => {
		for (var i = 0; i < this._size; i++) {
			for (var j = 0; j < this._size; j++) {
				i == j ? this._matrix[i][j] = 1 : this._matrix[i][j] = 0;
			}
		}
	}

	transpose = () => {
		var tmp = new squareMatrix(this._size);
		for (var i = 0; i < this._size; i++) { // s
			for (var j = 0; j < this._size; j++) {
				tmp.setElement(i, j, this._matrix[j][i]);
			}
		}
		this._matrix = tmp.getMatrix();
	}

	getCopy = (): squareMatrix => {
		var other = new squareMatrix(this._size);
		other._matrix = this._matrix;
		other._size = this._size;
		return other;
	}

	getSize = (): number => {
		return this._size;
	}

	getElement = (row: number, col: number): number => {
		return this._matrix[row][col];
	}

	getMatrix = (): Array<Array<number>> => {
		return this._matrix;
	}

	setElement = (row: number, col: number, val: number) => {
		this._matrix[row][col] = val;
	}

	multiplyBy = (other: squareMatrix): squareMatrix => {
		if (other.getSize() == this._size) {
			var outMatrix = new squareMatrix(this._size);
			for (var i = 0; i < this._size; i++) { // s
				for (var j = 0; j < this._size; j++) {
					var sum = 0;
					for (var m = 0; m < this._size; m++) {
						sum = sum + this._matrix[i][m] * other.getElement(m, j);
					}
					outMatrix.setElement(i, j, sum);
				}
			}
			return outMatrix;
		}
		throw "Square matrices with different sizes cannot be multiplied"
	}
}