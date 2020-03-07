import { XYZShaderReader } from "./XYZShaderReader.js";
import { XYZApplication } from "./XYZApplication.js";

class XYZShader {
	protected _program: WebGLProgram = -1;

	public static createShaderProgram = (vertexShaderText: string, fragmentShaderText: string): WebGLProgram => {
		let vertexShader = <WebGLShader>XYZApplication.gl.createShader(XYZApplication.gl.VERTEX_SHADER);
		let fragmentShader = <WebGLShader>XYZApplication.gl.createShader(XYZApplication.gl.FRAGMENT_SHADER);

		XYZApplication.gl.shaderSource(vertexShader, vertexShaderText);
		XYZApplication.gl.shaderSource(fragmentShader, fragmentShaderText);
		XYZApplication.gl.compileShader(vertexShader)
		if (!XYZApplication.gl.getShaderParameter(vertexShader, XYZApplication.gl.COMPILE_STATUS)) {
			console.error('ERROR compiling vertex shader', XYZApplication.gl.getShaderInfoLog(vertexShader));
			throw "error";
		}
		XYZApplication.gl.compileShader(fragmentShader)
		if (!XYZApplication.gl.getShaderParameter(fragmentShader, XYZApplication.gl.COMPILE_STATUS)) {
			console.error('ERROR compiling fragment shader', XYZApplication.gl.getShaderInfoLog(fragmentShader));
			throw "error";
		}

		let shaderProgram = XYZApplication.gl.createProgram();
		if (!shaderProgram) {
			throw "error";
		}
		XYZApplication.gl.attachShader(shaderProgram, vertexShader);
		XYZApplication.gl.attachShader(shaderProgram, fragmentShader);
		XYZApplication.gl.linkProgram(shaderProgram);

		if (!XYZApplication.gl.getProgramParameter(shaderProgram, XYZApplication.gl.LINK_STATUS)) {
			console.error('ERROR linking program!', XYZApplication.gl.getProgramInfoLog(shaderProgram));
			throw "error";
		}

		XYZApplication.gl.validateProgram(shaderProgram);
		if (!XYZApplication.gl.getProgramParameter(shaderProgram, XYZApplication.gl.VALIDATE_STATUS)) {
			console.error('ERROR validating program!', XYZApplication.gl.getProgramInfoLog(shaderProgram));
			throw "error";
		}
		return shaderProgram;
	}

}

export class XYZBasicShader extends XYZShader {
	private _positionAttributeLocation: number = -1;
	private _colorAttributeLocation: number = -1;
	private _mWorldUniformLocation: WebGLUniformLocation | null = -1;
	private _mViewUniformLocation: WebGLUniformLocation | null = -1;
	private _mProjUniformLocation: WebGLUniformLocation | null = -1;

	public initialize = async () => {
		const shaderText = await XYZShaderReader.load("src/shaders/vertex-shader.glsl", "src/shaders/fragment-shader.glsl");

		let shaderProgram = XYZShader.createShaderProgram(shaderText.vertexShaderText, shaderText.fragmentShaderText);
		XYZApplication.gl.useProgram(shaderProgram); // Set program in use before getting locations

		this._positionAttributeLocation = XYZApplication.gl.getAttribLocation(shaderProgram, 'vertPosition'); // get position ID
		this._colorAttributeLocation = XYZApplication.gl.getAttribLocation(shaderProgram, 'vertColor'); // get position ID
		this._mWorldUniformLocation = XYZApplication.gl.getUniformLocation(shaderProgram, 'mWorld'); // get mWorld ID
		this._mViewUniformLocation = XYZApplication.gl.getUniformLocation(shaderProgram, 'mView'); // get mWorld ID
		this._mProjUniformLocation = XYZApplication.gl.getUniformLocation(shaderProgram, 'mProj'); // get mWorld ID
	}
	
	public get positionAttributeLocation() { return this._positionAttributeLocation; }
	public get colorAttributeLocation() { return this._colorAttributeLocation; }
	public get mWorldUniformLocation() { return this._mWorldUniformLocation; }
	public get mViewUniformLocation() { return this._mViewUniformLocation; }
	public get mProjUniformLocation() { return this._mProjUniformLocation; }

	public enableAttributes = () => {
		XYZApplication.gl.enableVertexAttribArray(this._positionAttributeLocation);
		XYZApplication.gl.enableVertexAttribArray(this._colorAttributeLocation);
	}

}