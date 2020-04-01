import { Vec3, RotationVec4, AngularVelocityVec4 } from "../DataTypes/XYZVertex.js";
import { XYZRenderer } from "../../src/base/XYZRenderer.js";
import { XYZShader } from "../base/XYZShader.js";
import { XYZMatLab } from "../Math/XYZMatLab.js";
import { XYZMatrix } from "../Math/XYZMatrix.js";
import { XYZVector } from "../Math/XYZVector.js";
import { XYZMaterial } from "./XYZMaterial.js";

export class XYZMesh {
	// Geometry
	private _numOfVertices: number = 0;
	protected _vertPosArray: number[] = [];
	protected _vertNormalArray: number[] = [];
	protected _texCoordArray: number[] = [];
	protected _posArrayBufferObject: WebGLBuffer | null = null;
	protected _dimensions: number = 3;
	private _modelMatrix: XYZMatrix;
	protected _position: Vec3;
	protected _rotation: XYZMatrix;
	protected _scale: Vec3;

	// Appearance
	protected _texImg: HTMLImageElement = new Image();
	protected _normArrayBufferObject: WebGLBuffer | null = null;
	protected _texCoordArrayBufferObject: WebGLBuffer | null = null;
	private _textureObject: WebGLTexture | null = null;
	protected _texFileName: string = "";
	protected _materials: XYZMaterial[] = [];
	protected _shader: XYZShader | null = null;

	// Physics
	private _isUpdated: boolean = false;
	private _parent: XYZMesh | null = null;
	protected _linearVel: Vec3;
	private _angularVel: AngularVelocityVec4;
	private _rotationAngle: number = 0;

	constructor() {
		this._position = { x: 0, y: 0, z: 0 };
		this._rotation = (new XYZMatrix(4, 4)).identity();
		this._scale = { x: 1, y: 1, z: 1 };
		this._linearVel = { x: 0, y: 0, z: 0 };
		this._angularVel = { x: 0, y: 0, z: 1, speed: 0 };
		this._modelMatrix = (new XYZMatrix(4, 4)).identity()
	}

	public get vertexPositions(): Array<number> { return this._vertPosArray; }
	public get vertexColors(): Array<number> { return this._vertNormalArray; }
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
		if (this._dimensions == 2 && typeof (angularVelocity) == 'number') {
			// only rotations about the z-axis are allowed
			this._angularVel = { x: 0, y: 0, z: 1, speed: <number>angularVelocity };
		}
		else if (this._dimensions == 3 && typeof (angularVelocity) == 'object') {
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

	public loadTexture = (): Promise<HTMLImageElement> => {
		return new Promise(resolve => {
			this._texImg.addEventListener('load', () => {
				resolve(this._texImg);
			});
			this._texImg.src = './assets/textures/' + this._texFileName;
		});
	}

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
		shader.enableAttributes();
		let gl = XYZRenderer.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, this._posArrayBufferObject);

		gl.vertexAttribPointer(
			shader.positionAttributeLocation, // ID
			this._dimensions, // number of components per vertex attribute
			gl.FLOAT, // type,
			false, // normalized
			0, // stride
			0 // offset
		);

		if (shader.colorAttributeLocation > -1) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this._normArrayBufferObject);
			gl.vertexAttribPointer(
				shader.colorAttributeLocation, // ID
				3, // number of components per vertex attribute
				gl.FLOAT, // type,
				false, // normalized
				0, // stride
				0 // offset
			);
		}

		if (shader.texCoordAttributeLocation > -1) {
			gl.bindTexture(gl.TEXTURE_2D, this._textureObject);
			gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordArrayBufferObject);
			gl.vertexAttribPointer(
				shader.texCoordAttributeLocation, // ID
				2, // number of components per vertex attribute
				gl.FLOAT, // type,
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
				let mScale = XYZMatLab.makeScaleMatrix(1 / XYZRenderer.aspectRatio, 1, 1);
				mMVP = <XYZMatrix>mScale.multiplyBy(this._modelMatrix);
			}
			gl.uniformMatrix4fv(
				shader.mMVPUniformLocation,
				false, // transpose 
				mMVP.makeFloat32Array());
		}

		if (shader.mViewUniformLocation != null) {
			gl.uniformMatrix4fv(
				shader.mViewUniformLocation,
				false, // transpose 
				XYZRenderer.mView.makeFloat32Array());
		}

		if (shader.mModelUniformLocation != null) {
			gl.uniformMatrix4fv(
				shader.mModelUniformLocation,
				false, // transpose 
				XYZMatLab.makeModelMatrix(
					this._position,
					this._rotation,
					this._scale
				).makeFloat32Array());
		}

		if (this._materials.length > 0)
			this._materials.forEach((material: XYZMaterial) => {
				if (shader.sNsUniformLocation != null) {
					gl.uniform1f(
						shader.sNsUniformLocation,
						material.Ns
					)
				}
				if (shader.vKaUniformLocation != null) {
					gl.uniform3f(
						shader.vKaUniformLocation,
						material.Ka.r,
						material.Ka.g,
						material.Ka.b
					)
				}
				if (shader.vKdUniformLocation != null) {
					gl.uniform3f(
						shader.vKdUniformLocation,
						material.Kd.r,
						material.Kd.g,
						material.Kd.b
					)
				}

				if (shader.vKsUniformLocation != null) {
					gl.uniform3f(
						shader.vKsUniformLocation,
						material.Ks.r,
						material.Ks.g,
						material.Ks.b
					)
				}
				gl.drawArrays(gl.TRIANGLES, material.startIndex, material.vertexCount);
			})
		else {
			gl.drawArrays(gl.TRIANGLES, 0, this._numOfVertices);
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
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
		this._vertPosArray = []; // release as not needed anymore

		if (this._vertNormalArray.length > 0) {
			this._normArrayBufferObject = gl.createBuffer(); // get buffer ID
			gl.bindBuffer(gl.ARRAY_BUFFER, this._normArrayBufferObject); // select buffer
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertNormalArray), gl.STATIC_DRAW); // load data
			this._vertNormalArray = []; // release as not needed anymore
		}

		if (this._texCoordArray.length > 0 && shader.hasTexture) {
			this._texCoordArrayBufferObject = XYZRenderer.gl.createBuffer(); // get buffer ID
			gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordArrayBufferObject); // select buffer
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._texCoordArray), gl.STATIC_DRAW); // load data

			this._textureObject = XYZRenderer.gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, this._textureObject);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texImage2D(
				gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
				gl.UNSIGNED_BYTE,
				this._texImg
			)
			this._texCoordArray = []; // release as not needed anymore
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, null)
		gl.bindTexture(gl.TEXTURE_2D, null);
		shader.addMesh(this);

	}
}