

import { XYZRenderer } from "./base/XYZRenderer.js"
import { XYZMatrix } from "../lib/Math/XYZMatrix.js";
import { XYZVector } from "../lib/Math/XYZVector.js";
import { XYZMatLab } from "../lib/Math/XYZMatLab.js";
import { XYZQuaternion } from "../lib/Math/XYZQuaternion.js";
import { XYZTriangle } from "../lib/Objects/XYZTriangle.js";
import { XYZBasicShader } from "./base/XYZShader.js";

export async function main() {
	console.log("Hello Main");
	XYZRenderer.init();
	
	let basicShader = new XYZBasicShader();
	await basicShader.initialize();
	
	XYZRenderer.viewMatrix =  XYZMatLab.makeLookAtMatrix(new XYZQuaternion(0, 0, 1, 0), new XYZVector([0, 0, 5]));
	XYZRenderer.projMatrix =  XYZMatLab.makePerspectiveMatrix(XYZRenderer.aspectRatio, 55, 0.1, 1000);
	basicShader.enableAttributes();
	
	let triangle1 = new XYZTriangle({ x: 0, y: 0, z: 0 }, { r: 0, g: .3, b: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
	triangle1.attachShader(basicShader);

	let angle = 0;
	let rps = 0.5
	let modelMatrix: XYZMatrix;
	let loop = () => {
		angle = performance.now() / 1000 * 360 * rps;
		modelMatrix = XYZMatLab.makeRotationMatrix(angle, 0, 1, 0);
		basicShader.mMVP = <XYZMatrix>XYZRenderer.worldMatrix.multiplyBy(modelMatrix);
		XYZRenderer.gl.clear(XYZRenderer.gl.COLOR_BUFFER_BIT | XYZRenderer.gl.DEPTH_BUFFER_BIT);
		triangle1.draw();
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
}