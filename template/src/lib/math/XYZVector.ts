export class XYZVector {
	protected _elements: number[];
	constructor(elements: number[]) {
		this._elements = elements;
	}
	public get type(): string { return "vector"; }

	public multiplyByScalar = (value: number): XYZVector => {
		let outVector = new XYZVector(Array<number>(this.size))
		for (var i = 0; i < this.size; i++) { // col number
			outVector._elements[i] = this._elements[i] * value;
		}
		return outVector;
	}

	public makeCopy = (): XYZVector => {
		let outVector = new XYZVector(Array<number>(this.size));
		for (var i in this._elements) { outVector._elements[i] = this._elements[i]; }
		return outVector;
	}

	public dot = (other: XYZVector): number => {
		if (this.size == other.size) {
			let result = 0;
			for (var i = 0; i < this.size; i++) {
				result += this.getElement(i) * other.getElement(i)
			}
			return result;
		}
		else throw "Vector with different sizes!"
	}

	public get size(): number { return this._elements.length; }

	public norm = (): number => {
		return Math.sqrt(this.dot(this));
	}

	public getDirection = (): XYZVector => {
		let norm = this.norm()
		if (norm > 0) {
			return this.multiplyByScalar(1.0 / norm);
		}
		throw "A zero vector cannot be normalized"
	}

	public getElement = (elem: number): number => {
		return this._elements[elem];
	}

	public setElement = (elem: number, value: number) => {
		this._elements[elem] = value;
	}
}