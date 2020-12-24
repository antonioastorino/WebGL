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

	public static getGl = (): WebGLRenderingContext => { return XYZRenderer._gl; }

	public static addNode(node: XYZNode) { this._nodeList.push(node); }
	public static getActiveCameraNumber(): number { return this._activeCameraNumber; }
	public static addCamera(camera: XYZCamera) {
		XYZRenderer._cameraList.push(camera);
		XYZRenderer._activeCameraNumber = this._cameraList.length - 1;
	}

	public static init = () => {
		XYZRenderer._canvas = <HTMLCanvasElement>document.getElementById("glCanvas");
		let gl = <WebGLRenderingContext>XYZRenderer._canvas.getContext('webgl');
		gl.clearColor(0, 0, 0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		gl.enable(gl.CULL_FACE);
		gl.frontFace(gl.CCW);
		gl.cullFace(gl.BACK);

		let updateAspectRatio = () => {
			XYZRenderer._canvas.width = window.innerWidth;
			XYZRenderer._canvas.height = window.innerHeight;
			gl.viewport(0, 0, window.innerWidth, window.innerHeight);
			XYZRenderer._mProj = XYZMatLab.makePerspectiveMatrix(XYZRenderer.getAspectRatio(), 55, 0.1, 1000);
		}
		updateAspectRatio();
		window.addEventListener('resize', updateAspectRatio);
		XYZRenderer._gl = gl;
	}

	public static getAspectRatio() { return this._canvas.width / this._canvas.height; }

	public static setMat4View(matrix: XYZMatrix) { this._mView = matrix.makeCopy(); }
	public static setMat4Proj(matrix: XYZMatrix) { this._mProj = matrix.makeCopy(); }

	public static getMat4World(): XYZMatrix { return this._mProj.multiplyByMatrix(this._mView); }
	public static getMat4View(): XYZMatrix { return this._mView; }
	public static addShader(shader: XYZShader) { this._shaderList.push(shader); }

	public static createTextureObject(texture: HTMLImageElement) {
		let gl = XYZRenderer._gl;
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

	// update the position of every node
	public static updateAll(deltaTime: number) {
		this._nodeList.forEach((node: XYZNode) => {
			node.update(deltaTime);
		})
		let position = this._cameraList[this.getActiveCameraNumber()].getVec3Pos();
		let rotation = this._cameraList[this.getActiveCameraNumber()].getMat4Rot();
		this._mView = XYZMatLab.makeLookAtMatrix(rotation, position);
	}

	// reset the update state of every node
	public static resetAll() {
		this._nodeList.forEach((node: XYZNode) => {
			node.reset();
		})
	}

	// draw all meshes, grouped by shader
	public static drawAll = () => {
		XYZRenderer._gl.clear(XYZRenderer._gl.COLOR_BUFFER_BIT | XYZRenderer._gl.DEPTH_BUFFER_BIT);
		XYZRenderer._shaderList.forEach(
			shader => {
				shader.drawAll();
			}
		)
	}
}