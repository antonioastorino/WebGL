import { XYZRenderer } from "../../src/base/XYZRenderer.js";
import { XYZShader } from "../base/XYZShader.js";
import { XYZMatLab } from "../Math/XYZMatLab.js";
import { XYZMatrix } from "../Math/XYZMatrix.js";
import { XYZMaterial } from "./XYZMaterial.js";
import { XYZNode } from "./XYZNode.js"

export class XYZMesh extends XYZNode {
	// Geometry
	private _numOfVertices: number = 0;
	protected _vertPosArray: number[] = [];
	protected _vertNormalArray: number[] = [];
	protected _texCoordArray: number[] = [];
	private _posArrayBufferObject: WebGLBuffer | null = null;

	// Appearance
	private _normArrayBufferObject: WebGLBuffer | null = null;
	private _texCoordArrayBufferObject: WebGLBuffer | null = null;
	protected _materials: XYZMaterial[] = [];
	private _shader: XYZShader | null = null;

	public draw = () => {
		let shader = <XYZShader>this._shader;
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

		if (shader.normAttributeLocation > -1) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this._normArrayBufferObject);
			gl.vertexAttribPointer(
				shader.normAttributeLocation, // ID
				3, // number of components per vertex attribute
				gl.FLOAT, // type,
				false, // normalized
				0, // stride
				0 // offset
			);
		}

		if (shader.texCoordAttributeLocation > -1) {
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
				mMVP = <XYZMatrix>XYZRenderer.worldMatrix.multiplyBy(this.modelMatrix);
			}
			else {
				let mScale = XYZMatLab.makeScaleMatrix(1 / XYZRenderer.aspectRatio, 1, 1);
				mMVP = <XYZMatrix>mScale.multiplyBy(this.modelMatrix);
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
				gl.bindTexture(gl.TEXTURE_2D, material.texObject);
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

		if (this._texCoordArray.length > 0 && shader.enableTexture) {
			this._texCoordArrayBufferObject = XYZRenderer.gl.createBuffer(); // get buffer ID
			gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordArrayBufferObject); // select buffer
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._texCoordArray), gl.STATIC_DRAW); // load data
			this._texCoordArray = []; // release as not needed anymore
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, null)
		gl.bindTexture(gl.TEXTURE_2D, null);
		shader.addMesh(this);

	}
}