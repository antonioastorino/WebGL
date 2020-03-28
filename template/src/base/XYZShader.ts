import { XYZShaderReader } from "./XYZShaderReader.js";
import { XYZRenderer } from "./XYZRenderer.js";
import { XYZMatrix } from "../../lib/Math/XYZMatrix.js";
import { XYZMesh } from "../../lib/Objects/XYZMesh.js"

interface ShaderFile {
	vertexShaderFile: string,
	fragmentShaderFile: string,
	dimensions: number,
	texture: boolean
}

export var ShaderTypes: { [id: string]: ShaderFile } = {
	"basic": {
		vertexShaderFile: "src/shaders/basic-vs.glsl",
		fragmentShaderFile: "src/shaders/basic-fs.glsl",
		dimensions: 3,
		texture: false

	},
	"texture": {
		vertexShaderFile: "src/shaders/texture-vs.glsl",
		fragmentShaderFile: "src/shaders/texture-fs.glsl",
		dimensions: 3,
		texture: true

	},
	"2D": {
		vertexShaderFile: "src/shaders/2D-vs.glsl",
		fragmentShaderFile: "src/shaders/2D-fs.glsl",
		dimensions: 2,
		texture: true
	},
	"test": {
		vertexShaderFile: "src/shaders/test-vs.glsl",
		fragmentShaderFile: "src/shaders/test-fs.glsl",
		dimensions: 3,
		texture: true
	}
}

export class XYZShader {
	protected _positionAttributeLocation: number = -1;
	protected _colorAttributeLocation: number = -1;
	protected _texCoordAttributeLocation: number = -1;
	protected _mMVPUniformLocation: WebGLUniformLocation | null = null;
	protected _shaderProgram: WebGLProgram | null = null;
	private _meshList: Array<XYZMesh> = [];
	private _shaderType: string = "";
	private _dimensions: number = 3;

	constructor(shaderType: string) {
		if (ShaderTypes[shaderType] != undefined) {
			this._shaderType = shaderType;
		}
	}

	public initialize = async () => {
		this._dimensions = ShaderTypes[this._shaderType].dimensions;
		const shaderText = await XYZShaderReader.load(
			ShaderTypes[this._shaderType].vertexShaderFile,
			ShaderTypes[this._shaderType].fragmentShaderFile);
		this.createShaderProgram(shaderText.vertexShaderText, shaderText.fragmentShaderText);
		this.assignLocations();

		XYZRenderer.addShader(this);
	}

	public get hasTexture() { return ShaderTypes[this._shaderType].texture; }

	public createShaderProgram = (vertexShaderText: string, fragmentShaderText: string) => {
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
		this._shaderProgram = shaderProgram;
	}

	public assignLocations = async () => {
		this._shaderProgram = <WebGLProgram>this._shaderProgram;
		XYZRenderer.gl.useProgram(this._shaderProgram); // Set program in use before getting locations

		this._positionAttributeLocation = XYZRenderer.gl.getAttribLocation(this._shaderProgram, 'vertPosition'); // get position ID
		this._colorAttributeLocation = XYZRenderer.gl.getAttribLocation(this._shaderProgram, 'vertColor'); // get position ID
		this._texCoordAttributeLocation = XYZRenderer.gl.getAttribLocation(this._shaderProgram, 'vertTexCoord'); // get position ID
		this._mMVPUniformLocation = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'mMVP'); // get mWorld ID
	}

	public addMesh = (mesh: XYZMesh) => { this._meshList.push(mesh); }
	
	public drawAll(deltaTime: number) {
		XYZRenderer.gl.useProgram(this._shaderProgram); // Set program in use before getting locations
		this._meshList.forEach(mesh => {
			mesh.update(deltaTime);
			mesh.draw();
			mesh.reset();
		});
	}

	public get positionAttributeLocation() { return this._positionAttributeLocation; }
	public get colorAttributeLocation() { return this._colorAttributeLocation; }
	public get texCoordAttributeLocation() { return this._texCoordAttributeLocation; }
	public get mMVPUniformLocation() { return this._mMVPUniformLocation; }
	public get dimensions() { return this._dimensions; }

	public enableAttributes = () => {
		if (this._positionAttributeLocation > -1) {
			XYZRenderer.gl.enableVertexAttribArray(this._positionAttributeLocation);
		}

		if (this._colorAttributeLocation > -1) {
			XYZRenderer.gl.enableVertexAttribArray(this._colorAttributeLocation);
		}

		if (this._texCoordAttributeLocation > -1) {
			XYZRenderer.gl.enableVertexAttribArray(this._texCoordAttributeLocation);
		}
	}
}