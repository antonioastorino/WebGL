import { XYZMatrix } from '../dist/lib/math.js';
import { XYZVector } from '../dist/lib/math.js';
import { XYZMatLab } from '../dist/lib/math.js';

console.log("Hello Unit test!");

QUnit.module("Object creation");
QUnit.test("Create vector from array", (assert) => {
	let arr = new XYZVector([0, 2, 1.2]);
	assert.deepEqual(arr.getElement(2,0), 1.2, "Correct element value");
	let mat = new XYZMatrix([[0, 1],[2, 3]]);
	assert.deepEqual(mat.getElement(1,1), 3, "Correct element value");
});

QUnit.module("Non mutating matrix functions");
QUnit.test('Multiplication', (assert) => {
	var mat = (new XYZMatrix(3, 3)).identity().setElement(2,1,4);
	let scalar = 3.31;
	let mat2 = mat.makeCopy();
	mat.multiplyBy(scalar);
	assert.deepEqual(XYZMatLab.multiply(mat2, scalar), mat, 'Very good!');
	let tmp = (new XYZMatrix(3, 3)).identity().setElement(1, 2, 12)
	mat2 = mat.makeCopy();
	mat.multiplyBy(tmp);
	assert.deepEqual(XYZMatLab.multiply(mat2, tmp), mat, 'Very good!');
})

QUnit.test('Transposition', (assert) => {
	let mat1 = new XYZMatrix([[0, 1],[2, 3]]);
	mat1.transpose();
	let mat2 = new XYZMatrix([[0, 1],[2, 3]]);
	XYZMatLab.transpose(mat2);
	assert.deepEqual(mat1, XYZMatLab.transpose(mat2), "Correct transposition");
})

QUnit.test("Dot product", (assert) => {
	let a = 1,
	b = 3,
	c = 10;
	let vec1 = new XYZVector([a,b,c]);
	let vec2 = new XYZVector([a,b,c]);
	let prod = vec1.dot(vec2);
	assert.deepEqual(vec1, vec2, "Unchanged vectors");
	assert.deepEqual(prod, a*a + b*b + c*c, "Correct result");
});

QUnit.test("Cross product", (assert) => {
	let vecX = new XYZVector([1,0,0]);
	let vecY = new XYZVector([0,1,0]);
	let vecZ = new XYZVector([0,0,1]);
	let prod = vecX.cross(vecY);
	assert.deepEqual(prod, vecZ, "Correct result");
	prod = vecY.cross(vecZ);
	assert.deepEqual(prod, vecX, "Correct result");
	prod = vecZ.cross(vecX);
	assert.deepEqual(prod, vecY, "Correct result");
});

QUnit.module("Mutating matrix functions");
QUnit.test('Matrix times vector', (assert) => {
	var mat = (new XYZMatrix(3, 3)).identity().setElement(2,1,4);
	var vec = new XYZVector([1, 2, 3]);
	var prod = XYZMatLab.multiply(mat, vec);
	assert.deepEqual(prod.getMatrix(), (new XYZVector([1, 2, 11]).getMatrix()), "Very good");
})

QUnit.test('Normalization', (assert) => {
	let a = 1,
	b = 3,
	c = 0.8;
	let vec1 = new XYZVector([a, b, c]);
	let norm1 = vec1.norm();
	let vec2 = vec1.normalize()
	let norm2 = vec2.norm();
	assert.deepEqual(norm1, Math.sqrt(a*a + b*b + c*c), "Norm correctly calculated");
	assert.deepEqual(1, norm2, "Normalize vector has norm = 1");
})