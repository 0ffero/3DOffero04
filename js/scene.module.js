import * as THREE from 'https://unpkg.com/three@0.181.0/build/three.module.js';
import { FontLoader } from 'https://unpkg.com/three@0.181.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://unpkg.com/three@0.181.0/examples/jsm/geometries/TextGeometry.js';

class OrbitingTextScene {
    constructor(container, opts = {}) {
        this.container = container;
        this.opts = Object.assign({
            word: 'Offero 04 ',
            repeats: 2,
            tiltDeg: 45,
            letterColour: '#30FF30',
            letterDepth: 1.8,
            speed: -0.6, // text rotation speed

            lightIntensity: 6000,
            sphereColour: '#999999',
            earthRadius: 28,
            marsColour: '#BBBBBB',
            orbitRadius: 35,

            changeHue: true, // should the text hue change over time?
            colourLetters: 0, // colour letters differently based on position?
            /*  
                colourLettersOffset: number
                higher = more gradual changes 
                eg:
                    2 = every 2nd letter will have the same colour
                    4 = every 4th letter
                    10 = every 10th letter
                    etc.
                    
                If the number is more than the letter count (such as 100), the difference between letter colours will be more subtle
                Think of it like scaling up the HSL over a wider space to cover more letters
            */
            colourLettersOffset: 100,
            textHue: 0,
            textHueInc: 0.01
        }, opts);

        this.textures = [
            'milkyway.jpg',
            'earthmap.jpg',
            'earthnormal.jpg',
            'earthclouds.png',
            'mooncolour.jpg',
            'marscolour.jpg',
            'marsnormal.jpg',
            'jupiter.jpg'
        ];

        this.clock = new THREE.Clock();
        this._init();
    }

