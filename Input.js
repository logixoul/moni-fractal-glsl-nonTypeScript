import { globals } from "./Globals.js";
import * as THREE from 'three';
import * as KeysHeld from './KeysHeld';
import * as TweenJS from './Tween'

export function mix(x, y, a) {
    return x*(1-a)+y*a;
}

export class Input {
    constructor() {
        globals.tweenGroup = new TweenJS.Group();
        globals.targetRealSet = { start: globals.REAL_SET.start, end: globals.REAL_SET.end };
        globals.targetImaginarySet = { start: globals.IMAGINARY_SET.start, end: globals.IMAGINARY_SET.end };

        this.addSlider("numIterations", 1, 2000);
        this.addSlider("initialX", -1, 2);
        this.addSlider("initialY", -1, 2);
        console.log("ASDAD");
        document.addEventListener("wheel", e => {
            //e.preventDefault();
            if (e.button != 0)
                return;
            const ZOOM_FACTOR = e.deltaY < 0 ? 0.4 : -0.4;
            const m = this.unprojectPoint(e.x, e.y, globals.stateTex.get());

            globals.targetRealSet.start = mix(globals.targetRealSet.start, m.x, ZOOM_FACTOR);
            globals.targetRealSet.end = mix(globals.targetRealSet.end, m.x, ZOOM_FACTOR);
            globals.targetImaginarySet.start = mix(globals.targetImaginarySet.start, m.y, ZOOM_FACTOR),
            globals.targetImaginarySet.end = mix(globals.targetImaginarySet.end, m.y, ZOOM_FACTOR);
            //new TweenJS.Tween(globals.REAL_SET, globals.tweenGroup).to(globals.targetRealSet, 3000).dynamic(true).duration(300).easing(TweenJS.Easing.Exponential.Out).start();
            //new TweenJS.Tween(globals.IMAGINARY_SET, globals.tweenGroup).to(globals.targetImaginarySet, 3000).dynamic(true).duration(300).easing(TweenJS.Easing.Exponential.Out).start();
               });
        let prevMouseX = null;
        let prevMouseY = null;
        document.addEventListener("mousedown", e => {
            prevMouseX = e.x;
            prevMouseY = e.y;
        });
        document.addEventListener("mousemove", e => {
            if ((e.buttons & 1) != 0) {
                let movementX = e.x - prevMouseX;
                let movementY = e.y - prevMouseY;
                if(prevMouseX == null) movementX = 0;
                if(prevMouseY == null) movementY = 0;
                prevMouseX = e.x;
                prevMouseY = e.y;
                console.log("movementX=", movementX);
                const movementUnprojected = this.unprojectVector(movementX, movementY, globals.stateTex.get());
                console.log("movementUnprojected.X=", movementUnprojected.x);
                //movementUnprojected.x *= .01;
                //movementUnprojected.y *= .01;
                globals.targetRealSet = {
                    start: globals.targetRealSet.start + movementUnprojected.x,
                    end: globals.targetRealSet.end + movementUnprojected.x
                };
                globals.targetImaginarySet = {
                    start: globals.targetImaginarySet.start + movementUnprojected.y,
                    end: globals.targetImaginarySet.end + movementUnprojected.y
                };
                //drawLine(new THREE.Vector2(e.x, e.y), new THREE.Vector2(e.x - e.movementX, e.y - e.movementY));
            }
        });
        document.addEventListener("keydown", e => {
            const char = e.code.toLowerCase();
            KeysHeld.global_keysHeld[char] = true;
        });
        document.addEventListener("keyup", e => {
            const char = e.code.toLowerCase();
            KeysHeld.global_keysHeld[char] = false;
        });
    }
    // https://stackoverflow.com/a/35385518/122687
    htmlToNodes(html) {
        const template = document.createElement('template');
        template.innerHTML = html;
        return template.content;
    }
    addSlider(id, min, max) {
        const defaultValue = globals.configuration[id];
        const tagId = `slider-${id}`;
        const sliderContainer = this.htmlToNodes(`
			<p>
			<label for="${tagId}">${id}:</label>
			<input type="range" id="${tagId}" min="${min}" max="${max}" step="any" value="${defaultValue}"/>
			</p>
			`);
        const slider = sliderContainer.querySelector("#" + tagId);
        slider.oninput = (e) => {
            globals.configuration[id] = Number(e.target.value);
            console.log("slider moved ", e);
        };
        document.getElementById("sliderBox").appendChild(sliderContainer);
    }
    unprojectPoint(x, y, tex) {
        let val = new THREE.Vector2(x, tex.image.height/globals.configuration.scale - 1 - y);
        val.x /= window.innerWidth;
        val.y /= window.innerHeight;
        val.x = mix(globals.REAL_SET.start, globals.REAL_SET.end, val.x);
        val.y = mix(globals.IMAGINARY_SET.start, globals.IMAGINARY_SET.end, val.y);
        return val;
    }
    unprojectVector(x, y) {
        let val = new THREE.Vector2(-x, y);
        val.x /= window.innerWidth;
        val.y /= window.innerHeight;
        val.x *= globals.REAL_SET.end - globals.REAL_SET.start;
        val.y *= globals.IMAGINARY_SET.end - globals.IMAGINARY_SET.start;
        //val.x = mix(globals.REAL_SET.start, globals.REAL_SET.end, val.x);
        //val.y = mix(globals.IMAGINARY_SET.start, globals.IMAGINARY_SET.end, val.y);
        return val;
    }
}
