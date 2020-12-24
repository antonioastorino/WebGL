import { XYZFileLoader } from "../base/XYZFileLoader.js";

export class XYZKeyboard {
	private static _keyStates: any = {};
	private static _keyDictionary: any = {};

	public static init = async (configFile: string) => {
		let keyDict = await XYZFileLoader.loadJson(configFile);

		// Add keys to _keyStates object and set initial state to released (0)
		for (var property in keyDict) {
			let keys = keyDict[property];
			for (var key in keys) {
				XYZKeyboard._keyStates[keys[key]] = 0;
			}
		}
		XYZKeyboard._keyDictionary = keyDict;

		window.addEventListener("keydown", XYZKeyboard.press);
		window.addEventListener("keyup", XYZKeyboard.release);
	}

	/** Set the key status to pressed (1) when pressed.
	 * Ignore repetitions and keys not configured in keyboard.json
	 * */
	private static press(e: KeyboardEvent) {
		if (XYZKeyboard._keyStates[e.code] == 0) {
			XYZKeyboard._keyStates[e.code] = 1;
		}
	}

	/** Set the key status to released (0) when released.
	 * Ignore keys not int keyboard.json
	 */
	private static release(e: KeyboardEvent) {
		if (XYZKeyboard._keyStates[e.code] == 1) {
			XYZKeyboard._keyStates[e.code] = 0;
		}
	}

	public static getKeyState = (property: string, action: string): number | undefined => {
		try {
			let code = XYZKeyboard._keyDictionary[property][action];
			return XYZKeyboard._keyStates[code]
		}
		catch{
			return undefined;
		}
	}
}