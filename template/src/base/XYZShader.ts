import { XYZShaderReader } from "./XYZShaderReader.js";
import { XYZRenderer } from "./XYZRenderer.js";
import { XYZMesh } from "../objects/XYZMesh.js"
import { XYZLightSource, XYZPoint, XYZSun } from "../objects/XYZLightSource.js"

interface ShaderFile {
	vertexShaderFile: string,
	fragmentShaderFile: string,
	dimensions: number
	lighting: string
}

export var ShaderTypes: { [id: string]: ShaderFile } = {
	"basic": {
		vertexShaderFile: "../../shaders/basic-vs.glsl",
		fragmentShaderFile: "../../shaders/basic-fs.glsl",
		dimensions: 3,
		lighting: ""
	},
	"test": {
		vertexShaderFile: "../../shaders/test-vs.glsl",
		fragmentShaderFile: "../../shaders/test-fs.glsl",
		dimensions: 3,
		lighting: ""

	},
	"2D": {
		vertexShaderFile: "../../shaders/2D-vs.glsl",
		fragmentShaderFile: "../../shaders/2D-fs.glsl",
		dimensions: 2,
		lighting: ""
	},
	"3D": {
		vertexShaderFile: "../../shaders/3D-vs.glsl",
		fragmentShaderFile: "../../shaders/3D-fs.glsl",
		dimensions: 3,
		lighting: "phong"
	}
}

export class XYZShader {
	private _isInitialized = false;
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
	private _textureEnabled: boolean = false;

	// Light sources
	private _vPointLightPosUL: WebGLUniformLocation | null = null; // Position in world coordinates
	private _vPointLightIntUL: WebGLUniformLocation | null = null; // RGB intensity

	private _vDirLightDirUL: WebGLUniformLocation | null = null; // Position in world coordinates
	private _vDirLightIntUL: WebGLUniformLocation | null = null; // RGB intensity

	private _shaderProgram: WebGLProgram | null = null;
	private _meshList: Array<XYZMesh> = [];
	private _pointLights: Array<XYZLightSource> = [];
	private _dirLights: Array<XYZLightSource> = [];
	private _shaderType: string = "";
	private _dimensions: number = 0;

	constructor(shaderType: string) {
		if (ShaderTypes[shaderType] != undefined) {
			this._shaderType = shaderType;
		}
	}

