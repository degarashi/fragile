import GObject from "./gobject";
import {Assert} from "./utilfuncs";
import {default as State, BeginState, EndState} from "./state";

export default class FSMachine<T> extends GObject {
	private _state: State<T>;
	private _nextState: State<T>|null;

	constructor(p: number, state: State<T>) {
		super(p);
		this._state = state;
		this._nextState = null;
		state.onEnter(<T><any>this, <State<T>><any>BeginState);
	}
	_doSwitchState(): void {
		for(;;) {
			const ns = this._nextState;
			if(!ns)
				break;

			this._nextState = null;
			const old = this._state;
			old.onExit(<T><any>this, ns);
			this._state = ns;
			ns.onEnter(<T><any>this, old);
		}
	}
	setState(st: State<T>): void {
		Assert(!this._nextState);
		this._nextState = st;
	}
	onUpdate(dt: number): boolean {
		if(this.alive()) {
			this._state.onUpdate(<T><any>this, dt);
			this._doSwitchState();
		}
		return this.alive();
	}
	onDown(ret: any): void {
		this._state.onDown(<T><any>this, ret);
	}
	onUp(): void {
		this._state.onUp(<T><any>this);
	}
	discard(): boolean {
		if(this.alive()) {
			super.discard();
			this.setState(EndState);
			this._doSwitchState();
			return true;
		}
		return false;
	}
}
