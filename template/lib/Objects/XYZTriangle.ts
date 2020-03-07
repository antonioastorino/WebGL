import { Vec3, RGB } from "../DataTypes/XYZVertex.js";
import { XYZMesh } from './XYZMesh.js'
import { XYZApplication } from "../../src/base/XYZApplication.js";
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
	}

	public attachShader = (shader: XYZBasicShader) => {
		let vertexArrayBufferObject = XYZApplication.gl.createBuffer(); // get buffer ID
		XYZApplication.gl.bindBuffer(XYZApplication.gl.ARRAY_BUFFER, vertexArrayBufferObject); // select buffer
		XYZApplication.gl.bufferData(XYZApplication.gl.ARRAY_BUFFER, this.makeFloat32Array(), XYZApplication.gl.STATIC_DRAW); // load data

		XYZApplication.gl.vertexAttribPointer(
			shader.positionAttributeLocation, // ID
			3, // size
			XYZApplication.gl.FLOAT, // type,
			false, // normalized
			6 * Float32Array.BYTES_PER_ELEMENT, // stride
			0 // offset
		);

		XYZApplication.gl.vertexAttribPointer(
			shader.colorAttributeLocation, // ID
			3, // size
			XYZApplication.gl.FLOAT, // type,
			false, // normalized
			6 * Float32Array.BYTES_PER_ELEMENT, // stride
			3 * Float32Array.BYTES_PER_ELEMENT // offset
		);
	}

	public draw = () => { XYZApplication.gl.drawArrays(XYZApplication.gl.TRIANGLES, 0, 3); }
}