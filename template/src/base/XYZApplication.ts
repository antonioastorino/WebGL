export class XYZApplication {
	private static _gl: WebGLRenderingContext;
	public static _canvas: HTMLCanvasElement;

	public static init() {
		this._canvas = <HTMLCanvasElement>document.getElementById("glCanvas");
		this._gl = <WebGLRenderingContext>this._canvas.getContext('webgl');
		this._gl.clearColor(0.75, 0.85, 0.8, 1.0);
		this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
		this._gl.enable(this._gl.DEPTH_TEST);
		this._gl.enable(this._gl.CULL_FACE);
		this._gl.frontFace(this._gl.CCW);
		this._gl.cullFace(this._gl.BACK);
	}

	public static get aspectRatio() { return this._canvas.width/this._canvas.height; }

	public static get gl() { return this._gl; }
}