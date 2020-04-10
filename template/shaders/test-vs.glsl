precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vertTexCoord;
varying vec2 fragTexCoord; // output to fragment shader
uniform mat4 mMVP;

void main() {
	fragTexCoord = vertTexCoord;
	gl_Position = mMVP * vec4(vertPosition, 1.0);
}