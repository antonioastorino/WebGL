precision mediump float;

varying vec3 fragPosition;

void main() {
	float color = (0.1 - fragPosition.z) / 999.0;
	gl_FragColor = vec4(color, color, color, 1);
}