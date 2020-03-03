import { Vec3, RGB } from "../DataTypes/XYZVertex.js";

export class XYZTriangle {
	private _vertices: Array<number>;
	constructor(position: Vec3) {
		let V1: Vec3 = {x: 0, y: 1, z: 0};
		let V2: Vec3 = {x: -1, y: -1, z: 0};
		let V3: Vec3 = {x: 1, y: -1, z: 0};
		let C1: RGB = {r:1, g:0, b: 0};
		let C2: RGB = {r:0, g:1, b: 0};
		let C3: RGB = {r:0, g:0, b: 1};
		this._vertices = [
			V1.x + position.x, V1.y + position.y, V1.z + position.z,	C1.r, C1.g, C1.b,
			V2.x + position.x, V2.y + position.y, V2.z + position.z, 	C2.r, C2.g, C2.b,
			V3.x + position.x, V3.y + position.y, V3.z + position.z, 	C3.r, C3.g, C3.b
		]
	}
	
	public makeFloat32Array = (): Float32Array => {
		return new Float32Array(this._vertices);
	}

	public get vertices(): Array<number> { return this._vertices; }
}