import { XYZMatrix } from '../dist/lib/math/XYZMatrix.js';
import { XYZVector } from '../dist/lib/math/XYZVector.js';
import { XYZMatLab } from '../dist/lib/math/XYZMatLab.js';
import { XYZVec3 } from '../dist/lib/data-types/XYZVec3.js';
import { XYZVec4 } from '../dist/lib/data-types/XYZVec4.js';
import { XYZQuaternion } from '../dist/lib/math/XYZQuaternion.js'

console.log("Hello math!");

QUnit.module("Object creation");
QUnit.test("Create vector from array", (assert) => {
	let vec = new XYZVector([0, 2, 1.2]);
	assert.deepEqual(vec.getElement(2), 1.2, "Correct element value");
	let mat = new XYZMatrix([[0, 1], [2, 3]]);
	assert.deepEqual(mat.getElement(1, 1), 3, "Correct element value");
});

QUnit.test("Create float32array from matrix", (assert) => {
	let mat = new XYZMatrix(2, 3);
	mat.setElement(1, 1, 4.2);
	let arr = mat.makeFloat32Array();
	assert.deepEqual(arr[3], new Float32Array([4.2])[0], "Correct element value");
});

QUnit.test('Matrix times vector', (assert) => {
	var mat = (new XYZMatrix(3, 3)).identity().setElement(2, 1, 4);
	var vec = new XYZVec3([1, 2, 3]);
	var prod = mat.multiplyByVector(vec);
	assert.deepEqual(prod, new XYZVec3([1, 2, 11]), "Very good");
})

QUnit.test('Matrix times scalar', (assert) => {
	var mat = (new XYZMatrix(3, 3)).identity().setElement(2, 1, 4);
	let scalar = 3.31;
	let mat2 = mat.makeCopy();
	assert.deepEqual(mat2.multiplyByScalar(scalar), mat.multiplyByScalar(scalar), 'Very good!');
})

QUnit.test('Matrix times matrix', (assert) => {
	let mat = (new XYZMatrix(3, 3)).identity().setElement(2, 2, 4);
	let mat2 = mat.multiplyByMatrix(mat);
	assert.deepEqual(mat2.getElement(2, 2), 16, 'Very good!');
})

QUnit.test('Transposition', (assert) => {
	let mat1 = new XYZMatrix([[0, 1, 2], [3, 4, 6]]);
	let mat2 = mat1.transpose();
	assert.deepEqual(mat1.getElement(0, 1), mat2.getElement(1, 0), "Correct transposition");
})

QUnit.test("Dot product", (assert) => {
	let a = 1,
		b = 3,
		c = 10;
	let vec1 = new XYZVector([a, b, c]);
	let vec2 = new XYZVector([a, b, c]);
	let prod = vec1.dot(vec2);
	assert.deepEqual(vec1, vec2, "Unchanged vectors");
	assert.deepEqual(prod, a * a + b * b + c * c, "Correct result");
});

QUnit.test("Cross product", (assert) => {
	let vecX = new XYZVec3([1, 0, 0]);
	let vecY = new XYZVec3([0, 1, 0]);
	let vecZ = new XYZVec3([0, 0, 1]);
	let prod = vecX.cross(vecY);
	assert.deepEqual(prod, vecZ, "Correct result");
	prod = vecY.cross(vecZ);
	assert.deepEqual(prod, vecX, "Correct result");
	prod = vecZ.cross(vecX);
	assert.deepEqual(prod, vecY, "Correct result");
});

QUnit.test('Normalization', (assert) => {
	let a = 1,
		b = 3,
		c = 0.8;
	let norm = Math.sqrt(a * a + b * b + c * c);
	let vec1 = new XYZVector([a, b, c]);
	let norm1 = vec1.norm();
	let vec2 = vec1.getDirection()
	let norm2 = vec2.norm();
	assert.deepEqual(norm1, norm, "Norm correctly calculated");
	assert.deepEqual(1, norm2, "Normalized vector has norm = 1");
	let vec3 = new XYZVec4([a, b, c, 10]);
	let norm3 = vec3.norm();
	let vec4 = vec3.getDirection()
	let norm4 = vec4.norm();
	assert.deepEqual(norm3, norm, "Norm correctly calculated");
	assert.deepEqual(1, norm4, "Normalized vector has norm = 1");
})

QUnit.module("Special matrix creation");
QUnit.test('Translation', (assert) => {
	let a = 1,
		b = 3,
		c = 0.8;
	let vec1 = new XYZVec3([a, b, c]);
	let mat1 = XYZMatLab.makeTranslationMatrix(vec1);
	let vec2 = new XYZVec4([a, b, c, 1]);
	let vec3 = mat1.multiplyByVector(vec2);
	assert.deepEqual(vec3.x, 2 * a, "x-translation correct");
	assert.deepEqual(vec3.y, 2 * b, "y-translation correct");
	assert.deepEqual(vec3.z, 2 * c, "z-translation correct");
})

QUnit.test('Rotation', (assert) => {
	let vecX = new XYZVec3([1, 0, 0]);
	let vecY = new XYZVec3([0, 1, 0]);
	let vecZ = new XYZVec3([0, 0, 1]);
	let pointX = new XYZVec4([1, 0, 0, 1]);
	let pointY = new XYZVec4([0, 1, 0, 1]);
	let pointZ = new XYZVec4([0, 0, 1, 1]);
	let angle = 90;
	let matX = XYZMatLab.makeRotationMatrix(angle, vecX);
	let matY = XYZMatLab.makeRotationMatrix(angle, vecY);
	let matZ = XYZMatLab.makeRotationMatrix(angle, vecZ);
	assert.deepEqual((matZ.multiplyByVector(pointX)).y, 1, "rotation about z correct");
	assert.deepEqual(matY.multiplyByVector(pointZ).x, 1, "rotation about y correct");
	assert.deepEqual(matX.multiplyByVector(pointY).z, 1, "rotation about x correct");
})

QUnit.module("Quaternions");
QUnit.test('Creation', (assert) => {
	let x = 2 * Math.random() - 1;
	let y = 2 * Math.random() - 1;
	let z = 2 * Math.random() - 1;
	let theta = 380 * (Math.random() - 0.5);
	let q1 = new XYZQuaternion(theta, x, y, z);
	let vec1 = new XYZVec3([x, y, z]);
	assert.deepEqual(vec1, q1.getVector(), "Vector part correctly normalized");
})
