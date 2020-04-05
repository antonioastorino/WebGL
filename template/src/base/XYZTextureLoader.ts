export class XYZTextureLoader {
	public static loadTexture = (texFileName: string): Promise<HTMLImageElement> => {
		let texImg: HTMLImageElement = new Image();
		return new Promise((resolve, reject)  => {
			texImg.addEventListener('load', () => {
				resolve(texImg);
				reject();
			});
			texImg.src = './assets/textures/' + texFileName;
		});
	}
}