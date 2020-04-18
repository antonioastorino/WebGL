precision mediump float;

attribute vec3 vertPosition;

uniform mat4 mModel;
uniform mat4 mView;
uniform mat4 mMVP;
mat4 mMV = mView * mModel;
varying vec3 fragPosition;

void main() {
	fragPosition = vec4( mMV * vec4(vertPosition, 1)).xyz;
	gl_Position = mMVP * vec4(vertPosition, 1.0);
}