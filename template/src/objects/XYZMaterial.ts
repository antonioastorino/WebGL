import { RGB } from "../lib/data-types/XYZVertex.js"
export class XYZMaterial {
	private _params: { [id: string]: RGB | number } = {
		Ns: 255.0,
		Ka: { r: 1, g: 1, b: 1 },
		Kd: { r: 1, g: 1, b: 1 },
		Ks: { r: 1, g: 1, b: 1 },
		Ke: { r: 1, g: 1, b: 1 }
	}
	private _texObject: WebGLTexture | null = null;
	private _vertexCount: number = 0;
	private _startIndex: number = 0;
	private _name: string;
	constructor(name: string) {
		this._name = name;
	}
	public getName(): string { return this._name; }
	public getParam(unif: string) { return this._params[unif]; }
	public getTexObject() { return this._texObject; }
	public getVertexCount(): number { return this._vertexCount; }
	public get startIndex(): number { return this._startIndex; }

	public setParam(unif: string, value: RGB | number) { this._params[unif] = value; }
	public setTexObject(value: WebGLTexture | null) { this._texObject = value; }
	public setVertexCount(value: number) { this._vertexCount = value; }
	public set startIndex(value: number) { this._startIndex = value; }
}