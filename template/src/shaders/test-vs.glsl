precision mediump float;

/*pointLight
const int numOfPointLights = $numOfPointLights$;
uniform vec3 pointLightPosition[numOfPointLights];
varying vec3 pointLightWorldPosition[numOfPointLights];
pointLight*/

attribute vec3 vertPosition;
attribute vec3 vertNormal;
uniform mat4 mMVP;
uniform mat4 mModel;
uniform mat4 mView;
varying vec3 fragNormal;
varying vec3 fragPosition;

mat4 mMV = mView * mModel;

void main() {
	fragPosition = vec4( mMV * vec4(vertPosition, 1)).xyz;
	fragNormal = vec4( mMV * vec4(vertNormal, 0)).xyz;;

/*pointLight
	for (int i = 0; i < numOfPointLights; i++) {
		pointLightWorldPosition[i] = vec4(mView * vec4(pointLightPosition[i], 1)).xyz;; // pointLight location in world coordinates
	}
pointLight*/

	gl_Position = mMVP * vec4(vertPosition, 1.0);
}