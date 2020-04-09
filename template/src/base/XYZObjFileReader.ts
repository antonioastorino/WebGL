import { Vec3, Vec2, RGB } from "../DataTypes/XYZVertex.js";
import { XYZMaterial } from "../../lib/Objects/XYZMaterial.js"
import { XYZRenderer } from "./XYZRenderer.js";
import { XYZTextureLoader } from "./XYZTextureLoader.js";

export class XYZObjFileReader {
	// read .mtl files and creates a list of materials used by the specified object
	private static readMtlLib = async (filePath: string): Promise<XYZMaterial[]> => {
		let fileText = await $.get(filePath);
		let materials: XYZMaterial[] = [];
		let materialText = fileText.split("newmtl ");
		let makeVec3FromString = (str:string): RGB => {
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
							let texture = await XYZTextureLoader.loadTexture(texFileName);
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
		const objFileText = await $.get(fileDir + fileName);
		var lines = objFileText.split('\n');

		let vertexArray: Vec3[] = [];
		let textureArray: Vec2[] = [];
		let normalArray: Vec3[] = [];
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

		lines.forEach(async (line: string) => {
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
			else if (line.startsWith("usemtl ")) {
				if (matCount > -1) {
					materials[matCount].vertexCount = matVertexCount;
				}
				matCount ++;
				if (materials[matCount].name != line.split(" ")[1]) {
					throw "Material not matching object descriptor"
				}
				materials[matCount].startIndex = matStartIndex;
				matVertexCount = 0;
			}
			else if (line.startsWith("f ")) {
				line = line.replace("f ", "");
				let faceText = line.split(" ")
				faceText.forEach((vertex: string) => {
					matVertexCount += 1;
					matStartIndex += 1;
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