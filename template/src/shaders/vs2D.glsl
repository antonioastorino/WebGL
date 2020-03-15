precision mediump float;

attribute vec3 vertColor;
attribute vec2 vertPosition;
varying vec3 fragColor; // output to fragment shader
uniform mat4 mMVP;

void main() {
	fragColor = vertColor;
	gl_Position = mMVP * vec4(vertPosition, -1.0, 1.0); // z = -1.0 means always in front of everything
}