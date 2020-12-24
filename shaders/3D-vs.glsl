precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertNormal;
uniform mat4 mMVP;
uniform mat4 mModel;
uniform mat4 mView;
varying vec3 fragNormal;
varying vec3 fragPosition;

mat4 mMV = mView * mModel;

/*texture
attribute vec2 vertTexCoord;
varying vec2 fragTexCoord; // output to fragment shader
texture*/


void main() {
	fragPosition = vec4( mMV * vec4(vertPosition, 1)).xyz;
	fragNormal = vec4( mMV * vec4(vertNormal, 0)).xyz;;

/*texture
	fragTexCoord = vertTexCoord;
texture*/

	gl_Position = mMVP * vec4(vertPosition, 1.0);
}