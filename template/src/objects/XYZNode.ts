import { Vec3, AngularVelocityVec4, eulerAnglesDeg } from "../lib/data-types/XYZVertex.js";
import { XYZMatLab } from "../lib/math/XYZMatLab.js";
import { XYZMatrix } from "../lib/math/XYZMatrix.js";
import { XYZVector } from "../lib/math/XYZVector.js";
import { XYZKeyboard } from "../inputs/XYZKeyboard.js";
import { XYZRenderer } from "../base/XYZRenderer.js";

export class XYZNode {
	protected constructor() {
		XYZRenderer.addNode(this);
	}
	private _modelMatrix: XYZMatrix = (new XYZMatrix(4, 4)).identity();
	protected _position: Vec3 = { x: 0, y: 0, z: 0 };
	protected _rotation: XYZMatrix = (new XYZMatrix(4, 4)).identity();
	private _anglesDeg: eulerAnglesDeg = { yaw: 0, pitch: 0, roll: 0 };
	protected _scale: Vec3 = { x: 1, y: 1, z: 1 };
	protected _dimensions: number = 0;
	private _isPlayer: boolean = false;
	private _relativePosition: Vec3 = { x: 0, y: 0, z: 0 }
	private _relativeRotation: XYZMatrix = (new XYZMatrix(4, 4)).identity();
	private _relativeScale: Vec3 = { x: 1, y: 1, z: 1 };

	// Physics
	private _isUpdated: boolean = false;
	private _parent: XYZNode | null = null;
	private _linearVel: Vec3 = { x: 0, y: 0, z: 0 };
	private _angularVel: AngularVelocityVec4 = { x: 0, y: 0, z: 1, speed: 0 };
	private _rotationAngle: number = 0;
	private _eulerAngularVelocityDeg: eulerAnglesDeg = { yaw: 0, pitch: 0, roll: 0 };

	public getPositionVec3(): Vec3 { return this._position; }
	public getRotationMat4(): XYZMatrix { return this._rotation; }
	public getScaleVec3(): Vec3 { return this._scale; }

	public setParent(node: XYZNode) {
		this._parent = node;
		this._relativePosition.x = this._position.x - this._parent._position.x;
		this._relativePosition.y = this._position.y - this._parent._position.y;
		this._relativePosition.z = this._position.z - this._parent._position.z;

		this._relativeRotation = <XYZMatrix>this._parent._rotation.transpose().multiplyBy(
			this._rotation
		);
		this._relativeScale.x = this._scale.x / this._parent._scale.x;
		this._relativeScale.y = this._scale.y / this._parent._scale.y;
		this._relativeScale.z = this._scale.z / this._parent._scale.z;
	}

	public reset() { this._isUpdated = false; }
	public get modelMatrix(): XYZMatrix { return this._modelMatrix; }

	/* TODO: it should not be possible to access the position directly but
	only through forces. Only the initial position should be accessible upon
	initialization. */
	public setPosition = (value: Vec3) => { this._position = value; }

	public translateAlongGlobalAxis = (value: Vec3) => { this._linearVel = value; }

	public rotateAboutGlobalAxis = (angularVelocity: AngularVelocityVec4 | number) => {
		if (this._dimensions == 2 && typeof (angularVelocity) == 'number') {
			// only rotations about the z-axis are allowed
			this._angularVel = { x: 0, y: 0, z: 1, speed: <number>angularVelocity };
		}
		else if (this._dimensions == 3 && typeof (angularVelocity) == 'object') {
			angularVelocity = <AngularVelocityVec4>angularVelocity;
			let speed = angularVelocity.speed;
			try {
				let direction = (new XYZVector([angularVelocity.x, angularVelocity.y, angularVelocity.z])).getDirection();
				this._angularVel = {
					x: direction.x,
					y: direction.y,
					z: direction.z,
					speed: speed
				};
			}
			catch {
				this._angularVel.speed = 0; // set speed to zero will ignore angular velocity
			}
		}
		else {
			throw "Incorrect angular velocity!"
		}
	}

