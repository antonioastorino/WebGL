import { Vec3 } from "../DataTypes/XYZVertex.js";

export class XYZMtlFileReader {
	public static load = async (fileDir: string, fileName: string): Promise<{
		Ka: Vec3
	}> => {
		const mtlLibFileText = await $.get(fileDir + fileName);
		var lines = mtlLibFileText.split('\n');
		let Ka: Vec3 = { x: 1, y: 1, z: 1 };
		lines.forEach((line: string) => {
			if (line.startsWith("Ka ")) {
				let kaText = line.split(" ");
				Ka.x = parseFloat(kaText[1]),
					Ka.y = parseFloat(kaText[2]),
					Ka.z = parseFloat(kaText[3])
			};
		})
		return {
			Ka: Ka
		};
	}
}