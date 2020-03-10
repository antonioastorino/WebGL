import { Vec3 } from "../DataTypes/XYZVertex.js";
import { XYZRenderer } from "../../src/base/XYZRenderer.js";

export class XYZMesh {
	private _linearVel: Vec3;
	private _angularVel: Vec3;
	protected _numOfVertices: number = -1;
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

	public get numOfVertices(): number {
		if (this.numOfVertices > 0) {
			return this._numOfVertices;
		}
		else {
			throw "Num of vertices not defined"
		}
	}

	public draw = () => { XYZRenderer.gl.drawArrays(XYZRenderer.gl.TRIANGLES, 0, this._numOfVertices); }
}