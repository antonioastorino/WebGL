import { XYZObjFileReader } from '../dist/base/XYZObjFileReader.js'
import { XYZFileLoader } from '../dist/base/XYZFileLoader.js';

console.log("Hello files!");
QUnit.module("Obj files");
QUnit.test('Load', (assert) => {
	assert.expect(6);
	var obj = XYZObjFileReader.load("./models/", "sample.obj").then(result => {
		assert.deepEqual((result.vertexArrayBuffer).length, 9, "Correct position buffer length");
		assert.deepEqual((result.vertexArrayBuffer)[1], -1, "Correct vertex position coordinate");
		assert.deepEqual((result.textureArrayBuffer).length, 6, "Correct texture buffer length");
		assert.deepEqual((result.textureArrayBuffer)[5], 1, "Correct texture coordinate");
		assert.deepEqual((result.normalArrayBuffer).length, 9, "Correct normal buffer length");
		assert.deepEqual((result.normalArrayBuffer)[3], 0, "Correct vertex normal coordinate");
	});
	return obj
})

QUnit.module("Json files");
QUnit.test('Load', (assert) => {
	assert.expect(3);
	var obj = XYZFileLoader.loadJson("./other/json-test.json").then(result => {
		assert.deepEqual((result["field1"]), "value1", "Correct value for first field");
		assert.deepEqual((result.array1[0]), "item1", "Correct value in array at position 0");
		assert.deepEqual((result.array1[1]), "item2", "Correct value in array at position 0");
	});
	return obj
})