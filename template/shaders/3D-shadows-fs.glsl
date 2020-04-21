precision mediump float;

varying vec4 fragPosition;

uniform vec3 pointLightPosition;
uniform sampler2D texShadowSampler;


void main() {
	// distance normalized to match fragment shader
	float dist = fragPosition.z / 100.0;
	// from homogeneous coordinates to screen coordinates
	vec2 locationOnScreen = ((1.0 / fragPosition.w ) * fragPosition.xy) * 0.5 + 0.5;

	vec3 texColor = texture2D(texShadowSampler, locationOnScreen).xyz;

	// check if this fragment is behind another object
	vec3 color = vec3(1,1,1);
	if (dist > texColor.r) {
		color.r = 0.0;
	}

	gl_FragColor = vec4( color, 1);
}