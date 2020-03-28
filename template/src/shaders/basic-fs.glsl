precision mediump float;
varying vec3 fragColor; // input from vertex shader

void main() {
	gl_FragColor = vec4(
		fragColor,
		1.0
	);
}