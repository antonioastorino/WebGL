
import { XYZMatrix } from "../lib/Math/XYZMatrix.js";
import { XYZVector } from "../lib/Math/XYZVector.js";
import { XYZMatLab } from "../lib/Math/XYZMatLab.js";

export function main() {
	console.log("Hello Main");
	let canvas = <HTMLCanvasElement>document.getElementById("glCanvas");
	let gl = canvas.getContext('webgl');

	if (!gl) {
		return
	}

	let vertexShaderText: string;
	let fragmentShaderText: string;
	let vertexShader: WebGLShader;
	let fragmentShader: WebGLShader;

	function shader_loaded() {
		if (!gl) { return; }

		gl.clearColor(0.75, 0.85, 0.8, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		vertexShader = <WebGLShader>gl.createShader(gl.VERTEX_SHADER);
		fragmentShader = <WebGLShader>gl.createShader(gl.FRAGMENT_SHADER);

		gl.shaderSource(vertexShader, vertexShaderText);
		gl.shaderSource(fragmentShader, fragmentShaderText);
		gl.compileShader(vertexShader)
		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			console.error('ERROR compiling vertex shader', gl.getShaderInfoLog(vertexShader));
			return;
		}
		gl.compileShader(fragmentShader)
		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
			console.error('ERROR compiling fragment shader', gl.getShaderInfoLog(fragmentShader));
			return;
		}

		let shaderProgram = gl.createProgram();
		if (!shaderProgram) {
			return;
		}
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);

		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			console.error('ERROR linking program!', gl.getProgramInfoLog(shaderProgram));
			return;
		}

		gl.validateProgram(shaderProgram);
		if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)) {
			console.error('ERROR validating program!', gl.getProgramInfoLog(shaderProgram));
			return;
		}

		let vertices =
			[	// x, y, z			r, g, b
			0.0, 0.5, 0.0,		1.0, 0.0, 0.0,
			-0.5, -0.5, 0.0,	0.0, 1.0, 0.0,
			0.5, -0.5, 0.0,		0.0, 0.0, 1.0
		];

		let vertexArrayBufferObject = gl.createBuffer(); // get buffer ID
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexArrayBufferObject); // select buffer
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); // load data

		gl.useProgram(shaderProgram); // Set program in use before getting locations
		let positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'vertPosition'); // get position ID
		let colorAttributeLocation = gl.getAttribLocation(shaderProgram, 'vertColor'); // get position ID
		let mWorldUniformLocation = gl.getUniformLocation(shaderProgram, 'mWorld'); // get mWorld ID
		let mViewUniformLocation = gl.getUniformLocation(shaderProgram, 'mView'); // get mWorld ID
		let mProjUniformLocation = gl.getUniformLocation(shaderProgram, 'mProj'); // get mWorld ID

		gl.vertexAttribPointer(
			positionAttributeLocation, // ID
			3, // size
			gl.FLOAT, // type,
			false, // normalized
			6 * Float32Array.BYTES_PER_ELEMENT, // stride
			0 // offset
		);

		gl.vertexAttribPointer(
			colorAttributeLocation, // ID
			3, // size
			gl.FLOAT, // type,
			false, // normalized
			6 * Float32Array.BYTES_PER_ELEMENT, // stride
			3 * Float32Array.BYTES_PER_ELEMENT // offset
		);

		let mWorld = XYZMatLab.makeTranslationMatrix(
			new XYZVector([-.2, 0,0])
			);
		let mView = (new XYZMatrix(4, 4)).identity();
		let mProj = (new XYZMatrix(4, 4)).identity();
		

		// Set uniform values
		gl.uniformMatrix4fv(mWorldUniformLocation, false, mWorld.getFloat32Array());
		gl.uniformMatrix4fv(mViewUniformLocation, false, mView.getFloat32Array());
		gl.uniformMatrix4fv(mProjUniformLocation, false, mProj.getFloat32Array());

		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.enableVertexAttribArray(colorAttributeLocation);

		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}

	$.get("src/shaders/vertex-shader.glsl")
		.then(
			function (data: string) {
				vertexShaderText = data;
				$.get("src/shaders/fragment-shader.glsl")
					.then(
						function (data: string) {
							fragmentShaderText = data;
							shader_loaded();
						});
			});
}
