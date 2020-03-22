

import { XYZRenderer } from "./base/XYZRenderer.js"
import { XYZEngine } from "./base/XYZEngine.js"
import { XYZMatrix } from "../lib/Math/XYZMatrix.js";
import { XYZVector } from "../lib/Math/XYZVector.js";
import { XYZMatLab } from "../lib/Math/XYZMatLab.js";
import { XYZQuaternion } from "../lib/Math/XYZQuaternion.js";
import { XYZTriangle } from "../lib/Objects/XYZTriangle.js";
import { XYZSprite } from "../lib/Objects/XYZSprite.js";
import { XYZShader } from "./base/XYZShader.js";
import { XYZTime } from "./base/XYZTime.js";

export async function main() {
	console.log("Hello Main");
	XYZEngine.init();
	XYZRenderer.viewMatrix = XYZMatLab.makeLookAtMatrix(new XYZQuaternion(0, 0, 1, 0), new XYZVector([0, 0, 5]));

	let basicShader = await XYZEngine.makeShader("basic");
	let spriteShader = await XYZEngine.makeShader("2D");
	
	let triangle1 = new XYZTriangle();
	let sprite1 = new XYZSprite('wooden-wall.jpg');
	
	triangle1.attachShader(basicShader);
	sprite1.attachShader(spriteShader);
	
	sprite1.setPosition({ x: 0, y: 0, z: 0 })
	sprite1.setScale({x:0.3, y:0.3, z:1})
	triangle1.setPosition({ x: 3, y: 0, z: -1 });
	triangle1.setScale({ x: 3, y: 1, z: 1 })
	
	let angle = 0;
	let rps = 0.1
	let loop = () => {
		angle += XYZTime.deltaTime * 0.36 * rps;
		// triangle1.setOrientation({ x: 0, y: 0, z: 1, angle: angle });
		sprite1.setOrientation(angle);
		// triangle1.setPosition({ x: 2 * Math.cos(angle * Math.PI / 60), y: 2 * Math.sin(angle * Math.PI / 60), z: -2 });
		XYZRenderer.gl.clear(XYZRenderer.gl.COLOR_BUFFER_BIT | XYZRenderer.gl.DEPTH_BUFFER_BIT);
		XYZRenderer.drawAll()
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
}