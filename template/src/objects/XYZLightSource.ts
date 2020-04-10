import { Vec3, RGB } from "../lib/data-types/XYZVertex.js";

export class XYZLightSource {
	private _type: string;
	private _rgbIntensity: RGB = { r: 1, g: 1, b: 1 };
	protected constructor(type: string) {
		this._type = type;
	}
	public get type() { return this._type; }
	public get rgbIntensity(): RGB { return this._rgbIntensity; }
	public set rgbIntensity(value: RGB) {
		if (value.r < 0 || value.g < 0 || value.b < 0) {
			throw "Intensity values must all be non negative";
		}
		this._rgbIntensity = value;
	}
}

export class XYZPoint extends XYZLightSource {
	constructor() {
		super("point light");
	}
	// the location of the light bulb in world coordinates
	private _position: Vec3 = { x: 0, y: 0, z: 1 };
	public get position(): Vec3 { return this._position; }
	public set position(value: Vec3) {
		if (value.x == 0 && value.y == 0 && value.z == 0) {
			throw "position must be a vector with finite length";
		}
		this._position = value;
	}
}

export class XYZSun extends XYZLightSource {
	constructor() {
		super("directional light");
	}
	// the direction towards which the light is pointing
	private _direction: Vec3 = { x: 0, y: -1, z: 0};
	public get direction(): Vec3 { return this._direction; }
	public set direction(value: Vec3) {
		if (value.x == 0 && value.y == 0 && value.z == 0) {
			throw "direction must be a vector with finite length";
		}
		this._direction = value;
	}
}