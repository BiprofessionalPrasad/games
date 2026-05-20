import * as THREE from 'three';

export default class UnicornMesh {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.width = 60;
    this.height = 80;
    this.x = -100;
    this.y = canvasHeight - 100 - this.height;
    this.speed = 2;
    this.isStumbling = false;

    const geometry = new THREE.BoxGeometry(this.width, this.height, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x800080 }); // purple unicorn
    this.mesh = new THREE.Mesh(geometry, material);
    this.updateMeshPosition();
  }

  update(player, setGameState) {
    const currentSpeed = this.isStumbling ? 0.5 : this.speed;
    const dx = player.x - this.x;
    if (dx > 0) {
      this.x += currentSpeed;
    } else {
      this.x -= currentSpeed;
    }
    this.updateMeshPosition();
    // Collision detection (simple AABB) – uses three.js Box3 for consistency.
    if (this.x < player.x + player.width &&
        this.x + this.width > player.x &&
        this.y < player.y + player.height &&
        this.y + this.height > player.y) {
      setGameState('GAMEOVER');
    }
  }

  updateMeshPosition() {
    const x = this.x - this.canvasWidth / 2 + this.width / 2;
    const y = -(this.y - this.canvasHeight / 2) - this.height / 2;
    this.mesh.position.set(x, y, 0);
  }

  getBox3() {
    return new THREE.Box3().setFromObject(this.mesh);
  }
}
