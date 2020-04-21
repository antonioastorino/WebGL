precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertNormal;
uniform mat4 mMVP;
uniform mat4 mModel;
uniform mat4 mView;
uniform mat4 mProj;
varying vec3 fragNormal;
varying vec4 fragPosition;

mat4 mMV = mView * mModel;

void main() {
	mat4 lightView = mView; // view matrix of the light source;
	lightView[3][0] -= 10.0; // the relative position from the camera
	// calculate the vertex position as seen from the light
	fragPosition = mProj * lightView * mModel * vec4(vertPosition, 1);
	gl_Position = mMVP * vec4(vertPosition, 1.0);
}