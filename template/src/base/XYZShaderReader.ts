import { XYZFileLoader } from "./XYZFileLoader.js";

export class XYZShaderReader {
	public static load = async (vertexShaderPath: string, fragmentShaderPath: string): Promise<{ vertexShaderText: string, fragmentShaderText: string }> => {
		const vShaderText = await XYZFileLoader.loadText(vertexShaderPath);
		const fShaderText = await XYZFileLoader.loadText(fragmentShaderPath);

		return { vertexShaderText: vShaderText, fragmentShaderText: fShaderText }
	}
}