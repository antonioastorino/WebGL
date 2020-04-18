import { XYZRenderer } from "../base/XYZRenderer.js";
import { XYZShader } from "../base/XYZShader.js";
import { XYZMatLab } from "../lib/math/XYZMatLab.js";
import { XYZMatrix } from "../lib/math/XYZMatrix.js";
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
	private _castShadow: boolean = true;

	protected constructor() {
		super()
	}

	public doesCastShadow = (): boolean => { return this._castShadow; }

	public draw = () => {
		let shader = <XYZShader>this._shader;
		let gl = XYZRenderer.getGl()
		gl.bindBuffer(gl.ARRAY_BUFFER, this._posArrayBufferObject);

		gl.vertexAttribPointer(
			shader.getPosAL(), // ID
			this._dimensions, // number of components per vertex attribute
			gl.FLOAT, // type,
			false, // normalized
			0, // stride
			0 // offset
		);

		if (shader.getNormAL() > -1) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this._normArrayBufferObject);
			gl.vertexAttribPointer(
				shader.getNormAL(), // ID
				3, // number of components per vertex attribute
				gl.FLOAT, // type,
				false, // normalized
				0, // stride
				0 // offset
			);
		}

		if (shader.getTexCoorAL() > -1) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordArrayBufferObject);
			gl.vertexAttribPointer(
				shader.getTexCoorAL(), // ID
				2, // number of components per vertex attribute
				gl.FLOAT, // type,
				false, // normalized
				0, // stride
				0 // offset
			);
		}

		if (shader.getMVPUL() != null) {
			let mMVP: XYZMatrix
			if (this._dimensions == 3) {
				mMVP = <XYZMatrix>XYZRenderer.getMat4World().multiplyByMatrix(this.getMat4Model());
			}
			else {
				let mScale = XYZMatLab.makeScaleMatrix(1 / XYZRenderer.aspectRatio, 1, 1);
				mMVP = <XYZMatrix>mScale.multiplyByMatrix(this.getMat4Model());
			}
			gl.uniformMatrix4fv(
				shader.getMVPUL(),
				false, // transpose 
				mMVP.makeFloat32Array());
		}

		if (shader.getViewUL() != null) {
			gl.uniformMatrix4fv(
				shader.getViewUL(),
				false, // transpose 
				XYZRenderer.getMat4View().makeFloat32Array());
		}

		if (shader.getModelUL() != null) {
			gl.uniformMatrix4fv(
				shader.getModelUL(),
				false, // transpose 
				XYZMatLab.makeModelMatrix(
					this._v3Pos,
					this._m4Rot,
					this._v3Scale
				).makeFloat32Array());
		}

		if (this._materials.length > 0)
			this._materials.forEach((material: XYZMaterial) => {
				if (shader.getNsUL() != null) {
					gl.uniform1f(
						shader.getNsUL(),
						material.Ns
					)
				}
				if (shader.getKaUL() != null) {
					gl.uniform3f(
						shader.getKaUL(),
						material.Ka.r,
						material.Ka.g,
						material.Ka.b
					)
				}
				if (shader.getKdUL() != null) {
					gl.uniform3f(
						shader.getKdUL(),
						material.Kd.r,
						material.Kd.g,
						material.Kd.b
					)
				}

				if (shader.getKsUL() != null) {
					gl.uniform3f(
						shader.getKsUL(),
						material.Ks.r,
						material.Ks.g,
						material.Ks.b
					)
				}
				if (shader.sSamplerUL() != null) {
					gl.activeTexture(gl.TEXTURE0);
					gl.bindTexture(gl.TEXTURE_2D, material.texObject);
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
		let gl = XYZRenderer.getGl();
		if (shader.getDimensions() != this._dimensions) throw "Shader incompatible with object"
		this._shader = shader;
		gl.useProgram(shader.getShaderProgram());
		shader.enableAttributes()

		if (this._vertPosArray.length < 3) throw "Vertices not defined"
		this._numOfVertices = this._vertPosArray.length / this._dimensions
		this._posArrayBufferObject = gl.createBuffer(); // get buffer ID
		gl.bindBuffer(gl.ARRAY_BUFFER, this._posArrayBufferObject); // select buffer
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertPosArray), gl.STATIC_DRAW); // load data

		if (this._vertNormalArray.length > 0) {
			this._normArrayBufferObject = gl.createBuffer(); // get buffer ID
			gl.bindBuffer(gl.ARRAY_BUFFER, this._normArrayBufferObject); // select buffer
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._vertNormalArray), gl.STATIC_DRAW); // load data
		}

		if (this._texCoordArray.length > 0 && shader.isTextureEnabled()) {
			this._texCoordArrayBufferObject = gl.createBuffer(); // get buffer ID
			gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordArrayBufferObject); // select buffer
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._texCoordArray), gl.STATIC_DRAW); // load data
			if (shader.sSamplerUL() != null) gl.uniform1i(shader.sSamplerUL(), 0);  // texture unit 0
		}

		this._vertPosArray = []; // release as not needed anymore
		this._vertNormalArray = []; // release as not needed anymore
		this._texCoordArray = []; // release as not needed anymore

		gl.bindBuffer(gl.ARRAY_BUFFER, null)
		gl.bindTexture(gl.TEXTURE_2D, null);
		shader.addMesh(this);

	}
}