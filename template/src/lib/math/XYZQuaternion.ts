import { XYZVec3 } from '../data-types/XYZVec3.js';

export class XYZQuaternion {
	private _angle_deg: number;
	private _vec: XYZVec3;
	private _i: number;
	private _j: number;
	private _k: number;
	private _r: number;
	constructor(angle_deg: number, axis: XYZVec3);
	constructor(angle_deg: number, x: number, y: number, z: number); 
	constructor(angle_deg: number, x: XYZVec3 | number, y?: number, z?:number) {
		if (y == undefined || z == undefined) {
			this._vec = <XYZVec3>x;
		}
		else {
			this._vec = new XYZVec3([<number>x, y, z]);	
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

	getVector = (): XYZVec3 => { return this._vec; }
	getAngleDeg = (): number => { return this._angle_deg; }
	getAngleRad = (): number => { return this._angle_deg * Math.PI / 180; }
}