import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// --- INITIALIZATION ---

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020202); 

// SIGNIFICANTLY LARGER playfield dimensions
const playfieldWidth = 20;
const playfieldLength = 40;
const playfieldAngle = Math.PI / 12; // ~15 degree incline

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 35, 45); // Pulled back for larger board
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const world = new CANNON.World();
world.gravity.set(0, -9.81 * 2, 0); 

// --- MATERIALS & FRICTION ---
const ballMaterialPhys = new CANNON.Material('ball');
const groundMaterialPhys = new CANNON.Material('ground');

const contactMaterial = new CANNON.ContactMaterial(ballMaterialPhys, groundMaterialPhys, {
    friction: 0.005,
    restitution: 0.2,
});
world.addContactMaterial(contactMaterial);

// --- GLOBALS ---

let score = 0;
let hunger = 0;
let greenhouseGrowth = 0;
const greenhouseMaxGrowth = 100;
let jackpot = 0;

// --- COORDINATE SYSTEM HELPERS ---

function getTiltedPosition(x: number, z: number, yOffset: number = 0): THREE.Vector3 {
    const vec = new THREE.Vector3(x, yOffset, z);
    vec.applyAxisAngle(new THREE.Vector3(1, 0, 0), playfieldAngle);
    return vec;
}

function syncMeshWithBody(mesh: THREE.Mesh | THREE.Group, body: CANNON.Body) {
    mesh.position.copy(body.position as any);
    mesh.quaternion.copy(body.quaternion as any);
}

// --- OBJECTS ---

// 1. Playfield Surface
const groundShape = new CANNON.Box(new CANNON.Vec3(playfieldWidth / 2, 0.1, playfieldLength / 2));
const groundBody = new CANNON.Body({ mass: 0, material: groundMaterialPhys });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromEuler(playfieldAngle, 0, 0);
world.addBody(groundBody);

const groundGeometry = new THREE.BoxGeometry(playfieldWidth, 0.2, playfieldLength);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x8b3a2b, roughness: 1.0 });
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
scene.add(groundMesh);
syncMeshWithBody(groundMesh, groundBody);

// 1.5 Glass Top (Ceiling to keep ball on board)
// Physical glass is thicker than visual to prevent tunneling
const glassShape = new CANNON.Box(new CANNON.Vec3(playfieldWidth / 2, 1.0, playfieldLength / 2));
const glassBody = new CANNON.Body({ mass: 0, material: groundMaterialPhys });
glassBody.addShape(glassShape);
const glassPos = getTiltedPosition(0, 0, 3.5); // Position slightly higher due to thickness
glassBody.position.set(glassPos.x, glassPos.y, glassPos.z);
glassBody.quaternion.setFromEuler(playfieldAngle, 0, 0);
world.addBody(glassBody);

const glassGeometry = new THREE.BoxGeometry(playfieldWidth, 0.1, playfieldLength);
const glassMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x88ccff, // Slightly blue-tinted glass
    transparent: true, 
    opacity: 0.1, 
    metalness: 0.5, 
    roughness: 0 
});
const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
scene.add(glassMesh);
syncMeshWithBody(glassMesh, glassBody);

// 2. Walls
const wallThickness = 1.0;
const wallHeight = 4.0;
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 });

function createWall(x: number, z: number, length: number, width: number, angle: number) {
    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, wallHeight / 2, length / 2));
    const body = new CANNON.Body({ mass: 0, material: groundMaterialPhys });
    body.addShape(shape);
    const pos = getTiltedPosition(x, z, wallHeight / 2 - 0.1);
    body.position.set(pos.x, pos.y, pos.z);
    body.quaternion.setFromEuler(playfieldAngle, angle, 0);
    world.addBody(body);

    const geometry = new THREE.BoxGeometry(width, wallHeight, length);
    const mesh = new THREE.Mesh(geometry, wallMaterial);
    scene.add(mesh);
    syncMeshWithBody(mesh, body);
}

// Border Walls
createWall(-playfieldWidth / 2 - wallThickness / 2, 0, playfieldLength, wallThickness, 0);
createWall(playfieldWidth / 2 + wallThickness / 2, 0, playfieldLength, wallThickness, 0);
createWall(0, -playfieldLength / 2 - wallThickness / 2, playfieldWidth + wallThickness * 2, wallThickness, Math.PI / 2);

// Plunger Lane
createWall(playfieldWidth / 2 - 2.5, 6, playfieldLength - 12, 0.5, 0);

// Aprons (Diagonal walls at the bottom to guide ball to flippers)
createWall(-9.5, 14, 12, 0.5, Math.PI / 12); // Left Apron (Maximum clearance)
createWall(5.5, 14, 12, 0.5, -Math.PI / 12); // Right Apron

