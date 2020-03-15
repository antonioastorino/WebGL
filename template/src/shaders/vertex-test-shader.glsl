precision mediump float;

attribute vec3 vertPosition;

void main() {
	gl_Position = vec4(vertPosition, 1.0);
}