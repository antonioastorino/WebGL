export interface Vec3 {
	x: number,
	y: number,
	z: number
}

export interface Vec4 extends Vec3 {
	w: number
}

export interface RotationVec4 extends Vec3 {
	angle: number
}

export interface RGB {
	r: number,
	g: number,
	b: number
}

export interface VertexWithColor {
	vertex: Vec3,
	color: RGB
}