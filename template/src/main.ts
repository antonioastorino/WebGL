

import { XYZRenderer } from "./base/XYZRenderer.js"
import { XYZMatrix } from "../lib/Math/XYZMatrix.js";
import { XYZVector } from "../lib/Math/XYZVector.js";
import { XYZMatLab } from "../lib/Math/XYZMatLab.js";
import { XYZQuaternion } from "../lib/Math/XYZQuaternion.js";
import { XYZTriangle } from "../lib/Objects/XYZTriangle.js";
import { XYZShader } from "./base/XYZShader.js";

export async function main() {
	console.log("Hello Main");
	XYZRenderer.init();
	
	let basicShader = new XYZShader("basic"); await basicShader.initialize();
	let testShader = new XYZShader("test"); await testShader.initialize();
	
	XYZRenderer.viewMatrix =  XYZMatLab.makeLookAtMatrix(new XYZQuaternion(0, 0, 1, 0), new XYZVector([0, 0, 5]));
	XYZRenderer.projMatrix =  XYZMatLab.makePerspectiveMatrix(XYZRenderer.aspectRatio, 55, 0.1, 1000);
	
	let triangle1 = new XYZTriangle();
	triangle1.attachShader(basicShader);
	let triangle2 = new XYZTriangle();
	triangle2.attachShader(testShader);

	let angle = 0;
	let rps = 0.5
	angle = performance.now() * 0.36 * rps;
	triangle1.setPosition(1, 1, -1);
	let loop = () => {
		XYZRenderer.gl.clear(XYZRenderer.gl.COLOR_BUFFER_BIT | XYZRenderer.gl.DEPTH_BUFFER_BIT);
		XYZRenderer.drawAll()
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
}