import { Vec3 } from "../DataTypes/XYZVertex.js";

export class XYZMesh {
	private _linearVel: Vec3;
	private _angularVel: Vec3;
	protected _vertices: number[] = [];
	constructor(
		linearVel: Vec3,
		angularVel: Vec3) {
			this._linearVel =   linearVel;
			this._angularVel =  angularVel;
	}

	public makeFloat32Array = (): Float32Array => {
		return new Float32Array(this._vertices);
	}

	public get vertices(): Array<number> { return this._vertices; }
}