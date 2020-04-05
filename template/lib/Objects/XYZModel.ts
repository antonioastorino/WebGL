import { XYZMesh } from './XYZMesh.js'
import { XYZObjFileReader } from '../../src/base/XYZObjFileReader.js';

export class XYZModel extends XYZMesh {
	private _fileDir: string;
	private _fileName: string;
	constructor(fileDir: string, fileName: string, texFileName?: string) {
		super();
		this._fileDir = fileDir;
		this._fileName = fileName;
		if (texFileName != undefined) {
			this._texFileName = texFileName;
		}
	}

	public async init() {
		let arrayBuffers = await XYZObjFileReader.load(this._fileDir, this._fileName);
		this._materials = arrayBuffers.materials;
		this._vertPosArray = arrayBuffers.vertexArrayBuffer;
		this._vertNormalArray = arrayBuffers.normalArrayBuffer;
		this._texCoordArray = arrayBuffers.textureArrayBuffer;
		if (this._texFileName != "") {
			await this.loadTexture();
		}
	}
}