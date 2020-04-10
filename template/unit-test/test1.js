import { XYZMatrix } from '../dist/lib/math/XYZMatrix.js';
import { XYZVector } from '../dist/lib/math/XYZVector.js';
import { XYZMatLab } from '../dist/lib/math/XYZMatLab.js';
import { XYZQuaternion } from '../dist/lib/math/XYZQuaternion.js'
import { XYZObjFileReader } from '../dist/base/XYZObjFileReader.js'

console.log("Hello Unit test!");

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

QUnit.module("Non mutating matrix functions");
QUnit.test('Matrix times vector', (assert) => {
	var mat = (new XYZMatrix(3, 3)).identity().setElement(2, 1, 4);
	var vec = new XYZVector([1, 2, 3]);
	var prod = XYZMatLab.multiply(mat, vec);
	assert.deepEqual(prod, new XYZVector([1, 2, 11]), "Very good");
})

QUnit.test('Multiplication', (assert) => {
	var mat = (new XYZMatrix(3, 3)).identity().setElement(2, 1, 4);
	let scalar = 3.31;
	let mat2 = mat.makeCopy();
	assert.deepEqual(XYZMatLab.multiply(mat2, scalar), mat.multiplyBy(scalar), 'Very good!');
})

QUnit.test('Transposition', (assert) => {
	let mat1 = new XYZMatrix([[0, 1], [2, 3]]);
	mat1.transpose();
	let mat2 = new XYZMatrix([[0, 1], [2, 3]]);
	XYZMatLab.transpose(mat2);
	assert.deepEqual(mat1, XYZMatLab.transpose(mat2), "Correct transposition");
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
	let vecX = new XYZVector([1, 0, 0]);
	let vecY = new XYZVector([0, 1, 0]);
	let vecZ = new XYZVector([0, 0, 1]);
	let prod = vecX.cross(vecY);
	assert.deepEqual(prod, vecZ, "Correct result");
	prod = vecY.cross(vecZ);
	assert.deepEqual(prod, vecX, "Correct result");
	prod = vecZ.cross(vecX);
	assert.deepEqual(prod, vecY, "Correct result");
});

QUnit.module("Mutating matrix functions");
QUnit.test('Normalization', (assert) => {
	let a = 1,
		b = 3,
		c = 0.8;
	let vec1 = new XYZVector([a, b, c]);
	let norm1 = vec1.norm();
	let vec2 = vec1.normalize()
	let norm2 = vec2.norm();
	assert.deepEqual(norm1, Math.sqrt(a * a + b * b + c * c), "Norm correctly calculated");
	assert.deepEqual(1, norm2, "Normalize vector has norm = 1");
})

QUnit.module("Special matrix creation");
QUnit.test('Translation', (assert) => {
	let a = 1,
		b = 3,
		c = 0.8;
	let vec1 = new XYZVector([a, b, c]);
	let mat1 = XYZMatLab.makeTranslationMatrix(vec1);
	let vec2 = new XYZVector([a, b, c, 1]);
	let vec3 = XYZMatLab.multiply(mat1, vec2)
	assert.deepEqual(vec3.x, 2 * a, "x-translation correct");
	assert.deepEqual(vec3.y, 2 * b, "y-translation correct");
	assert.deepEqual(vec3.z, 2 * c, "z-translation correct");
})

QUnit.test('Rotation', (assert) => {
	let vecX = new XYZVector([1, 0, 0]);
	let vecY = new XYZVector([0, 1, 0]);
	let vecZ = new XYZVector([0, 0, 1]);
	let pointX = new XYZVector([1, 0, 0, 1]);
	let pointY = new XYZVector([0, 1, 0, 1]);
	let pointZ = new XYZVector([0, 0, 1, 1]);
	let angle = 90;
	let matX = XYZMatLab.makeRotationMatrix(angle, vecX);
	let matY = XYZMatLab.makeRotationMatrix(angle, vecY);
	let matZ = XYZMatLab.makeRotationMatrix(angle, vecZ);
	assert.deepEqual(matZ.multiplyBy(pointX).y, 1, "rotation about z correct");
	assert.deepEqual(matY.multiplyBy(pointZ).x, 1, "rotation about y correct");
	assert.deepEqual(matX.multiplyBy(pointY).z, 1, "rotation about x correct");
})

QUnit.module("Quaternions");
QUnit.test('Creation', (assert) => {
	let x = 2 * Math.random() - 1;
	let y = 2 * Math.random() - 1;
	let z = 2 * Math.random() - 1;
	let theta = 380 * (Math.random() - 0.5);
	let q1 = new XYZQuaternion(theta, x, y, z);
	let vec1 = (new XYZVector([x, y, z]));
	assert.deepEqual(vec1, q1.getVector(), "Vector part correctly normalized");
})

QUnit.module("Obj files");
QUnit.test('Load', (assert) => {
	assert.expect(6);
	var obj = XYZObjFileReader.load("./models/", "sample.obj").then(result => {
		console.log(result)
		assert.deepEqual((result.vertexArrayBuffer).length, 9, "Correct position buffer length");
		assert.deepEqual((result.vertexArrayBuffer)[1], -1, "Correct vertex position coordinate");
		assert.deepEqual((result.textureArrayBuffer).length, 6, "Correct texture buffer length");
		assert.deepEqual((result.textureArrayBuffer)[5], 1, "Correct texture coordinate");
		assert.deepEqual((result.normalArrayBuffer).length, 9, "Correct normal buffer length");
		assert.deepEqual((result.normalArrayBuffer)[3], 0, "Correct vertex normal coordinate");
	});
	return obj
})