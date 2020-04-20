precision mediump float;
varying vec4 fragPosition;

void main() {
	float dist = (fragPosition.z - 0.1) / 99.9;
	gl_FragColor = vec4(dist, dist, dist, 1);
}