import { Matrix } from '../dist/lib/math.js';
import { Vector } from '../dist/lib/math.js';
import { MatLab } from '../dist/lib/math.js';

console.log("Hello Unit test!");

var mat = (new Matrix(3, 3)).identity()
var vec = new Vector([1, 2, 3]);
var prod = MatLab.multiplyMatrixBy(mat, vec);

QUnit.module("Hello test");
QUnit.test('test matrix * vector product', (assert) => {
	assert.equal(prod, new Vector([1, 2, 3]), "Very good");
})