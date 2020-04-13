import { RGB } from "../lib/data-types/XYZVertex.js";
import { XYZVec3 } from "../lib/data-types/XYZVec3.js";

export class XYZLightSource {
	private _type: string;
	private _rgbIntensity: RGB = { r: 1, g: 1, b: 1 };
	protected constructor(type: string) {
		this._type = type;
	}
	public get type() { return this._type; }
	public getRgbIntensity = (): RGB => { return this._rgbIntensity; }
	public setRgbIntensity = (r: number, g: number, b: number) => {
		if (r < 0 || g < 0 || b < 0) {
			throw "Intensity values must all be non negative";
		}
		this._rgbIntensity = { r: r, g: g, b: b };
	}
}

export class XYZPoint extends XYZLightSource {
	constructor() {
		super("point light");
	}
	// the location of the light bulb in world coordinates
	private _position: XYZVec3 = new XYZVec3([0, 0, 1]);
	public getPosition = (): XYZVec3 => { return this._position; }
	public setPosition = (x: number, y: number, z: number) => {
		if (x == 0 && y == 0 && z == 0) {
			throw "position must be a vector with finite length";
		}
		this._position = new XYZVec3([x, y, z]);
	}
}

export class XYZSun extends XYZLightSource {
	constructor() {
		super("directional light");
	}
	// the direction towards which the light is pointing
	private _direction: XYZVec3 = new XYZVec3([0, -1, 0]);
	public getDirection(): XYZVec3 { return this._direction; }
	public setDirection = (x: number, y: number, z: number) => {
		if (x == 0 && y == 0 && z == 0) {
			throw "direction must be a vector with finite length";
		}
		this._direction = new XYZVec3([x, y, z]);
	}
}