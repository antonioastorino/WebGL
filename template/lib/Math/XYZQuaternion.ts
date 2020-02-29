import { XYZVector } from './XYZVector.js'

export class XYZQuaternion {
	private _angle_deg: number;
	private _vec: XYZVector;
	private _i: number;
	private _j: number;
	private _k: number;
	private _w: number;
	constructor(angle_deg: number, x: number, y: number, z: number) {
		this._angle_deg = angle_deg;
		this._vec = (new XYZVector([x, y, z])).normalize();
		
		let s = Math.sin(this.getAngleRad()/2);
		this._i = s * this._vec.getElement(0);
		this._j = s * this._vec.getElement(1);
		this._k = s * this._vec.getElement(2);
		this._w = Math.cos(this.getAngleRad()/2);
	}

	public get i() { return this._i; }
	public get j() { return this._j; }
	public get k() { return this._k; }
	public get w() { return this._w; }

	getVector = (): XYZVector => { return this._vec; }
	getAngleDeg = (): number => { return this._angle_deg; }
	getAngleRad = (): number => { return this._angle_deg * Math.PI / 180; }
}