// ... (rest of curve code)
// Plunger Lane Curve (Top Right - enlarged for better flow)
const curveRadius = 3.5;
for (let i = 0; i <= 8; i++) {
    const angle = (i / 8) * (Math.PI / 2);
    const x = playfieldWidth / 2 - curveRadius + Math.cos(angle) * curveRadius;
    const z = -playfieldLength / 2 + curveRadius - Math.sin(angle) * curveRadius;
    createWall(x, z, 2.0, 0.3, angle);
}

// 3. Flippers
const flipperWidth = 4.5;

function createFlipper(x: number, z: number, isRight: boolean) {
    const shape = new CANNON.Box(new CANNON.Vec3(flipperWidth / 2, 0.3, 0.4));
    const pos = getTiltedPosition(x, z, 0.5);
    const body = new CANNON.Body({ 
        mass: 10, 
        position: new CANNON.Vec3(pos.x, pos.y, pos.z),
        angularDamping: 0.8, // Increased for stability
        linearDamping: 0.5
    });
    body.addShape(shape);
    body.quaternion.setFromEuler(playfieldAngle, 0, 0);
    world.addBody(body);

    const geometry = new THREE.BoxGeometry(flipperWidth, 0.6, 0.8);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0x550000 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const pivotOffset = isRight ? flipperWidth / 2 - 0.5 : -flipperWidth / 2 + 0.5;
    const pivotPos = getTiltedPosition(x + pivotOffset, z, 0.5);
    const anchorBody = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(pivotPos.x, pivotPos.y, pivotPos.z) });
    world.addBody(anchorBody);
    
    const axis = new CANNON.Vec3(0, 1, 0);
    const hinge = new CANNON.HingeConstraint(body, anchorBody, {
        pivotA: new CANNON.Vec3(pivotOffset, 0, 0),
        axisA: axis,
        pivotB: new CANNON.Vec3(0, 0, 0),
        axisB: axis
    });
    
    const limit = Math.PI / 4;
    (hinge as any).enableLimits = true;
    if (isRight) {
        (hinge as any).lowerLimit = -limit;
        (hinge as any).upperLimit = limit / 6;
    } else {
        (hinge as any).lowerLimit = -limit / 6;
        (hinge as any).upperLimit = limit;
    }
    
    hinge.enableMotor();
    hinge.setMotorMaxForce(1000); // Reduced for smoother action
    world.addConstraint(hinge);

    return { mesh, body, hinge };
}

const leftFlipper = createFlipper(-6.0, 16, false);
const rightFlipper = createFlipper(1.0, 16, true);

// 4. Ball
const ballRadius = 0.7;
const ballBody = new CANNON.Body({
    mass: 3,
    material: ballMaterialPhys,
    linearDamping: 0.01,
    angularDamping: 0.01
});
ballBody.addShape(new CANNON.Sphere(ballRadius));
world.addBody(ballBody);

const ballMesh = new THREE.Mesh(
    new THREE.SphereGeometry(ballRadius, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 })
);
scene.add(ballMesh);

function resetBall() {
    const pos = getTiltedPosition(playfieldWidth / 2 - 1.2, playfieldLength / 2 - 2, 1);
    ballBody.position.set(pos.x, pos.y, pos.z);
    ballBody.velocity.set(0, 0, 0);
    ballBody.angularVelocity.set(0, 0, 0);
}
resetBall();

