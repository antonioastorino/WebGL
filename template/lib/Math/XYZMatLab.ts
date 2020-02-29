import { XYZMatrix } from './XYZMatrix.js'
import { XYZVector } from './XYZVector.js'

export class XYZMatLab {
	static multiply = (a: XYZMatrix, b: XYZMatrix | XYZVector | number): XYZMatrix | XYZVector => {
		return a.multiplyBy(b);;
	}

	static transpose = (a: XYZMatrix): XYZMatrix | XYZVector => {
		var outMatrix = a.makeCopy();
		outMatrix.transpose();
		return outMatrix;
	}

	static makeTranslationMatrix = (vector: XYZVector): XYZMatrix => {
		let matTranslation = (new XYZMatrix(4,4)).identity();
		matTranslation.setElement(0,3,vector.getElement(0));
		matTranslation.setElement(1,3,vector.getElement(1));
		matTranslation.setElement(2,3,vector.getElement(2));
		return matTranslation;
	}
}