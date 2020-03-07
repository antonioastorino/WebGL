

import { XYZApplication } from "./base/XYZApplication.js"
import { XYZMatrix } from "../lib/Math/XYZMatrix.js";
import { XYZVector } from "../lib/Math/XYZVector.js";
import { XYZMatLab } from "../lib/Math/XYZMatLab.js";
import { XYZQuaternion } from "../lib/Math/XYZQuaternion.js";
import { XYZTriangle } from "../lib/Objects/XYZTriangle.js";
import { XYZBasicShader } from "./base/XYZShader.js";

export async function main() {
	console.log("Hello Main");
	XYZApplication.init();

	let triangle1 = new XYZTriangle({ x: -0.5, y: 1, z: 0.3 }, { r: 0, g: .3, b: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
	let mWorld = XYZMatLab.makeRotationMatrix(90, 0, 0, 1);
	let mView = XYZMatLab.makeLookAtMatrix(new XYZQuaternion(25, 0, 1, 0), new XYZVector([0, 0, 3]));
	let mProj = XYZMatLab.makePerspectiveMatrix(XYZApplication.aspectRatio, 55, 0.1, 1000);

	let basicShader = new XYZBasicShader();
	await basicShader.initialize();

	XYZApplication.gl.uniformMatrix4fv(basicShader.mWorldUniformLocation, /*transpose =*/ false, mWorld.makeFloat32Array());
	XYZApplication.gl.uniformMatrix4fv(basicShader.mViewUniformLocation,  /*transpose =*/ false, mView.makeFloat32Array());
	XYZApplication.gl.uniformMatrix4fv(basicShader.mProjUniformLocation,  /*transpose =*/ false, mProj.makeFloat32Array());

	let vertexArrayBufferObject = XYZApplication.gl.createBuffer(); // get buffer ID
	XYZApplication.gl.bindBuffer(XYZApplication.gl.ARRAY_BUFFER, vertexArrayBufferObject); // select buffer
	XYZApplication.gl.bufferData(XYZApplication.gl.ARRAY_BUFFER, triangle1.makeFloat32Array(), XYZApplication.gl.STATIC_DRAW); // load data

	XYZApplication.gl.vertexAttribPointer(
		basicShader.positionAttributeLocation, // ID
		3, // size
		XYZApplication.gl.FLOAT, // type,
		false, // normalized
		6 * Float32Array.BYTES_PER_ELEMENT, // stride
		0 // offset
	);

	XYZApplication.gl.vertexAttribPointer(
		basicShader.colorAttributeLocation, // ID
		3, // size
		XYZApplication.gl.FLOAT, // type,
		false, // normalized
		6 * Float32Array.BYTES_PER_ELEMENT, // stride
		3 * Float32Array.BYTES_PER_ELEMENT // offset
	);

	basicShader.enableAttributes();

	let angle = 0;
	let rps = 0.5
	let loop = () => {
		angle = performance.now() / 1000 * 360 * rps;
		mWorld = XYZMatLab.makeRotationMatrix(angle, 0, 1, 0);
		XYZApplication.gl.uniformMatrix4fv(basicShader.mWorldUniformLocation, /*transpose =*/ false, mWorld.makeFloat32Array());
		XYZApplication.gl.clear(XYZApplication.gl.COLOR_BUFFER_BIT | XYZApplication.gl.DEPTH_BUFFER_BIT);
		XYZApplication.gl.drawArrays(XYZApplication.gl.TRIANGLES, 0, 3);
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
}