// 5. Bumpers
function createBumper(x: number, z: number) {
    const radius = 1.2;
    const height = 1.5;
    const pos = getTiltedPosition(x, z, height / 2);
    const body = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(pos.x, pos.y, pos.z), material: groundMaterialPhys });
    body.addShape(new CANNON.Cylinder(radius, radius, height, 20));
    body.quaternion.setFromEuler(playfieldAngle, 0, 0);
    world.addBody(body);

    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, height, 32),
        new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.5 })
    );
    scene.add(mesh);
    syncMeshWithBody(mesh, body);

    body.addEventListener('collide', (e: any) => {
        if (e.body === ballBody) {
            const force = ballBody.position.vsub(body.position);
            force.y = 0; force.normalize();
            ballBody.applyImpulse(force.scale(30), new CANNON.Vec3(0, 0, 0));
            (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 5;
            setTimeout(() => (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5, 100);
            addScore(100);
        }
    });
}

createBumper(-4, -6);
createBumper(4, -6);
createBumper(0, -12);

// 6. Greenhouse
function createGreenhouse(x: number, z: number) {
    const radius = 2.2;
    const height = 2.5;
    const pos = getTiltedPosition(x, z, height / 2);
    const body = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(pos.x, pos.y, pos.z), material: groundMaterialPhys });
    body.addShape(new CANNON.Cylinder(radius, radius, height, 20));
    body.quaternion.setFromEuler(playfieldAngle, 0, 0);
    world.addBody(body);

    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, height, 32),
        new THREE.MeshStandardMaterial({ color: 0x228b22, transparent: true, opacity: 0.6 })
    );
    scene.add(mesh);
    syncMeshWithBody(mesh, body);

    const plantGeom = new THREE.TorusKnotGeometry(0.8, 0.2, 64, 8);
    const plantMesh = new THREE.Mesh(plantGeom, new THREE.MeshStandardMaterial({ color: 0x00ff00 }));
    plantMesh.position.y = 0.5;
    mesh.add(plantMesh);

    body.addEventListener('collide', (e: any) => {
        if (e.body === ballBody) {
            const force = ballBody.position.vsub(body.position);
            force.y = 0; force.normalize();
            ballBody.applyImpulse(force.scale(25), new CANNON.Vec3(0, 0, 0));
            greenhouseGrowth += 5;
            if (greenhouseGrowth >= greenhouseMaxGrowth) {
                greenhouseGrowth = 0; addScore(5000);
                ballBody.velocity.set((Math.random() - 0.5) * 15, 10, 20);
            }
            updateHUD();
            plantMesh.scale.set(1.5, 1.5, 1.5);
            setTimeout(() => plantMesh.scale.set(1, 1, 1), 100);
        }
    });
}
createGreenhouse(0, -2);

// 7. Ramp
function createRamp(x: number, z: number, width: number, length: number, height: number) {
    const rampAngle = -Math.PI / 8;
    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, 0.1, length / 2));
    const pos = getTiltedPosition(x, z, height);
    const body = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(pos.x, pos.y, pos.z), material: groundMaterialPhys });
    body.addShape(shape);
    body.quaternion.setFromEuler(playfieldAngle + rampAngle, 0, 0);
    world.addBody(body);

    const geometry = new THREE.BoxGeometry(width, 0.2, length);
    const material = new THREE.MeshStandardMaterial({ color: 0x3366ff, transparent: true, opacity: 0.6 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    syncMeshWithBody(mesh, body);

    const ePos = getTiltedPosition(x, z + length / 2, height + 0.5);
    const entranceBody = new CANNON.Body({ isTrigger: true, position: new CANNON.Vec3(ePos.x, ePos.y, ePos.z) });
    entranceBody.addShape(new CANNON.Box(new CANNON.Vec3(width / 2, 1, 0.1)));
    entranceBody.quaternion.setFromEuler(playfieldAngle, 0, 0);
    world.addBody(entranceBody);
    entranceBody.addEventListener('collide', (e: any) => { if (e.body === ballBody) jackpot += 1000; updateHUD(); });

    const xPos = getTiltedPosition(x, z - length / 2, height + 1.0);
    const exitBody = new CANNON.Body({ isTrigger: true, position: new CANNON.Vec3(xPos.x, xPos.y, xPos.z) });
    exitBody.addShape(new CANNON.Box(new CANNON.Vec3(width / 2, 1, 0.1)));
    exitBody.quaternion.setFromEuler(playfieldAngle, 0, 0);
    world.addBody(exitBody);
    exitBody.addEventListener('collide', (e: any) => {
        if (e.body === ballBody) {
            addScore(jackpot); jackpot = 0; updateHUD();
            material.emissive.set(0x00ffff); material.emissiveIntensity = 2;
            setTimeout(() => { material.emissive.set(0x000000); material.emissiveIntensity = 0; }, 500);
        }
    });
}
createRamp(-6, -2, 3, 12, 1.5);

// 8. Supply Crates
let crates: { mesh: THREE.Mesh; body: CANNON.Body }[] = [];
function createCrate() {
    const size = 1.5;
    const x = (Math.random() - 0.5) * (playfieldWidth - 8);
    const z = -playfieldLength / 2 + 6;
    const pos = getTiltedPosition(x, z, 8);
    const body = new CANNON.Body({ mass: 4, position: new CANNON.Vec3(pos.x, pos.y, pos.z) });
    body.addShape(new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2)));
    world.addBody(body);

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), new THREE.MeshStandardMaterial({ color: 0xffaa00 }));
    scene.add(mesh);
    const crate = { mesh, body };
    crates.push(crate);

    body.addEventListener('collide', (e: any) => {
        if (e.body === ballBody) {
            addScore(500);
            greenhouseGrowth = Math.min(greenhouseMaxGrowth, greenhouseGrowth + 15);
            updateHUD();
            scene.remove(mesh);
            world.removeBody(body);
            crates = crates.filter(c => c !== crate);
        }
    });
}
setInterval(createCrate, 15000);

