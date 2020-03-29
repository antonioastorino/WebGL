

import { XYZRenderer } from "./base/XYZRenderer.js"
import { XYZEngine } from "./base/XYZEngine.js"
import { XYZMatrix } from "../lib/Math/XYZMatrix.js";
import { XYZVector } from "../lib/Math/XYZVector.js";
import { XYZMatLab } from "../lib/Math/XYZMatLab.js";
import { XYZQuaternion } from "../lib/Math/XYZQuaternion.js";
import { XYZTriangle } from "../lib/Objects/XYZTriangle.js";
import { XYZSprite } from "../lib/Objects/XYZSprite.js";
import { XYZModel } from "../lib/Objects/XYZModel.js";

export async function main() {
	console.log("Hello Main");
	XYZEngine.init();
	XYZRenderer.viewMatrix = XYZMatLab.makeLookAtMatrix(new XYZQuaternion(0, 0, 1, 0), new XYZVector([0, 0, 5]));

	let texturedShader = await XYZEngine.makeShader("texture");
	let spriteShader = await XYZEngine.makeShader("2D");
	let basicShader = await XYZEngine.makeShader("basic");

	//
	// TODO: init() missing to triangle
	// Need to check for initialization
	// Triangle 1
	let triangle1 = new XYZTriangle();
	triangle1.attachShader(basicShader);
	triangle1.setPosition({ x: 1, y: 0, z: 0 });
	triangle1.setScale({ x: 0.3, y: 0.3, z: 1 })

	// Triangle 2
	let triangle2 = new XYZTriangle();
	triangle2.attachShader(basicShader);
	triangle2.setPosition({ x: 1, y: 2, z: 0 });
	triangle2.setScale({ x: 0.5, y: 0.3, z: 1 })

	let sprite1 = new XYZSprite('wooden-wall.jpg');
	await sprite1.init();
	sprite1.attachShader(spriteShader);
	sprite1.setPosition({ x: 0.4, y: 0.4, z: 0 })
	sprite1.setScale({ x: 0.3, y: 0.3, z: 1 })
	
	let model1 = new XYZModel("./assets/meshes/", "model1.obj", "wood_old.jpg");
	await model1.init();
	model1.attachShader(texturedShader);
	model1.setAngularVel({ x: 1, y: 1, z: 1, speed: 0.05 });
	triangle2.parent = model1;



	// sprite1.setAngularVel(0.01);
	let loop = () => {
		// triangle1.setOrientation({ x: 0, y: 0, z: 1, angle: angle });
		// triangle1.setPosition({ x: 2 * Math.cos(angle * Math.PI / 60), y: 2 * Math.sin(angle * Math.PI / 60), z: -2 });
		XYZRenderer.gl.clear(XYZRenderer.gl.COLOR_BUFFER_BIT | XYZRenderer.gl.DEPTH_BUFFER_BIT);
		XYZRenderer.drawAll()
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
}