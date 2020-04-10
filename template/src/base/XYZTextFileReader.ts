export class XYZTextFileReader {
	public static load = (filePath: string): Promise<string> => {
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
}