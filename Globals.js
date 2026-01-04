export class Configuration {
    constructor() {
        this.numIterations = 540;
        this.initialX = 0.1;
        this.initialY = 0;
        this.scale = 1.0;
    }
}
export class Globals {
    tweenGroup;
    constructor() {
        this.stateTex = null;
        this.REAL_SET = { start: -2, end: 1 };
        this.IMAGINARY_SET = { start: -1, end: 1 };
        this.targetRealSet = { start: -2, end: 1 };
        this.targetImaginarySet = { start: -1, end: 1 };
        this.configuration = new Configuration();
    }
}
;
export var globals = new Globals();
