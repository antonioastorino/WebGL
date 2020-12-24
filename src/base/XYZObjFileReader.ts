import { RGB } from "../lib/data-types/XYZVertex.js";
import { XYZMaterial } from "../objects/XYZMaterial.js"
import { XYZRenderer } from "./XYZRenderer.js";
import { XYZFileLoader } from "./XYZFileLoader.js";

export class XYZObjFileReader {
	// read .mtl files and creates a list of materials used by the specified object
	private static readMtlLib = async (filePath: string): Promise<{ [id: string]: XYZMaterial }> => {
		let fileText = await XYZFileLoader.loadText(filePath);

		let materials: { [id: string]: XYZMaterial } = {};
		let materialText = fileText.split("newmtl ");
		let makeVec3FromString = (str: string): RGB => {
			let valuesText = str.split(" ");
			return {
				r: parseFloat(valuesText[1]),
				g: parseFloat(valuesText[2]),
				b: parseFloat(valuesText[3]),
			}
		}
		for (let i = 1; i < materialText.length; i++) {
			let lines = materialText[i].split("\n");
			let newMaterial = new XYZMaterial(lines[0]);
			lines.forEach(async (line: string) => {
				let key = line.split(" ")[0];
				switch (key) {
					case "Ns":
						newMaterial.setParam(key, parseFloat(line.split(" ")[1]));
						break;
					case "Ka":
					case "Kd":
					case "Ks":
					case "Ke":
						newMaterial.setParam(key, makeVec3FromString(line));
						break;
					case "map_Kd":
						let texFileName = line.split("map_Kd ")[1];
						try {
							let texture = await XYZFileLoader.loadImage(texFileName);
							newMaterial.setTexObject(XYZRenderer.createTextureObject(texture));
						}
						catch {
							throw "File not found";
						}
						break;
				}
			});
			materials[lines[0]] = newMaterial;
		}
		return materials;
	}

	public static load = async (fileDir: string, fileName: string): Promise<{
		materials: XYZMaterial[],
		vertexArrayBuffer: number[],
		textureArrayBuffer: number[],
		normalArrayBuffer: number[]
	}> => {
		const objFileText = await XYZFileLoader.loadText(fileDir + fileName);
		var lines = objFileText.split('\n');

		let materials: { [id: string]: XYZMaterial } = {};
		let matStartIndex = 0;
		let matVertexCount = 0;
		let matCount = -1;

		let vertexArrayBuffer: number[] = [];
		let textureArrayBuffer: number[] = [];
		let normalArrayBuffer: number[] = [];

		for (let i = 0; !lines[i].startsWith("v "); i++) { // scan file until find first vertex
			if (lines[i].startsWith("mtllib ")) {
				materials = await XYZObjFileReader.readMtlLib(fileDir + "../materials/" + lines[i].split(" ")[1]);
				break;
			}
		}

		let posCoordArray: number[] = [];
		let texCoordArray: number[] = [];
		let normCoordArray: number[] = [];
		let matName = "";

		lines.forEach(async (line: string) => {
			let lineSplit = line.split(" ");
			switch (lineSplit[0]) {
				case "v":
					posCoordArray.push(parseFloat(lineSplit[1]));
					posCoordArray.push(parseFloat(lineSplit[2]));
					posCoordArray.push(parseFloat(lineSplit[3]));
					break;
				case "vt":
					texCoordArray.push(parseFloat(lineSplit[1]));
					texCoordArray.push(parseFloat(lineSplit[2]));
					break;
				case "vn":
					normCoordArray.push(parseFloat(lineSplit[1]));
					normCoordArray.push(parseFloat(lineSplit[2]));
					normCoordArray.push(parseFloat(lineSplit[3]));
					break;
				case "usemtl":
					if (matCount > -1) {
						materials[matName].setVertexCount(matVertexCount);
					}
					matName = lineSplit[1];
					materials[matName].startIndex = matStartIndex;
					matCount++;

					matVertexCount = 0;
					break;
				case "f":
					for (var i = 1; i < 4; i++) {
						let vertex = lineSplit[i];
						matVertexCount += 1;
						matStartIndex += 1;
						let faceIndices = vertex.split("/");
						// Load vertex coordinate array
						let vIndex = (parseInt(faceIndices[0]) - 1) * 3;
						vertexArrayBuffer.push(posCoordArray[vIndex]);
						vertexArrayBuffer.push(posCoordArray[vIndex + 1]);
						vertexArrayBuffer.push(posCoordArray[vIndex + 2]);
						// Check for texture and normals
						if (faceIndices.length > 1) {
							if (faceIndices[1] != "") { // there is texture
								let tIndex = (parseInt(faceIndices[1]) - 1) * 2;
								textureArrayBuffer.push(texCoordArray[tIndex]);
								textureArrayBuffer.push(texCoordArray[tIndex + 1]);
							}
							if (faceIndices.length == 3) { // there are normals
								let nIndex = (parseInt(faceIndices[2]) - 1) * 3;
								normalArrayBuffer.push(normCoordArray[nIndex]);
								normalArrayBuffer.push(normCoordArray[nIndex + 1]);
								normalArrayBuffer.push(normCoordArray[nIndex + 2]);
							}
						}
					}
					for (var j = 1; j < lineSplit.length - 3; j++) {
						let indices = [j, j + 2, j + 3];
						indices.forEach(i => {
							let vertex = lineSplit[i];
							matVertexCount += 1;
							matStartIndex += 1;
							let faceIndices = vertex.split("/");
							// Load vertex coordinate array
							let vIndex = (parseInt(faceIndices[0]) - 1) * 3;
							vertexArrayBuffer.push(posCoordArray[vIndex]);
							vertexArrayBuffer.push(posCoordArray[vIndex + 1]);
							vertexArrayBuffer.push(posCoordArray[vIndex + 2]);
							// Check for texture and normals
							if (faceIndices.length > 1) {
								if (faceIndices[1] != "") { // there is texture
									let tIndex = (parseInt(faceIndices[1]) - 1) * 2;
									textureArrayBuffer.push(texCoordArray[tIndex]);
									textureArrayBuffer.push(texCoordArray[tIndex + 1]);
								}
								if (faceIndices.length == 3) { // there are normals
									let nIndex = (parseInt(faceIndices[2]) - 1) * 3;
									normalArrayBuffer.push(normCoordArray[nIndex]);
									normalArrayBuffer.push(normCoordArray[nIndex + 1]);
									normalArrayBuffer.push(normCoordArray[nIndex + 2]);
								}
							}

						})
					}
				default:
					break;
			}
		});
		if (Object.keys(materials).length == 0) {
			throw "Material name not found or object material missing"
		}
		materials[matName].setVertexCount(matVertexCount);
		let materialArray: XYZMaterial[] = [];
		Object.keys(materials).forEach((name: string) => {
			materialArray.push(materials[name]);
		})

		return {
			materials: materialArray,
			vertexArrayBuffer: vertexArrayBuffer,
			textureArrayBuffer: textureArrayBuffer,
			normalArrayBuffer: normalArrayBuffer
		};
	}
}