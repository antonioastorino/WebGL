import { XYZFileLoader } from "../base/XYZFileLoader.js";
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
		let texture = await XYZFileLoader.loadImage(this._texFileName);
		let material = new XYZMaterial("");
		material.setTexObject(XYZRenderer.createTextureObject(texture));
		material.setVertexCount(6);
		this._materials.push(material);
	}
}
