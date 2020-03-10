import { XYZShaderReader } from "./XYZShaderReader.js";
import { XYZRenderer } from "./XYZRenderer.js";
import { XYZMatrix } from "../../lib/Math/XYZMatrix.js";

class XYZShader {
	protected _program: WebGLProgram = -1;

	public static createShaderProgram = (vertexShaderText: string, fragmentShaderText: string): WebGLProgram => {
		let vertexShader = <WebGLShader>XYZRenderer.gl.createShader(XYZRenderer.gl.VERTEX_SHADER);
		let fragmentShader = <WebGLShader>XYZRenderer.gl.createShader(XYZRenderer.gl.FRAGMENT_SHADER);

		XYZRenderer.gl.shaderSource(vertexShader, vertexShaderText);
		XYZRenderer.gl.shaderSource(fragmentShader, fragmentShaderText);
		XYZRenderer.gl.compileShader(vertexShader)
		if (!XYZRenderer.gl.getShaderParameter(vertexShader, XYZRenderer.gl.COMPILE_STATUS)) {
			console.error('ERROR compiling vertex shader', XYZRenderer.gl.getShaderInfoLog(vertexShader));
			throw "error";
		}
		XYZRenderer.gl.compileShader(fragmentShader)
		if (!XYZRenderer.gl.getShaderParameter(fragmentShader, XYZRenderer.gl.COMPILE_STATUS)) {
			console.error('ERROR compiling fragment shader', XYZRenderer.gl.getShaderInfoLog(fragmentShader));
			throw "error";
		}

		let shaderProgram = XYZRenderer.gl.createProgram();
		if (!shaderProgram) {
			throw "error";
		}
		XYZRenderer.gl.attachShader(shaderProgram, vertexShader);
		XYZRenderer.gl.attachShader(shaderProgram, fragmentShader);
		XYZRenderer.gl.linkProgram(shaderProgram);

		if (!XYZRenderer.gl.getProgramParameter(shaderProgram, XYZRenderer.gl.LINK_STATUS)) {
			console.error('ERROR linking program!', XYZRenderer.gl.getProgramInfoLog(shaderProgram));
			throw "error";
		}

		XYZRenderer.gl.validateProgram(shaderProgram);
		if (!XYZRenderer.gl.getProgramParameter(shaderProgram, XYZRenderer.gl.VALIDATE_STATUS)) {
			console.error('ERROR validating program!', XYZRenderer.gl.getProgramInfoLog(shaderProgram));
			throw "error";
		}
		return shaderProgram;
	}

}

export class XYZBasicShader extends XYZShader {
	private _positionAttributeLocation: number = -1;
	private _colorAttributeLocation: number = -1;
	private _mMVP: WebGLUniformLocation | null = -1;
	
	public initialize = async () => {
		const shaderText = await XYZShaderReader.load("src/shaders/vertex-shader.glsl", "src/shaders/fragment-shader.glsl");

		let shaderProgram = XYZShader.createShaderProgram(shaderText.vertexShaderText, shaderText.fragmentShaderText);
		XYZRenderer.gl.useProgram(shaderProgram); // Set program in use before getting locations

		this._positionAttributeLocation = XYZRenderer.gl.getAttribLocation(shaderProgram, 'vertPosition'); // get position ID
		this._colorAttributeLocation = XYZRenderer.gl.getAttribLocation(shaderProgram, 'vertColor'); // get position ID
		this._mMVP = XYZRenderer.gl.getUniformLocation(shaderProgram, 'mMVP'); // get mWorld ID
	}
	
	public get positionAttributeLocation() { return this._positionAttributeLocation; }
	public get colorAttributeLocation() { return this._colorAttributeLocation; }
	public set mMVP(matrix: XYZMatrix) { XYZRenderer.gl.uniformMatrix4fv(this._mMVP, /*transpose =*/ false, matrix.makeFloat32Array()); }
	

	public enableAttributes = () => {
		XYZRenderer.gl.enableVertexAttribArray(this._positionAttributeLocation);
		XYZRenderer.gl.enableVertexAttribArray(this._colorAttributeLocation);
	}
}