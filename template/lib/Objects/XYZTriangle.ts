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
		this._vertices = [
			V1.x, V1.y, V1.z, 1, .3, .5,
			V2.x, V2.y, V2.z, 1, .3, .5,
			V3.x, V3.y, V3.z, 1, .3, .5
		]
		this._numOfVertices = 3;
	}

	public attachShader = (shader: XYZShader) => {
		this._vertexArrayBufferObject = XYZRenderer.gl.createBuffer(); // get buffer ID
		this._shader = shader;
		shader.enableAttributes()
		XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, this._vertexArrayBufferObject); // select buffer
		XYZRenderer.gl.bufferData(XYZRenderer.gl.ARRAY_BUFFER, this.makeFloat32Array(), XYZRenderer.gl.STATIC_DRAW); // load data
		XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, null)
		shader.addMesh(this);
	}
}