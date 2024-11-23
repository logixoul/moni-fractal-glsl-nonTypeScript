import * as THREE from 'three';
import { shade2 } from './shade';
export var renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);
export function cloneTex(inTex) {
    return shade2([inTex], `_out = fetch4();`, { releaseFirstInputTex: false });
}
export function unpackTex(t) {
    if (t.isWebGLRenderTarget)
        return t.texture;
    else
        return t;
}
export function drawToScreen(inputTex, releaseFirstInputTex) {
    shade2([inputTex], `
		vec2 texSize = vec2(textureSize(tex1, 0));
		_out.rgb = vec3(texelFetch(tex1, ivec2(tc * texSize), 0).r);
		`, {
        toScreen: true,
        releaseFirstInputTex: releaseFirstInputTex
    });
}
export function appendImageToHtml(tex) {
    var oldMagFilter = tex.get().magFilter;
    tex.get().magFilter = THREE.NearestFilter;
    drawToScreen(tex, false);
    tex.get().magFilter = oldMagFilter;
    var dataURL = renderer.domElement.toDataURL();
    var img = new Image();
    img.src = dataURL;
    document.body.appendChild(img);
}
