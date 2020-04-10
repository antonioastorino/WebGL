export class XYZFileLoader {
	public static loadText = (filePath: string): Promise<string> => {
		let xhttp = new XMLHttpRequest();
		return new Promise<string>((resolve) => {
			xhttp.onreadystatechange = function () {
				if (xhttp.readyState != 4) return;
				if (xhttp.status >= 200 && xhttp.status < 300) {
					let text = xhttp.response;
					resolve(text);
				}
			};
			xhttp.open("GET", filePath, true);
			xhttp.responseType = "text";
			xhttp.send();
		});
	}

	public static loadImage = (imgFileName: string): Promise<HTMLImageElement> => {
		let texImg: HTMLImageElement = new Image();
		return new Promise((resolve, reject)  => {
			texImg.addEventListener('load', () => {
				resolve(texImg);
				reject();
			});
			texImg.src = './assets/textures/' + imgFileName;
		});
	}

	public static loadJson = async (jsonFilePath: string): Promise<any> => {
		let text = await XYZFileLoader.loadText(jsonFilePath);		
		return JSON.parse(text);
	}
}