precision mediump float;

attribute vec2 vertTexCoord;
attribute vec2 vertPosition;
varying vec2 fragTexCoord; // output to fragment shader
uniform mat4 mMVP;

void main() {
	fragTexCoord = vertTexCoord;
	vec4 rawPosition = mMVP * vec4(vertPosition, -1.0, 1.0);
	rawPosition.z = -1.0;
	gl_Position = rawPosition; // z = -1.0 means always in front of everything
}