import { XYZMatrix } from "../../lib/Math/XYZMatrix.js";
import { XYZMatLab } from "../../lib/Math/XYZMatLab.js";
import { XYZShader } from "./XYZShader.js"
import { XYZTime } from "./XYZTime.js";

export class XYZRenderer {
	private static _gl: WebGLRenderingContext;
	public static _canvas: HTMLCanvasElement;
	private static _mView: XYZMatrix = (new XYZMatrix(4,4)).identity();
	private static _mProj: XYZMatrix = (new XYZMatrix(4,4)).identity();
	private static _shaderList: Array<XYZShader> = [];
	
	public static init() {
		this._canvas = <HTMLCanvasElement>document.getElementById("glCanvas");
		this._gl = <WebGLRenderingContext>this._canvas.getContext('webgl');
		this._gl.clearColor(0.75, 0.85, 0.8, 1.0);
		this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
		this._gl.enable(this._gl.DEPTH_TEST);
		// this._gl.enable(this._gl.CULL_FACE);
		// this._gl.frontFace(this._gl.CCW);
		// this._gl.cullFace(this._gl.BACK);

		let updateAspectRatio = () => {
			this._canvas.width = window.innerWidth;
			this._canvas.height = window.innerHeight;
			this.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
			this.projMatrix = XYZMatLab.makePerspectiveMatrix(XYZRenderer.aspectRatio, 55, 0.1, 1000);
		}
		updateAspectRatio()
		window.addEventListener('resize', updateAspectRatio);
	}

	public static get aspectRatio() { return this._canvas.width/this._canvas.height; }

	public static set viewMatrix(matrix: XYZMatrix)  { this._mView = matrix; }
	public static set projMatrix(matrix: XYZMatrix) { this._mProj = matrix; }

	public static get worldMatrix(): XYZMatrix { return <XYZMatrix>this._mProj.multiplyBy(this._mView); }

	public static addShader(shader: XYZShader) { this._shaderList.push(shader); }

	public static drawAll() {
		let deltaTime = XYZTime.deltaTime;
		this._shaderList.forEach(
			shader => { shader.drawAll(deltaTime); }
		)
	}

	public static get gl() { return this._gl; }
}