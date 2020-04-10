import { XYZVector } from './XYZVector.js'

export class XYZQuaternion {
	private _angle_deg: number;
	private _vec: XYZVector;
	private _i: number;
	private _j: number;
	private _k: number;
	private _r: number;
	constructor(angle_deg: number, axis: XYZVector);
	constructor(angle_deg: number, x: number, y: number, z: number); 
	constructor(angle_deg: number, x: XYZVector | number, y?: number, z?:number) {
		if (y == undefined || z == undefined) {
			this._vec = <XYZVector>x;
		}
		else {
			this._vec = new XYZVector([<number>x, y, z]);	
		}
		this._angle_deg = angle_deg;
		let s = Math.sin(this.getAngleRad()/2);
		this._i = s * this._vec.x;
		this._j = s * this._vec.y;
		this._k = s * this._vec.z;
		this._r = Math.cos(this.getAngleRad()/2);
	}

	public get i() { return this._i; }
	public get j() { return this._j; }
	public get k() { return this._k; }
	public get r() { return this._r; }

	getVector = (): XYZVector => { return this._vec; }
	getAngleDeg = (): number => { return this._angle_deg; }
	getAngleRad = (): number => { return this._angle_deg * Math.PI / 180; }
}