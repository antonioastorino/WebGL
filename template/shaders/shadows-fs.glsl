precision mediump float;
varying vec4 fragPosition;

void main() {
	// distance normalized for visulization purposes
	// added small offset to avoid z-fighting
	float dist = (fragPosition.z) / 100.0 + 0.1; 
	gl_FragColor = vec4(dist, dist, dist, 1);
}