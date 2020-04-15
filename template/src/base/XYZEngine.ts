import { XYZRenderer } from "./XYZRenderer.js"
import { XYZShader } from "./XYZShader.js"
import { XYZLightSource } from "../objects/XYZLightSource";
import { XYZKeyboard } from "../inputs/XYZKeyboard.js";
import { XYZTime } from "./XYZTime.js";

export class XYZEngine {
	private static _initialized = false;

	public static init = async (keyboardConfigFile: string) => {
		XYZEngine._initialized = true;
		await XYZKeyboard.init(keyboardConfigFile);
		XYZRenderer.init();
	}

	static makeShader = async (
		shaderType: string,
		lightSources: XYZLightSource[],
		enableTexture: boolean
	): Promise<XYZShader> => {
		if (XYZEngine._initialized) {
			let shader = new XYZShader(shaderType);
			if (enableTexture) shader.enableTexture();
			// attach light sources to shader
			if (lightSources.length > 0) {
				lightSources.forEach((lightSource: XYZLightSource) => {
					shader.addLightSource(lightSource);
				})
			}
			await shader.initialize();
			return shader;
		}
		throw "Engine not initialized"
	}

	public static run () {
		if (XYZRenderer.getActiveCameraNumber() < 0) {
			throw "No camera defined";
		}
		let loop = () => {
			let deltaTime = XYZTime.deltaTime;
			XYZRenderer.updateAll(deltaTime);
			XYZRenderer.drawAll();
			XYZRenderer.resetAll();
			requestAnimationFrame(loop);
		}
		requestAnimationFrame(loop);
	}


}