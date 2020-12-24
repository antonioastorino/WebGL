precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertNormal;
uniform mat4 mMVP;
uniform mat4 mModel;
uniform mat4 mView;
varying vec3 fragNormal;
varying vec3 fragPosition;

mat4 mMV = mView * mModel;

void main() {
	fragPosition = vec4( mModel * vec4(vertPosition, 1)).xyz;
	gl_Position = mMVP * vec4(vertPosition, 1.0);
}