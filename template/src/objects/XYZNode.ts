import { Vec3, AngularVelocityVec4, eulerAnglesDeg } from "../lib/data-types/XYZVertex.js";
import { XYZMatLab } from "../lib/math/XYZMatLab.js";
import { XYZMatrix } from "../lib/math/XYZMatrix.js";
import { XYZVector } from "../lib/math/XYZVector.js";
import { XYZKeyboard } from "../inputs/XYZKeyboard.js";

export class XYZNode {
	protected constructor() { }
	private _modelMatrix: XYZMatrix = (new XYZMatrix(4, 4)).identity();
	protected _position: Vec3 = { x: 0, y: 0, z: 0 };
	protected _rotation: XYZMatrix = (new XYZMatrix(4, 4)).identity();
	private _anglesDeg: eulerAnglesDeg = {yaw: 0, pitch: 0, roll: 0};
	protected _scale: Vec3 = { x: 1, y: 1, z: 1 };
	protected _dimensions: number = 0;
	private _isPlayer: boolean = false;

	// Physics
	private _isUpdated: boolean = false;
	private _parent: XYZNode | null = null;
	private _linearVel: Vec3 = { x: 0, y: 0, z: 0 };
	private _angularVel: AngularVelocityVec4 = { x: 0, y: 0, z: 1, speed: 0 };
	private _rotationAngle: number = 0;
	private _eulerAngularVelocityDeg: eulerAnglesDeg = {yaw: 0, pitch: 0, roll: 0};

	public get position(): Vec3 { return this._position; }
	public get rotation(): XYZMatrix { return this._rotation; }
	public get scale(): Vec3 { return this._scale; }
	public set parent(node: XYZNode | null) { this._parent = node; }
	public reset() { this._isUpdated = false; }
	public get modelMatrix(): XYZMatrix { return this._modelMatrix; }

	/* TODO: it should not be possible to access the position directly but
	only through forces. Only the initial position should be accessible upon
	initialization. */
	public setPosition = (value: Vec3) => { this._position = value; }
	public setLinearVel = (value: Vec3) => { this._linearVel = value; }

	public setAngularVel = (angularVelocity: AngularVelocityVec4 | number) => {
		if (this._dimensions == 2 && typeof (angularVelocity) == 'number') {
			// only rotations about the z-axis are allowed
			this._angularVel = { x: 0, y: 0, z: 1, speed: <number>angularVelocity };
		}
		else if (this._dimensions == 3 && typeof (angularVelocity) == 'object') {
			angularVelocity = <AngularVelocityVec4>angularVelocity;
			let direction = (new XYZVector([angularVelocity.x, angularVelocity.y, angularVelocity.z])).getDirection();
			let speed = angularVelocity.speed;
			this._angularVel = {
				x: direction.x,
				y: direction.y,
				z: direction.z,
				speed: speed
			};
		}
		else {
			throw "Incorrect angular velocity!"
		}
	}

	public setScale = (scale: Vec3) => { this._scale = scale; }

	public update = (deltaTime: number) => {
		if (this._isUpdated) return;
		this._isUpdated = true;

		this.updatePlayer()

		let addedPosition: Vec3 = {
			x: this._linearVel.x * deltaTime,
			y: this._linearVel.y * deltaTime,
			z: this._linearVel.z * deltaTime
		}
		let finalPosition: Vec3 = {
			x: this._position.x += addedPosition.x,
			y: this._position.y += addedPosition.y,
			z: this._position.z += addedPosition.z
		}
		let finalScale: Vec3 = {
			x: this._scale.x,
			y: this._scale.y,
			z: this._scale.z
		}

		if (this._parent != null) {
			finalPosition.x -= this._parent._position.x;
			finalPosition.y -= this._parent._position.y;
			finalPosition.z -= this._parent._position.z;
			finalScale.x /= this._parent._scale.x;
			finalScale.y /= this._parent._scale.y;
			finalScale.z /= this._parent._scale.z;
		}

		if (this._eulerAngularVelocityDeg.yaw != 0
			|| this._eulerAngularVelocityDeg.pitch != 0
			|| this._eulerAngularVelocityDeg.roll !=0 ) {
				this._anglesDeg.yaw += this._eulerAngularVelocityDeg.yaw;
				this._anglesDeg.pitch += this._eulerAngularVelocityDeg.pitch;
				this._anglesDeg.roll += this._eulerAngularVelocityDeg.roll;
				this._rotation = XYZMatLab.makeRotationMatrixFromEulerAngles(this._anglesDeg);
		}

		if (this._angularVel.speed != 0) {
			this._rotationAngle = this._angularVel.speed * deltaTime

			let addedRotation = XYZMatLab.makeRotationMatrix(
				this._rotationAngle,
				this._angularVel.x,
				this._angularVel.y,
				this._angularVel.z);
			this._rotation = <XYZMatrix>this._rotation.multiplyBy(addedRotation);
		}

		this._modelMatrix = XYZMatLab.makeModelMatrix(
			finalPosition,
			this._rotation,
			finalScale
		);

		if (this._parent != null) {
			this._parent.update(deltaTime);
			this._modelMatrix = <XYZMatrix>(<XYZNode>this._parent).modelMatrix.multiplyBy(this._modelMatrix);
		}
	}

	public makePlayer = () => { this._isPlayer = true; }
	// public isPlayer = (): boolean => { return this._isPlayer; }
	private updatePlayer = () => {
		if (this._isPlayer) {
			let vx = 0;
			let vz = 0;
			if (XYZKeyboard.getKeyState("Velocity", "Left")) vx -= 1;
			if (XYZKeyboard.getKeyState("Velocity", "Right")) vx += 1;
			if (XYZKeyboard.getKeyState("Velocity", "Forward")) vz -= 1;
			if (XYZKeyboard.getKeyState("Velocity", "Backward")) vz += 1;
			let vec4Velocity = <XYZVector>this._rotation.multiplyBy(new XYZVector([vx, 0, vz, 1]));
			this._linearVel = {
				x: vec4Velocity.getElement(0),
				y: vec4Velocity.getElement(1),
				z: vec4Velocity.getElement(2)
			}

			let ax = 0;
			let ay = 0;
			if (XYZKeyboard.getKeyState("Angular velocity", "Left")) ay += 1;
			if (XYZKeyboard.getKeyState("Angular velocity", "Right")) ay -= 1;
			if (XYZKeyboard.getKeyState("Angular velocity", "Forward")) ax -= 1;
			if (XYZKeyboard.getKeyState("Angular velocity", "Backward")) ax += 1;

			if (ax || ay) this._angularVel = { speed: 100, x: ax, y: ay, z: 0 }
			else this._angularVel = { speed: 0, x: 1, y: 0, z: 0 }

			let yaw = 0;
			let pitch = 0;
			if (XYZKeyboard.getKeyState("Euler angles", "Pitch+")) pitch += 1;
			if (XYZKeyboard.getKeyState("Euler angles", "Pitch-")) pitch -= 1;
			if (XYZKeyboard.getKeyState("Euler angles", "YawLeft")) yaw -= 1;
			if (XYZKeyboard.getKeyState("Euler angles", "YawRight")) yaw += 1;

			if (yaw || pitch){
				this._eulerAngularVelocityDeg = {yaw: yaw, pitch: pitch, roll: 0};
			}
			else this._eulerAngularVelocityDeg = {yaw: 0, pitch: 0, roll: 0};
		}
	}
}
