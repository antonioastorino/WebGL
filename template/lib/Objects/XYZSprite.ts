import { XYZMesh } from "./XYZMesh.js";

export class XYZSprite extends XYZMesh {
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

		this._vertColorArray = [
			1.0, 1.0, 1.0,
			1.0, 1.0, 1.0,
			0.5, 0.5, 0.5,
			1.0, 1.0, 1.0,
			1.0, 1.0, 1.0,
			0.5, 0.5, 0.5
		];
	}
}