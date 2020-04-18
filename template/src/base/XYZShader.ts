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
		lighting: "whatever"
	},
	"shadows": {
		vertexShaderFile: "../../shaders/shadows-vs.glsl",
		fragmentShaderFile: "../../shaders/shadows-fs.glsl",
		dimensions: 3,
		lighting: "whatever"
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
	private _sSamplerUL: WebGLUniformLocation | null = null;
	private _textureEnabled: boolean = false;

	// Light sources
	private _vPointLightPosUL: WebGLUniformLocation | null = null; // Position in world coordinates
	private _vPointLightIntUL: WebGLUniformLocation | null = null; // RGB intensity

	private _vDirLightDirUL: WebGLUniformLocation | null = null; // Position in world coordinates
	private _vDirLightIntUL: WebGLUniformLocation | null = null; // RGB intensity

	// Shadows
	private _texObject: WebGLTexture | null = null;
	private _frameBuffer: WebGLFramebuffer | null = null;
	private _sShadowSamplerUL: WebGLUniformLocation | null = null;

	private _shaderProgram: WebGLProgram | null = null;
	private _meshList: Array<XYZMesh> = [];
	private _pointLights: Array<XYZLightSource> = [];
	private _dirLights: Array<XYZLightSource> = [];
	private _shaderType: string = "";
	private _dimensions: number = 0;

	constructor(shaderType: string) {
		if (ShaderTypes[shaderType] == undefined) throw "Undefined shader type";
		this._shaderType = shaderType;
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
		if (this._shaderType == "shadows") {
			XYZRenderer.getGl().useProgram(this._shaderProgram);
			let texObjectData = XYZRenderer.createShadowTextureObject(1024);
			this._texObject = texObjectData.texObject;
			this._frameBuffer = texObjectData.frameBuffer;
			XYZRenderer.setShadowShader(this);
		}
		else {
			XYZRenderer.addShader(this);
		}
		this._isInitialized = true;
	

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
			vertexShaderText = vertexShaderText.replace("$numOfDirLights$", this._dirLights.length.toString());
			vertexShaderText = vertexShaderText.split("/*dirLight").join("");
			vertexShaderText = vertexShaderText.split("dirLight*/").join("");
			fragmentShaderText = fragmentShaderText.replace("$numOfDirLights$", this._dirLights.length.toString());
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

		console.log(vertexShaderText);
		console.log(fragmentShaderText);

		let gl = XYZRenderer.getGl();
		let vertexShader = <WebGLShader>gl.createShader(gl.VERTEX_SHADER);
		let fragmentShader = <WebGLShader>gl.createShader(gl.FRAGMENT_SHADER);

		gl.shaderSource(vertexShader, vertexShaderText);
		gl.shaderSource(fragmentShader, fragmentShaderText);
		gl.compileShader(vertexShader)
		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			throw 'ERROR compiling vertex shader\n' + gl.getShaderInfoLog(vertexShader);
		}
		gl.compileShader(fragmentShader)
		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
			throw 'ERROR compiling fragment shader\n' + gl.getShaderInfoLog(fragmentShader);
		}

		let shaderProgram = gl.createProgram();
		if (!shaderProgram) {
			throw "Shader program not created";
		}

		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);

		gl.linkProgram(shaderProgram);
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			throw 'ERROR linking program!' + gl.getProgramInfoLog(shaderProgram)
		}

		gl.validateProgram(shaderProgram);
		if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
			throw 'ERROR validating program!' + gl.getProgramInfoLog(shaderProgram)
		}

		this._shaderProgram = shaderProgram;
	}

	public async assignLocations() {
		let gl = XYZRenderer.getGl();
		this._shaderProgram = <WebGLProgram>this._shaderProgram;
		gl.useProgram(this._shaderProgram); // Set program in use before getting locations

		this._positionAttributeLocation = gl.getAttribLocation(this._shaderProgram, 'vertPosition'); // get position ID
		this._normalAttributeLocation = gl.getAttribLocation(this._shaderProgram, 'vertNormal'); // get position ID
		this._texCoordAttributeLocation = gl.getAttribLocation(this._shaderProgram, 'vertTexCoord'); // get position ID
		this._mMVPUniformLocation = gl.getUniformLocation(this._shaderProgram, 'mMVP'); // get mMVP ID
		this._mViewUniformLocation = gl.getUniformLocation(this._shaderProgram, 'mView'); // get mView ID
		this._mModelUniformLocation = gl.getUniformLocation(this._shaderProgram, 'mModel'); // get mModel ID

		// lighting parameters
		this._vPointLightPosUL = gl.getUniformLocation(this._shaderProgram, 'pointLightPosition'); // get pointLightPosition ID
		this._vPointLightIntUL = gl.getUniformLocation(this._shaderProgram, 'pointLightIntensity'); // get pointLightIntensity ID
		this._vDirLightDirUL = gl.getUniformLocation(this._shaderProgram, 'dirLightDirection'); // get pointLightPosition ID
		this._vDirLightIntUL = gl.getUniformLocation(this._shaderProgram, 'dirLightIntensity'); // get pointLightIntensity ID
		this._sNsUniformLocation = gl.getUniformLocation(this._shaderProgram, 'sNs'); // get sNs ID
		this._vKaUniformLocation = gl.getUniformLocation(this._shaderProgram, 'vKa'); // get vKa ID
		this._vKdUniformLocation = gl.getUniformLocation(this._shaderProgram, 'vKd'); // get vKd ID
		this._vKsUniformLocation = gl.getUniformLocation(this._shaderProgram, 'vKs'); // get vKs ID

		// texture
		this._sSamplerUL = gl.getUniformLocation(this._shaderProgram, 'texSampler'); // get vKs ID
		gl.activeTexture(gl.TEXTURE0);
		gl.uniform1i(this._sSamplerUL, 0);  // texture unit 0

		// shadow texture
		this._sShadowSamplerUL = gl.getUniformLocation(this._shaderProgram, 'shadowTexSampler'); // get vKs ID
		gl.activeTexture(gl.TEXTURE1);
		gl.uniform1i(this._sShadowSamplerUL, 1);  // texture unit 0

		gl.useProgram(null);
	}

	public getShaderProgram() { return this._shaderProgram; }
	public getPosAL() { return this._positionAttributeLocation; }
	public getNormAL() { return this._normalAttributeLocation; }
	public getTexCoorAL() { return this._texCoordAttributeLocation; }
	public getMVPUL() { return this._mMVPUniformLocation; }
	public getViewUL() { return this._mViewUniformLocation; }
	public getModelUL() { return this._mModelUniformLocation; }
	public getNsUL() { return this._sNsUniformLocation; }
	public getKaUL() { return this._vKaUniformLocation; }
	public getKdUL() { return this._vKdUniformLocation; }
	public getKsUL() { return this._vKsUniformLocation; }
	public sSamplerUL() { return this._sSamplerUL; }
	public sShadowSamplerUL() { return this._sShadowSamplerUL; }
	public getTexObject = (): WebGLTexture | null => { return this._texObject; }
	public getFrameBuffer = (): WebGLFramebuffer | null => { return this._frameBuffer; }
	public getDimensions() { return this._dimensions; }

	public addMesh = (mesh: XYZMesh) => { this._meshList.push(mesh); }

	public drawAll() {
		this.enableAttributes()
		if (this._vPointLightPosUL != null && this._vPointLightIntUL != null) {
			let pointLightPosArray: number[] = [];
			let pointLightIntArray: number[] = [];
			this._pointLights.forEach((light: XYZLightSource) => {
				let dirLight = <XYZPoint>light;

				pointLightPosArray.push(dirLight.getPosition().x);
				pointLightPosArray.push(dirLight.getPosition().y);
				pointLightPosArray.push(dirLight.getPosition().z);

				pointLightIntArray.push(dirLight.getRgbIntensity().r);
				pointLightIntArray.push(dirLight.getRgbIntensity().g);
				pointLightIntArray.push(dirLight.getRgbIntensity().b);
			})

			XYZRenderer.getGl().uniform3fv(
				this._vPointLightPosUL,
				new Float32Array(pointLightPosArray));

			XYZRenderer.getGl().uniform3fv(
				this._vPointLightIntUL,
				new Float32Array(pointLightIntArray));
		}

		if (this._vDirLightDirUL != null && this._vDirLightIntUL != null) {
			let dirLightDirArray: number[] = [];
			let dirLightIntArray: number[] = [];
			this._dirLights.forEach((light: XYZLightSource) => {
				let dirLight = <XYZSun>light;

				dirLightDirArray.push(dirLight.getDirection().x);
				dirLightDirArray.push(dirLight.getDirection().y);
				dirLightDirArray.push(dirLight.getDirection().z);

				dirLightIntArray.push(dirLight.getRgbIntensity().r);
				dirLightIntArray.push(dirLight.getRgbIntensity().g);
				dirLightIntArray.push(dirLight.getRgbIntensity().b);
			})

			XYZRenderer.getGl().uniform3fv(
				this._vDirLightDirUL,
				new Float32Array(dirLightDirArray));

			XYZRenderer.getGl().uniform3fv(
				this._vDirLightIntUL,
				new Float32Array(dirLightIntArray));
		}

		this._meshList.forEach(mesh => {
			mesh.draw();
		});
	}

	public enableAttributes = () => {
		let attributeCounter = 0; // counts how many attributes are enabled
		if (this._positionAttributeLocation > -1) {
			attributeCounter++;
			XYZRenderer.getGl().enableVertexAttribArray(this._positionAttributeLocation);
		}

		if (this._normalAttributeLocation > -1) {
			attributeCounter++;
			XYZRenderer.getGl().enableVertexAttribArray(this._normalAttributeLocation);
		}

		if (this._texCoordAttributeLocation > -1) {
			attributeCounter++;
			XYZRenderer.getGl().enableVertexAttribArray(this._texCoordAttributeLocation);
		}

		// disable unused attributes
		for (; attributeCounter < 8; attributeCounter++) XYZRenderer.getGl().disableVertexAttribArray(attributeCounter);
	}
}