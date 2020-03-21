

import { XYZRenderer } from "./base/XYZRenderer.js"
import { XYZMatrix } from "../lib/Math/XYZMatrix.js";
import { XYZVector } from "../lib/Math/XYZVector.js";
import { XYZMatLab } from "../lib/Math/XYZMatLab.js";
import { XYZQuaternion } from "../lib/Math/XYZQuaternion.js";
import { XYZTriangle } from "../lib/Objects/XYZTriangle.js";
import { XYZSprite } from "../lib/Objects/XYZSprite.js";
import { XYZShader } from "./base/XYZShader.js";

export async function main() {
	console.log("Hello Main");
	XYZRenderer.init();

	let basicShader = new XYZShader("basic"); await basicShader.initialize();
	let spriteShader = new XYZShader("2D"); await spriteShader.initialize();

	XYZRenderer.viewMatrix = XYZMatLab.makeLookAtMatrix(new XYZQuaternion(0, 0, 1, 0), new XYZVector([0, 0, 5]));

	let triangle1 = new XYZTriangle();
	triangle1.attachShader(basicShader);
	let sprite1 = new XYZSprite('wooden-wall.jpg');
	sprite1.setScale({x:0.3, y:0.3, z:1})
	sprite1.attachShader(spriteShader);

	let angle = 0;
	let rps = 0.1
	triangle1.setPosition({ x: 3, y: 0, z: -1 });
	sprite1.setPosition({ x: 0, y: 0, z: 0 })
	triangle1.setScale({ x: 3, y: 1, z: 1 })
	let loop = () => {
		angle = performance.now() * 0.36 * rps;
		triangle1.setOrientation({ x: 0, y: 0, z: 1, angle: angle });
		// sprite1.setOrientation(angle);
		triangle1.setPosition({ x: 2 * Math.cos(angle * Math.PI / 60), y: 2 * Math.sin(angle * Math.PI / 60), z: -2 });
		XYZRenderer.gl.clear(XYZRenderer.gl.COLOR_BUFFER_BIT | XYZRenderer.gl.DEPTH_BUFFER_BIT);
		XYZRenderer.drawAll()
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
}