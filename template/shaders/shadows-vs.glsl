precision mediump float;

attribute vec3 vertPosition;
varying vec4 fragPosition;
uniform mat4 mMVP;

void main() {
	fragPosition = mMVP * vec4(vertPosition, 1.0);
	gl_Position = fragPosition;
}