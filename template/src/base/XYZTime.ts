export class XYZTime {
	private static _currTime: number = performance.now();

	public static get deltaTime(): number {
		let newTime = performance.now()
		let delta = newTime - this._currTime;
		this._currTime = newTime;
		return delta;
	}
}