// 9. Plunger Visual
const plungerGroup = new THREE.Group();
scene.add(plungerGroup);
const plungerMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2, 16), new THREE.MeshStandardMaterial({ color: 0xff4400, metalness: 0.9 }));
plungerGroup.add(plungerMesh);

const springGroup = new THREE.Group();
plungerGroup.add(springGroup);
for (let i = 0; i < 8; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 8, 24), new THREE.MeshStandardMaterial({ color: 0xaaaaaa }));
    ring.position.y = -0.8 - (i * 0.2);
    ring.rotation.x = Math.PI / 2;
    springGroup.add(ring);
}

function updatePlungerVisual(offset: number = 0) {
    const pos = getTiltedPosition(playfieldWidth / 2 - 1.2, playfieldLength / 2 - 0.5 + offset, 0.5);
    plungerGroup.position.copy(pos);
    const euler = new THREE.Euler(playfieldAngle + Math.PI / 2, 0, 0);
    plungerGroup.quaternion.setFromEuler(euler);
    springGroup.scale.y = 1 + (offset * 0.5);
    springGroup.position.y = offset;
}
updatePlungerVisual();

// --- LIGHTING ---
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dLight = new THREE.DirectionalLight(0xffffff, 1.2);
dLight.position.set(10, 30, 10);
scene.add(dLight);

// --- HUD ---
const hud = document.createElement('div');
hud.style.position = 'absolute'; hud.style.top = '20px'; hud.style.left = '20px';
hud.style.color = '#00ff00'; hud.style.fontFamily = 'monospace'; hud.style.fontSize = '24px';
document.body.appendChild(hud);

function updateHUD() {
    hud.innerHTML = `
        <div style="text-shadow: 0 0 10px #00ff00;">COLONY HEALTH: ${score}</div>
        <div style="color: #ff0000; text-shadow: 0 0 10px #ff0000;">ZOMBIE HUNGER: ${Math.floor(hunger)}%</div>
        <div style="font-size: 16px;">GREENHOUSE: ${greenhouseGrowth}% | JACKPOT: ${jackpot}</div>
    `;
}
updateHUD();

function addScore(p: number) { score += p; updateHUD(); }

// --- CONTROLS ---
const keys = { a: false, d: false };
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'a') keys.a = true;
    if (e.key.toLowerCase() === 'd') keys.d = true;
    if (e.key === ' ') {
        if (ballBody.position.z > 0 && ballBody.position.x > playfieldWidth / 2 - 4) {
            const impulse = new THREE.Vector3(0, 0, -120);
            impulse.applyAxisAngle(new THREE.Vector3(1, 0, 0), playfieldAngle);
            ballBody.applyImpulse(new CANNON.Vec3(impulse.x, impulse.y, impulse.z), new CANNON.Vec3(0, 0, 0));
            updatePlungerVisual(-0.8);
            setTimeout(() => updatePlungerVisual(0), 100);
        }
    }
});
window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'a') keys.a = false;
    if (e.key.toLowerCase() === 'd') keys.d = false;
});

// --- MAIN LOOP ---
const timeStep = 1 / 60;
function animate() {
    requestAnimationFrame(animate);
    hunger = Math.min(100, hunger + 0.001);
    updateHUD();
const motorSpeed = 40; // Increased speed for snappier feel
leftFlipper.hinge.setMotorSpeed(keys.a ? motorSpeed : -motorSpeed);
rightFlipper.hinge.setMotorSpeed(keys.d ? -motorSpeed : motorSpeed);

// Use sub-stepping for much higher accuracy
world.step(1/60, timeStep, 10);

// Strict Out of Bounds (Kill Volumes)
if (Math.abs(ballBody.position.x) > playfieldWidth || 
    Math.abs(ballBody.position.y) > 30 || 
    ballBody.position.z > playfieldLength / 2 + 5 || 
    ballBody.position.z < -playfieldLength / 2 - 5) {
    resetBall();
    hunger = Math.min(100, hunger + 10);
}

// Sync

    syncMeshWithBody(groundMesh, groundBody);
    syncMeshWithBody(ballMesh, ballBody);
    syncMeshWithBody(leftFlipper.mesh, leftFlipper.body);
    syncMeshWithBody(rightFlipper.mesh, rightFlipper.body);
    crates.forEach(c => syncMeshWithBody(c.mesh, c.body));

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
