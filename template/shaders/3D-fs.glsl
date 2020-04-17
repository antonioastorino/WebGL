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
/*dirLight
const int numOfDirLights = $numOfDirLights$;
uniform vec3 dirLightIntensity[numOfDirLights];
varying vec3 dirLightWorldDirection[numOfDirLights];
dirLight*/
/*texture
varying vec2 fragTexCoord; // input from vertex shader
uniform sampler2D texSampler;
texture*/
const float Id = 0.4;
const float Ia = 0.2;

void main() {
	vec3 N = normalize(fragNormal); // surface normal
	vec3 V = - normalize(fragPosition); // eye normalized location
	vec3 specular = vec3(0.0, 0.0, 0.0);
	vec3 directional = vec3(1.0, 1.0, 1.0);
	vec3 texColor = vec3(1.0 ,1.0 ,1.0);
	vec3 ambient = vec3(0.0, 0.0, 0.0);
	vec3 diffuse = vec3(0.0, 0.0, 0.0);
/*pointLight
for (int i = 0; i < numOfPointLights; i++){
	float decay = 1.0/(1.0 + distance(pointLightWorldPosition[i], fragPosition));
	vec3 L = normalize(pointLightWorldPosition[i] - fragPosition);
	vec3 H = normalize(L + V); // halfway ray
	specular += pow(max(dot(N, H), 0.0), sNs) * vKs * decay * pointLightIntensity[i] / float(numOfPointLights);
	ambient += decay * pointLightIntensity[i]/ float(numOfPointLights);
	diffuse += decay * pointLightIntensity[i] * max(0.0, dot(N, L)) / float(numOfPointLights);
}
pointLight*/
/*dirLight
	directional = vec3(0.0, 0.0, 0.0);
	for (int i = 0; i < numOfDirLights; i++){
		directional += max(dot(normalize(-dirLightWorldDirection[i]), N), 0.0) * dirLightIntensity[i] / float(numOfDirLights);
		ambient += normalize(dirLightIntensity[i]) / float(numOfDirLights);
		diffuse += normalize(dirLightIntensity[i]) * max(0.0, dot(N, -dirLightWorldDirection[i])) / float(numOfDirLights);
	}
dirLight*/
/*texture
	texColor = texture2D(texSampler, fragTexCoord).xyz;
texture*/
	ambient *= vKa * Ia;
	diffuse *= vKd * Id;
	vec3 fragColor = (ambient + diffuse + specular + directional) * texColor;
	gl_FragColor = vec4(fragColor, 1);
}