export interface Vec2 {
	x: number,
	y: number
}

export interface Vec3 extends Vec2 {
	z: number
}

export interface Vec4 extends Vec3 {
	w: number
}

export interface RotationVec4 extends Vec3 {
	angle: number
}

export interface AngularVelocityVec4 extends Vec3 {
	speed: number
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

export interface eulerAnglesDeg {
	yaw: number,
	pitch: number,
	roll: number
}