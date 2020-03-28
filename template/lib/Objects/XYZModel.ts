import { XYZMesh } from './XYZMesh.js'
import { XYZObjFileReader } from '../../src/base/XYZObjFileReader.js';

export class XYZModel extends XYZMesh {
	private _sourcePath: string;
	constructor(sourcePath: string, texFileName: string) {
		super();
		this._sourcePath = sourcePath;
		this._texFileName = texFileName;
	}

	public async init() {
		let arrayBuffers = await XYZObjFileReader.load(this._sourcePath);
		this._vertPosArray = arrayBuffers.vertexArrayBuffer;
		this._vertColorArray = arrayBuffers.normalArrayBuffer;
		this._texCoordArray = arrayBuffers.textureArrayBuffer;
		await this.loadTexture();
	}
}