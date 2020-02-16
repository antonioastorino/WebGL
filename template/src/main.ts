function main() {
	console.log("Hello Main");
	let canvas = <HTMLCanvasElement> document.getElementById("glCanvas");
	let gl = canvas.getContext('webgl');

	if (!gl) {
		return
	}

	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	let vertex_shader_text: string;
	let fragment_shader_text: string;
	let vertex_shader: WebGLShader;
	let fragment_shader: WebGLShader;

	function shader_loaded() {
		if (!gl) { return; }
		
		vertex_shader = <WebGLShader> gl.createShader(gl.VERTEX_SHADER);
		fragment_shader = <WebGLShader> gl.createShader(gl.FRAGMENT_SHADER);
		
		gl.shaderSource(vertex_shader, vertex_shader_text);
		gl.shaderSource(fragment_shader, fragment_shader_text);
		gl.compileShader(vertex_shader)
		if (!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS)) {
			console.error('ERROR compiling vertex shader', gl.getShaderInfoLog(vertex_shader));
			return;
		}
		gl.compileShader(fragment_shader)
		if (!gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS)) {
			console.error('ERROR compiling fragment shader', gl.getShaderInfoLog(fragment_shader));
			return;
		}

		let program = gl.createProgram();
		if (!program) {
			return;
		}
		gl.attachShader(program, vertex_shader);
		gl.attachShader(program, fragment_shader);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error('ERROR linking program!', gl.getProgramInfoLog(program));
			return;
		}

		gl.validateProgram(program);
		if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
			console.error('ERROR validating program!', gl.getProgramInfoLog(program));
			return;
		}

	}

	$.get("src/shaders/vertex-shader.glsl").then(
		function(data: string) { 
			vertex_shader_text = data;
			$.get("src/shaders/fragment-shader.glsl").then(
				function(data: string) {
					fragment_shader_text = data;
					shader_loaded();
				}
			);
		}
	);
}
