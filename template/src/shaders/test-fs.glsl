precision mediump float;
uniform vec3 vKa;
uniform vec3 vKd;
varying vec3 fragNormal;
varying vec3 fragPosition;
varying vec3 sunLocation;
const vec3 vKs = vec3(1,1,1);

const float Ia = 0.2;
const float Id = 0.5;

void main() {
	vec3 L = normalize(sunLocation - fragPosition);
	vec3 N = normalize(fragNormal); // surface normal
	vec3 V = - normalize(fragPosition); // eye normalized location
	vec3 R = normalize((2.0 * dot(L, N) * N) - L); // reflected ray

	vec3 ambient = vKa * Ia;
	vec3 diffuse = Id * max(dot(N, V), 0.0) * vKd;
	vec3 specular = pow(max(dot(V, R), 0.0), 10.0) * vKs;
	// vec3 fragColor = specular;
	vec3 fragColor = ambient + diffuse + specular;
	gl_FragColor = vec4(fragColor, 1);
}