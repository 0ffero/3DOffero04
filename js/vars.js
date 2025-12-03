import { OrbitingTextScene } from './scene.module.js';

var vars = {
    title: "Offero Orbiter",
    description: "A 3D visualization of Offero's orbit around the earth.",
    version: "1.0",

    init: ()=> {
        console.log("Initializing Offero Orbiter...");
        window.document.title = `${vars.title} v${vars.version}`;

        const canvasContainer = document.getElementById('canvasContainer');
        const scene = new OrbitingTextScene(canvasContainer, {});
    }
};

vars.init();