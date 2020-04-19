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
	protected _v3Pos = new XYZVec3([0, 0, 0]);
	protected _m4Rot: XYZMatrix = (new XYZMatrix(4, 4)).identity();
	protected _v3Scale = new XYZVec3([1, 1, 1]);
	protected _dimensions: number = 0;
	private _isPlayer: boolean = false;
	private _vec3RelPos = new XYZVec3([0, 0, 0]);
	private _mat4RelRot: XYZMatrix = (new XYZMatrix(4, 4)).identity();

	// Physics
	private _isUpdated: boolean = false;
	private _parent: XYZNode | null = null;
	private _linearVel = new XYZVec3([0, 0, 0]);
	private _angularVel = { x: 0, y: 0, z: 1, speed: 0 };

	public getVec3Pos(): XYZVec3 { return this._v3Pos; }
	public getMat4Rot(): XYZMatrix { return this._m4Rot; }
	public getVec3Scale(): XYZVec3 { return this._v3Scale; }
	public getMat4Model = (): XYZMatrix => { return this._modelMatrix; }

	public setParent(node: XYZNode) {
		this._parent = node;
		this._vec3RelPos.x = this._v3Pos.x - this._parent._v3Pos.x;
		this._vec3RelPos.y = this._v3Pos.y - this._parent._v3Pos.y;
		this._vec3RelPos.z = this._v3Pos.z - this._parent._v3Pos.z;

		this._mat4RelRot = <XYZMatrix>this._parent._m4Rot.transpose().multiplyByMatrix(
			this._m4Rot
		);
	}

	public reset() { this._isUpdated = false; }

	public setPosition = (x: number, y: number, z: number) => { this._v3Pos = new XYZVec3([x, y, z]); }

	private getLocalXAxis = (): XYZVec4 => { return new XYZVec4(this._modelMatrix.getMatrix()[0]); }
	private getLocalYAxis = (): XYZVec4 => { return new XYZVec4(this._modelMatrix.getMatrix()[1]); }
	private getLocalZAxis = (): XYZVec4 => { return new XYZVec4(this._modelMatrix.getMatrix()[2]); }

	private rotateAboutLocalX = (speed: number) => {
		let axis = this.getLocalXAxis();
		this._m4Rot = XYZMatLab.makeRotationMatrix(speed, axis.x, axis.y, axis.z).multiplyByMatrix(this._m4Rot);
	}
	private rotateAboutLocalY = (speed: number) => {
		let axis = this.getLocalZAxis();
		this._m4Rot = XYZMatLab.makeRotationMatrix(speed, axis.x, axis.y, axis.z).multiplyByMatrix(this._m4Rot);
	}
	private rotateAboutLocalZ = (speed: number) => {
		let axis = this.getLocalZAxis();
		this._m4Rot = XYZMatLab.makeRotationMatrix(speed, axis.x, axis.y, axis.z).multiplyByMatrix(this._m4Rot);
	}
	
	private rotateAboutLocalAxis = (x: number, y: number, z: number, speed: number) => {
		let localAxis = new XYZVec4([x, y, z, 0]);
		let globalAxis = <XYZVec4>this._m4Rot.multiplyByVector(localAxis);
		this._m4Rot = XYZMatLab.makeRotationMatrix(speed, globalAxis.x, globalAxis.y, globalAxis.z).multiplyByMatrix(this._m4Rot);
	}

	private rotateAboutGlobalAxis = (x: number, y: number, z: number, speed: number) => {
		this._m4Rot = XYZMatLab.makeRotationMatrix(speed, x, y, z).multiplyByMatrix(this._m4Rot);
	}

	public setAngVel = (x: number, y: number, z: number, speed: number) => {
		if (this._dimensions == 2) {
			// only rotations about the z-axis are allowed
			this._angularVel = { x: 0, y: 0, z: 1, speed: speed };
		}
		else {
			try { // fails if axis has zero length
				let axis = <XYZVec3>(new XYZVec3([x, y, z])).getDirection();
				this._angularVel = { x: axis.x, y: axis.y, z: axis.z, speed: speed };
			}
			catch {
				this._angularVel.speed = 0; // set speed to zero will ignore angular velocity
			}
		}
	}

	// set the linear velocity in local coordinates
	public setLocalLinVel = (speedX: number, speedY: number, speedZ: number) => {
		let vec4Velocity = <XYZVec4>this._m4Rot.multiplyByVector(new XYZVec4([speedX, speedY, speedZ, 0]));
		this.setGlobalLinVel(vec4Velocity.x, vec4Velocity.y, vec4Velocity.z);
	}

	// set the linear velocity in world coordinates
	public setGlobalLinVel = (speedX: number, speedY: number, speedZ: number) => {
		this._linearVel.x = speedX;
		this._linearVel.y = speedY;
		this._linearVel.z = speedZ;
	}

	public setScale = (scaleX: number, scaleY: number, scaleZ: number) => {
		this._v3Scale = new XYZVec3([scaleX, scaleY, scaleZ]);
	}

	public update = (deltaTime: number) => {
		if (this._isUpdated) return;
		this._isUpdated = true;

		this.updatePlayer()

		if (this._parent != null) {
			// Update the parent and apply the changes to this node
			this._parent.update(deltaTime);
			this._v3Pos = (<XYZVec4>this._parent._m4Rot.multiplyByVector(new XYZVec4([
					this._vec3RelPos.x,
					this._vec3RelPos.y,
					this._vec3RelPos.z,
					1
				]))).xyz

			this._v3Pos.x += this._parent._v3Pos.x
			this._v3Pos.y += this._parent._v3Pos.y
			this._v3Pos.z += this._parent._v3Pos.z

			this._vec3RelPos.x += this._linearVel.x * deltaTime;
			this._vec3RelPos.y += this._linearVel.y * deltaTime;
			this._vec3RelPos.z += this._linearVel.z * deltaTime;
			
			if (this._angularVel.speed != 0) {
				let localAxis = new XYZVec4([this._angularVel.x, this._angularVel.y, this._angularVel.z, 0]);
				let globalAxis = <XYZVec4>this._mat4RelRot.multiplyByVector(localAxis);
				let speed = this._angularVel.speed * deltaTime;
				this._mat4RelRot = XYZMatLab.makeRotationMatrix(speed, globalAxis.x, globalAxis.y, globalAxis.z).multiplyByMatrix(this._mat4RelRot);
			}
			this._m4Rot = <XYZMatrix>this._parent._m4Rot.multiplyByMatrix(this._mat4RelRot);
		}
		else {
			this._v3Pos.x += this._linearVel.x * deltaTime;
			this._v3Pos.y += this._linearVel.y * deltaTime;
			this._v3Pos.z += this._linearVel.z * deltaTime;

			if (this._angularVel.speed != 0) {
				let speedX = this._angularVel.speed * deltaTime * this._angularVel.x;
				let speedY = this._angularVel.speed * deltaTime * this._angularVel.y;
				let speedZ = this._angularVel.speed * deltaTime * this._angularVel.z;
				this.rotateAboutLocalX(speedX);
				this.rotateAboutGlobalAxis(0, 1, 0, speedY);
				this.rotateAboutLocalAxis(0, 0, 1, speedZ);
			}
		}

		this._modelMatrix = XYZMatLab.makeModelMatrix(
			this._v3Pos,
			this._m4Rot,
			this._v3Scale
		);
	}

	public makePlayer = () => { this._isPlayer = true; }

	private updatePlayer = () => {
		if (this._isPlayer) {
			let vx = 0;
			let vy = 0;
			let vz = 0;
			let v = 30;
			if (XYZKeyboard.getKeyState("Velocity", "Left")) vx -= v;
			if (XYZKeyboard.getKeyState("Velocity", "Right")) vx += v;
			if (XYZKeyboard.getKeyState("Modifiers", "ShiftLeft")) {
				if (XYZKeyboard.getKeyState("Velocity", "Forward")) vy += v;
				if (XYZKeyboard.getKeyState("Velocity", "Backward")) vy -= v;
			} else {
				if (XYZKeyboard.getKeyState("Velocity", "Forward")) vz -= v;
				if (XYZKeyboard.getKeyState("Velocity", "Backward")) vz += v;
			}
			this.setLocalLinVel(vx, vy, vz);

			let ax = 0;
			let ay = 0;
			let az = 0;
			if (XYZKeyboard.getKeyState("Modifiers", "ShiftRight")) {
				if (XYZKeyboard.getKeyState("Angular velocity", "Left")) az += 1;
				if (XYZKeyboard.getKeyState("Angular velocity", "Right")) az -= 1;
			}
			else {
				if (XYZKeyboard.getKeyState("Angular velocity", "Left")) ay += 1;
				if (XYZKeyboard.getKeyState("Angular velocity", "Right")) ay -= 1;
			}
			if (XYZKeyboard.getKeyState("Angular velocity", "Forward")) ax += 1;
			if (XYZKeyboard.getKeyState("Angular velocity", "Backward")) ax -= 1;
			this.setAngVel(ax, ay, az, 50);
		}
	}
}
