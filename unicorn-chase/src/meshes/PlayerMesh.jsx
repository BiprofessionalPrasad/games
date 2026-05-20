import * as THREE from 'three';

export default class PlayerMesh {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.width = 40;
    this.height = 60;
    this.x = 100;
    this.y = canvasHeight - 100 - this.height;
    this.vx = 0;
    this.vy = 0;
    this.speed = 5;
    this.jumpPower = -15;
    this.gravity = 0.8;
    this.isGrounded = true;
    this.isSliding = false;
    this.slideTimer = 0;
    this.originalHeight = this.height;

    const geometry = new THREE.BoxGeometry(this.width, this.height, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // blue player
    this.mesh = new THREE.Mesh(geometry, material);
    this.updateMeshPosition();
  }

  update(keys, controls) {
    if (keys[controls.left]) {
      this.vx = -this.speed;
    } else if (keys[controls.right]) {
      this.vx = this.speed;
    } else {
      this.vx = 0;
    }

    if (keys[controls.jump] && this.isGrounded) {
      this.vy = this.jumpPower;
      this.isGrounded = false;
    }

    if (keys[controls.slide]) {
      this.isSliding = true;
      this.height = this.originalHeight / 2;
      this.y = this.canvasHeight - 100 - this.height;
    } else {
      if (this.isSliding) {
        this.isSliding = false;
        this.height = this.originalHeight;
        this.y = this.canvasHeight - 100 - this.height;
      }
    }

    if (keys[controls.special]) {
      this.speed = 8;
    } else {
      this.speed = 5;
    }

    this.vy += this.gravity;
    this.y += this.vy;
    this.x += this.vx;

    if (this.y > this.canvasHeight - 100 - this.height) {
      this.y = this.canvasHeight - 100 - this.height;
      this.vy = 0;
      this.isGrounded = true;
    }

    if (this.x < 0) this.x = 0;
    if (this.x > 800 - this.width) this.x = 800 - this.width;

    this.updateMeshPosition();
  }

  updateMeshPosition() {
    // Transform canvas top‑left coordinates to three.js orthographic centre‑based coords.
    const x = this.x - this.canvasWidth / 2 + this.width / 2;
    const y = -(this.y - this.canvasHeight / 2) - this.height / 2;
    this.mesh.position.set(x, y, 0);
  }

  getBox3() {
    const box = new THREE.Box3().setFromObject(this.mesh);
    return box;
  }
}
