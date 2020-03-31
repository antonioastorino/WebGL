precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertNormal;
uniform mat4 mMVP;
uniform mat4 mModel;
uniform mat4 mView;
varying vec3 fragNormal;
varying vec3 fragPosition;
varying vec3 sunLocation;

mat4 mMV = mView * mModel;

void main() {
	fragPosition = vec4( mMV * vec4(vertPosition, 1)).xyz;
	fragNormal = vec4( mMV * vec4(vertNormal, 0)).xyz;;
	sunLocation = vec4(mView * vec4(2, 5, 3, 1)).xyz;; // sun location in world coordinatesat3(mView) * vertNormal;

	gl_Position = mMVP * vec4(vertPosition, 1.0);
}