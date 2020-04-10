export class XYZVector {
	private _elements: number[];
	constructor(elements: number[]) {
		this._elements = elements;
	}
	public get type(): string { return "vector"; }
	
	public multiplyBy = (value: number): XYZVector => {
		for (var i = 0; i < this.size; i++) { // col number
			this._elements[i] *= value;
		}
		return this
	}

	public makeCopy = (): XYZVector => {
		let outVector = new XYZVector(this._elements);
		return outVector;
	}

	public dot = (other: XYZVector): number => {
		if (this.size == other.size) {
			let result = 0;
			for (var i = 0; i < this.size; i ++) {
				result += this.getElement(i)*other.getElement(i)
			}
			return result;
		}
		else throw "Vector with different sizes!"
	}

	public cross = (other: XYZVector): XYZVector => {
		if (this.size == 3 && other.size == 3) {
			let a0 = <number>this.x;
			let a1 = <number>this.y;
			let a2 = <number>this.z;

			let b0 = <number>other.x;
			let b1 = <number>other.y;
			let b2 = <number>other.z;

			let x = a1*b2 - b1*a2;
			let y = a2*b0 - b2*a0;
			let z = a0*b1 - b0*a1;			
			return new XYZVector([x, y, z]);
		}
		else throw "Wrong vector dimensions"
	}

	public get size(): number { return this._elements.length; }

	public norm = (): number => {
		return Math.sqrt(this.dot(this));
	}

	public normalize = (): XYZVector => {
		let norm = this.norm()
		if (norm > 0) {
			return <XYZVector>this.multiplyBy(1.0/this.norm());
		}
		throw "A zero vector cannot be normalized" 
	}

	public getDirection = (): XYZVector => {
		let tmp = this.makeCopy();
		return tmp.normalize();
	}

	public getElement = (elem: number): number => {
		return this._elements[elem];
	}

	public setElement = (elem: number, value: number) => {
		this._elements[elem] = value;
	}

	public get x(): number { 
		if (this.size < 5) return this.getElement(0);
		else throw "Parameter not defined for vector with more than 4 elements";
	}
	public get y(): number { 
		if (this.size < 5) return this.getElement(1);
		else throw "Parameter not defined for vector with more than 4 elements";
	}
	public get z(): number { 
		if (this.size < 5) return this.getElement(2);
		else throw "Parameter not defined for vector with more than 4 elements";
	}
	public get w(): number { 
		if (this.size < 5) return this.getElement(3);
		else throw "Parameter not defined for vector with more than 4 elements";
	}

	public set x(value: number) { 
		if (this.size < 5) this.setElement(0, value);
		else throw "Parameter not defined for vector with more than 4 elements";
	}
	public set y(value: number) { 
		if (this.size < 5) this.setElement(1, value);
		else throw "Parameter not defined for vector with more than 4 elements";
	}
	public set z(value: number) { 
		if (this.size < 5) this.setElement(2, value);
		else throw "Parameter not defined for vector with more than 4 elements";
	}
	public set w(value: number) { 
		if (this.size < 5) this.setElement(3, value);
		else throw "Parameter not defined for vector with more than 4 elements";
	}

}