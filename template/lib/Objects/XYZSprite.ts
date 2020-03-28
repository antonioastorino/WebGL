import { XYZMesh } from "./XYZMesh.js";

export class XYZSprite extends XYZMesh {
	constructor(texFileName: string) {
		super();
		this._texFileName = texFileName;
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
		await this.loadTexture();
	}
}
