import { Vec3, RotationVec4 } from "../DataTypes/XYZVertex.js";
import { XYZRenderer } from "../../src/base/XYZRenderer.js";
import { XYZShader } from "../base/XYZShader";
import { XYZMatLab } from "../Math/XYZMatLab";
import { XYZMatrix } from "../Math/XYZMatrix.js";

export class XYZMesh {
	protected _numOfVertices: number = -1;
	protected _vertices: number[] = [];
	protected _vertexArrayBufferObject: WebGLBuffer | null = null;
	protected _shader: XYZShader | null = null;

	private _modelMatrix: XYZMatrix;
	protected _position: Vec3;
	protected _rotation: RotationVec4;
	protected _linearVel: Vec3;
	protected _angularVel: Vec3;

	constructor() {
		this._position = {x: 0, y: 0, z:0};
		this._rotation = {x: 0, y: 1, z:0, angle: 0};
		this._linearVel = {x: 0, y: 0, z:0};
		this._angularVel = {x: 0, y: 0, z:0};
		this._modelMatrix = (new XYZMatrix(4,4)).identity()
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

	public setPosition = (x: number, y: number, z: number) => {
		this._position = {x: x, y: y, z: z};
	}

	protected update = () => {
		let x = this._position.x
		let y = this._position.y
		let z = this._position.z
		this._modelMatrix.setElement(0, 3, x);
		this._modelMatrix.setElement(1, 3, y);
		this._modelMatrix.setElement(2, 3, z);
	}

	public draw = () => {
		this.update();
		XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, this._vertexArrayBufferObject);
		let stride = 6 * Float32Array.BYTES_PER_ELEMENT;
		let shader = <XYZShader>this._shader;
		if (shader.colorAttributeLocation > -1) {
			// stride += 3 * Float32Array.BYTES_PER_ELEMENT;
			XYZRenderer.gl.vertexAttribPointer(
				shader.colorAttributeLocation, // ID
				this._numOfVertices, // size
				XYZRenderer.gl.FLOAT, // type,
				false, // normalized
				stride, // stride
				3 * Float32Array.BYTES_PER_ELEMENT // offset
			);
		}

		XYZRenderer.gl.vertexAttribPointer(
			shader.positionAttributeLocation, // ID
			this._numOfVertices, // size
			XYZRenderer.gl.FLOAT, // type,
			false, // normalized
			stride, // stride
			0 // offset
		);

		if (shader.mMVPUniformLocation != null) {
			let mMVP = <XYZMatrix>XYZRenderer.worldMatrix.multiplyBy(this._modelMatrix);
			XYZRenderer.gl.uniformMatrix4fv(
				shader.mMVPUniformLocation,
				false, // transpose 
				mMVP.makeFloat32Array());
		}

		XYZRenderer.gl.drawArrays(XYZRenderer.gl.TRIANGLES, 0, this._numOfVertices);
	}
}