precision mediump float;
varying vec2 fragTexCoord; // input from vertex shader
uniform sampler2D texSampler;

void main() {
	gl_FragColor = texture2D(texSampler, fragTexCoord);
}