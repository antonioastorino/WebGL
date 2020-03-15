import { Vec3, RotationVec4 } from "../DataTypes/XYZVertex.js";
import { XYZRenderer } from "../../src/base/XYZRenderer.js";
import { XYZShader } from "../base/XYZShader.js";
import { XYZMatLab } from "../Math/XYZMatLab.js";
import { XYZMatrix } from "../Math/XYZMatrix.js";

export class XYZMesh {
	protected _numOfVertices: number = -1;
	protected _vertPosArray: number[] = [];
	protected _vertColorArray: number[] = [];
	protected _posArrayBufferObject: WebGLBuffer | null = null;
	protected _colArrayBufferObject: WebGLBuffer | null = null;
	protected _shader: XYZShader | null = null;

	private _modelMatrix: XYZMatrix;
	protected _position: Vec3;
	protected _rotation: RotationVec4;
	protected _scale: Vec3;
	protected _linearVel: Vec3;
	protected _angularVel: Vec3;

	constructor() {
		this._position = {x: 0, y: 0, z:0};
		this._rotation = {x: 0, y: 1, z:0, angle: 0};
		this._scale = {x: 1, y: 1, z:1 };
		this._linearVel = {x: 0, y: 0, z:0};
		this._angularVel = {x: 0, y: 0, z:0};
		this._modelMatrix = (new XYZMatrix(4,4)).identity()
	}

	public get vertexPositions(): Array<number> { return this._vertPosArray; }
	public get vertexColors(): Array<number> { return this._vertColorArray; }

	public get numOfVertices(): number {
		if (this.numOfVertices > 0) {
			return this._numOfVertices;
		}
		else {
			throw "Num of vertices not defined"
		}
	}

	/* TODO: it should not be possible to access the position directly but
		only through forces. Only the initial position should be accessible upon
		initialization. Same goes for the orientation
	*/
	public setPosition = (position: Vec3) => { this._position = position; }
	public setOrientation = (orientation: RotationVec4) => { this._rotation = orientation; }
	public setScale = (scale: Vec3) => { this._scale = scale; }

	protected update = () => {
		this._modelMatrix = XYZMatLab.makeModelMatrix(
			this._position,
			this._rotation,
			this._scale
			);
	}

	public draw = () => {
		this.update();
		let shader = <XYZShader>this._shader;
		XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, this._posArrayBufferObject);

		XYZRenderer.gl.vertexAttribPointer(
			shader.positionAttributeLocation, // ID
			this._numOfVertices, // size
			XYZRenderer.gl.FLOAT, // type,
			false, // normalized
			3 * Float32Array.BYTES_PER_ELEMENT, // stride
			0 // offset
		);

		// TODO: Fix stride based on vertex attribute
		if (shader.colorAttributeLocation > -1) {
			XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, this._colArrayBufferObject);
			// stride += 3 * Float32Array.BYTES_PER_ELEMENT;
			XYZRenderer.gl.vertexAttribPointer(
				shader.colorAttributeLocation, // ID
				this._numOfVertices, // size
				XYZRenderer.gl.FLOAT, // type,
				false, // normalized
				3 * Float32Array.BYTES_PER_ELEMENT, // stride
				0 // offset
			);
		}

		if (shader.mMVPUniformLocation != null) {
			let mMVP = <XYZMatrix>XYZRenderer.worldMatrix.multiplyBy(this._modelMatrix);
			XYZRenderer.gl.uniformMatrix4fv(
				shader.mMVPUniformLocation,
				false, // transpose 
				mMVP.makeFloat32Array());
		}

		XYZRenderer.gl.drawArrays(XYZRenderer.gl.TRIANGLES, 0, this._numOfVertices);
		XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, null);
	}
}