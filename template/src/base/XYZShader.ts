import { XYZShaderReader } from "./XYZShaderReader.js";
import { XYZRenderer } from "./XYZRenderer.js";
import { XYZMesh } from "../../lib/Objects/XYZMesh.js"
import { XYZLightSource, XYZSun } from "../../lib/Objects/XYZLightSource.js"
import { XYZMatrix } from "../../lib/Math/XYZMatrix.js";

interface ShaderFile {
	vertexShaderFile: string,
	fragmentShaderFile: string,
	dimensions: number,
	texture: boolean,
	lighting: string
}

export var ShaderTypes: { [id: string]: ShaderFile } = {
	"basic": {
		vertexShaderFile: "src/shaders/basic-vs.glsl",
		fragmentShaderFile: "src/shaders/basic-fs.glsl",
		dimensions: 3,
		texture: false,
		lighting: ""
	},
	"texture": {
		vertexShaderFile: "src/shaders/texture-vs.glsl",
		fragmentShaderFile: "src/shaders/texture-fs.glsl",
		dimensions: 3,
		texture: true,
		lighting: ""

	},
	"2D": {
		vertexShaderFile: "src/shaders/2D-vs.glsl",
		fragmentShaderFile: "src/shaders/2D-fs.glsl",
		dimensions: 2,
		texture: true,
		lighting: ""
	},
	"test": {
		vertexShaderFile: "src/shaders/test-vs.glsl",
		fragmentShaderFile: "src/shaders/test-fs.glsl",
		dimensions: 3,
		texture: false,
		lighting: "phong"
	}
}

export class XYZShader {
	private _initialized = false;
	// Geometry
	private _positionAttributeLocation: number = -1;
	private _normalAttributeLocation: number = -1;
	private _mMVPUniformLocation: WebGLUniformLocation | null = null;
	private _mViewUniformLocation: WebGLUniformLocation | null = null;
	private _mModelUniformLocation: WebGLUniformLocation | null = null;
	// Material
	private _texCoordAttributeLocation: number = -1;
	private _sNsUniformLocation: WebGLUniformLocation | null = null;
	private _vKaUniformLocation: WebGLUniformLocation | null = null;
	private _vKdUniformLocation: WebGLUniformLocation | null = null;
	private _vKsUniformLocation: WebGLUniformLocation | null = null;

	// Light sources
	private _vPointLightPosUL: WebGLUniformLocation | null = null; // Position in world coordinates
	private _vPointLightIntUL: WebGLUniformLocation | null = null; // RGB intensity

	private _shaderProgram: WebGLProgram | null = null;
	private _meshList: Array<XYZMesh> = [];
	private _pointLights: Array<XYZLightSource> = [];
	private _shaderType: string = "";
	private _dimensions: number = 3;

	constructor(shaderType: string) {
		if (ShaderTypes[shaderType] != undefined) {
			this._shaderType = shaderType;
		}
	}

