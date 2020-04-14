import { XYZEngine } from "./base/XYZEngine.js"
import { XYZTriangle } from "./objects/XYZTriangle.js";
import { XYZSprite } from "./objects/XYZSprite.js";
import { XYZModel } from "./objects/XYZModel.js";
import { XYZPoint, XYZSun } from "./objects/XYZLightSource.js";
import { XYZCamera } from "./objects/XYZCamera.js";

export async function main() {
	console.log("Hello Main");
	await XYZEngine.init("../../etc/keyboard.json");

	let camera1 = new XYZCamera();
	camera1.setPosition(0, 10, 30);
	camera1.makePlayer();

	let pointLight1 = new XYZPoint();
	pointLight1.setPosition(10, 20, 30);
	pointLight1.setRgbIntensity(40, 40, 40);

	let pointLight2 = new XYZPoint();
	pointLight2.setPosition(-10, 10, -30);
	pointLight2.setRgbIntensity(40, 25, 40);

	let sun1 = new XYZSun();
	sun1.setDirection(-1, -1, 0);
	sun1.setRgbIntensity(0.2, 0.2, 0.2);

	// let lightShader = await XYZEngine.makeShader("3D", [sun1, pointLight2], true);
	let lightShader2 = await XYZEngine.makeShader("3D", [sun1, pointLight1, pointLight2], false);
	let spriteShader = await XYZEngine.makeShader("2D", [], true);
	// let basicShader = await XYZEngine.makeShader("basic", [], false);



	let sprite1 = new XYZSprite('wooden-wall.jpg');
	await sprite1.init();
	sprite1.attachShader(spriteShader);
	sprite1.setPosition(0.8, 0.8, 0)
	sprite1.setScale(0.2, 0.2, 1)

	let cube1 = new XYZModel("./assets/meshes/", "cube.obj");
	await cube1.init();
	cube1.setScale(10, 10, 10);
	cube1.setPosition(0, 10, 0);
	cube1.attachShader(lightShader2);

	let cube2 = new XYZModel("./assets/meshes/", "cube2.obj");
	await cube2.init();
	cube2.setScale(10, 10, 10);
	cube2.setPosition(10, 10, 0);
	// cube2.setLinearVelocity(2,0,0);
	cube2.attachShader(lightShader2);
	cube2.setParent(cube1);

	let cube3 = new XYZModel("./assets/meshes/", "cube.obj");
	await cube3.init();
	cube3.setScale(5, 5, 5);
	cube3.setPosition(10, 10, 10);
	// cube3.setLinearVelocity(0,0,2);
	cube3.attachShader(lightShader2);
	cube3.setParent(cube2);

	let layer0 = new XYZModel("./assets/meshes/", "layer0.obj");
	await layer0.init();
	layer0.setScale(10, 1, 10);
	// layer0.setAngularVel({speed: 20, x: 0, y: 1, z: 0});
	layer0.attachShader(lightShader2);

	cube1.setAngularVelocity(0, 1, 0, 50);
	cube2.setAngularVelocity(1, 0, 0, 25);
	cube3.setAngularVelocity(0, 0, 1, 100);

	// let block1 = new XYZModel("./assets/meshes/", "textured-object.obj");
	// await block1.init();
	// block1.getScaleVec3().x = 5;
	// block1.getScaleVec3().z = 5;
	// block1.getPositionVec3().y = -3;
	// // block1.setAngularVel({x: 1, y: 0.3, z: 0, speed: 40});
	// block1.attachShader(lightShader);
	// // block1.makePlayer()

	// sprite1.setAngularVel(0.01);
	XYZEngine.run();
}