import { XYZMesh } from './XYZMesh.js'
import { XYZObjFileReader } from '../../src/base/XYZObjFileReader.js';

export class XYZModel extends XYZMesh {
	private _fileDir: string;
	private _fileName: string;
	constructor(fileDir: string, fileName: string) {
		super();
		this._fileDir = fileDir;
		this._fileName = fileName;
		this._dimensions = 3;
	}

	public async init() {
		let properties = await XYZObjFileReader.load(this._fileDir, this._fileName);
		this._materials = properties.materials;
		this._vertPosArray = properties.vertexArrayBuffer;
		this._vertNormalArray = properties.normalArrayBuffer;
		this._texCoordArray = properties.textureArrayBuffer;
	}
}