import { XYZMatrix } from '../dist/lib/math.js';
import { XYZVector } from '../dist/lib/math.js';
import { XYZMatLab } from '../dist/lib/math.js';

console.log("Hello Unit test!");

var mat = (new XYZMatrix(3, 3)).identity()
var vec = new XYZVector([1, 2, 3]);
var prod = XYZMatLab.multiplyMatrixBy(mat, vec);

QUnit.module("Hello test");
QUnit.test('test matrix * vector product', (assert) => {
	assert.equal(prod, new XYZVector([1, 2, 3]), "Very good");
})