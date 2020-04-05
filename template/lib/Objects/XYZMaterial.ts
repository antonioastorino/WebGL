import { RGB } from "../DataTypes/XYZVertex.js"
export class XYZMaterial {
	private _Ns: number = 255.0;
	private _Ka: RGB = {r: 1, g: 1, b: 1};
	private _Kd: RGB = {r: 1, g: 1, b: 1};
	private _Ks: RGB = {r: 1, g: 1, b: 1};
	private _Ke: RGB = {r: 1, g: 1, b: 1};
	private _texObject: WebGLTexture | null = null;
	private _vertexCount: number = 0;
	private _startIndex: number = 0;
	private _name: string;
	constructor(name: string) {
		this._name = name;
	}
	public get name(): string { return this._name; }
	public set Ns(value: number) { this._Ns = value; }
	public set Ka(value: RGB) { this._Ka = value; }
	public set Kd(value: RGB) { this._Kd = value; }
	public set Ks(value: RGB) { this._Ks = value; }
	public set Ke(value: RGB) { this._Ke = value; }
	public set texObject(value: WebGLTexture | null) { this._texObject = value; }
	public get Ns() { return this._Ns; }
	public get Ka() { return this._Ka; }
	public get Kd() { return this._Kd; }
	public get Ks() { return this._Ks; }
	public get Ke() { return this._Ke; }
	public get texObject() { return this._texObject; }
	public get vertexCount(): number { return this._vertexCount; }
	public get startIndex(): number { return this._startIndex; }
	public set vertexCount(value: number) { this._vertexCount = value; }
	public set startIndex(value: number) { this._startIndex = value; }
}