	public addLightSource = (source: XYZLightSource) => {
		if (this._isInitialized) {
			throw "No light sources can be added after initialization";
		}
		if (ShaderTypes[this._shaderType].lighting == "") {
			throw "This shader does not support lighting";
		}
		switch (source.type) {
			case "point light":
				this._pointLights.push(source);
				break;
			case "directional light":
				this._dirLights.push(source);
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
		this._isInitialized = true;
		XYZRenderer.addShader(this);

	}

	public enableTexture = () => { this._textureEnabled = true; }
	public isTextureEnabled = (): boolean => { return this._textureEnabled; }

	public createShaderProgram = (vertexShaderText: string, fragmentShaderText: string) => {
		if (this._pointLights.length > 0) {
			vertexShaderText = vertexShaderText.replace("$numOfPointLights$", this._pointLights.length.toString());
			vertexShaderText = vertexShaderText.split("/*pointLight").join("");
			vertexShaderText = vertexShaderText.split("pointLight*/").join("");
			fragmentShaderText = fragmentShaderText.replace("$numOfPointLights$", this._pointLights.length.toString());
			fragmentShaderText = fragmentShaderText.split("/*pointLight").join("");
			fragmentShaderText = fragmentShaderText.split("pointLight*/").join("");
		}

		if (this._dirLights.length > 0) {
			vertexShaderText = vertexShaderText.replace("$numOfDirLights$", this._pointLights.length.toString());
			vertexShaderText = vertexShaderText.split("/*dirLight").join("");
			vertexShaderText = vertexShaderText.split("dirLight*/").join("");
			fragmentShaderText = fragmentShaderText.replace("$numOfDirLights$", this._pointLights.length.toString());
			fragmentShaderText = fragmentShaderText.split("/*dirLight").join("");
			fragmentShaderText = fragmentShaderText.split("dirLight*/").join("");
		}

		if (this._textureEnabled) {
			vertexShaderText = vertexShaderText.split("/*texture").join("");
			vertexShaderText = vertexShaderText.split("texture*/").join("");
			fragmentShaderText = fragmentShaderText.split("/*texture").join("");
			fragmentShaderText = fragmentShaderText.split("texture*/").join("");
		}

		// remove remaining comments
		let newSplit = vertexShaderText.split("/*");
		vertexShaderText = newSplit[0];
		for (let i = 1; i < newSplit.length; i++) {
			vertexShaderText = vertexShaderText + newSplit[i].split("*/")[1];
		}

		newSplit = fragmentShaderText.split("/*");
		fragmentShaderText = newSplit[0];
		for (let i = 1; i < newSplit.length; i++) {
			fragmentShaderText = fragmentShaderText + newSplit[i].split("*/")[1];
		}

		let vertexShader = <WebGLShader>XYZRenderer.gl.createShader(XYZRenderer.gl.VERTEX_SHADER);
		let fragmentShader = <WebGLShader>XYZRenderer.gl.createShader(XYZRenderer.gl.FRAGMENT_SHADER);

		XYZRenderer.gl.shaderSource(vertexShader, vertexShaderText);
		XYZRenderer.gl.shaderSource(fragmentShader, fragmentShaderText);
		XYZRenderer.gl.compileShader(vertexShader)
		if (!XYZRenderer.gl.getShaderParameter(vertexShader, XYZRenderer.gl.COMPILE_STATUS)) {
			throw 'ERROR compiling vertex shader\n' + XYZRenderer.gl.getShaderInfoLog(vertexShader);
		}
		XYZRenderer.gl.compileShader(fragmentShader)
		if (!XYZRenderer.gl.getShaderParameter(fragmentShader, XYZRenderer.gl.COMPILE_STATUS)) {
			throw 'ERROR compiling fragment shader\n' + XYZRenderer.gl.getShaderInfoLog(fragmentShader);
		}

		let shaderProgram = XYZRenderer.gl.createProgram();
		if (!shaderProgram) {
			throw "Shader program not created";
		}

		XYZRenderer.gl.attachShader(shaderProgram, vertexShader);
		XYZRenderer.gl.attachShader(shaderProgram, fragmentShader);

		XYZRenderer.gl.linkProgram(shaderProgram);
		if (!XYZRenderer.gl.getProgramParameter(shaderProgram, XYZRenderer.gl.LINK_STATUS)) {
			throw 'ERROR linking program!' + XYZRenderer.gl.getProgramInfoLog(shaderProgram)
		}

		XYZRenderer.gl.validateProgram(shaderProgram);
		if (!XYZRenderer.gl.getProgramParameter(shaderProgram, XYZRenderer.gl.VALIDATE_STATUS)) {
			throw 'ERROR validating program!' + XYZRenderer.gl.getProgramInfoLog(shaderProgram)
		}

		// console.log(vertexShaderText);
		// console.log(fragmentShaderText);
		this._shaderProgram = shaderProgram;
	}

	public assignLocations = async () => {
		this._shaderProgram = <WebGLProgram>this._shaderProgram;
		XYZRenderer.gl.useProgram(this._shaderProgram); // Set program in use before getting locations

		this._positionAttributeLocation = XYZRenderer.gl.getAttribLocation(this._shaderProgram, 'vertPosition'); // get position ID
		this._normalAttributeLocation = XYZRenderer.gl.getAttribLocation(this._shaderProgram, 'vertNormal'); // get position ID
		this._texCoordAttributeLocation = XYZRenderer.gl.getAttribLocation(this._shaderProgram, 'vertTexCoord'); // get position ID
		this._mMVPUniformLocation = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'mMVP'); // get mMVP ID
		this._mViewUniformLocation = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'mView'); // get mView ID
		this._mModelUniformLocation = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'mModel'); // get mModel ID

		// lighting parameters
		this._vPointLightPosUL = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'pointLightPosition'); // get pointLightPosition ID
		this._vPointLightIntUL = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'pointLightIntensity'); // get pointLightIntensity ID
		this._vDirLightDirUL = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'dirLightDirection'); // get pointLightPosition ID
		this._vDirLightIntUL = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'dirLightIntensity'); // get pointLightIntensity ID
		this._sNsUniformLocation = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'sNs'); // get sNs ID
		this._vKaUniformLocation = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'vKa'); // get vKa ID
		this._vKdUniformLocation = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'vKd'); // get vKd ID
		this._vKsUniformLocation = XYZRenderer.gl.getUniformLocation(this._shaderProgram, 'vKs'); // get vKs ID
		XYZRenderer.gl.useProgram(null);
	}

	public addMesh = (mesh: XYZMesh) => { this._meshList.push(mesh); }

	public drawAll(deltaTime: number) {
		XYZRenderer.gl.useProgram(this._shaderProgram); // Set program in use before getting locations
		this.enableAttributes()
		if (this._vPointLightPosUL != null && this._vPointLightIntUL != null) {
			let pointLightPosArray: number[] = [];
			let pointLightIntArray: number[] = [];
			this._pointLights.forEach((light: XYZLightSource) => {
				let dirLight = <XYZPoint>light;

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

		if (this._vDirLightDirUL != null && this._vDirLightIntUL != null) {
			let dirLightDirArray: number[] = [];
			let dirLightIntArray: number[] = [];
			this._dirLights.forEach((light: XYZLightSource) => {
				let dirLight = <XYZSun>light;

				dirLightDirArray.push(dirLight.direction.x);
				dirLightDirArray.push(dirLight.direction.y);
				dirLightDirArray.push(dirLight.direction.z);

				dirLightIntArray.push(dirLight.rgbIntensity.r);
				dirLightIntArray.push(dirLight.rgbIntensity.g);
				dirLightIntArray.push(dirLight.rgbIntensity.b);
			})

			XYZRenderer.gl.uniform3fv(
				this._vDirLightDirUL,
				new Float32Array(dirLightDirArray));

			XYZRenderer.gl.uniform3fv(
				this._vDirLightIntUL,
				new Float32Array(dirLightIntArray));
		}

		this._meshList.forEach(mesh => {
			mesh.update(deltaTime);
			mesh.draw();
			mesh.reset();
		});
	}

	public get positionAttributeLocation() { return this._positionAttributeLocation; }
	public get normalAttributeLocation() { return this._normalAttributeLocation; }
	public get texCoordAttributeLocation() { return this._texCoordAttributeLocation; }
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

		// disable unused attributes
		for (; attributeCounter < 8; attributeCounter++) XYZRenderer.gl.disableVertexAttribArray(attributeCounter);
	}
}