precision mediump float;

uniform vec3 vKa;
uniform vec3 vKd;
uniform vec3 vKs;
varying vec3 fragNormal;
varying vec3 fragPosition;
/*pointLight
const int numOfPointLights = $numOfPointLights$;
uniform vec3 pointLightIntensity[numOfPointLights];
uniform float sNs;
varying vec3 pointLightWorldPosition[numOfPointLights];
pointLight*/

const float Ia = 0.2;
const float Id = 0.5;

void main() {
	vec3 N = normalize(fragNormal); // surface normal
	vec3 V = - normalize(fragPosition); // eye normalized location
	vec3 specular = vec3(0.0, 0.0, 0.0);
/*pointLight
for (int i = 0; i < numOfPointLights; i++){
	float decay = min(1.0, 1.0/distance(pointLightWorldPosition[i], fragPosition));
	vec3 L = normalize(pointLightWorldPosition[i] - fragPosition);
	vec3 H = normalize(L + V); // halfway ray
	specular += pow(max(dot(N, H), 0.0), sNs) * vKs * decay * pointLightIntensity[i];; // Blinn-Phong reflection
}
pointLight*/

	vec3 ambient = vKa * Ia;
	vec3 diffuse = Id * max(dot(N, V), 0.0) * vKd;
	vec3 fragColor = ambient + diffuse + specular;
	gl_FragColor = vec4(fragColor, 1);
}