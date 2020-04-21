import { XYZRenderer } from "../base/XYZRenderer.js";
import { XYZShader } from "../base/XYZShader.js";
import { XYZMatLab } from "../lib/math/XYZMatLab.js";
import { XYZMatrix } from "../lib/math/XYZMatrix.js";
import { XYZMaterial } from "./XYZMaterial.js";
import { XYZNode } from "./XYZNode.js"
import { RGB } from "../lib/data-types/XYZVertex.js";

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
	private _castShadow: boolean = true;

	protected constructor() {
		super()
	}

	public doesCastShadow = (): boolean => { return this._castShadow; }

	public draw = (shader: XYZShader) => {
		let gl = XYZRenderer.getGl()
		gl.bindBuffer(gl.ARRAY_BUFFER, this._posArrayBufferObject);

		gl.vertexAttribPointer(
			shader.getAttribLoc('vertPosition'), // ID
			this._dimensions, // number of components per vertex attribute
			gl.FLOAT, // type,
			false, // normalized
			0, // stride
			0 // offset
		);

		if (shader.getAttribLoc('vertNormal') > -1) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this._normArrayBufferObject);
			gl.vertexAttribPointer(
				shader.getAttribLoc('vertNormal'), // ID
				3, // number of components per vertex attribute
				gl.FLOAT, // type,
				false, // normalized
				0, // stride
				0 // offset
			);
		}

		if (shader.getAttribLoc('vertTexCoord') > -1) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordArrayBufferObject);
			gl.vertexAttribPointer(
				shader.getAttribLoc('vertTexCoord'), // ID
				2, // number of components per vertex attribute
				gl.FLOAT, // type,
				false, // normalized
				0, // stride
				0 // offset
			);
		}

		if (shader.getUnifLoc('mMVP') != null) {
			let mMVP: XYZMatrix
			if (this._dimensions == 3) {
				mMVP = <XYZMatrix>XYZRenderer.getMat4World().multiplyByMatrix(this.getMat4Model());
			}
			else {
				let mScale = XYZMatLab.makeScaleMatrix(1 / XYZRenderer.getAspectRatio(), 1, 1);
				mMVP = <XYZMatrix>mScale.multiplyByMatrix(this.getMat4Model());
			}
			gl.uniformMatrix4fv(
				shader.getUnifLoc('mMVP'),
				false, // transpose 
				mMVP.makeFloat32Array());
		}

		if (shader.getUnifLoc('mView') != null) {
			gl.uniformMatrix4fv(
				shader.getUnifLoc('mView'),
				false, // transpose 
				XYZRenderer.getMat4View().makeFloat32Array());
		}

		if (shader.getUnifLoc('mModel') != null) {
			gl.uniformMatrix4fv(
				shader.getUnifLoc('mModel'),
				false, // transpose 
				XYZMatLab.makeModelMatrix(
					this._v3Pos,
					this._m4Rot,
					this._v3Scale
				).makeFloat32Array());
		}

		if (this._materials.length > 0)
			this._materials.forEach((material: XYZMaterial) => {
				let scalarUniforms = ['Ns'];
				for (let index in scalarUniforms) {
					let unif = scalarUniforms[index];
					if (shader.getUnifLoc(unif) != null) {
						gl.uniform1f(
							shader.getUnifLoc(unif),
							<number>material.getParam(unif)
						)
					}
				}
				let rgbUniforms = ['Ka', 'Kd', 'Ks'];
				for (let index in rgbUniforms) {
					let unif = rgbUniforms[index];
					if (shader.getUnifLoc(unif) != null) {
						gl.uniform3f(
							shader.getUnifLoc(unif),
							(<RGB>material.getParam(unif)).r,
							(<RGB>material.getParam(unif)).g,
							(<RGB>material.getParam(unif)).b
						)
					}
				}

				if (shader.getUnifLoc('texSampler') != null) {
					gl.bindTexture(gl.TEXTURE_2D, material.getTexObject());
				}
				gl.drawArrays(gl.TRIANGLES, material.startIndex, material.getVertexCount());
			})
		else {
			gl.drawArrays(gl.TRIANGLES, 0, this._numOfVertices);
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		if (shader.getType() != 'test') gl.bindTexture(gl.TEXTURE_2D, null); // we are binding the texture for shadowing
	}

	public attachShaders = (shaders: XYZShader[]) => {
		for (var i in shaders) {
			let shader = shaders[i];

			let gl = XYZRenderer.getGl();
			if (shader.getDimensions() != this._dimensions) throw "Shader incompatible with object"
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
			}
			
			gl.bindBuffer(gl.ARRAY_BUFFER, null)
			gl.bindTexture(gl.TEXTURE_2D, null);
			shader.addMesh(this);
		}
		this._vertPosArray = []; // release as not needed anymore
		this._vertNormalArray = []; // release as not needed anymore
		this._texCoordArray = []; // release as not needed anymore
	}
}