import { Vec3, RGB } from "../DataTypes/XYZVertex.js";

export class XYZLightSource {
	protected _type: string;
	protected constructor(type: string) {
		this._type = type;
	}
	public get type() { return this._type; }
}

export class XYZSun extends XYZLightSource {
	constructor() {
		super("point light");
	}

	private _position: Vec3 = { x: 0, y: 0, z: 1 };
	private _rgbIntensity: RGB = { r: 1, g: 1, b: 1 };

	public get position(): Vec3 { return this._position; }
	public get rgbIntensity(): RGB { return this._rgbIntensity; }

	public set position(value: Vec3) {
		if (value.x == 0 && value.y == 0 && value.z == 0) {
			throw "position must be a vector with finite length";
		}
		this._position = value;
	}

	public set rgbIntensity(value: RGB) {
		if (value.r < 0 || value.g < 0 || value.b < 0) {
			throw "Intensity values must all be non negative";
		}
		this._rgbIntensity = value;
	}

	public get type() { return this._type; }
}