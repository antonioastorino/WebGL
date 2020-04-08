

import { XYZRenderer } from "./base/XYZRenderer.js"
import { XYZEngine } from "./base/XYZEngine.js"
import { XYZMatrix } from "../lib/Math/XYZMatrix.js";
import { XYZVector } from "../lib/Math/XYZVector.js";
import { XYZMatLab } from "../lib/Math/XYZMatLab.js";
import { XYZQuaternion } from "../lib/Math/XYZQuaternion.js";
import { XYZTriangle } from "../lib/Objects/XYZTriangle.js";
import { XYZSprite } from "../lib/Objects/XYZSprite.js";
import { XYZModel } from "../lib/Objects/XYZModel.js";
import { XYZPoint, XYZSun } from "../lib/Objects/XYZLightSource.js";

export async function main() {
	console.log("Hello Main");
	XYZEngine.init();
	XYZRenderer.mView = XYZMatLab.makeLookAtMatrix(new XYZQuaternion(0, 0, 0, 1), new XYZVector([0, 0, 10]));

	let pointLight1 = new XYZPoint();
	pointLight1.position.x = 2;
	pointLight1.position.y = 5;
	pointLight1.position.z = 2;
	pointLight1.rgbIntensity.r = 3;

	let pointLight2 = new XYZPoint();
	pointLight2.position.x = -6;
	pointLight2.position.y = 10;
	pointLight2.position.z = 3;
	pointLight2.rgbIntensity.g = 4;

	let sun1 = new XYZSun();
	sun1.direction.x = -1;
	sun1.direction.y = -1;
	sun1.direction.z = 0;
	sun1.rgbIntensity.r = 1;

	let lightShader = await XYZEngine.makeShader("3D", [sun1, pointLight2], true);
	let spriteShader = await XYZEngine.makeShader("2D", [], true);
	let basicShader = await XYZEngine.makeShader("basic", [], false);

	//
	// TODO: init() missing to triangle
	// Need to check for initialization
	// Triangle 1
	let triangle1 = new XYZTriangle();
	triangle1.attachShader(basicShader);
	triangle1.setPosition({ x: 2, y: 0, z: 0 });
	// triangle1.setScale({ x: 0.3, y: 0.3, z: 1 })

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
	
	// let sphere1 = new XYZModel("./assets/meshes/", "sphere-smooth.obj");
	// await sphere1.init();
	// sphere1.attachShader(lightShader);
	// sphere1.setAngularVel({ x: 1, y: 1, z: 1, speed: 0.05 });
	// sphere1.setLinearVel({ x: 0.1, y: 0, z: 0})
	// triangle2.parent = sphere1;
	// triangle1.parent = triangle2;

	let block1 = new XYZModel("./assets/meshes/", "textured-object.obj");
	await block1.init();
	block1.scale.x = 5;
	block1.scale.z = 5;
	block1.position.z = -5;
	block1.setAngularVel({x: 1, y: 0.3, z: 0, speed: 40});
	block1.attachShader(lightShader);

	// sprite1.setAngularVel(0.01);
	let loop = () => {
		XYZRenderer.gl.clear(XYZRenderer.gl.COLOR_BUFFER_BIT | XYZRenderer.gl.DEPTH_BUFFER_BIT);
		XYZRenderer.drawAll()
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
}