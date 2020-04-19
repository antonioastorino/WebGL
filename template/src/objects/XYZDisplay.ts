import { XYZRenderer } from "../base/XYZRenderer.js";
import { XYZMesh } from "./XYZMesh.js";
import { XYZMaterial } from "./XYZMaterial.js";

export class XYZDisplay extends XYZMesh {
	constructor() {
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
	}
	
	public init = async () => {
		// let texture = await XYZFileLoader.loadImage(this._texFileName);
		let material = new XYZMaterial("");
		material.setTexObject(XYZRenderer.getShadowShaderTexObject());
		material.setVertexCount(6);
		this._materials.push(material);	
	}
}
