import { XYZVector } from "../math/XYZVector.js";
import { XYZVec3 } from "./XYZVec3.js";

export class XYZVec4 extends XYZVector{
	constructor(elements: number[]) {
		super(elements);
		if (elements.length != 4) throw "Wrong number of elements"
	}

	public get type(): string { return "vec4"; }

	public get x(): number { return this.getElement(0); }
	public get y(): number { return this.getElement(1); }
	public get z(): number { return this.getElement(2); }
	public get w(): number { return this.getElement(4); }
	public get xyz(): XYZVec3 { return new XYZVec3([this.x, this.y, this.z]); }

	public set x(value: number) { this.setElement(0, value); }
	public set y(value: number) { this.setElement(1, value); }
	public set z(value: number) { this.setElement(2, value); }
	public set w(value: number) { this.setElement(3, value); }

	public norm = (): number => {
		let v3 = new XYZVector([this.x, this.y, this.z]);
		return Math.sqrt(v3.dot(v3));
	}

	public makeCopy = (): XYZVec4 => {
		let outVector = new XYZVec4(Array<number>(4));
		for (var i in this._elements) { outVector._elements[i] = this._elements[i]; }
		return outVector;
	}

	public getDirection = (): XYZVec4 => {
		let norm = this.norm();
		return new XYZVec4([this.x/norm, this.y/norm, this.z/norm, this.w]);
	}

}