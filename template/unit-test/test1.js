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

QUnit.module("Mutating matrix functions");
QUnit.test('Matrix times vector', (assert) => {
	var mat = (new XYZMatrix(3, 3)).identity().setElement(2,1,4);
	var vec = new XYZVector([1, 2, 3]);
	var prod = XYZMatLab.multiply(mat, vec);
	assert.deepEqual(prod.getMatrix(), (new XYZVector([1, 2, 11]).getMatrix()), "Very good");
})

QUnit.test('Normalization', (assert) => {
	let a = 3.0;
	let b = 4.0;
	let norm = Math.sqrt(a * a + b * b);
	let v1 = new XYZVector([a * (1 / norm), b * (1 / norm)]);
	let v2 = (new XYZVector([a, b])).normalize();
	assert.deepEqual(v1.getMatrix(), v2.getMatrix(), "Very good");
})