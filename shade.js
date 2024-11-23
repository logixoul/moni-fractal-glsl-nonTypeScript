import * as THREE from 'three';
import { renderer } from './util';
import { SafeMap } from './SafeMap';
import * as System from './System';
export var lx;
(function (lx) {
    class Texture {
        constructor(param) {
            var asTex = param;
            var asRt = param;
            if (param instanceof THREE.Texture) {
                this.actualTextureObj = asTex;
            }
            else if (param instanceof THREE.WebGLRenderTarget) {
                this.actualTextureObj = asRt.texture;
                this.renderTargetObj = asRt;
            }
            else if (param instanceof lx.Texture) {
                var asLxTex = param;
                this.actualTextureObj = asLxTex.actualTextureObj;
                this.renderTargetObj = asLxTex.renderTargetObj;
            }
            else {
                throw "error";
            }
        }
        get() {
            return this.actualTextureObj;
        }
        getRenderTarget() {
            if (this.renderTargetObj === undefined)
                throw "error";
            return this.renderTargetObj;
        }
        toString() {
            return this.actualTextureObj.id.toString();
        }
        dispose() {
            if (this.renderTargetObj !== undefined) {
                this.renderTargetObj.dispose();
            }
            else {
                this.actualTextureObj.dispose();
            }
        }
    }
    lx.Texture = Texture;
})(lx || (lx = {}));
function mapType(value) {
    if (value instanceof THREE.Vector2)
        return 'vec2';
    else if (typeof value === "number")
        return 'float';
    else if (value.isTexture) {
        return 'sampler2D';
    }
    else
        throw "error";
}
const vertexShader = `
varying vec2 vUv;
vec2 tc;

void main() {
	tc = uv; // backward compatibility
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	%VSHADER_EXTRA%
	vUv = tc;
}
`;
const intro = `
	varying vec2 vUv;
	vec4 _out;
	vec2 tc;
	vec4 fetch4(sampler2D tex_, vec2 tc_) {
		return texture2D(tex_, tc_).rgba;
	}
	vec3 fetch3(sampler2D tex_, vec2 tc_) {
		return texture2D(tex_, tc_).rgb;
	}
	vec2 fetch2(sampler2D tex_, vec2 tc_) {
		return texture2D(tex_, tc_).rg;
	}
	float fetch1(sampler2D tex_, vec2 tc_) {
		return texture2D(tex_, tc_).r;
	}
	vec4 fetch4(sampler2D tex_) {
		return texture2D(tex_, tc).rgba;
	}
	vec3 fetch3(sampler2D tex_) {
		return texture2D(tex_, tc).rgb;
	}
	vec2 fetch2(sampler2D tex_) {
		return texture2D(tex_, tc).rg;
	}
	float fetch1(sampler2D tex_) {
		return texture2D(tex_, tc).r;
	}
	vec4 fetch4() {
		return texture2D(tex1, tc).rgba;
	}
	vec3 fetch3() {
		return texture2D(tex1, tc).rgb;
	}
	vec2 fetch2() {
		return texture2D(tex1, tc).rg;
	}
	float fetch1() {
		return texture2D(tex1, tc).r;
	}

`;
const outro = `
	}
	void main() {
		tc = vUv; // backward compatibility
		_out.a = 1.0f;
		shade();
		gl_FragColor = _out;
	}
`;
var camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1000, 1000);
var geometry = new THREE.PlaneBufferGeometry();
var programCache = {};
var meshCache = {};
var scene = new THREE.Scene();
class TextureCacheKey {
    constructor(w, h, itype) {
        this.width = 0;
        this.height = 0;
        this.itype = 0;
        this.width = w;
        this.height = h;
        this.itype = itype;
    }
    toString() {
        return this.width + "," + this.height + "," + this.itype;
        //return JSON.stringify(this);
    }
}
class TextureInfo {
    constructor(key) {
        this.useCount = 0;
        this.key = key;
    }
}
function console_log(s) {
}
class TextureCache {
    constructor() {
        this.cache = new SafeMap(); // key obtained by TextureCacheKey.toString()
        this.infos = new SafeMap(); // key obtained by lx.Texture.toString()
        this.numTexturesDbg = 0;
    }
    _setDefaults(tex) {
        /*tex->setMinFilter(GL_LINEAR);
        tex->setMagFilter(GL_LINEAR);
        tex->setWrap(GL_CLAMP_TO_EDGE, GL_CLAMP_TO_EDGE);*/
    }
    _allocTex(key) {
        var tex = new THREE.WebGLRenderTarget(key.width, key.height, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false, type: key.itype });
        var texWrapper = new lx.Texture(tex);
        var keyString = texWrapper.toString();
        this.infos.set(keyString, new TextureInfo(key));
        this.infos.checkedGet(keyString).useCount = 1;
        this.numTexturesDbg++;
        return texWrapper;
    }
    onNoLongerUsingTex(tex) {
        var info = this.infos.get(tex.toString());
        if (info === undefined) {
            console.assert(tex.get() instanceof THREE.DataTexture);
            // `tex` has not been created by TextureCache and is not managed by it.
            // Since `onNoLongerUsingTex()` has been called, the user tells us that he no longer needs that texture so
            // it's safe to just dispose it.
            tex.dispose();
            return;
        }
        info.useCount--;
    }
    get(key) {
        /*var tex = this._allocTex(key);
        //vec.push(tex);
        this._setDefaults(tex);
        return tex;*/
        var keyString = key.toString();
        console_log("get(" + keyString + "):");
        console_log("\tnumTexturesDbg = " + this.numTexturesDbg);
        const alreadyExists = this.cache.has(keyString);
        console_log("\talreadyExists = " + alreadyExists);
        if (!alreadyExists) {
            console_log("\tcachemap doesn't have anything for this key. allocating texture");
            const tex = this._allocTex(key);
            const vec = [tex];
            this.cache.set(keyString, vec);
            this._setDefaults(tex.get());
            return tex;
        }
        else {
            const vec = this.cache.checkedGet(keyString);
            for (let i = 0; i < vec.length; i++) {
                let tex = vec[i];
                var texInfo = this.infos.checkedGet(tex.toString());
                if (texInfo.useCount == 0) {
                    console_log("\treusing");
                    this._setDefaults(tex.get());
                    texInfo.useCount++;
                    return tex;
                }
            }
            console_log("\tvec doesn't contain an unused ");
            var tex = this._allocTex(key);
            vec.push(tex);
            this._setDefaults(tex.get());
            return tex;
        }
    }
}
export var textureCache = new TextureCache();
export function shade2(texs, fshader, options) {
    var _a;
    const wrappedTexs = texs.map(t => new lx.Texture(t));
    options = options || {};
    var processedOptions = {
        releaseFirstInputTex: options.releaseFirstInputTex,
        toScreen: options.toScreen !== undefined ? options.toScreen : false,
        scale: options.scale !== undefined ? options.scale : new THREE.Vector2(1, 1),
        itype: options.itype !== undefined ? options.itype : wrappedTexs[0].get().type,
        uniforms: options.uniforms || {},
        vshaderExtra: options.vshaderExtra || "",
        lib: options.lib || "",
    };
    var renderTarget;
    if (options.toScreen) {
        renderTarget = null;
    }
    else {
        var size = new THREE.Vector2(wrappedTexs[0].get().image.width, wrappedTexs[0].get().image.height);
        size = size.multiply(processedOptions.scale);
        const key = new TextureCacheKey(size.x, size.y, processedOptions.itype);
        renderTarget = textureCache.get(key);
        //renderTarget.texture.generateMipmaps = util.unpackTex(texs[0]).generateMipmaps;
    }
    var params = {
        uniforms: {
            time: { value: 0.0 },
            mouse: { value: System.getMousePos() },
        }
    };
    var uniformsString = "";
    var i = 0;
    texs.forEach(tex => {
        const name = "tex" + (i + 1);
        const tsizeName = "tsize" + (i + 1);
        //uniformsString += "uniform sampler2D " + name + ";";
        //uniformsString += "uniform vec2 " + tsizeName + ";";
        var texture = wrappedTexs[i].get();
        params.uniforms[name] = { value: texture };
        params.uniforms[tsizeName] = { value: new THREE.Vector2(1.0 / texture.image.width, 1.0 / texture.image.height) };
        i++;
    });
    Object.keys(processedOptions.uniforms).forEach(key => {
        var value = processedOptions.uniforms[key];
        params.uniforms[key] = { value: value };
    });
    Object.keys(params.uniforms).forEach(key => {
        var value = params.uniforms[key].value;
        // for things like `uniforms: { mul: new THREE.Uniform(amount) }`
        if (value instanceof THREE.Uniform) { // todo: improve this ugliness
            value = value.value;
            params.uniforms[key].value = value;
        }
        uniformsString += "uniform " + mapType(value) + " " + key + ";";
    });
    const fshader_complete = uniformsString + intro + processedOptions.lib + "	void shade() {" + fshader + outro;
    var cachedMaterial = programCache[fshader_complete];
    var cachedMesh = meshCache[fshader_complete];
    if (!cachedMaterial) {
        cachedMaterial = new THREE.ShaderMaterial({
            uniforms: params.uniforms,
            vertexShader: uniformsString + vertexShader.replace("%VSHADER_EXTRA%", processedOptions.vshaderExtra),
            fragmentShader: fshader_complete,
            side: THREE.DoubleSide,
            blending: THREE.NoBlending
        });
        cachedMesh = new THREE.Mesh(geometry, cachedMaterial);
        programCache[fshader_complete] = cachedMaterial;
        meshCache[fshader_complete] = cachedMesh;
    }
    var material = cachedMaterial;
    var mesh = cachedMesh;
    for (const [key, value] of Object.entries(params.uniforms)) { // todo: is the "!" necessary?
        material.uniforms[key] = value;
    }
    mesh.position.set(.5, .5, 0);
    scene.add(mesh);
    renderer.setRenderTarget((_a = renderTarget === null || renderTarget === void 0 ? void 0 : renderTarget.getRenderTarget()) !== null && _a !== void 0 ? _a : null);
    renderer.render(scene, camera);
    scene.remove(mesh);
    if (processedOptions.releaseFirstInputTex) {
        textureCache.onNoLongerUsingTex(wrappedTexs[0]);
    }
    if (renderTarget === null)
        return null;
    return new lx.Texture(renderTarget);
}
