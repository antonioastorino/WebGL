function main() {
	console.log("Hello Main");
	let canvas = <HTMLCanvasElement> document.getElementById("glCanvas");
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

		vertexShader = <WebGLShader> gl.createShader(gl.VERTEX_SHADER);
		fragmentShader = <WebGLShader> gl.createShader(gl.FRAGMENT_SHADER);
		
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
		[
			0.0, 0.5,
			-0.5, -0.5,
			0.5, -0.5
		];

		let vertexArrayBufferObject = gl.createBuffer(); // get buffer ID
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexArrayBufferObject); // select buffer
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW); // load data

		let positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'vertPosition'); // get position ID
		gl.vertexAttribPointer(
			positionAttributeLocation, // ID
			2, // size
			gl.FLOAT, // type,
			false, // normalized
			2 * Float32Array.BYTES_PER_ELEMENT, // stride
			0 // offset
		);
		gl.enableVertexAttribArray(positionAttributeLocation);

		gl.useProgram(shaderProgram);
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
						}
					);
			}
		);
}
