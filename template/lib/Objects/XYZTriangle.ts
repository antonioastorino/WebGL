import { Vec3 } from "../DataTypes/XYZVertex.js";
import { XYZMesh } from './XYZMesh.js'

export class XYZTriangle extends XYZMesh {
	constructor() {
		super();
		let V1: Vec3 = { x: 0, y: 1, z: 0 };
		let V2: Vec3 = { x: -1, y: -1, z: 0 };
		let V3: Vec3 = { x: 1, y: -1, z: 0 };
		this._vertPosArray = [
			V1.x, V1.y, V1.z,
			V2.x, V2.y, V2.z,
			V3.x, V3.y, V3.z
		]
		this._vertNormalArray = [
			1.0, 1.0, 1.0,
			1.0, 1.0, 1.0,
			0.5, 0.5, 0.5
		]
	}
}