import { XYZMatrix } from './XYZMatrix.js'
import { XYZVector } from './XYZVector.js'
import { XYZQuaternion } from './XYZQuaternion.js'

export class XYZMatLab {
	public static multiply = (a: XYZMatrix, b: XYZMatrix | XYZVector | number): XYZMatrix | XYZVector => {
		return a.multiplyBy(b);;
	}

	public static transpose = (a: XYZMatrix): XYZMatrix | XYZVector => {
		var outMatrix = a.makeCopy();
		outMatrix.transpose();
		return outMatrix;
	}

	public static makeTranslationMatrix = (vector: XYZVector): XYZMatrix => {
		let matTranslation = (new XYZMatrix(4,4)).identity();
		matTranslation.setElement(0,3,vector.getElement(0));
		matTranslation.setElement(1,3,vector.getElement(1));
		matTranslation.setElement(2,3,vector.getElement(2));
		return matTranslation;
	}

	public static makeRotationMatrix = (angle_deg: number, x: XYZVector | number, y?: number, z?: number): XYZMatrix => {
		let quat: XYZQuaternion;
		if (y == undefined || z == undefined) {
			quat = new XYZQuaternion(angle_deg, <XYZVector>x);
		}
		else {
			quat = new XYZQuaternion(angle_deg, <number>x, y, z);
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

	public static makeLookAtMatrix = (quat: XYZQuaternion, pos: XYZVector): XYZMatrix => {
		let rotationMatrix = XYZMatLab.makeRotationMatrix(-quat.getAngleDeg(), quat.getVector());
		let translationMatrix = XYZMatLab.makeTranslationMatrix(pos.multiplyBy(-1));

		return <XYZMatrix>rotationMatrix.multiplyBy(translationMatrix);
	}
}