    async _init() {
        // Basic scene setup
        this.scene = new THREE.Scene();
        const { clientWidth: w, clientHeight: h } = this.container;
        this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 2000);
        this.camera.position.set(0, 20, 130);
        this.camera.lookAt(0, 0, 0);
        this.camera.rotateZ(Math.PI / 180 * -23.5);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(w, h);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Lights
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.15));
        this.pointLight = new THREE.PointLight(0xffffff, this.opts.lightIntensity, 0, 2);
        this.pointLight.position.set(50, 10, 70);
        this.pointLight.castShadow = true;
        this.scene.add(this.pointLight);

        // Load all assets concurrently
        const [milkywayTex, earthTex, earthNormalTex, cloudTex, moonTex, marsTex, marsNormalTex, jupiterTex, font] = await this._loadAssets();

        const configureTexture = this._configureTexture.bind(this);

        this._initSkySphere(configureTexture, milkywayTex);
        this._initEarth(configureTexture, earthTex, earthNormalTex, cloudTex);
        this._initMoon(configureTexture, moonTex);
        this._initMars(configureTexture, marsTex, marsNormalTex);
        this._initJupiter(configureTexture, jupiterTex);

        // Letters
        this.letterGroup = new THREE.Group();
        this.scene.add(this.letterGroup);
        this.font = font;
        this._buildLetters();

        // Event Listeners & Animation
        window.addEventListener('resize', () => this._onResize());
        this.animate();
    }

    

    _initEarth(configureTexture, earthTex, earthNormalTex, cloudTex) {
        // Earth
        const earthGeo = new THREE.SphereGeometry(this.opts.earthRadius, 64, 64);
        const earthMat = new THREE.MeshStandardMaterial({
            color: this.opts.sphereColour,
            metalness: 0.3,
            roughness: 0.6,
            map: configureTexture(earthTex),
            normalMap: configureTexture(earthNormalTex)
        });
        this.earth = new THREE.Mesh(earthGeo, earthMat);
        this.earth.receiveShadow = true;
        this.scene.add(this.earth);

        // Cloud Layer
        const cloudGeo = new THREE.SphereGeometry(this.opts.earthRadius + 0.4, 64, 64);
        const cloudMat = new THREE.MeshStandardMaterial({
            map: configureTexture(cloudTex),
            color: 0xffffff,
            transparent: true,
            opacity: 0.55,
            side: THREE.DoubleSide,
            depthWrite: false,
            roughness: 1,
            metalness: 0
        });
        this.cloudLayer = new THREE.Mesh(cloudGeo, cloudMat);
        this.cloudLayer.name = 'cloudLayer';
        this.scene.add(this.cloudLayer);
    }

    _initJupiter(configureTexture, jupiterTex) {
        // Earth
        const jupiterGeo = new THREE.SphereGeometry(32, 64, 64);
        const jupiterMat = new THREE.MeshStandardMaterial({
            color: this.opts.sphereColour,
            metalness: 0.3,
            roughness: 0.6,
            map: configureTexture(jupiterTex)
        });
        this.jupiter = new THREE.Mesh(jupiterGeo, jupiterMat);
        this.jupiter.position.set(-45, 20, -50);
        this.scene.add(this.jupiter);
    }

    _initMars(configureTexture, marsTex, marsNormalTex) {
        const marsGeo = new THREE.SphereGeometry(14, 64, 64);
        const marsMat = new THREE.MeshStandardMaterial({
            color: this.opts.marsColour,
            metalness: 0.3,
            roughness: 0.6,
            map: configureTexture(marsTex),
            normalMap: configureTexture(marsNormalTex)
        });
        this.mars = new THREE.Mesh(marsGeo, marsMat);
        this.mars.position.set(70, 3, -55);
        this.scene.add(this.mars);
    }

    _initMoon(configureTexture, moonTex) {
        const moonGeo = new THREE.SphereGeometry(7, 32, 32);
        const moonMat = new THREE.MeshStandardMaterial({
            map: configureTexture(moonTex),
            color: 0x888888,
            metalness: 0.5,
            roughness: 0.7
        });
        this.moon = new THREE.Mesh(moonGeo, moonMat);
        this.moon.position.set(-60, 20, -10);
        this.scene.add(this.moon);
    }

    _initSkySphere(configureTexture, milkywayTex) {
        const skyGeo = new THREE.SphereGeometry(100, 64, 64);
        const skyMat = new THREE.MeshBasicMaterial({
            map: configureTexture(milkywayTex, THREE.EquirectangularReflectionMapping),
            color: 0xffffff,
            transparent: true,
            opacity: 0.2,
            depthWrite: false,
            side: THREE.BackSide
        });
        this.skySphere = new THREE.Mesh(skyGeo, skyMat);
        this.skySphere.rotation.x = Math.PI; // align texture
        this.scene.add(this.skySphere);
    }

    _buildLetters() {
        this._clearLetters();
        const opts = this.opts;
        const word = String(opts.word);
        const totalLetters = word.length * opts.repeats;
        const step = Math.PI * 2 / totalLetters;
        const radius = opts.orbitRadius;

        for (let r = 0; r < opts.repeats; r++) {
            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                const index = r * word.length + i;
                const angle = index * step; // around Y

                const txtGeo = new TextGeometry(char, {
                    font: this.font,
                    size: 6,
                    height: opts.letterDepth,
                    curveSegments: 6,
                    bevelEnabled: false
                });
                // center geometry so pivot is middle
                txtGeo.computeBoundingBox();
                const bx = (txtGeo.boundingBox.max.x + txtGeo.boundingBox.min.x) / 2;
                const by = (txtGeo.boundingBox.max.y + txtGeo.boundingBox.min.y) / 2;
                const bz = (txtGeo.boundingBox.max.z + txtGeo.boundingBox.min.z) / 2;
                txtGeo.translate(-bx, -by, -bz);

                const mat = new THREE.MeshStandardMaterial({ color: opts.letterColour, metalness: 0.03, roughness: 0.7 });
                const mesh = new THREE.Mesh(txtGeo, mat);
                mesh.castShadow = true;

                // position along circle
                const x = Math.sin(angle) * radius;
                const z = Math.cos(angle) * radius;

                // vertical offset to create the left-lower / right-higher look
                // We'll use a sinusoidal vertical offset so letters on left (angle ~ pi/2 or 3pi/2) move lower
                const verticalAmp = 12; // amplitude
                const y = Math.sin(angle + Math.PI / 2) * verticalAmp * -0.6; // tweak sign so left is lower

                mesh.position.set(x, y, z);

                // apply tilt: rotation around X so the left-side letters appear lower than right incoming
                const tiltRad = THREE.MathUtils.degToRad(opts.tiltDeg);
                // vary tilt slightly by angle to emulate the front view; using cos to keep consistent left-right slope
                mesh.rotation.x = Math.sin(angle) * tiltRad * 0.6;
                mesh.rotation.z = Math.cos(angle) * tiltRad * 0.08; // slight roll

                // push slightly outward so letters don't intersect sphere
                const pushOut = 4 + (i % 2 === 0 ? 0.5 : 0);
                mesh.position.add(new THREE.Vector3(Math.sin(angle) * pushOut, 0, Math.cos(angle) * pushOut));

                // store angle for animation offset if needed
                mesh.userData.baseAngle = angle;

                this.letterGroup.add(mesh);
            }
        }
    }

    _clearLetters() {
        while (this.letterGroup.children.length) {
            const c = this.letterGroup.children.pop();
            if (c.geometry) c.geometry.dispose();
            if (c.material) c.material.dispose();
        }
    }

    _configureTexture = (tex, mapping = THREE.UVMapping) => {
        tex.encoding = THREE.sRGBEncoding;
        const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
        if (maxAniso) tex.anisotropy = maxAniso;
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.mapping = mapping;
        return tex;
    }

    async _loadAssets() {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.path = './assets/';
        const fontLoader = new FontLoader();

        const texturePromises = this.textures.map(url => textureLoader.loadAsync(url));

        const fontPromise = fontLoader.loadAsync('https://unpkg.com/three@0.181.0/examples/fonts/gentilis_bold.typeface.json');

        return Promise.all([...texturePromises, fontPromise]);
    }

    _onResize() {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    animate() {
        const tick = () => {
            const dt = this.clock.getDelta();
            // rotate the whole group slowly around Y
            this.letterGroup.rotation.y += this.opts.speed*dt;
            let opts = this.opts;

            // Make each letter face the camera (billboarding)
            let cLO = this.opts.colourLettersOffset;
            this.letterGroup.children.forEach((letter,i) => {
                this.opts.changeHue && letter.material.color.setHSL(opts.textHue+i*(1/cLO*this.opts.colourLetters),1,0.5);
                letter.lookAt(this.camera.position);
            });

            this.opts.changeHue && this.updateHue(dt);

            // add rotation to planets & sky
            this.earth.rotation.y += 0.1*dt;
            this.cloudLayer.rotation.y += 0.12*dt;
            this.skySphere.rotation.y += 0.005*dt;
            this.mars.rotation.y -= 0.1*dt;
            this.jupiter.rotation.y -= 0.005*dt;


            this.renderer.render(this.scene, this.camera);
            this._raf = requestAnimationFrame(tick);
        };
        this._raf = requestAnimationFrame(tick);
    }

    dispose() {
        cancelAnimationFrame(this._raf);
        this._clearLetters();
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }

    setOptions(opts) {
        Object.assign(this.opts, opts);
        // update light intensity & sphere color & rebuild letters
        this.pointLight.intensity = this.opts.lightIntensity;
        this.jupiter.material.color.set(this.opts.sphereColour);
        // update letter materials & rebuild
        this._buildLetters();
    }

    updateHue(dt) {
        let opts = this.opts;
        opts.textHue += opts.textHueInc*dt;
        opts.textHue %= 1; // stops letters flashing after they hit 1.0
    }
};

export { OrbitingTextScene };