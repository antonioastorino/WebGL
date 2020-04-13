import { XYZVector } from "../math/XYZVector.js";

export class XYZVec2 extends XYZVector{
	constructor(elements: number[]) {
		super(elements);
		if (elements.length != 2) throw "Wrong number of elements"
	}

	public get type(): string { return "vec2"; }

	public get x(): number { return this.getElement(0); }
	public get y(): number { return this.getElement(1); }

	public set x(value: number) { this.setElement(0, value); }
	public set y(value: number) { this.setElement(1, value); }

	public getDirection = (): XYZVec2 => {
		let norm = this.norm()
		if (norm > 0) {
			return new XYZVec2([this.x/norm, this.y/norm]);
		}
		throw "A zero vector cannot be normalized"
	}
}