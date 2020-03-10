import { Vec3, RGB } from "../DataTypes/XYZVertex.js";
import { XYZMesh } from './XYZMesh.js'
import { XYZRenderer } from "../../src/base/XYZRenderer.js";
import { XYZBasicShader } from "../../src/base/XYZShader.js";

export class XYZTriangle extends XYZMesh {
	constructor(
		position: Vec3,
		color: RGB,
		linearVel: Vec3,
		angularVel: Vec3) {
		super(linearVel, angularVel);
		let V1: Vec3 = { x: 0, y: 1, z: 0 };
		let V2: Vec3 = { x: -1, y: -1, z: 0 };
		let V3: Vec3 = { x: 1, y: -1, z: 0 };
		this._vertices = [
			V1.x + position.x, V1.y + position.y, V1.z + position.z, color.r, color.g, color.b,
			V2.x + position.x, V2.y + position.y, V2.z + position.z, color.r, color.g, color.b,
			V3.x + position.x, V3.y + position.y, V3.z + position.z, color.r, color.g, color.b
		]
		this._numOfVertices = 3;
	}

	public attachShader = (shader: XYZBasicShader) => {
		let vertexArrayBufferObject = XYZRenderer.gl.createBuffer(); // get buffer ID
		XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, vertexArrayBufferObject); // select buffer
		XYZRenderer.gl.bufferData(XYZRenderer.gl.ARRAY_BUFFER, this.makeFloat32Array(), XYZRenderer.gl.STATIC_DRAW); // load data

		XYZRenderer.gl.vertexAttribPointer(
			shader.positionAttributeLocation, // ID
			this._numOfVertices, // size
			XYZRenderer.gl.FLOAT, // type,
			false, // normalized
			6 * Float32Array.BYTES_PER_ELEMENT, // stride
			0 // offset
		);

		XYZRenderer.gl.vertexAttribPointer(
			shader.colorAttributeLocation, // ID
			this._numOfVertices, // size
			XYZRenderer.gl.FLOAT, // type,
			false, // normalized
			6 * Float32Array.BYTES_PER_ELEMENT, // stride
			3 * Float32Array.BYTES_PER_ELEMENT // offset
		);
	}
}