import { Vec3, RotationVec4 } from "../DataTypes/XYZVertex.js";
import { XYZRenderer } from "../../src/base/XYZRenderer.js";
import { XYZShader } from "../base/XYZShader.js";
import { XYZMatLab } from "../Math/XYZMatLab.js";
import { XYZMatrix } from "../Math/XYZMatrix.js";

export class XYZMesh {
	protected _vertPosArray: number[] = [];
	protected _vertColorArray: number[] = [];
	protected _posArrayBufferObject: WebGLBuffer | null = null;
	protected _colArrayBufferObject: WebGLBuffer | null = null;
	protected _shader: XYZShader | null = null;
	protected _dimensions: number = 3;

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
	public get numOfVertices(): number { return this._vertPosArray.length / this._dimensions; }

	/* TODO: it should not be possible to access the position directly but
		only through forces. Only the initial position should be accessible upon
		initialization. Same goes for the orientation
	*/
	public setPosition = (position: Vec3) => { this._position = position; }
	public setOrientation = (orientation: RotationVec4 | number) => {
		if (this._dimensions == 2 && typeof(orientation) == 'number' ) {
			// only rotations about the z-axis are allowed
			this._rotation = {x: 0, y: 0, z: 1, angle: <number>orientation };
		}
		else if (this._dimensions == 3 && typeof(orientation) == 'object' ) {
			this._rotation = <RotationVec4>orientation;
		}
		else {
			throw "Check orientation parameter!"
		}
	}
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
			this._dimensions, // number of components per vertex attribute
			XYZRenderer.gl.FLOAT, // type,
			false, // normalized
			0, // stride
			0 // offset
		);

		// TODO: Fix stride based on vertex attribute
		if (shader.colorAttributeLocation > -1) {
			XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, this._colArrayBufferObject);
			// stride += 3 * Float32Array.BYTES_PER_ELEMENT;
			XYZRenderer.gl.vertexAttribPointer(
				shader.colorAttributeLocation, // ID
				3, // number of components per vertex attribute
				XYZRenderer.gl.FLOAT, // type,
				false, // normalized
				0, // stride
				0 // offset
			);
		}

		if (shader.mMVPUniformLocation != null) {
			let mMVP: XYZMatrix
			if (this._dimensions == 3) {
				mMVP = <XYZMatrix>XYZRenderer.worldMatrix.multiplyBy(this._modelMatrix);
			}
			else {
				let mScale = XYZMatLab.makeScaleMatrix(1/XYZRenderer.aspectRatio, 1, 1);
				mMVP = <XYZMatrix>mScale.multiplyBy(this._modelMatrix);
			}
			XYZRenderer.gl.uniformMatrix4fv(
				shader.mMVPUniformLocation,
				false, // transpose 
				mMVP.makeFloat32Array());
		}

		XYZRenderer.gl.drawArrays(XYZRenderer.gl.TRIANGLES, 0, this.numOfVertices);
		XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, null);
	}

	public attachShader = (shader: XYZShader) => {
		if (shader.dimensions != this._dimensions) throw "Shader incompatible with object"
		this._shader = shader;
		this._posArrayBufferObject = XYZRenderer.gl.createBuffer(); // get buffer ID
		this._colArrayBufferObject = XYZRenderer.gl.createBuffer(); // get buffer ID
		shader.enableAttributes()

		XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, this._posArrayBufferObject); // select buffer
		XYZRenderer.gl.bufferData(XYZRenderer.gl.ARRAY_BUFFER, new Float32Array(this._vertPosArray), XYZRenderer.gl.STATIC_DRAW); // load data

		XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, this._colArrayBufferObject); // select buffer
		XYZRenderer.gl.bufferData(XYZRenderer.gl.ARRAY_BUFFER, new Float32Array(this._vertColorArray), XYZRenderer.gl.STATIC_DRAW); // load data

		XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, null)

		shader.addMesh(this);
	}
}