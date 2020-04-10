import { XYZMatrix } from "../lib/math/XYZMatrix.js";
import { XYZMatLab } from "../lib/math/XYZMatLab.js";
import { XYZQuaternion } from "../lib/math/XYZQuaternion.js";
import { XYZShader } from "./XYZShader.js"
import { XYZTime } from "./XYZTime.js";
import { XYZCamera } from "../objects/XYZCamera.js";

export class XYZRenderer {
	private static _gl: WebGLRenderingContext;
	public static _canvas: HTMLCanvasElement;
	private static _mView: XYZMatrix = (new XYZMatrix(4, 4)).identity();
	private static _mProj: XYZMatrix = (new XYZMatrix(4, 4)).identity();
	private static _shaderList: XYZShader[] = [];
	private static _cameraList: XYZCamera[] = [];
	private static _activeCameraNumber: number = -1;

	public static get activeCameraNumber(): number { return this._activeCameraNumber; }
	public static addCamera(camera: XYZCamera) { 
		this._cameraList.push(camera);
		this._activeCameraNumber = this._cameraList.length - 1;
	}

	public static init() {
		this._canvas = <HTMLCanvasElement>document.getElementById("glCanvas");
		this._gl = <WebGLRenderingContext>this._canvas.getContext('webgl');
		this._gl.clearColor(0, 0, 0, 1.0);
		this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
		this._gl.enable(this._gl.DEPTH_TEST);
		// this._gl.enable(this._gl.CULL_FACE);
		// this._gl.frontFace(this._gl.CCW);
		// this._gl.cullFace(this._gl.BACK);

		let updateAspectRatio = () => {
			this._canvas.width = window.innerWidth;
			this._canvas.height = window.innerHeight;
			this.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
			this.mProj = XYZMatLab.makePerspectiveMatrix(XYZRenderer.aspectRatio, 55, 0.1, 1000);
		}
		updateAspectRatio()
		window.addEventListener('resize', updateAspectRatio);
	}

	public static get aspectRatio() { return this._canvas.width / this._canvas.height; }

	public static set mView(matrix: XYZMatrix) { this._mView = matrix; }
	public static set mProj(matrix: XYZMatrix) { this._mProj = matrix; }

	public static get worldMatrix(): XYZMatrix { return <XYZMatrix>this._mProj.multiplyBy(this._mView); }
	public static get mView(): XYZMatrix { return <XYZMatrix>this._mView; }
	public static addShader(shader: XYZShader) { this._shaderList.push(shader); }

	public static createTextureObject(texture:HTMLImageElement) {
		let gl = XYZRenderer.gl;
		let texObject = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texObject);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texImage2D(
			gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
			gl.UNSIGNED_BYTE,
			texture
		);
		return texObject;
	}

	public static drawAll() {
		let deltaTime = XYZTime.deltaTime;
		this._cameraList[this.activeCameraNumber].update(deltaTime);
		this._cameraList[this.activeCameraNumber].reset();
		this._mView = XYZMatLab.makeLookAtMatrix(new XYZQuaternion(0, 0, 0, 1), this._cameraList[this.activeCameraNumber].position);
		this._shaderList.forEach(
			shader => { 
				shader.drawAll(deltaTime); 
			}
		)
	}

	public static get gl() { return this._gl; }
}