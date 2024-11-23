export class Configuration {
    constructor() {
        this.numIterations = 100;
        this.initialX = 0.1;
        this.initialY = 0;
    }
}
export class Globals {
    constructor() {
        this.stateTex = null;
        this.REAL_SET = { start: -2, end: 1 };
        this.IMAGINARY_SET = { start: -1, end: 1 };
        this.scale = 1;
        this.configuration = new Configuration();
    }
}
;
export var globals = new Globals();
