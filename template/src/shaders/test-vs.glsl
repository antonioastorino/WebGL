precision mediump float;

/*omniDirLight
const int numOfOmniDirLights = $numOfOmniDirLights$;
uniform vec3 omniDirLightPosition[numOfOmniDirLights];
varying vec3 omniDirLightWorldPosition[numOfOmniDirLights];
omniDirLight*/

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

/*omniDirLight
	for (int i = 0; i < numOfOmniDirLights; i++) {
		omniDirLightWorldPosition[i] = vec4(mView * vec4(omniDirLightPosition[i], 1)).xyz;; // omniDirLight location in world coordinates
	}
omniDirLight*/

	gl_Position = mMVP * vec4(vertPosition, 1.0);
}