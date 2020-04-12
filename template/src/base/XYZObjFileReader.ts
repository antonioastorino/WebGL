import { Vec3, Vec2, RGB } from "../lib/data-types/XYZVertex.js";
import { XYZMaterial } from "../objects/XYZMaterial.js"
import { XYZRenderer } from "./XYZRenderer.js";
import { XYZFileLoader } from "./XYZFileLoader.js";

export class XYZObjFileReader {
	// read .mtl files and creates a list of materials used by the specified object
	private static readMtlLib = async (filePath: string): Promise<XYZMaterial[]> => {
		let fileText = await XYZFileLoader.loadText(filePath);

		let materials: XYZMaterial[] = [];
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
				switch (line.split(" ")[0]) {
					case "Ns":
						newMaterial.Ns = parseFloat(line.split(" ")[1])
						break;
					case "Ka":
						newMaterial.Ka = makeVec3FromString(line);
						break;
					case "Kd":
						newMaterial.Kd = makeVec3FromString(line);
						break;
					case "Ks":
						newMaterial.Ks = makeVec3FromString(line);
						break;
					case "Ke":
						newMaterial.Ke = makeVec3FromString(line);
						break;
					case "map_Kd":
						let texFileName = line.split("map_Kd ")[1];
						try {
							let texture = await XYZFileLoader.loadImage(texFileName);
							newMaterial.texObject = XYZRenderer.createTextureObject(texture);
						}
						catch {
							throw "File not found";
						}
						break;
				}
			});
			materials.push(newMaterial);
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

		let materials: XYZMaterial[] = [];
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
		
		let posCoordIndex = 0;
		let texCoordIndex = 0;
		let normCoordIndex = 0;

		let vertexArrayBufferIndex = 0;
		let textureArrayBufferIndex = 0;
		let normalArrayBufferIndex = 0;

		lines.forEach(async (line: string) => {
			let lineSplit = line.split(" ");
			switch (lineSplit[0]) {
				case "v":
						posCoordArray[posCoordIndex++] = parseFloat(lineSplit[1]);
						posCoordArray[posCoordIndex++] = parseFloat(lineSplit[2]);
						posCoordArray[posCoordIndex++] = parseFloat(lineSplit[3]);
					break;
				case "vt":
						texCoordArray[texCoordIndex++] = parseFloat(lineSplit[1]);
						texCoordArray[texCoordIndex++] = parseFloat(lineSplit[2]);
					break;
				case "vn":
						normCoordArray[normCoordIndex++] = parseFloat(lineSplit[1]);
						normCoordArray[normCoordIndex++] = parseFloat(lineSplit[2]);
						normCoordArray[normCoordIndex++] = parseFloat(lineSplit[3]);
					break;
				case "usemtl":
					if (matCount > -1) {
						materials[matCount].vertexCount = matVertexCount;
					}
					matCount++;
					if (materials[matCount].name != line.split(" ")[1]) {
						throw "Material not matching object descriptor"
					}
					materials[matCount].startIndex = matStartIndex;
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
							vertexArrayBuffer[vertexArrayBufferIndex++] = posCoordArray[vIndex];
							vertexArrayBuffer[vertexArrayBufferIndex++] = posCoordArray[vIndex + 1];
							vertexArrayBuffer[vertexArrayBufferIndex++] = posCoordArray[vIndex + 2];
						// Check for texture and normals
						if (faceIndices.length > 1) {
							if (faceIndices[1] != "") { // there is texture
								let tIndex = (parseInt(faceIndices[1]) - 1) * 2;
									textureArrayBuffer[textureArrayBufferIndex++] = texCoordArray[tIndex];
									textureArrayBuffer[textureArrayBufferIndex++] = texCoordArray[tIndex+1];
							}
							if (faceIndices.length == 3) { // there are normals
								let nIndex = (parseInt(faceIndices[2]) - 1) * 3;
									normalArrayBuffer[normalArrayBufferIndex++] = normCoordArray[nIndex];
									normalArrayBuffer[normalArrayBufferIndex++] = normCoordArray[nIndex+1];
									normalArrayBuffer[normalArrayBufferIndex++] = normCoordArray[nIndex+2];
							}
						}
					}
				default:
					break;
			}
		});
		if (materials.length > 0) {
			materials[matCount].vertexCount = matVertexCount;
		}
		else {
			// do something in case no material name is specified
			throw "Material name not found or object material missing"
		}
		return {
			materials: materials,
			vertexArrayBuffer: vertexArrayBuffer,
			textureArrayBuffer: textureArrayBuffer,
			normalArrayBuffer: normalArrayBuffer
		};
	}
}