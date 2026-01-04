import * as THREE from 'three';
import { shade2, textureCache } from './shade';
import { globals } from './Globals.js';
import { Input, mix } from './Input.js';
import * as util from './util';
import { Image } from "./Image.js";
const ZOOM_FACTOR = 0.1;
let fractalFragmentShader;
let input = new Input();
console.log("TEST");
function initStateTex() {
    if (globals.stateTex != null) {
        textureCache.onNoLongerUsingTex(globals.stateTex);
    }
    var documentW = window.innerWidth;
    var documentH = window.innerHeight;
    var img = new Image(Math.trunc(documentW*globals.configuration.scale), Math.trunc(documentH*globals.configuration.scale), Float32Array);
    //Uint8Array);
    //img.forEach((x : number, y : number) => img.set(x, y, Math.random()));
    globals.stateTex = new THREE.DataTexture(img.data, img.width, img.height, THREE.RedFormat, THREE.FloatType);
    //THREE.UnsignedByteType);
    globals.stateTex.generateMipmaps = false;
    globals.stateTex.minFilter = THREE.LinearFilter;
    globals.stateTex.magFilter = THREE.LinearFilter;
    globals.stateTex.needsUpdate = true;
    // ensure we're in the textureCache
    globals.stateTex = shade2([globals.stateTex], `_out.r = fetch1();`, { itype: THREE.UnsignedByteType,
        //THREE.HalfFloatType,
        //THREE.FloatType,
        releaseFirstInputTex: true });
    util.renderer.setSize(window.innerWidth, window.innerHeight);
}
initStateTex();
//const backgroundPicTex = new THREE.TextureLoader().load( 'assets/background.jpg' );
document.defaultView.addEventListener("resize", initStateTex);

function animate(time) {
    globals.REAL_SET.start = mix(globals.REAL_SET.start, globals.targetRealSet.start, .1);
    globals.REAL_SET.end = mix(globals.REAL_SET.end, globals.targetRealSet.end, .1);
    globals.IMAGINARY_SET.start = mix(globals.IMAGINARY_SET.start, globals.targetImaginarySet.start, .1);
    globals.IMAGINARY_SET.end = mix(globals.IMAGINARY_SET.end, globals.targetImaginarySet.end, .1);

    //globals.tweenGroup.update(time);
    let tex2 = shade2([globals.stateTex], `
    //const vec2 zoomP = vec2(-.7451544,.1861545);
    const vec2 zoomP = vec2(-.7451544,.1853);
    const float zoomTime = 70.0;
	const float iTime = 0.0;
	vec2 iResolution = vec2(textureSize(tex1, 0));
    float tTime = 9.0 + abs(mod(iTime+zoomTime,zoomTime*2.0)-zoomTime);
    tTime = (145.5/(.0005*pow(tTime,5.0)));
    vec2 aspect = vec2(1,iResolution.y/iResolution.xy);
    //vec2 mouseNorm = mouse / iResolution.x;//iMouse.xy/iResolution.x;
	vec2 mouseNorm = vec2(.5, .5);
    
    vec4 outs = vec4(0.0);
    
    for(int i = 0; i < samples; i++) {        
        vec2 fragment = (gl_FragCoord.xy+offsets[i])/iResolution.xy;    
        //vec2 uv = fragment*2.0 - vec2(0.5, 0.5);
		vec2 uv = vec2(
			mix(REAL_SET_start, REAL_SET_end, fragment.x),
			mix(IMAGINARY_SET_start, IMAGINARY_SET_end, fragment.y)
		);
        outs += mapColor(moniFractal(uv));
	

    }
	_out = outs/float(samples);

		`, { releaseFirstInputTex: false,
        uniforms: {
            REAL_SET_start: new THREE.Uniform(globals.REAL_SET.start),
            REAL_SET_end: new THREE.Uniform(globals.REAL_SET.end),
            IMAGINARY_SET_start: new THREE.Uniform(globals.IMAGINARY_SET.start),
            IMAGINARY_SET_end: new THREE.Uniform(globals.IMAGINARY_SET.end),
            numIterations: new THREE.Uniform(globals.configuration.numIterations),
            initialX: new THREE.Uniform(globals.configuration.initialX),
            initialY: new THREE.Uniform(globals.configuration.initialY)
        },
        lib: fractalFragmentShader + `
				const float offsetsD = .5;
				const float offsetsD2 = .25;
				const float offsetsD3 = .125;
				const float offsetsD4 = .075;
				const vec2 offsets[16] = vec2[](
					vec2(-offsetsD,-offsetsD),
					vec2(offsetsD,offsetsD),
					vec2(-offsetsD,offsetsD),
					vec2(offsetsD,-offsetsD),
					vec2(-offsetsD2,-offsetsD2),
					vec2(offsetsD2,offsetsD2),
					vec2(-offsetsD2,offsetsD2),
					vec2(offsetsD2,-offsetsD2),
					vec2(-offsetsD3,-offsetsD3),
					vec2(offsetsD3,offsetsD3),
					vec2(-offsetsD3,offsetsD3),
					vec2(offsetsD3,-offsetsD3),
					vec2(-offsetsD4,-offsetsD4),
					vec2(offsetsD4,offsetsD4),
					vec2(-offsetsD4,offsetsD4),
					vec2(offsetsD4,-offsetsD4)
				);
			`
    });
    requestAnimationFrame( animate );
    //setTimeout(animate, 16);
    shade2([tex2 === null || tex2 === void 0 ? void 0 : tex2.get()], ` // todo: rm the ! and ? when I've migrated ImgProc to TS.
		float d = fetch1() - fetch1(tex1, tc - vec2(0, tsize1.y));
		_out.rgb = fetch3();
		float specular = max(-d, 0.0f);
		//_out.rgb += specular * vec3(1); // specular
		//if(d>0.0f)_out.rgb /= 1.0+d; // shadows
		//_out.rgb /= _out.rgb + 1.0f;
		//_out.rgb = pow(_out.rgb, vec3(1.0/2.2)); // gamma correction
		`, {
        toScreen: true,
        releaseFirstInputTex: true
    });
}
const url = "./fractalImplementation.fs.glsl";
fetch(url)
    .then(r => r.text())
    .then(t => {
    fractalFragmentShader = t;
    requestAnimationFrame(animate);
});
