import { XYZMatrix } from './XYZMatrix.js'
import { XYZVector } from './XYZVector.js'
import { XYZQuaternion } from './XYZQuaternion.js'
import { XYZVec3 } from '../data-types/XYZVec3.js'

export class XYZMatLab {
	public static makeTranslationMatrix = (vector: XYZVector): XYZMatrix => {
		let matTranslation = (new XYZMatrix(4, 4)).identity();
		matTranslation.setElement(0, 3, vector.getElement(0));
		matTranslation.setElement(1, 3, vector.getElement(1));
		matTranslation.setElement(2, 3, vector.getElement(2));
		return matTranslation;
	}

	/**
	 * Returns a matrix which is the product of three rotation matrices:
	 * 1. Ry - yaw (rotation about the model y-axis)
	 * 2. Rx - pitch (rotation about the model x-axis)
	 * 3. Rz - roll (rotation about the model z-axis)
	 * The resulting matrix is Rz * Rx * Ry
	 * @param anglesDeg
	 */
	public static makeRotationMatrixFromEulerAngles(anglesDeg: { pitch: number, yaw: number, roll: number }): XYZMatrix {
		let phi = anglesDeg.pitch * Math.PI / 180;
		let theta = anglesDeg.yaw * Math.PI / 180;
		let psi = anglesDeg.roll * Math.PI / 180;

		let cosPhi = Math.cos(phi);
		let sinPhi = Math.sin(phi);
		let cosTheta = Math.cos(theta);
		let sinTheta = Math.sin(theta);
		let cosPsi = Math.cos(psi);
		let sinPsi = Math.sin(psi);

		let a00 = cosTheta * cosPsi;
		let a10 = cosTheta * sinPsi;
		let a20 = - sinTheta;

		let a01 = -cosPhi * sinPsi + sinPhi * sinTheta * cosPsi;
		let a11 = cosPhi * cosPsi + sinPhi * sinTheta * sinPsi;
		let a21 = sinPhi * cosTheta;

		let a02 = sinPhi * sinPsi + cosPhi * sinTheta * cosPsi;
		let a12 = - sinPhi * cosPsi + cosPhi * sinTheta * sinPsi;
		let a22 = cosPhi * cosTheta;

		let matRotation = new XYZMatrix([
			[a00, a10, a20, 0],
			[a01, a11, a21, 0],
			[a02, a12, a22, 0],
			[0, 0, 0, 1]
		]);

		return matRotation;
	}

	/**
	 * Returns a rotation matrix about a given vector. The vector doesn't need to be normalized
	 * @param angle_deg		angle of rotation in degrees
	 * @param x				x-component of the rotation vector
	 * @param y				y-component of the rotation vector
	 * @param z				z-component of the rotation vector
	 */
	public static makeRotationMatrix(angle_deg: number, x: number | XYZVec3, y?: number, z?: number): XYZMatrix {
		let quat: XYZQuaternion;
		if (y == undefined && z == undefined) {
			quat = new XYZQuaternion(angle_deg, (<XYZVec3>x));
		}
		else if (y == undefined || z == undefined) throw "Invalid function arguments"
		else {
			let dir = (new XYZVec3([<number>x, y, z])).getDirection();
			quat = new XYZQuaternion(angle_deg, <XYZVec3>dir);
		}
		let i = quat.i;
		let j = quat.j;
		let k = quat.k;
		let r = quat.r;
		return new XYZMatrix([
			[1 - 2 * (j * j + k * k), 2 * (i * j + k * r), 2 * (i * k - j * r), 0],
			[2 * (i * j - k * r), 1 - 2 * (i * i + k * k), 2 * (j * k + i * r), 0],
			[2 * (i * k + j * r), 2 * (j * k - i * r), 1 - 2 * (i * i + j * j), 0],
			[0, 0, 0, 1]
		])
	}

	public static makeEulerAnglesFromRotationMatrix = (mat4Rotation: XYZMatrix): {
		yaw: number,
		pitch: number,
		roll: number
	} => {

		let yaw, roll, pitch, theta, phi, psi;
		let R11 = mat4Rotation.getElement(0, 0);
		let R12 = mat4Rotation.getElement(0, 1);
		let R13 = mat4Rotation.getElement(0, 2);
		let R21 = mat4Rotation.getElement(1, 0);
		let R31 = mat4Rotation.getElement(2, 0);
		let R32 = mat4Rotation.getElement(2, 1);
		let R33 = mat4Rotation.getElement(2, 2);

		if (Math.abs(R31) != 1) {
			theta = - Math.asin(R31);
			let cosTheta = Math.cos(theta);
			phi = Math.atan2(R32 / cosTheta, R33 / cosTheta);
			psi = Math.atan2(R21 / cosTheta, R11 / cosTheta);

		}
		else {
			phi = 0;
			if (R31 == -1) {
				theta = Math.PI / 2.0;
				psi = Math.atan2(R12, R13);
			}
			else {
				theta = - Math.PI / 2.0;
				psi = Math.atan2(- R12, - R13);
			}
		}

		yaw = theta * 180 / Math.PI;
		pitch = phi * 180 / Math.PI;
		roll = psi * 180 / Math.PI;
		return { yaw: yaw, pitch: pitch, roll: roll };
	}

	public static makeScaleMatrix = (scaleX: number, scaleY?: number, scaleZ?: number): XYZMatrix => {
		let scaleMatrix = (new XYZMatrix(4, 4)).identity();
		scaleMatrix.setElement(0, 0, scaleX);
		if (scaleY == undefined || scaleZ == undefined) {
			scaleMatrix.setElement(1, 1, scaleX);
			scaleMatrix.setElement(2, 2, scaleX);
		}
		else {
			scaleMatrix.setElement(1, 1, scaleY);
			scaleMatrix.setElement(2, 2, scaleZ);
		}
		return scaleMatrix;
	}

	public static makeModelMatrix = (
		position: XYZVec3,
		rotation: XYZMatrix,
		scale: XYZVec3
	): XYZMatrix => {
		let matRotation = rotation;
		let matTranslation = XYZMatLab.makeTranslationMatrix(position);
		let matScale = XYZMatLab.makeScaleMatrix(scale.x, scale.y, scale.z);

		return <XYZMatrix>matTranslation.multiplyByMatrix(<XYZMatrix>matRotation.multiplyByMatrix(matScale));
	}

	public static makePerspectiveMatrix(aspect: number, fov_deg: number, near: number, far: number) {
		let t: number = Math.tan(fov_deg * Math.PI / 180 / 2); // tangent of the FOV
		let a: number = 1 / (aspect * t)
		let b: number = 1 / t
		let c: number = ((far + near) / (near - far))
		let d: number = (2 * (far * near) / (near - far))

		var outMatrix = new XYZMatrix([
			[a, 0, 0, 0],
			[0, b, 0, 0],
			[0, 0, c, -1],
			[0, 0, d, 0]
		])

		return outMatrix;
	}

	public static makeLookAtMatrix = (rotation: XYZMatrix, position: XYZVec3): XYZMatrix => {

		let vecPosition = new XYZVector([-position.x, -position.y, -position.z]);
		let matRotation = rotation.transpose();

		let matTranslation = XYZMatLab.makeTranslationMatrix(vecPosition);
		return <XYZMatrix>matRotation.multiplyByMatrix(matTranslation);
	}
}
