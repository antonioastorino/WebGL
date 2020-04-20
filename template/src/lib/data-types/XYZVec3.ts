import { XYZVector } from "../math/XYZVector.js";

export class XYZVec3 extends XYZVector{
	constructor(elements: number[]) {
		super(elements);
		if (elements.length != 3) throw "Wrong number of elements"
	}

	public get type(): string { return "vec3"; }

	public get x(): number { return this.getElement(0); }
	public get y(): number { return this.getElement(1); }
	public get z(): number { return this.getElement(2); }

	public set x(value: number) { this.setElement(0, value); }
	public set y(value: number) { this.setElement(1, value); }
	public set z(value: number) { this.setElement(2, value); }

	public cross = (other: XYZVec3): XYZVec3 => {
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
			return new XYZVec3([x, y, z]);
		}
		else throw "Wrong vector dimensions"
	}

	public makeCopy = (): XYZVec3 => {
		let outVector = new XYZVec3(Array<number>(3));
		for (var i in this._elements) { outVector._elements[i] = this._elements[i]; }
		return outVector;
	}

	public getDirection = (): XYZVec3 => {
		let norm = this.norm()
		if (norm > 0) {
			return new XYZVec3([this.x/norm, this.y/norm, this.z/norm]);
		}
		throw "A zero vector cannot be normalized"
	}
}