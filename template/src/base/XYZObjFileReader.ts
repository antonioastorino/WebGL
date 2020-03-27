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
		let faceArray: { v: number, vt: number, vn: number }[] = [];

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
					if (faceIndices.length == 3) {
						let vIndex = parseInt(faceIndices[0]);
						let tIndex = parseInt(faceIndices[0]);
						let nIndex = parseInt(faceIndices[0]);
						vertexArrayBuffer = vertexArrayBuffer.concat([
							vertexArray[vIndex - 1].x,
							vertexArray[vIndex - 1].y,
							vertexArray[vIndex - 1].z,
						])
						normalArrayBuffer = normalArrayBuffer.concat([
							vertexArray[nIndex - 1].x,
							vertexArray[nIndex - 1].y,
							vertexArray[nIndex - 1].z,
						])
						textureArrayBuffer = textureArrayBuffer.concat([
							vertexArray[tIndex - 1].x,
							vertexArray[tIndex - 1].y,
							vertexArray[tIndex - 1].z,
						])
					}
				})
				// faceArray.push({
				// 	x: parseFloat(normalText[1]),
				// 	y: parseFloat(normalText[2]),
				// 	z: parseFloat(normalText[3])
				// });
			}
		});
		return {
			vertexArrayBuffer: vertexArrayBuffer,
			textureArrayBuffer: vertexArrayBuffer,
			normalArrayBuffer: normalArrayBuffer
		};
	}
}