	public addLightSource = (source: XYZLightSource) => {
		if (this._initialized) {
			throw "No light sources can be added after initialization";
		}
		if (ShaderTypes[this._shaderType].lighting == "") {
			throw "This shader does not support lighting";
		}
		switch (source.type) {
			case "point light":
				this._pointLights.push(source);
				break;
			default:
				throw "Light source type not found"
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
		if (this._pointLights.length > 0) {
			vertexShaderText = vertexShaderText.replace("$numOfPointLights$", this._pointLights.length.toString());
			vertexShaderText = vertexShaderText.split("/*pointLight").join("");
			vertexShaderText = vertexShaderText.split("pointLight*/").join("");
			fragmentShaderText = fragmentShaderText.replace("$numOfPointLights$", this._pointLights.length.toString());
			fragmentShaderText = fragmentShaderText.split("/*pointLight").join("");
			fragmentShaderText = fragmentShaderText.split("pointLight*/").join("");
		}
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
		this._normalAttributeLocation = XYZRenderer.gl.getAttribLocation(this._shaderProgram, 'vertNormal'); // get position ID
		this._texCoordAttributeLocation = XYZRenderer.gl.getAttribLocation(this._shaderProgram, 'vertTexCoord'); // get position ID
		this._normalAttributeLocation = XYZRenderer.gl.getAttribLocation(this._shaderProgram, 'vertNormal'); // get position ID
		this._mMVPUniformLocation = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'mMVP'); // get mMVP ID
		this._mViewUniformLocation = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'mView'); // get mView ID
		this._mModelUniformLocation = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'mModel'); // get mModel ID

		// lighting parameters
		this._vPointLightPosUL = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'pointLightPosition'); // get pointLightPosition ID
		this._vPointLightIntUL = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'pointLightIntensity'); // get pointLightIntensity ID
		this._sNsUniformLocation = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'sNs'); // get sNs ID
		this._vKaUniformLocation = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'vKa'); // get vKa ID
		this._vKdUniformLocation = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'vKd'); // get vKd ID
		this._vKsUniformLocation = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'vKs'); // get vKs ID
	}

	public addMesh = (mesh: XYZMesh) => { this._meshList.push(mesh); }

	public drawAll(deltaTime: number) {
		this.enableAttributes()
		XYZRenderer.gl.useProgram(this._shaderProgram); // Set program in use before getting locations
		if (this._vPointLightPosUL != null && this._vPointLightIntUL != null) {
			let pointLightPosArray: number[] = [];
			let pointLightIntArray: number[] = [];
			this._pointLights.forEach((light: XYZLightSource) => {
				let dirLight = <XYZSun>light;

				pointLightPosArray.push(dirLight.position.x);
				pointLightPosArray.push(dirLight.position.y);
				pointLightPosArray.push(dirLight.position.z);

				pointLightIntArray.push(dirLight.rgbIntensity.r);
				pointLightIntArray.push(dirLight.rgbIntensity.g);
				pointLightIntArray.push(dirLight.rgbIntensity.b);
			})

			XYZRenderer.gl.uniform3fv(
				this._vPointLightPosUL,
				new Float32Array(pointLightPosArray));

			XYZRenderer.gl.uniform3fv(
				this._vPointLightIntUL,
				new Float32Array(pointLightIntArray));
		}
		this._meshList.forEach(mesh => {
			mesh.update(deltaTime);
			mesh.draw();
			mesh.reset();
		});
	}

	public get positionAttributeLocation() { return this._positionAttributeLocation; }
	public get colorAttributeLocation() { return this._normalAttributeLocation; }
	public get texCoordAttributeLocation() { return this._texCoordAttributeLocation; }
	public get normalAttributeLocation() { return this._normalAttributeLocation; }
	public get mMVPUniformLocation() { return this._mMVPUniformLocation; }
	public get mViewUniformLocation() { return this._mViewUniformLocation; }
	public get mModelUniformLocation() { return this._mModelUniformLocation; }
	public get sNsUniformLocation() { return this._sNsUniformLocation; }
	public get vKaUniformLocation() { return this._vKaUniformLocation; }
	public get vKdUniformLocation() { return this._vKdUniformLocation; }
	public get vKsUniformLocation() { return this._vKsUniformLocation; }
	public get dimensions() { return this._dimensions; }

	public enableAttributes = () => {
		let attributeCounter = 0; // counts how many attributes are enabled
		if (this._positionAttributeLocation > -1) {
			attributeCounter++;
			XYZRenderer.gl.enableVertexAttribArray(this._positionAttributeLocation);
		}

		if (this._normalAttributeLocation > -1) {
			attributeCounter++;
			XYZRenderer.gl.enableVertexAttribArray(this._normalAttributeLocation);
		}

		if (this._texCoordAttributeLocation > -1) {
			attributeCounter++;
			XYZRenderer.gl.enableVertexAttribArray(this._texCoordAttributeLocation);
		}
		if (this._normalAttributeLocation > -1) {
			attributeCounter++;
			XYZRenderer.gl.enableVertexAttribArray(this._normalAttributeLocation);
		}
		// disable unused attributes
		for (; attributeCounter < 8; attributeCounter++) XYZRenderer.gl.disableVertexAttribArray(attributeCounter);
	}
}