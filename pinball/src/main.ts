import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// --- INITIALIZATION ---

// Three.js Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a0a0a); // Dark Martian night

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 12, 18);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Cannon.js Physics Setup
const world = new CANNON.World();
world.gravity.set(0, -3.71, 0); // Mars gravity

// --- OBJECTS ---

const playfieldAngle = -Math.PI / 12; // ~15 degree incline
const playfieldWidth = 10;
const playfieldLength = 20;

// Inclined Playfield (Physics)
const groundShape = new CANNON.Box(new CANNON.Vec3(playfieldWidth / 2, 0.1, playfieldLength / 2));
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(groundShape);
groundBody.position.set(0, 0, 0);
groundBody.quaternion.setFromEuler(playfieldAngle, 0, 0);
world.addBody(groundBody);

// Inclined Playfield (Visual)
const groundGeometry = new THREE.BoxGeometry(playfieldWidth, 0.2, playfieldLength);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
scene.add(groundMesh);

// Helper function to sync mesh with body
function syncMeshWithBody(mesh: THREE.Mesh, body: CANNON.Body) {
    mesh.position.copy(body.position as any);
    mesh.quaternion.copy(body.quaternion as any);
}

// Side Walls
const wallThickness = 0.5;
const wallHeight = 2;

function createWall(x: number, z: number, length: number, angle: number) {
    const wallShape = new CANNON.Box(new CANNON.Vec3(wallThickness / 2, wallHeight / 2, length / 2));
    const wallBody = new CANNON.Body({ mass: 0 });
    wallBody.addShape(wallShape);
    
    wallBody.position.set(x, wallHeight / 2, z);
    wallBody.quaternion.setFromEuler(playfieldAngle, angle, 0);
    world.addBody(wallBody);

    const wallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, length);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
    scene.add(wallMesh);
    
    return { mesh: wallMesh, body: wallBody };
}

const leftWall = createWall(-playfieldWidth / 2 - wallThickness / 2, 0, playfieldLength, 0);
const rightWall = createWall(playfieldWidth / 2 + wallThickness / 2, 0, playfieldLength, 0);
const topWall = createWall(0, -playfieldLength / 2 - wallThickness / 2, playfieldWidth + wallThickness * 2, Math.PI / 2);

// Flippers
const flipperWidth = 2.5;
const flipperHeight = 0.4;
const flipperDepth = 0.5;

function createFlipper(x: number, z: number, isRight: boolean) {
    const shape = new CANNON.Box(new CANNON.Vec3(flipperWidth / 2, flipperHeight / 2, flipperDepth / 2));
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(x, 0.4, z)
    });
    body.addShape(shape);
    body.quaternion.setFromEuler(playfieldAngle, 0, 0);
    world.addBody(body);

    const geometry = new THREE.BoxGeometry(flipperWidth, flipperHeight, flipperDepth);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const pivot = new CANNON.Vec3(isRight ? flipperWidth / 2 : -flipperWidth / 2, 0, 0);
    const axis = new CANNON.Vec3(0, 1, 0);
    
    const anchorBody = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(x + pivot.x, 0.4, z + pivot.z) });
    world.addBody(anchorBody);
    
    const hinge = new CANNON.HingeConstraint(body, anchorBody, {
        pivotA: pivot,
        axisA: axis,
        pivotB: new CANNON.Vec3(0, 0, 0),
        axisB: axis
    });
    hinge.enableMotor();
    world.addConstraint(hinge);

    return { mesh, body, hinge, isRight };
}

const leftFlipper = createFlipper(-2.5, 8, false);
const rightFlipper = createFlipper(2.5, 8, true);

// Ball (Physics)
const ballRadius = 0.4;
const ballShape = new CANNON.Sphere(ballRadius);
const ballBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(4, 1, 9), 
    linearDamping: 0.1,
    angularDamping: 0.1
});
ballBody.addShape(ballShape);
world.addBody(ballBody);

// Ball (Visual)
const ballGeometry = new THREE.SphereGeometry(ballRadius);
const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 });
const ballMesh = new THREE.Mesh(ballGeometry, ballMaterial);
scene.add(ballMesh);

// Plunger
function launchBall() {
    if (ballBody.position.z > 8) {
        ballBody.applyImpulse(new CANNON.Vec3(0, 0, -30), new CANNON.Vec3(0, 0, 0));
    }
}

// Controls
const keys = { a: false, d: false };
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'a') keys.a = true;
    if (e.key.toLowerCase() === 'd') keys.d = true;
    if (e.key === ' ') launchBall();
});
window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'a') keys.a = false;
    if (e.key.toLowerCase() === 'd') keys.d = false;
});

