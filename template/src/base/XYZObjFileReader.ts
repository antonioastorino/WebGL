import { Vec3, Vec2 } from "../DataTypes/XYZVertex.js";

export class XYZObjFileReader {
	public static load = async (filePath: string): Promise<{
		vertexArrayBuffer: number[],
		textureArrayBuffer: number[],
		normalArrayBuffer: number[]
	}> => {
		const objFileText = await $.get(filePath);
		var lines = objFileText.split('\n');

		let vertexArray: Vec3[] = [];
		let textureArray: Vec2[] = [];
		let normalArray: Vec3[] = [];

		let vertexArrayBuffer: number[] = [];
		let textureArrayBuffer: number[] = [];
		let normalArrayBuffer: number[] = [];

		lines.forEach((line: string) => {
			if (line.startsWith("v ")) {
				let vertexText = line.split(" ")
				vertexArray.push({
					x: parseFloat(vertexText[1]),
					y: parseFloat(vertexText[2]),
					z: parseFloat(vertexText[3])
				});
			}
			else if (line.startsWith("vt ")) {
				let textureText = line.split(" ")
				textureArray.push({
					x: parseFloat(textureText[1]),
					y: parseFloat(textureText[2])
				});
			}
			else if (line.startsWith("vn ")) {
				let normalText = line.split(" ")
				normalArray.push({
					x: parseFloat(normalText[1]),
					y: parseFloat(normalText[2]),
					z: parseFloat(normalText[3])
				});
			}
			else if (line.startsWith("f ")) {
				line = line.replace("f ", "");
				let faceText = line.split(" ")
				faceText.forEach((vertex: string) => {
					let faceIndices = vertex.split("/");
					// Load vertex coordinate array
					let vIndex = parseInt(faceIndices[0]) - 1;
					vertexArrayBuffer = vertexArrayBuffer.concat([
						vertexArray[vIndex].x,
						vertexArray[vIndex].y,
						vertexArray[vIndex].z,
					])
					// Check for texture and normals
					if (faceIndices.length > 1) {
						if (faceIndices[1] != "") { // there is texture
							let tIndex = parseInt(faceIndices[1]) - 1;
							textureArrayBuffer = textureArrayBuffer.concat([
								textureArray[tIndex].x,
								textureArray[tIndex].y
							])
						}
						if (faceIndices.length == 3) { // there are normals
							let nIndex = parseInt(faceIndices[2]) - 1;
							normalArrayBuffer = normalArrayBuffer.concat([
								normalArray[nIndex].x,
								normalArray[nIndex].y,
								normalArray[nIndex].z,
							])
						}
					}
				})
			}
		});
		return {
			vertexArrayBuffer: vertexArrayBuffer,
			textureArrayBuffer: vertexArrayBuffer,
			normalArrayBuffer: normalArrayBuffer
		};
	}
}