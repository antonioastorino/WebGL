import { XYZEngine } from "./base/XYZEngine.js"
import { XYZTriangle } from "./objects/XYZTriangle.js";
import { XYZSprite } from "./objects/XYZSprite.js";
import { XYZModel } from "./objects/XYZModel.js";
import { XYZPoint, XYZSun } from "./objects/XYZLightSource.js";
import { XYZCamera } from "./objects/XYZCamera.js";

export async function main() {
	console.log("Hello Main");
	await XYZEngine.init("../../etc/keyboard-locked-up.json");

	let camera1 = new XYZCamera();
	camera1.getPositionVec3().z = 10;
	camera1.getPositionVec3().y = 4;
	camera1.makePlayer();

	let pointLight1 = new XYZPoint();
	pointLight1.position.x = 10;
	pointLight1.position.y = 10;
	pointLight1.position.z = 10;
	pointLight1.rgbIntensity = {r: 40, g: 40, b: 40};

	let pointLight2 = new XYZPoint();
	pointLight2.position.x = -6;
	pointLight2.position.y = 10;
	pointLight2.position.z = 3;
	pointLight1.rgbIntensity = {r: 40, g: 25, b: 40};

	let sun1 = new XYZSun();
	sun1.direction.x = -1;
	sun1.direction.y = -1;
	sun1.direction.z = 0;
	sun1.rgbIntensity = {r: 0.3, g: 0.3, b: 0.3};

	// let lightShader = await XYZEngine.makeShader("3D", [sun1, pointLight2], true);
	let lightShader2 = await XYZEngine.makeShader("3D", [sun1, pointLight1, pointLight2], false);
	// let spriteShader = await XYZEngine.makeShader("2D", [], true);
	// let basicShader = await XYZEngine.makeShader("basic", [], false);

	//
	// TODO: init() missing to triangle
	// Need to check for initialization
	// // Triangle 1
	// let triangle1 = new XYZTriangle();
	// triangle1.attachShader(basicShader);
	// triangle1.setPosition({ x: 2, y: 0, z: 0 });

	// let sprite1 = new XYZSprite('wooden-wall.jpg');
	// await sprite1.init();
	// sprite1.attachShader(spriteShader);
	// sprite1.setPosition({ x: 0.8, y: 0.8, z: 0 })
	// sprite1.setScale({ x: 0.2, y: 0.2, z: 1 })

	// let cube = new XYZModel("./assets/meshes/", "cube.obj");
	// await cube.init();
	// cube.setScale({x: 10, y: 1, z: 10});
	// cube.setAngularVel({speed: 20, x: 1, y: 1, z: 0});
	// cube.attachShader(lightShader2);

	let layer0 = new XYZModel("./assets/meshes/", "layer0.obj");
	await layer0.init();
	layer0.setScale({x: 1, y: 1, z: 1});
	// layer0.setAngularVel({speed: 20, x: 0, y: 1, z: 0});
	layer0.attachShader(lightShader2);

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