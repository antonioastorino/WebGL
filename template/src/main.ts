import { XYZEngine } from "./base/XYZEngine.js"
import { XYZSprite } from "./objects/XYZSprite.js";
import { XYZModel } from "./objects/XYZModel.js";
import { XYZDisplay } from "./objects/XYZDisplay.js";
import { XYZPoint, XYZSun } from "./objects/XYZLightSource.js";
import { XYZCamera } from "./objects/XYZCamera.js";

export async function main() {
	console.log("Hello Main");
	await XYZEngine.init("../../etc/keyboard.json");

	let camera1 = new XYZCamera();
	camera1.setPos(0, 10, 40);
	camera1.makePlayer();

	let pointLight1 = new XYZPoint();
	pointLight1.setPosition(20, 20, 0);
	pointLight1.setRgbIntensity(40, 40, 40);

	let pointLight2 = new XYZPoint();
	pointLight2.setPosition(-20, 20, 0);
	pointLight2.setRgbIntensity(20, 25, 20);

	let sun1 = new XYZSun();
	sun1.setDirection(-1, -1, 0);
	sun1.setRgbIntensity(0.4, 0.4, 0.4);

	
	// let shaderLight = await XYZEngine.makeShader("shadows", [sun1], false);
	let shaderLight = await XYZEngine.makeShader("3D", [sun1], false);
	// let shaderLightAndTex = await XYZEngine.makeShader("3D", [sun1, pointLight1, pointLight2], true);
	let shadowShader = await XYZEngine.makeShader("shadows", [pointLight1], false);
	let shaderSprite = await XYZEngine.makeShader("2D", [], true);
	
	// let sprite1 = new XYZSprite('gun-sight.png');
	// await sprite1.init();
	// sprite1.attachShader(shaderSprite);
	// sprite1.setPos(0, 0, 0)
	// sprite1.setScale(0.1, 0.1, 1)
	let display1 = new XYZDisplay("");
	await display1.init();
	display1.attachShaders([shaderSprite]);
	display1.setScale(0.3, 0.3, 3);
	display1.setPos(-0.3, -0.3, 0);

	let cube1 = new XYZModel("./assets/meshes/", "cube2.obj");
	await cube1.init();
	cube1.setScale(8, 8, 8);
	cube1.setPos(0, 10, 0);
	cube1.attachShaders([shadowShader, shaderLight]);

	// let cube2 = new XYZModel("./assets/meshes/", "wooden-cube.obj");
	// await cube2.init();
	// cube2.setScale(8, 8, 8);
	// cube2.setPos(10, 10, 0);
	// cube2.setLocalLinVel(2,0,0);
	// cube2.attachShader(shaderLightAndTex);
	// cube2.setParent(cube1);

	let cube3 = new XYZModel("./assets/meshes/", "cube.obj");
	await cube3.init();
	cube3.setScale(8, 8, 8);
	cube3.setPos(10, 10, 10);
	// cube3.setLocalLinVel(0,0,2);
	cube3.attachShaders([shadowShader, shaderLight]);
	// cube3.setParent(cube2);

	// let layer0 = new XYZModel("./assets/meshes/", "layer0.obj");
	// await layer0.init();
	// layer0.setScale(10, 1, 10);
	// layer0.setPos(0,-10, 0);
	// layer0.attachShader(shaderLight);

	cube1.setAngVel(0, 1, 0, 50);
	// cube2.setAngVel(1, 0, 0, 25);
	cube3.setAngVel(0, 0, 1, 100);

	// let sphere = new XYZModel('./assets/meshes/', 'sphere.obj');
	// await sphere.init();
	// sphere.attachShader(shaderLight);
	// sphere.setPos(0,20,0);
	// sphere.setScale(5,5,5);
	// sphere.setAngVel(0, 1, 0, 100);

	// sprite1.setAngularVel(0.01);
	XYZEngine.run();
}