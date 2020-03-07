export class XYZShaderReader {
	public static load = async (vertexShaderPath: string, fragmentShaderPath: string): Promise<{ vertexShaderText: string, fragmentShaderText: string }> => {
		const vShaderText = await $.get(vertexShaderPath);
		const fShaderText = await $.get(fragmentShaderPath);

		return { vertexShaderText: vShaderText, fragmentShaderText: fShaderText }
	}
}