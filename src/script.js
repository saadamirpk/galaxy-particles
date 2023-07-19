import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

THREE.ColorManagement.enabled = false;

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */

const parameters = {
    count: 100000,
    size: 0.01,
    radius: 5,
    radiusOffset: 0.5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 1.7,
    insideColor: "#ff6030",
    outsideColor: "#0a3385",
    centerCount: 35000,
    centerSize: 7,
    centerHeight: 1.8,
    centerWidth: 1.1,
    centerColor: "#ff6030",
};

let galaxyGeometry = null;
let galaxyMaterial = null;
let GalaxyParticlesSystem = null;

let galacticCenterGeometry = null;
let galacticCenterMaterial = null;
let GalacticCenterParticlesSystem = null;

const generateGalaxy = () => {
    //Dispose
    if (GalaxyParticlesSystem != null) {
        galaxyGeometry.dispose();
        galaxyMaterial.dispose();
        scene.remove(GalaxyParticlesSystem);
    }

    //Geometry
    galaxyGeometry = new THREE.BufferGeometry();

    const positions = new Float32Array(parameters.count * 3);
    const colors = new Float32Array(parameters.count * 3);

    const insideColor = new THREE.Color(parameters.insideColor);
    const outsideColor = new THREE.Color(parameters.outsideColor);

    for (let i = 0; i < parameters.count; i++) {
        const index = i * 3;

        //Position
        const onRadius =
            Math.random() * (parameters.radius + parameters.radiusOffset);
        const spinAngle = onRadius * parameters.spin;
        const branchAngle =
            (Math.PI * 2 * (i % parameters.branches)) / parameters.branches;

        const randomX =
            Math.pow(Math.random(), parameters.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1) *
            (parameters.randomness * onRadius);
        const randomY =
            Math.pow(Math.random(), parameters.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1) *
            parameters.randomness *
            onRadius;
        const randomZ =
            Math.pow(Math.random(), parameters.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1) *
            parameters.randomness *
            onRadius;

        positions[index] =
            Math.sin(branchAngle + spinAngle) *
                (onRadius + parameters.radiusOffset) +
            randomX;
        positions[index + 1] = randomY;
        positions[index + 2] =
            Math.cos(branchAngle + spinAngle) *
                (onRadius + parameters.radiusOffset) +
            randomZ;

        //Color
        const mixedColor = insideColor.clone();
        mixedColor.lerp(
            outsideColor,
            onRadius / (parameters.radius + parameters.radiusOffset)
        );
        colors[index] = mixedColor.r;
        colors[index + 1] = mixedColor.g;
        colors[index + 2] = mixedColor.b;
    }

    galaxyGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    galaxyGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    //Material
    galaxyMaterial = new THREE.PointsMaterial({
        color: "white",
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    });
    GalaxyParticlesSystem = new THREE.Points(galaxyGeometry, galaxyMaterial);
    scene.add(GalaxyParticlesSystem);

    generateGalacticCenter();
};

const getPointsInSphere = () => {
    var d, x, y, z;
    const size1 = parameters.centerSize;
    const size2 = parameters.centerSize / 3;
    do {
        x = Math.random() * size1 - size2;
        y = Math.random() * size1 - size2;
        z = Math.random() * size1 - size2;
        d = x * x + y * y + z * z;
    } while (d > size2);
    return {
        x: x,
        y: y / parameters.centerHeight,
        z: z / parameters.centerWidth,
    };
};

const generateGalacticCenter = () => {
    if (GalacticCenterParticlesSystem != null) {
        galacticCenterGeometry.dispose();
        galacticCenterMaterial.dispose();
        scene.remove(GalacticCenterParticlesSystem);
    }

    //Geometry
    galacticCenterGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(parameters.centerCount * 3);

    for (let i = 0; i < parameters.centerCount; i++) {
        const ind = i * 3;
        const pos = getPointsInSphere();
        positions[ind] = pos.x;
        positions[ind + 1] = pos.y;
        positions[ind + 2] = pos.z;
    }

    galacticCenterGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    );

    //Material
    galacticCenterMaterial = new THREE.PointsMaterial({
        color: parameters.centerColor,
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    GalacticCenterParticlesSystem = new THREE.Points(
        galacticCenterGeometry,
        galacticCenterMaterial
    );
    scene.add(GalacticCenterParticlesSystem);
};

generateGalaxy();

// Tweaks
gui.add(parameters, "count")
    .min(100)
    .max(200000)
    .step(100)
    .name("Star Count")
    .onFinishChange(generateGalaxy);

gui.add(parameters, "size")
    .min(0.001)
    .max(0.1)
    .step(0.001)
    .name("Star Size")
    .onFinishChange(generateGalaxy);

gui.add(parameters, "radius")
    .min(1)
    .max(12)
    .step(1)
    .name("Radius")
    .onFinishChange(generateGalaxy);

gui.add(parameters, "radiusOffset")
    .min(0)
    .max(parameters.radius)
    .step(0.1)
    .onFinishChange(generateGalaxy);

gui.add(parameters, "branches")
    .min(2)
    .max(8)
    .step(1)
    .name("Branches")
    .onFinishChange(generateGalaxy);

gui.add(parameters, "spin")
    .min(-2)
    .max(2)
    .step(0.01)
    .name("Spiral Intensity")
    .onFinishChange(generateGalaxy);

gui.add(parameters, "randomness")
    .min(0)
    .max(1.0)
    .step(0.01)
    .name("Randomness")
    .onFinishChange(generateGalaxy);

gui.add(parameters, "randomnessPower")
    .min(1)
    .max(10)
    .step(0.001)
    .onFinishChange(generateGalaxy);

gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy);
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy);

gui.add(parameters, "centerCount")
    .min(1000)
    .max(100000)
    .step(100)
    .onFinishChange(generateGalaxy);

gui.add(parameters, "centerSize")
    .min(1)
    .max(40)
    .step(0.1)
    .onFinishChange(generateGalaxy);

gui.add(parameters, "centerHeight")
    .min(1)
    .max(3)
    .step(0.1)
    .onFinishChange(generateGalaxy);

gui.add(parameters, "centerWidth")
    .min(1)
    .max(3)
    .step(0.1)
    .onFinishChange(generateGalaxy);

gui.addColor(parameters, "centerColor").onFinishChange(generateGalaxy);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
);
camera.position.x = 3;
camera.position.y = 5;
camera.position.z = 8;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    if (GalaxyParticlesSystem) {
        GalaxyParticlesSystem.rotation.y = -elapsedTime / 36;
    }

    if (GalacticCenterParticlesSystem) {
        GalacticCenterParticlesSystem.rotation.y = -elapsedTime / 42;
    }

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
