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
	},
}

export class XYZShader {
	private _attributes: { [id: string]: number } = {
		vertPosition: -1,
		vertNormal: -1,
		vertTexCoord: -1,
	}
	private _uniforms: { [id: string]: WebGLUniformLocation | null } = {
		mMVP: null,
		mView: null,
		mModel: null,
		pointLightPosition: null,
		pointLightIntensity: null,
		dirLightDirection: null,
		dirLightIntensity: null,
		Ns: null,
		Ka: null,
		Kd: null,
		Ks: null,
		texSampler: null,
	}

	private _isInitialized = false;
	private _textureEnabled: boolean = false;



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
		switch (source.getType()) {
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


		for (var attr in this._attributes) {
			this._attributes[attr] = gl.getAttribLocation(this._shaderProgram, attr);
		}

		for (var unif in this._uniforms) {
			this._uniforms[unif] = gl.getUniformLocation(this._shaderProgram, unif);
		}

		gl.useProgram(null);
	}

	public getShaderProgram() { return this._shaderProgram; }
	public getAttribLoc(attribute: string) { return this._attributes[attribute]; }
	public getUnifLoc(uniform: string) { return this._uniforms[uniform]; }
	public getDimensions() { return this._dimensions; }
	public addMesh = (mesh: XYZMesh) => { this._meshList.push(mesh); }

	public drawAll() {
		let gl = XYZRenderer.getGl();
		gl.useProgram(this._shaderProgram);
		this.enableAttributes()
		if (this._uniforms['pointLightPosition'] != null
			&& this._uniforms['pointLightIntensity'] != null) {
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

			gl.uniform3fv(
				this._uniforms['pointLightPosition'],
				new Float32Array(pointLightPosArray));

			gl.uniform3fv(
				this._uniforms['pointLightIntensity'],
				new Float32Array(pointLightIntArray));
		}

		if (this._uniforms['dirLightDirection'] != null
			&& this._uniforms['dirLightIntensity'] != null) {
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

			gl.uniform3fv(
				this._uniforms['dirLightDirection'],
				new Float32Array(dirLightDirArray));

			gl.uniform3fv(
				this._uniforms['dirLightIntensity'],
				new Float32Array(dirLightIntArray));
		}

		this._meshList.forEach(mesh => { mesh.draw(); });
	}

	public enableAttributes = () => {
		let attributeCounter = 0; // counts how many attributes are enabled
		let gl = XYZRenderer.getGl();
		for (var attr in this._attributes) {
			if (this._attributes[attr] > -1) {
				attributeCounter++;
				gl.enableVertexAttribArray(this._attributes[attr]);
			}
		}
		// disable unused attributes
		for (; attributeCounter < 8; attributeCounter++) gl.disableVertexAttribArray(attributeCounter);
	}
}