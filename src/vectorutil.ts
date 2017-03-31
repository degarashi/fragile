import Vec2 from "./vector2";
import Vec3 from "./vector3";
import Vec4 from "./vector4";
import VectorImpl from "./vectorimpl";
import Vector from "./vector";

export function MakeVector(n: number, ...args: number[]) {
	switch(n) {
		case 2:
			return new Vec2(args[0], args[1]);
		case 3:
			return new Vec3(args[0], args[1], args[2]);
		case 4:
			return new Vec4(args[0], args[1], args[2], args[3]);
	}
	throw new Error("invalid dimension");
}
