import { XYZTextFileReader } from "./XYZTextFileReader.js";

export class XYZShaderReader {
	public static load = async (vertexShaderPath: string, fragmentShaderPath: string): Promise<{ vertexShaderText: string, fragmentShaderText: string }> => {
		const vShaderText = await XYZTextFileReader.load(vertexShaderPath);
		const fShaderText = await XYZTextFileReader.load(fragmentShaderPath);

		return { vertexShaderText: vShaderText, fragmentShaderText: fShaderText }
	}
}