	public rotateThroughEulerAngles(speed: number, angles?: eulerAnglesDeg) {
		if (this._dimensions == 2 && angles == undefined) {
			// only rotations about the z-axis are allowed
			this._angularVel = { x: 0, y: 0, z: 1, speed: speed };
		}
		else if (this._dimensions == 3 && angles != undefined) {
			try {
				let direction = (new XYZVector([angles.yaw, angles.pitch, angles.roll])).getDirection();
				this._eulerAngularVelocityDeg = {
					yaw: direction.x * speed,
					pitch: direction.y * speed,
					roll: direction.z * speed,
				};
			}
			catch {
				this._eulerAngularVelocityDeg = { yaw: 0, pitch: 0, roll: 0 };
			}
		}
		else {
			throw "Incorrect angular velocity!"
		}
	}

	public translateAlongLocalAxes = (speedX: number, speedY: number, speedZ: number) => {
		let vec4Velocity = <XYZVector>this._rotation.multiplyBy(new XYZVector([speedX, speedY, speedZ, 1]));
		this.translateAlongGlobalAxis({
			x: vec4Velocity.x,
			y: vec4Velocity.y,
			z: vec4Velocity.z
		})
	}

	public setScale = (scale: Vec3) => { this._scale = scale; }

	public update = (deltaTime: number) => {
		if (this._isUpdated) return;
		this._isUpdated = true;

		this.updatePlayer()

		if (this._parent != null) {
			// Update the parent and apply the changes to this node
			this._parent.update(deltaTime);
			let newPosition = <XYZVector>this._parent.modelMatrix.multiplyBy(
				new XYZVector([
					this._relativePosition.x,
					this._relativePosition.y,
					this._relativePosition.z,
					1
				]))
			this._position = {
				x: newPosition.x,
				y: newPosition.y,
				z: newPosition.z
			}

			this._rotation = <XYZMatrix>this._parent._rotation.multiplyBy(
				this._relativeRotation
			)
		}
		else {
			this._position.x += this._linearVel.x * deltaTime;
			this._position.y += this._linearVel.y * deltaTime;
			this._position.z += this._linearVel.z * deltaTime;

			this._anglesDeg.yaw += this._eulerAngularVelocityDeg.yaw;
			this._anglesDeg.pitch += this._eulerAngularVelocityDeg.pitch;
			this._anglesDeg.roll += this._eulerAngularVelocityDeg.roll;
			this._rotation = XYZMatLab.makeRotationMatrixFromEulerAngles(this._anglesDeg);

			if (this._angularVel.speed != 0) {
				this._rotationAngle = this._angularVel.speed * deltaTime
				let addedRotation = XYZMatLab.makeRotationMatrix(
					this._rotationAngle,
					this._angularVel.x,
					this._angularVel.y,
					this._angularVel.z);
				this._rotation = <XYZMatrix>this._rotation.multiplyBy(addedRotation);
			}
		}

		this._modelMatrix = XYZMatLab.makeModelMatrix(
			this._position,
			this._rotation,
			this._scale
		);
	}

	public makePlayer = () => { this._isPlayer = true; }

	private updatePlayer = () => {
		if (this._isPlayer) {
			let vx = 0;
			let vz = 0;
			if (XYZKeyboard.getKeyState("Velocity", "Left")) vx -= 10;
			if (XYZKeyboard.getKeyState("Velocity", "Right")) vx += 10;
			if (XYZKeyboard.getKeyState("Velocity", "Forward")) vz -= 10;
			if (XYZKeyboard.getKeyState("Velocity", "Backward")) vz += 10;
			this.translateAlongLocalAxes(vx, 0, vz);

			let ax = 0;
			let ay = 0;
			if (XYZKeyboard.getKeyState("Angular velocity", "Left")) ay += 1;
			if (XYZKeyboard.getKeyState("Angular velocity", "Right")) ay -= 1;
			if (XYZKeyboard.getKeyState("Angular velocity", "Forward")) ax -= 1;
			if (XYZKeyboard.getKeyState("Angular velocity", "Backward")) ax += 1;
			this.rotateAboutGlobalAxis({ speed: 100, x: ax, y: ay, z: 0 });

			let yaw = 0;
			let pitch = 0;
			if (XYZKeyboard.getKeyState("Euler angles", "Pitch+")) pitch += 1;
			if (XYZKeyboard.getKeyState("Euler angles", "Pitch-")) pitch -= 1;
			if (XYZKeyboard.getKeyState("Euler angles", "YawLeft")) yaw += 1;
			if (XYZKeyboard.getKeyState("Euler angles", "YawRight")) yaw -= 1;
			this.rotateThroughEulerAngles(2, { yaw: yaw, pitch: pitch, roll: 0 });
		}
	}
}
