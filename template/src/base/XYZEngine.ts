import { XYZRenderer } from "./XYZRenderer.js"
import { XYZShader } from "./XYZShader.js"
import { XYZLightSource } from "../Objects/XYZLightSource";

export class XYZEngine {
	private static _initialized = false;
	
	public static init = () => {
		XYZEngine._initialized = true;
		XYZRenderer.init();
	}

	static makeShader = async (
		shaderType: string,
		lightSources?: XYZLightSource[]):Promise<XYZShader> => {
		if (XYZEngine._initialized) {
			let shader = new XYZShader(shaderType);
			// attach light sources to shader
			if (lightSources != undefined) {
				lightSources.forEach((lightSource: XYZLightSource) => {
					shader.addLightSource(lightSource);
				})
			}
			await shader.initialize();
			return shader;
		}
		throw "Engine not initialized"
	}

	
}