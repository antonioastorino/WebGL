import { XYZMatrix } from './XYZMatrix.js'
import { XYZVector } from './XYZVector.js'
import { XYZQuaternion } from './XYZQuaternion.js'
import { Vec3, eulerAnglesDeg } from '../data-types/XYZVertex.js'

export class XYZMatLab {
	public static multiply = (a: XYZMatrix, b: XYZMatrix | XYZVector | number): XYZMatrix | XYZVector => {
		return a.multiplyBy(b);;
	}

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
	public static makeRotationMatrixFromEulerAngles(anglesDeg: eulerAnglesDeg): XYZMatrix {
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
	public static makeRotationMatrix(angle_deg: number, x: XYZVector | number, y?: number, z?: number): XYZMatrix {
		let quat: XYZQuaternion;
		if (y == undefined && z == undefined) {
			quat = new XYZQuaternion(angle_deg, (<XYZVector>x).getDirection());
		}
		else if (y == undefined || z == undefined) throw "Invalid function arguments"
		else {
			let dir = (new XYZVector([<number>x, y, z])).getDirection();
			quat = new XYZQuaternion(angle_deg, dir);
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

	public static makeTranslateMatrix = (posX: number, posY: number, posZ: number): XYZMatrix => {
		let scaleMatrix = (new XYZMatrix(4, 4)).identity();
		scaleMatrix.setElement(0, 3, posX);
		scaleMatrix.setElement(1, 3, posY);
		scaleMatrix.setElement(2, 3, posZ);
		return scaleMatrix;
	}

	public static makeModelMatrix = (
		position: Vec3,
		rotation: XYZMatrix,
		scale: Vec3
	): XYZMatrix => {
		let matRotation = rotation;
		let matTranslation = XYZMatLab.makeTranslateMatrix(position.x, position.y, position.z);
		let matScale = XYZMatLab.makeScaleMatrix(scale.x, scale.y, scale.z);

		return <XYZMatrix>matTranslation.multiplyBy(<XYZMatrix>matRotation.multiplyBy(matScale));
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

	public static makeLookAtMatrix = (rotation: XYZMatrix, position: Vec3): XYZMatrix => {

		let vecPosition = new XYZVector([-position.x, -position.y, -position.z]);
		let matRotation = rotation.transpose();

		let matTranslation = XYZMatLab.makeTranslationMatrix(vecPosition);
		return <XYZMatrix>matRotation.multiplyBy(matTranslation);
	}
}
