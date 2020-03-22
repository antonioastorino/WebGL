import { Vec3, RotationVec4 } from "../DataTypes/XYZVertex.js";
import { XYZRenderer } from "../../src/base/XYZRenderer.js";
import { XYZShader } from "../base/XYZShader.js";
import { XYZMatLab } from "../Math/XYZMatLab.js";
import { XYZMatrix } from "../Math/XYZMatrix.js";

export class XYZMesh {
	protected _vertPosArray: number[] = [];
	protected _vertColorArray: number[] = [];
	protected _texCoordArray: number[] = [];
	protected _texImg: HTMLImageElement = new Image();
	protected _posArrayBufferObject: WebGLBuffer | null = null;
	protected _colArrayBufferObject: WebGLBuffer | null = null;
	protected _texCoordArrayBufferObject: WebGLBuffer | null = null;
	protected _shader: XYZShader | null = null;
	protected _dimensions: number = 3;

	private _hasParent: boolean = false;
	private _parent: XYZMesh | null = null;
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

	public set parent(mesh: XYZMesh | null) {
		mesh != null ? this._hasParent = true :	this._hasParent = false;
		this._parent = mesh;
	}

	public get modelMatrix(): XYZMatrix { return this._modelMatrix; }

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
		if (this._hasParent) {
			this._parent?.update()
			this._modelMatrix = <XYZMatrix>this._modelMatrix.multiplyBy((<XYZMesh>this._parent).modelMatrix);
		}
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

		if (shader.colorAttributeLocation > -1) {
			XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, this._colArrayBufferObject);
			XYZRenderer.gl.vertexAttribPointer(
				shader.colorAttributeLocation, // ID
				3, // number of components per vertex attribute
				XYZRenderer.gl.FLOAT, // type,
				false, // normalized
				0, // stride
				0 // offset
			);
		}

		if (shader.texCoordAttributeLocation > -1) {
			XYZRenderer.gl.bindBuffer(XYZRenderer.gl.ARRAY_BUFFER, this._texCoordArrayBufferObject);
			XYZRenderer.gl.vertexAttribPointer(
				shader.texCoordAttributeLocation, // ID
				2, // number of components per vertex attribute
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
		let gl = XYZRenderer.gl;
		if (shader.dimensions != this._dimensions) throw "Shader incompatible with object"
		this._shader = shader;
		shader.enableAttributes()

		this._posArrayBufferObject = gl.createBuffer(); // get buffer ID
		gl.bindBuffer(gl.ARRAY_BUFFER, this._posArrayBufferObject); // select buffer
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertPosArray), gl.STATIC_DRAW); // load data

		if (this._vertColorArray.length > 0) {
			this._colArrayBufferObject = gl.createBuffer(); // get buffer ID
			gl.bindBuffer(gl.ARRAY_BUFFER, this._colArrayBufferObject); // select buffer
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertColorArray), gl.STATIC_DRAW); // load data
		}
		if (this._texCoordArray.length > 0) {
			this._texCoordArrayBufferObject = XYZRenderer.gl.createBuffer(); // get buffer ID
			gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordArrayBufferObject); // select buffer
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._texCoordArray), gl.STATIC_DRAW); // load data
			
			let texture = XYZRenderer.gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texImage2D(
				gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
				gl.UNSIGNED_BYTE,
				this._texImg
			)
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, null)

		shader.addMesh(this);
	}
}