

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
	let spriteShader = new XYZShader("2D"); await spriteShader.initialize();
	
	XYZRenderer.viewMatrix =  XYZMatLab.makeLookAtMatrix(new XYZQuaternion(0, 0, 1, 0), new XYZVector([0, 0, 5]));
	function updateAspectRatio() {
		XYZRenderer._canvas.width  = window.innerWidth;
		XYZRenderer._canvas.height = window.innerHeight;
		XYZRenderer.gl.viewport(0,0,window.innerWidth, window.innerHeight);
		XYZRenderer.projMatrix =  XYZMatLab.makePerspectiveMatrix(XYZRenderer.aspectRatio, 55, 0.1, 1000);
	}
	updateAspectRatio()
	window.addEventListener('resize', updateAspectRatio);


	let triangle1 = new XYZTriangle();
	triangle1.attachShader(basicShader);
	let triangle2 = new XYZTriangle();
	triangle2.attachShader(spriteShader);

	let angle = 0;
	let rps = 0.5
	triangle1.setPosition({ x: 3, y: 0, z: -1 });
	triangle2.setPosition({ x: 0, y: 2, z: 1 })
	triangle1.setScale({ x: 3, y: 1, z: 1 })
	let loop = () => {
		angle = performance.now() * 0.36 * rps;
		triangle1.setOrientation({ x: 0, y: 0, z: 1, angle: angle });
		triangle2.setOrientation({ x: 1, y: 0, z: 0, angle: angle });
		triangle1.setPosition({x: 3*Math.cos(angle * Math.PI / 60), y: 2*Math.sin(angle * Math.PI / 60), z: -3*Math.cos(angle * Math.PI / 360)});
		XYZRenderer.gl.clear(XYZRenderer.gl.COLOR_BUFFER_BIT | XYZRenderer.gl.DEPTH_BUFFER_BIT);
		XYZRenderer.drawAll()
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
}