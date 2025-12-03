import { OrbitingTextScene } from './scene.module.js';
import * as THREE from 'https://unpkg.com/three@0.181.0/build/three.module.js'; // only needed when debugging

let vars = {
    /*
        DEBUG MODE
        When true, exposes vars and THREE to the global window object.
    */
    DEBUG: false, // set to false for production
    title: "Offero Orbiter",
    description: "A 3D Offero 04 orbiting around the earth.",
    version: "1.1",
    instructions: `Options can be set or changed using setOptions() method of the scene object or when initialising the scene.
vars.DEBUG must be true to access the scene object via vars.scene.

OPTIONS:
    - word: string - the word to orbit around the earth
    - repeats: number - how many times to repeat the word
    - tiltDeg: number - tilt of the orbit in degrees
    - letterColor: string - color of the letters in hex format
    - letterDepth: number - depth of the 3D letters
    - speed: number - rotation speed of the text
    - earthRadius: number - radius of the earth
    - orbitRadius: number - radius of the text orbit
    - changeHue: boolean - whether the text hue changes over time
    - colourLetters: boolean - 1 to colour letters differently based on position
    - colourLettersOffset: number - color letters differently based on position (higher = more gradual changes)
    - textHue: number - current hue for the text colors
    - textHueInc: number - amount to increment the text hue each frame`,

    init: ()=> {
        let consoleCSS = `font-weight: bold; color: #30AA30; font-size: 14px; padding:5px 10px; background-color: #000000; border-radius: 5px; border: 1px solid #30AA30;`;

        console.log(`%cInitializing Offero Orbiter v${vars.version}...`, consoleCSS);
        window.document.title = `${vars.title} v${vars.version}`;

        const canvasContainer = document.getElementById('canvasContainer');
        vars.scene = new OrbitingTextScene(canvasContainer, {});
        console.log(`%c  > Scene initialized`, consoleCSS);
    }
};

vars.init();

let infoCSS = `font-weight: bold; color: #FFFF00; font-size: 14px; padding: 8px 16px; border-radius: 5px;`;
if (vars.DEBUG) {
    window.vars = vars;
    window.THREE = THREE;

    console.log("%cDEBUG MODE: vars and THREE are exposed to the global window object.", infoCSS.replace('color: #FFFF00', 'color: #FF0000'));
};
console.log(`%c${vars.instructions}`, infoCSS);