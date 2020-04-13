import { AngularVelocityVec4, eulerAnglesDeg } from "../lib/data-types/XYZVertex.js";
import { XYZMatLab } from "../lib/math/XYZMatLab.js";
import { XYZMatrix } from "../lib/math/XYZMatrix.js";
import { XYZKeyboard } from "../inputs/XYZKeyboard.js";
import { XYZRenderer } from "../base/XYZRenderer.js";
import { XYZVec3 } from "../lib/data-types/XYZVec3.js";
import { XYZVec4 } from "../lib/data-types/XYZVec4.js";

export class XYZNode {
	protected constructor() {
		XYZRenderer.addNode(this);
	}
	private _modelMatrix: XYZMatrix = (new XYZMatrix(4, 4)).identity();
	protected _vec3Position = new XYZVec3([0, 0, 0]);
	protected _mat4Rotation: XYZMatrix = (new XYZMatrix(4, 4)).identity();
	private _anglesDeg: eulerAnglesDeg = { yaw: 0, pitch: 0, roll: 0 };
	protected _scale = new XYZVec3([1, 1, 1]);
	protected _dimensions: number = 0;
	private _isPlayer: boolean = false;
	private _vec3RelativePosition = new XYZVec3([0, 0, 0]);
	private _relativeRotation: XYZMatrix = (new XYZMatrix(4, 4)).identity();
	private _relativeScale = new XYZVec3([1, 1, 1]);

	// Physics
	private _isUpdated: boolean = false;
	private _parent: XYZNode | null = null;
	private _linearVel = new XYZVec3([0, 0, 0]);
	private _angularVel: AngularVelocityVec4 = { x: 0, y: 0, z: 1, speed: 0 };
	private _rotationAngle: number = 0;
	private _eulerAngularVelocityDeg: eulerAnglesDeg = { yaw: 0, pitch: 0, roll: 0 };

	public getPositionVec3(): XYZVec3 { return this._vec3Position; }
	public getRotationMat4(): XYZMatrix { return this._mat4Rotation; }
	public getScaleVec3(): XYZVec3 { return this._scale; }

	public setParent(node: XYZNode) {
		this._parent = node;
		this._vec3RelativePosition.x = this._vec3Position.x - this._parent._vec3Position.x;
		this._vec3RelativePosition.y = this._vec3Position.y - this._parent._vec3Position.y;
		this._vec3RelativePosition.z = this._vec3Position.z - this._parent._vec3Position.z;

		this._relativeRotation = <XYZMatrix>this._parent._mat4Rotation.transpose().multiplyByMatrix(
			this._mat4Rotation
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
	public setPosition = (x: number, y: number, z: number) => { this._vec3Position = new XYZVec3([x, y, z]); }

	public translateAlongGlobalAxis = (speedX: number, speedY: number, speedZ: number) => {
		this._linearVel.x = speedX;
		this._linearVel.y = speedY;
		this._linearVel.z = speedZ;
	}

	public rotateAboutGlobalAxis = (angularVelocity: AngularVelocityVec4 | number) => {
		if (this._dimensions == 2 && typeof (angularVelocity) == 'number') {
			// only rotations about the z-axis are allowed
			this._angularVel = { x: 0, y: 0, z: 1, speed: <number>angularVelocity };
		}
		else if (this._dimensions == 3 && typeof (angularVelocity) == 'object') {
			angularVelocity = <AngularVelocityVec4>angularVelocity;
			let speed = angularVelocity.speed;
			try {
				let direction = <XYZVec3>(new XYZVec3([angularVelocity.x, angularVelocity.y, angularVelocity.z])).getDirection();
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
				let direction = <XYZVec3>(new XYZVec3([angles.yaw, angles.pitch, angles.roll])).getDirection();
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

	public setLinearVelocity = (speedX: number, speedY: number, speedZ: number) => {
		let vec4Velocity = <XYZVec4>this._mat4Rotation.multiplyByVector(new XYZVec4([speedX, speedY, speedZ, 1]));
		this.translateAlongGlobalAxis(vec4Velocity.x, vec4Velocity.y, vec4Velocity.z);
	}

	public setScale = (scaleX:number, scaleY:number, scaleZ:number) => {
		this._scale = new XYZVec3([scaleX, scaleY, scaleZ]);
	}

	public update = (deltaTime: number) => {
		if (this._isUpdated) return;
		this._isUpdated = true;

		this.updatePlayer()

		if (this._parent != null) {
			// Update the parent and apply the changes to this node
			this._parent.update(deltaTime);
			this._vec3Position = (<XYZVec4>this._parent._mat4Rotation.multiplyByVector(
				new XYZVec4([
					this._vec3RelativePosition.x,
					this._vec3RelativePosition.y,
					this._vec3RelativePosition.z,
					1
				]))).xyz
			
			this._vec3Position.x += this._parent._vec3Position.x
			this._vec3Position.y += this._parent._vec3Position.y
			this._vec3Position.z += this._parent._vec3Position.z

			this._mat4Rotation = <XYZMatrix>this._parent._mat4Rotation.multiplyByMatrix(
				this._relativeRotation
			)
			this._vec3RelativePosition.x += this._linearVel.x * deltaTime;
			this._vec3RelativePosition.y += this._linearVel.y * deltaTime;
			this._vec3RelativePosition.z += this._linearVel.z * deltaTime;
		}
		else {
			this._vec3Position.x += this._linearVel.x * deltaTime;
			this._vec3Position.y += this._linearVel.y * deltaTime;
			this._vec3Position.z += this._linearVel.z * deltaTime;

			if (this._eulerAngularVelocityDeg.yaw
				|| this._eulerAngularVelocityDeg.pitch
				|| this._eulerAngularVelocityDeg.roll) {
				this._anglesDeg.yaw += this._eulerAngularVelocityDeg.yaw;
				this._anglesDeg.pitch += this._eulerAngularVelocityDeg.pitch;
				this._anglesDeg.roll += this._eulerAngularVelocityDeg.roll;
				this._mat4Rotation = XYZMatLab.makeRotationMatrixFromEulerAngles(this._anglesDeg);
			}
			else if (this._angularVel.speed != 0) {
				this._rotationAngle = this._angularVel.speed * deltaTime
				let addedRotation = XYZMatLab.makeRotationMatrix(
					this._rotationAngle,
					this._angularVel.x,
					this._angularVel.y,
					this._angularVel.z);
				this._mat4Rotation = <XYZMatrix>this._mat4Rotation.multiplyByMatrix(addedRotation);
			}
		}

		this._modelMatrix = XYZMatLab.makeModelMatrix(
			this._vec3Position,
			this._mat4Rotation,
			this._scale
		);
	}

	public makePlayer = () => { this._isPlayer = true; }

	private updatePlayer = () => {
		if (this._isPlayer) {
			let vx = 0;
			let vy = 0;
			let vz = 0;

			if (XYZKeyboard.getKeyState("Velocity", "Left")) vx -= 30;
			if (XYZKeyboard.getKeyState("Velocity", "Right")) vx += 30;
			if (XYZKeyboard.getKeyState("Velocity", "ShiftLeft")) {
				if (XYZKeyboard.getKeyState("Velocity", "Forward")) vy += 10;
				if (XYZKeyboard.getKeyState("Velocity", "Backward")) vy -= 10;
			} else {
				if (XYZKeyboard.getKeyState("Velocity", "Forward")) vz -= 10;
				if (XYZKeyboard.getKeyState("Velocity", "Backward")) vz += 10;
			}
			this.setLinearVelocity(vx, vy, vz);

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
