import { XYZMatrix } from "../lib/math/XYZMatrix.js";
import { XYZMatLab } from "../lib/math/XYZMatLab.js";
import { XYZShader } from "./XYZShader.js"
import { XYZCamera } from "../objects/XYZCamera.js";
import { XYZNode } from "../objects/XYZNode.js";

export class XYZRenderer {
	private static _gl: WebGLRenderingContext;
	public static _canvas: HTMLCanvasElement;
	private static _mView: XYZMatrix = (new XYZMatrix(4, 4)).identity();
	private static _mProj: XYZMatrix = (new XYZMatrix(4, 4)).identity();
	private static _nodeList: XYZNode[] = [];
	private static _shaderList: XYZShader[] = [];
	private static _cameraList: XYZCamera[] = [];
	private static _activeCameraNumber: number = -1;

	public static addNode(node: XYZNode) { this._nodeList.push(node); }
	public static get activeCameraNumber(): number { return this._activeCameraNumber; }
	public static addCamera(camera: XYZCamera) {
		XYZRenderer._cameraList.push(camera);
		XYZRenderer._activeCameraNumber = this._cameraList.length - 1;
	}

	public static init = () => {
		XYZRenderer._canvas = <HTMLCanvasElement>document.getElementById("glCanvas");
		XYZRenderer._gl = <WebGLRenderingContext>XYZRenderer._canvas.getContext('webgl');
		XYZRenderer._gl.clearColor(0, 0, 0, 1.0);
		XYZRenderer._gl.clear(XYZRenderer._gl.COLOR_BUFFER_BIT | XYZRenderer._gl.DEPTH_BUFFER_BIT);
		XYZRenderer._gl.enable(XYZRenderer._gl.DEPTH_TEST);
		// XYZRenderer._gl.enable(this._gl.CULL_FACE);
		// XYZRenderer._gl.frontFace(this._gl.CCW);
		// XYZRenderer._gl.cullFace(this._gl.BACK);

		let updateAspectRatio = () => {
			XYZRenderer._canvas.width = window.innerWidth;
			XYZRenderer._canvas.height = window.innerHeight;
			XYZRenderer.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
			XYZRenderer._mProj = XYZMatLab.makePerspectiveMatrix(XYZRenderer.aspectRatio, 55, 0.1, 1000);
		}
		updateAspectRatio();
		window.addEventListener('resize', updateAspectRatio);
	}

	public static get aspectRatio() { return this._canvas.width / this._canvas.height; }

	public static set mView(matrix: XYZMatrix) { this._mView = matrix.makeCopy(); }
	public static set mProj(matrix: XYZMatrix) { this._mProj = matrix.makeCopy(); }

	public static get worldMatrix(): XYZMatrix { return this._mProj.multiplyByMatrix(this._mView); }
	public static get mView(): XYZMatrix { return this._mView; }
	public static addShader(shader: XYZShader) { this._shaderList.push(shader); }

	public static createTextureObject(texture: HTMLImageElement) {
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

	public static updateAll(deltaTime: number) {
		this._nodeList.forEach((node: XYZNode) => {
			node.update(deltaTime);
		})
		let position = this._cameraList[this.activeCameraNumber].getPositionVec3();
		let rotation = this._cameraList[this.activeCameraNumber].getRotationMat4();
		this._mView = XYZMatLab.makeLookAtMatrix(rotation, position);
	}

	public static resetAll() {
		this._nodeList.forEach((node: XYZNode) => {
			node.reset();
		})
	}

	public static drawAll() {
		this.gl.clear(XYZRenderer.gl.COLOR_BUFFER_BIT | XYZRenderer.gl.DEPTH_BUFFER_BIT);
		this._shaderList.forEach(
			shader => {
				shader.drawAll();
			}
		)
	}

	public static get gl() { return this._gl; }
}