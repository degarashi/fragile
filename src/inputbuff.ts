import Vec2 from "./vector2";

export default class InputBuff {
	key: {[key: string]: boolean} = {};
	mkey: {[key: string]: boolean} = {};
	wheelDelta: Vec2 = new Vec2(0);
	pos: Vec2|null = null;
	dblClick: number = 0;
}
