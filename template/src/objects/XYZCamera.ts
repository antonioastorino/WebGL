import { XYZNode } from "./XYZNode.js";
import { XYZRenderer } from "../base/XYZRenderer.js"

export class XYZCamera extends XYZNode {
	constructor() {
		super();
		this._dimensions = 3;
		XYZRenderer.addCamera(this);
	}
}