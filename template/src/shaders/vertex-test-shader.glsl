precision mediump float;

attribute vec3 vertPosition;

varying vec3 fragColor; // output to fragment shader
// uniform mat4 mMVP;

void main() {
	gl_Position = vec4(vertPosition, 1.0);
}