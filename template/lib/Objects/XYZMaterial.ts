import { Vec3 } from "../DataTypes/XYZVertex.js"
export class XYZMaterial {
	private _Ns = 255;
	private _Ka: Vec3 = {x: 1, y: 1, z: 1};
	private _Kd: Vec3 = {x: 1, y: 1, z: 1};
	private _Ks: Vec3 = {x: 1, y: 1, z: 1};
	private _Ke: Vec3 = {x: 1, y: 1, z: 1};
	private _vertexCount: number = 0;
	private _startIndex: number = 0;
	private _name: string;
	constructor(name: string) {
		this._name = name;
	}
	public get name(): string { return this._name; }
	public set Ns(value: number) { this._Ns = value; }
	public set Ka(value: Vec3) { this._Ka = value; }
	public set Kd(value: Vec3) { this._Kd = value; }
	public set Ks(value: Vec3) { this._Ks = value; }
	public set Ke(value: Vec3) { this._Ke = value; }
	public get Ka() { return this._Ka; }
	public get Kd() { return this._Kd; }
	public get vertexCount(): number { return this._vertexCount; }
	public get startIndex(): number { return this._startIndex; }
	public set vertexCount(value: number) { this._vertexCount = value; }
	public set startIndex(value: number) { this._startIndex = value; }
}