precision mediump float;

attribute vec3 vertPosition;
uniform mat4 mMVP;

void main() {
	gl_Position = mMVP * vec4(vertPosition, 1.0);
}