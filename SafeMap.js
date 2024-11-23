// todo: move this into util.ts when util becomes ts
// NOTE: I won't be using this, as `Map` uses reference-equality for 
export class SafeMap extends Map {
    constructor() {
        super();
    }
    checkedGet(key) {
        if (!super.has(key))
            throw "lxError";
        return super.get(key);
    }
}
