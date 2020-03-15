precision mediump float;

attribute vec3 vertColor;
attribute vec2 vertPosition;
varying vec3 fragColor; // output to fragment shader
uniform mat4 mMVP;

void main() {
	fragColor = vertColor;
	gl_Position = mMVP * vec4(vertPosition, 0.0, 1.0);
}