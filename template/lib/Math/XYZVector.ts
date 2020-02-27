import { XYZMatrix } from './XYZMatrix.js'

export class XYZVector extends XYZMatrix {
	constructor(elements: number[]) {
		super (elements.length, 1);
		for (var i = 0; i < this.getRows(); i++) {
			this.setElement(i, 0, elements[i]);
		}
	}

	multiplyBy = (other: XYZMatrix | number): XYZVector => {
		if (typeof(other) != 'number') {
			throw "Operation not admitted"
		}
		var outVector = new XYZVector(new Array<number>(this._rows));
		for (var i = 0; i < this._rows; i++) { // col number
			outVector.setElement(i, 0, this._matrix[i][0] * other);
		}
		this._matrix = outVector.getMatrix();
		return outVector;
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
			let result = 0;
			for (var i = 0; i < this._rows; i ++) {
				result += this.getElement(i, 0)*other.getElement(i, 0)
			}
			return result;
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