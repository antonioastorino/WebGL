import { XYZNode } from "./XYZNode.js";
import { XYZRenderer } from "../base/XYZRenderer.js"

export class XYZCamera extends XYZNode {
	constructor() {
		super();
		XYZRenderer.addCamera(this);
	}
}