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
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 1.7,
    insideColor: "#ff6030",
    outsideColor: "#0a3385",
};

let galaxyGeometry = null;
let galaxyMaterial = null;
let GalaxyParticlesSystem = null;

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
        const onRadius = Math.random() * parameters.radius;
        const spinAngle = onRadius * parameters.spin;
        const branchAngle =
            (Math.PI * 2 * (i % parameters.branches)) / parameters.branches;

        const randomX =
            Math.pow(Math.random(), parameters.randomnessPower) *
            (Math.random() < 0.5 ? 1 : -1) *
            parameters.randomness *
            onRadius;
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
            Math.sin(branchAngle + spinAngle) * onRadius + randomX;
        positions[index + 1] = randomY;
        positions[index + 2] =
            Math.cos(branchAngle + spinAngle) * onRadius + randomZ;

        //Color
        const mixedColor = insideColor.clone();
        mixedColor.lerp(outsideColor, onRadius / parameters.radius);
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

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
