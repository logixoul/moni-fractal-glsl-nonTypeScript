import { globals } from "./Globals.js";
import * as THREE from 'three';
import * as KeysHeld from './KeysHeld';

function mix(x, y, a) {
    return x*(1-a)+y*a;
}

export class Input {
    constructor() {
        this.addSlider("numIterations", 1, 2000);
        this.addSlider("initialX", -1, 2);
        this.addSlider("initialY", -1, 2);
        console.log("ASDAD");
        document.addEventListener("wheel", e => {
            //e.preventDefault();
            if (e.button != 0)
                return;
            const ZOOM_FACTOR = e.deltaY < 0 ? 0.1 : -0.1;
            const m = unproject(e.x, e.y, globals.stateTex.get());
            //const ratioX = m.x / (1.0 - m.x);
            //const ratioY = m.y / (1.0 - m.y);
            console.log("m=", m);

            globals.REAL_SET = {
                start: mix(globals.REAL_SET.start, m.x, ZOOM_FACTOR),
                end: mix(globals.REAL_SET.end, m.x, ZOOM_FACTOR)
            };
            globals.IMAGINARY_SET = {
                start: mix(globals.IMAGINARY_SET.start, m.y, ZOOM_FACTOR),
                end: mix(globals.IMAGINARY_SET.end, m.y, ZOOM_FACTOR)
            };
        });
        function unproject(x, y, tex) {
            let val = new THREE.Vector2(x, tex.image.height - 1 - y);
            val.x /= window.innerWidth;
            val.y /= window.innerHeight;
            val.x = mix(globals.REAL_SET.start, globals.REAL_SET.end, val.x);
            val.y = mix(globals.IMAGINARY_SET.start, globals.IMAGINARY_SET.end, val.y);
            return val;
        }
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
}
