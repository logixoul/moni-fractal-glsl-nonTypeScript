import * as THREE from 'three';
var mousePos;
export function getMousePos() {
    return mousePos !== null && mousePos !== void 0 ? mousePos : new THREE.Vector2(0, 0);
}
document.addEventListener("mousemove", e => {
    mousePos = new THREE.Vector2(e.x, e.y);
});
