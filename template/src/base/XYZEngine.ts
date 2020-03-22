import { XYZRenderer } from "./XYZRenderer.js"
import { XYZShader } from "./XYZShader.js"

export class XYZEngine {
	private static _initialized = false;
	
	public static init = () => {
		XYZEngine._initialized = true;
		XYZRenderer.init();
	}

	static makeShader = async (shaderType: string): Promise<XYZShader> => {
		if (XYZEngine._initialized) {
			let shader = new XYZShader(shaderType); await shader.initialize();
			return shader;
		}
		throw "Engine not initialized"
	}

	
}