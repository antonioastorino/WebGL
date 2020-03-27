import { XYZMesh } from './XYZMesh.js'
import { XYZObjFileReader } from '../../src/base/XYZObjFileReader.js';

export class XYZModel extends XYZMesh {
	private _sourcePath: string;
	constructor(sourcePath: string) {
		super();
		this._sourcePath = sourcePath;		
	}

	public async init() {
		let arrayBuffers = await XYZObjFileReader.load(this._sourcePath);
		this._vertPosArray = arrayBuffers.vertexArrayBuffer;
		this._vertColorArray = arrayBuffers.normalArrayBuffer;
		this._texCoordArray = arrayBuffers.textureArrayBuffer;
	}
}