// Scoring & HUD
let score = 0;
let hunger = 0;
const hud = document.createElement('div');
hud.style.position = 'absolute';
hud.style.top = '20px';
hud.style.left = '20px';
hud.style.color = '#00ff00';
hud.style.fontFamily = 'monospace';
hud.style.fontSize = '24px';
hud.style.textShadow = '0 0 10px #00ff00';
hud.innerHTML = `
    <div>COLONY HEALTH: 0</div>
    <div style="color: #ff0000; text-shadow: 0 0 10px #ff0000;">ZOMBIE HUNGER: 0%</div>
`;
document.body.appendChild(hud);

function updateHUD() {
    hud.children[0].innerHTML = `COLONY HEALTH: ${score}`;
    hud.children[1].innerHTML = `ZOMBIE HUNGER: ${Math.floor(hunger)}%`;
}

function addScore(points: number) {
    score += points;
    updateHUD();
}

// Materials Refinement
const martianMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8b3a2b, 
    roughness: 0.9, 
    metalness: 0.1 
});
groundMesh.material = martianMaterial;

const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x222222, 
    roughness: 0.5, 
    metalness: 0.8 
});
leftWall.mesh.material = wallMaterial;
rightWall.mesh.material = wallMaterial;
topWall.mesh.material = wallMaterial;

// Ball Material
ballMaterial.color.set(0xaaaaaa);
ballMaterial.emissive.set(0x444444);
ballMaterial.emissiveIntensity = 0.2;

// Bumpers
const bumperRadius = 0.8;
const bumperHeight = 1;

function createBumper(x: number, z: number) {
    const shape = new CANNON.Cylinder(bumperRadius, bumperRadius, bumperHeight, 16);
    const body = new CANNON.Body({
        mass: 0, // Static
        position: new CANNON.Vec3(x, 0.5, z)
    });
    body.addShape(shape);
    // Align with inclined playfield
    body.quaternion.setFromEuler(playfieldAngle, 0, 0);
    world.addBody(body);

    const geometry = new THREE.CylinderGeometry(bumperRadius, bumperRadius, bumperHeight, 32);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x00ff00, 
        emissive: 0x00ff00, 
        emissiveIntensity: 0.5 
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    syncMeshWithBody(mesh, body);

    // Collision Event
    body.addEventListener('collide', (e: any) => {
        if (e.body === ballBody) {
            // Apply impulse away from bumper center
            const forceDirection = ballBody.position.vsub(body.position);
            forceDirection.y = 0;
            forceDirection.normalize();
            ballBody.applyImpulse(forceDirection.scale(15), new CANNON.Vec3(0, 0, 0));
            
            // Visual feedback
            material.emissiveIntensity = 2;
            setTimeout(() => material.emissiveIntensity = 0.5, 100);
            
            addScore(100);
        }
    });

    return { mesh, body };
}

const bumpers = [
    createBumper(-2, -2),
    createBumper(2, -2),
    createBumper(0, -6)
];

// Supply Crates
interface Crate {
    mesh: THREE.Mesh;
    body: CANNON.Body;
}
let crates: Crate[] = [];

function createCrate() {
    const size = 0.8;
    const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
    const x = (Math.random() - 0.5) * (playfieldWidth - 2);
    const z = -playfieldLength / 2 + 2;
    
    const body = new CANNON.Body({
        mass: 5,
        position: new CANNON.Vec3(x, 5, z)
    });
    body.addShape(shape);
    world.addBody(body);

    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const crate = { mesh, body };
    crates.push(crate);

    body.addEventListener('collide', (e: any) => {
        if (e.body === ballBody) {
            addScore(500);
            // Remove crate
            scene.remove(mesh);
            world.removeBody(body);
            crates = crates.filter(c => c !== crate);
        }
    });
}

setInterval(createCrate, 10000); // Spawn every 10 seconds

// --- LIGHTING ---

const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// --- ANIMATION LOOP ---

const timeStep = 1 / 60;
function animate() {
    requestAnimationFrame(animate);

    // Zombie Hunger increases over time
    hunger += 0.01;
    if (hunger > 100) hunger = 100;
    updateHUD();

    // Update Flipper Motors
    const motorSpeed = 25;
    leftFlipper.hinge.setMotorSpeed(keys.a ? -motorSpeed : motorSpeed);
    rightFlipper.hinge.setMotorSpeed(keys.d ? motorSpeed : -motorSpeed);

    // Step physics world
    world.step(timeStep);

    // Sync visuals with physics
    syncMeshWithBody(groundMesh, groundBody);
    syncMeshWithBody(leftWall.mesh, leftWall.body);
    syncMeshWithBody(rightWall.mesh, rightWall.body);
    syncMeshWithBody(topWall.mesh, topWall.body);
    syncMeshWithBody(leftFlipper.mesh, leftFlipper.body);
    syncMeshWithBody(rightFlipper.mesh, rightFlipper.body);
    syncMeshWithBody(ballMesh, ballBody);

    crates.forEach(crate => {
        syncMeshWithBody(crate.mesh, crate.body);
    });

    renderer.render(scene, camera);
}

animate();

// --- WINDOW RESIZE ---

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
