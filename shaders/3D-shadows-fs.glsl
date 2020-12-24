precision mediump float;

varying vec3 fragPosition;
uniform mat4 mView;
uniform mat4 mProj;
uniform vec3 pointLightPosition;
uniform sampler2D texShadowSampler;


void main() {
	float dist = distance(fragPosition, pointLightPosition) * 10.0;

	vec4 fragTexCoordFromLightView = mProj * mView * vec4(fragPosition, 1.0);
	vec2 locationOnScreen = gl_FragCoord.xy / 896.0;

	vec3 texColor = texture2D(texShadowSampler, locationOnScreen).xyz;

	vec3 color = vec3(1,1,1);
	if (dist < texColor.r) {
		color.r = 0.0;
	}

	gl_FragColor = vec4( color, 1);
}