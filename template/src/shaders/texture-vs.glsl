precision mediump float;

attribute vec2 vertTexCoord;
attribute vec3 vertPosition;
varying vec2 fragTexCoord; // output to fragment shader
uniform mat4 mMVP;

void main() {
	fragTexCoord = vertTexCoord;
	gl_Position = mMVP * vec4(vertPosition, 1.0);
}