import { XYZMatrix } from '../dist/lib/math.js';
import { XYZVector } from '../dist/lib/math.js';
import { XYZMatLab } from '../dist/lib/math.js';

console.log("Hello Unit test!");

var mat = (new XYZMatrix(3, 3)).identity()
var vec = new XYZVector([1, 2, 3]);
var prod = XYZMatLab.multiplyMatrixBy(mat, vec);

QUnit.module("Hello test");
QUnit.test('test matrix * vector product', (assert) => {
	assert.deepEqual(prod.getMatrix(), new XYZVector([1, 2, 3]).getMatrix(), "Very good");
})

QUnit.test('Vector normalization', (assert) => {
	let a = 3.0;
	let b = 4.0;
	let norm = Math.sqrt(a*a + b*b);
	let v1 = new XYZVector([a*(1/norm), b*(1/norm)]).getMatrix();
	let v2 = (new XYZVector([a, b])).normalize().getMatrix();
	assert.deepEqual(v1, v2, "Very good");
})