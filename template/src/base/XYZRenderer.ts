import { XYZMatrix } from "../lib/math/XYZMatrix.js";
import { XYZMatLab } from "../lib/math/XYZMatLab.js";
import { XYZShader } from "./XYZShader.js"
import { XYZCamera } from "../objects/XYZCamera.js";
import { XYZNode } from "../objects/XYZNode.js";
import { XYZVec3 } from "../lib/data-types/XYZVec3.js";

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
	public static getActiveCamera = (): XYZCamera => {
		return XYZRenderer._cameraList[XYZRenderer._activeCameraNumber];
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
		const texObject = gl.createTexture();
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
		const frameBuffer = gl.createFramebuffer();
		if (frameBuffer == null) throw "Frame buffer not created"
		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) throw "Error when creating framebuffer"
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texObject, 0);
		
		// enable depth text when writing to texture
		const depthBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, texSize, texSize);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
		
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return { texObject, frameBuffer };
	}

	// update the position of every node
	public static updateAll(deltaTime: number) {
		this._nodeList.forEach((node: XYZNode) => {
			node.update(deltaTime);
		})
	}
	
	public static goCameraView = () => {
		let activeCamera = XYZRenderer.getActiveCamera();
		XYZRenderer._mView = XYZMatLab.makeLookAtMatrix(
			activeCamera.getMat4Rot(),
			activeCamera.getVec3Pos()
			);
	}

	public static goCustomView = (position: XYZVec3, rotation: XYZMatrix) => {
		XYZRenderer._mView = XYZMatLab.makeLookAtMatrix(
			rotation,
			position
			);
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
		let position = XYZRenderer.getActiveCamera().getVec3Pos();
		let rotation = XYZRenderer.getActiveCamera().getMat4Rot();
		position.x += 10;
		XYZRenderer.goCustomView(position, rotation);
		shader.drawAll();
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	public static drawAll = () => {
		let gl = XYZRenderer._gl;
		XYZRenderer.goCameraView();
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