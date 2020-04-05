

import { XYZRenderer } from "./base/XYZRenderer.js"
import { XYZEngine } from "./base/XYZEngine.js"
import { XYZMatrix } from "../lib/Math/XYZMatrix.js";
import { XYZVector } from "../lib/Math/XYZVector.js";
import { XYZMatLab } from "../lib/Math/XYZMatLab.js";
import { XYZQuaternion } from "../lib/Math/XYZQuaternion.js";
import { XYZTriangle } from "../lib/Objects/XYZTriangle.js";
import { XYZSprite } from "../lib/Objects/XYZSprite.js";
import { XYZModel } from "../lib/Objects/XYZModel.js";
import { XYZSun } from "../lib/Objects/XYZLightSource.js";

export async function main() {
	console.log("Hello Main");
	XYZEngine.init();
	XYZRenderer.mView = XYZMatLab.makeLookAtMatrix(new XYZQuaternion(0, 0, 1, 0), new XYZVector([0, 0, 10]));

	let pointLight1 = new XYZSun();
	pointLight1.position.x = 2;
	pointLight1.position.y = 5;
	pointLight1.position.z = 2;
	pointLight1.rgbIntensity.r = 3;

	let pointLight2 = new XYZSun();
	pointLight2.position.x = -6;
	pointLight2.position.y = 10;
	pointLight2.position.z = 3;
	pointLight2.rgbIntensity.g = 4;


	let lightShader = await XYZEngine.makeShader("test", [pointLight1, pointLight2]);
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
	triangle2.setPosition({ x: 0, y: 2, z: 0 });
	triangle2.setScale({ x: 0.5, y: 0.3, z: 1 })

	let sprite1 = new XYZSprite('wooden-wall.jpg');
	await sprite1.init();
	sprite1.attachShader(spriteShader);
	sprite1.setPosition({ x: 0.6, y: 0.6, z: 0 })
	sprite1.setScale({ x: 0.3, y: 0.3, z: 1 })
	
	let model1 = new XYZModel("./assets/meshes/", "sphere-smooth.obj");
	await model1.init();
	model1.attachShader(lightShader);
	model1.setAngularVel({ x: 1, y: 1, z: 1, speed: 0.05 });
	triangle2.parent = model1;

	let plane1 = new XYZModel("./assets/meshes/", "xz-plane.obj", "wood_old.jpg");
	await plane1.init();
	plane1.scale.x = 5;
	plane1.scale.z = 5;
	plane1.position.y = -2;
	plane1.setAngularVel({x: 1, y: 0.1, z: 0, speed: 0.04});
	plane1.attachShader(lightShader);

	// sprite1.setAngularVel(0.01);
	let loop = () => {
		XYZRenderer.gl.clear(XYZRenderer.gl.COLOR_BUFFER_BIT | XYZRenderer.gl.DEPTH_BUFFER_BIT);
		XYZRenderer.drawAll()
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
}