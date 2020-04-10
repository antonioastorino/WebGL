import { XYZTextureLoader } from "../base/XYZTextureLoader.js";
import { XYZRenderer } from "../base/XYZRenderer.js";
import { XYZMesh } from "./XYZMesh.js";
import { XYZMaterial } from "./XYZMaterial.js";

export class XYZSprite extends XYZMesh {
	private _texFileName: string;
	constructor(texFileName: string) {
		super();
		this._dimensions = 2;
		this._vertPosArray = [
			-1, -1,
			1, -1,
			1, 1,
			-1, -1,
			1, 1,
			-1, 1,
		];

		this._texCoordArray = [
			0, 0,
			1, 0,
			1, 1,
			0, 0,
			1, 1,
			0, 1
		];
		this._texFileName = texFileName;

	}
	
	public init = async () => {
		let texture = await XYZTextureLoader.loadTexture(this._texFileName);
		let material = new XYZMaterial("");
		material.texObject = XYZRenderer.createTextureObject(texture);
		material.vertexCount = 6;
		this._materials.push(material);	
	}
}
