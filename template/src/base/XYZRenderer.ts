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
	private static _shadowShader: XYZShader;
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
			XYZRenderer._mProj = XYZMatLab.makePerspectiveMatrix(XYZRenderer.aspectRatio, 55, 0.1, 1000);
		}
		updateAspectRatio();
		window.addEventListener('resize', updateAspectRatio);
		XYZRenderer._gl = gl;
	}

	public static get aspectRatio() { return this._canvas.width / this._canvas.height; }

	public static setMat4View(matrix: XYZMatrix) { this._mView = matrix.makeCopy(); }
	public static setMat4Proj(matrix: XYZMatrix) { this._mProj = matrix.makeCopy(); }

	public static getMat4World(): XYZMatrix { return this._mProj.multiplyByMatrix(this._mView); }
	public static getMat4View(): XYZMatrix { return this._mView; }
	public static addShader(shader: XYZShader) { this._shaderList.push(shader); }
	public static setShadowShader(shader: XYZShader) { this._shadowShader = shader; }
	public static getShadowShaderTexObject() { return this._shadowShader.getTexObject(); }


	public static createTextureObject = (texture: HTMLImageElement): WebGLTexture => {
		let gl = XYZRenderer._gl;
		let texObject = gl.createTexture();
		if (texObject == null) throw "Texture object not created";
		gl.activeTexture(gl.TEXTURE1);
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
		gl.bindTexture(gl.TEXTURE_2D, null);
		return texObject;
	}

	public static createShadowTextureObject = (texSize: number): {
		texObject: WebGLTexture,
		frameBuffer: WebGLFramebuffer
	} => {
		let gl = XYZRenderer._gl;
		let texObject = gl.createTexture();
		if (texObject == null) throw "Texture object not created";
		gl.bindTexture(gl.TEXTURE_2D, texObject);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texImage2D(
			gl.TEXTURE_2D, 	0, gl.RGBA, texSize, texSize,
							0, gl.RGBA, gl.UNSIGNED_BYTE, null
		);
		let frameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texObject, 0);
		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) throw "Error when creating framebuffer"
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return { texObject, frameBuffer };
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
	public static shadowAll = () => {
		let gl = XYZRenderer._gl;
		let shader = XYZRenderer._shadowShader;
		gl.useProgram(shader.getShaderProgram()); // Set program in use before getting locations
		gl.bindFramebuffer(gl.FRAMEBUFFER, shader.getFrameBuffer());
		gl.clearColor(.5, .1, .1, 1);   // clear to blue
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, 1024, 1024);
		// gl.activeTexture(gl.TEXTURE0 + 1);
		// gl.bindTexture(gl.TEXTURE_2D, shader.getTexObject());
		shader.drawAll();
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	public static drawAll = () => {
		let gl = XYZRenderer._gl;
		// gl.clearColor(0.3, 0.3, 0, 1);   // clear to blue
		// gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		XYZRenderer._shaderList.forEach(
			shader => {
				gl.useProgram(shader.getShaderProgram()); // Set program in use before getting locations
				gl.viewport(0, 0, window.innerWidth, window.innerHeight);
				shader.drawAll();
			}
		)
	}
}