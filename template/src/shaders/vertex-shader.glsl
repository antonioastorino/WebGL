precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertColor;
varying vec3 fragColor; // output to fragment shader
uniform mat4 mMVP;

void main() {
	fragColor = vertColor;
	gl_Position = mMVP * vec4(vertPosition, 1.0);
}