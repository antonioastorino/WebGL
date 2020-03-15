import { Vec3 } from "../DataTypes/XYZVertex.js";
import { XYZMesh } from './XYZMesh.js'
import { XYZRenderer } from "../../src/base/XYZRenderer.js";
import { XYZShader } from "../../src/base/XYZShader.js";

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
		this._vertColorArray = [
			1.0, 1.0, 1.0,
			1.0, 1.0, 1.0,
			0.5, 0.5, 0.5
		]
		this._numOfVertices = this._vertPosArray.length / 3;
	}

	public attachShader = (shader: XYZShader) => {
		this._posArrayBufferObject = XYZRenderer.gl.createBuffer(); // get buffer ID
		this._colArrayBufferObject = XYZRenderer.gl.createBuffer(); // get buffer ID
		this._shader = shader;
		shader.enableAttributes()

		XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, this._posArrayBufferObject); // select buffer
		XYZRenderer.gl.bufferData(XYZRenderer.gl.ARRAY_BUFFER, new Float32Array(this._vertPosArray), XYZRenderer.gl.STATIC_DRAW); // load data
		XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, null)

		XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, this._colArrayBufferObject); // select buffer
		XYZRenderer.gl.bufferData(XYZRenderer.gl.ARRAY_BUFFER, new Float32Array(this._vertColorArray), XYZRenderer.gl.STATIC_DRAW); // load data
		XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, null)

		shader.addMesh(this);
	}
}