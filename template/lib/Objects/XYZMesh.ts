import { Vec3, RotationVec4, AngularVelocityVec4 } from "../DataTypes/XYZVertex.js";
import { XYZRenderer } from "../../src/base/XYZRenderer.js";
import { XYZShader } from "../base/XYZShader.js";
import { XYZMatLab } from "../Math/XYZMatLab.js";
import { XYZMatrix } from "../Math/XYZMatrix.js";
import { XYZVector } from "../Math/XYZVector.js";

export class XYZMesh {
	protected _vertPosArray: number[] = [];
	protected _vertColorArray: number[] = [];
	protected _texCoordArray: number[] = [];
	private _numOfVertices: number = 0;
	protected _texImg: HTMLImageElement = new Image();
	protected _posArrayBufferObject: WebGLBuffer | null = null;
	protected _colArrayBufferObject: WebGLBuffer | null = null;
	protected _texCoordArrayBufferObject: WebGLBuffer | null = null;
	protected _shader: XYZShader | null = null;
	protected _dimensions: number = 3;

	private _isUpdated: boolean = false;
	private _parent: XYZMesh | null = null;
	private _modelMatrix: XYZMatrix;
	protected _position: Vec3;
	protected _rotation: XYZMatrix;
	protected _scale: Vec3;
	protected _linearVel: Vec3;
	private _angularVel: AngularVelocityVec4;
	private _rotationAngle: number = 0;

	constructor() {
		this._position = {x: 0, y: 0, z:0};
		this._rotation = (new XYZMatrix(4, 4)).identity();
		this._scale = {x: 1, y: 1, z:1 };
		this._linearVel = {x: 0, y: 0, z:0};
		this._angularVel = {x: 0, y: 0, z:1, speed: 0};
		this._modelMatrix = (new XYZMatrix(4,4)).identity()
	}

	public get vertexPositions(): Array<number> { return this._vertPosArray; }
	public get vertexColors(): Array<number> { return this._vertColorArray; }
	public get numOfVertices(): number { return this._numOfVertices; }
	public get position(): Vec3 { return this._position; }
	public get scale(): Vec3 { return this._scale; }

	public set parent(mesh: XYZMesh | null) {
		this._parent = mesh;
	}

	public reset() { this._isUpdated = false; }

	public get modelMatrix(): XYZMatrix { return this._modelMatrix; }

	/* TODO: it should not be possible to access the position directly but
		only through forces. Only the initial position should be accessible upon
		initialization. Same goes for the orientation
	*/
	public setPosition = (position: Vec3) => { this._position = position; }
	public setOrientation = (orientation: RotationVec4 | number) => {
		if (this._dimensions == 2 && typeof (orientation) == 'number') {
			// only rotations about the z-axis are allowed
			this._rotation = XYZMatLab.makeRotationMatrix(
				<number>orientation,
				0,
				0,
				1);
		}
		else if (this._dimensions == 3 && typeof (orientation) == 'object') {
			this._rotation = XYZMatLab.makeRotationMatrix(
				orientation.angle,
				orientation.x,
				orientation.y,
				orientation.z);
		}
		else {
			throw "Check orientation parameter!"
		}
	}

	public setAngularVel = (angularVelocity: AngularVelocityVec4 | number) => {
		if (this._dimensions == 2 && typeof(angularVelocity) == 'number' ) {
			// only rotations about the z-axis are allowed
			this._angularVel = {x: 0, y: 0, z: 1, speed:<number>angularVelocity };
		}
		else if (this._dimensions == 3 && typeof(angularVelocity) == 'object' ) {
			angularVelocity = <AngularVelocityVec4>angularVelocity;
			let direction = (new XYZVector([angularVelocity.x, angularVelocity.y, angularVelocity.z])).getDirection();
			let speed = angularVelocity.speed;
			this._angularVel = {
				x: direction.x,
				y: direction.y,
				z: direction.z,
				speed: speed
			};
		}
		else {
			throw "Check orientation parameter!"
		}
	}

	public setScale = (scale: Vec3) => { this._scale = scale; }

	public update = (deltaTime: number) => {
		if (this._isUpdated) return;
		this._isUpdated = true;

		let finalPosition: Vec3 = {
			x: this._position.x,
			y: this._position.y,
			z: this._position.z
		}
		let finalScale: Vec3 = {
			x: this._scale.x,
			y: this._scale.y,
			z: this._scale.z
		}

		if (this._parent != null) {
			finalPosition.x -= this._parent.position.x;
			finalPosition.y -= this._parent.position.y;
			finalPosition.z -= this._parent.position.z;
			finalScale.x /= this._parent.scale.x;
			finalScale.y /= this._parent.scale.y;
			finalScale.z /= this._parent.scale.z;
		}

		if (this._angularVel.speed != 0) {
			this._rotationAngle = this._angularVel.speed * deltaTime
			let addedRotation = XYZMatLab.makeRotationMatrix(
				this._rotationAngle,
				this._angularVel.x,
				this._angularVel.y,
				this._angularVel.z);
			this._rotation = <XYZMatrix>this._rotation.multiplyBy(addedRotation);
		}

		this._modelMatrix = XYZMatLab.makeModelMatrix(
			finalPosition,
			this._rotation,
			finalScale
		);

		if (this._parent != null) {
			this._parent.update(deltaTime);
			this._modelMatrix = <XYZMatrix>(<XYZMesh>this._parent).modelMatrix.multiplyBy(this._modelMatrix);
		}
	}

	public draw = () => {
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

		if (this._vertPosArray.length < 3) throw "Vertices not defined"
		this._numOfVertices = this._vertPosArray.length / this._dimensions
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

		// Release memory (the GPU is now storing the arrays)
		this._vertPosArray = [];
		this._vertColorArray = [];
		this._texCoordArray = [];
	}
}