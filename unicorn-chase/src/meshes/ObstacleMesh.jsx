import * as THREE from 'three';

export default class ObstacleMesh {
  constructor(type, canvasWidth, canvasHeight) {
    this.type = type;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    // Default dimensions
    this.width = 40;
    this.height = 40;
    this.x = canvasWidth + Math.random() * 500;
    this.y = canvasHeight - 100 - this.height;
    // Adjust per type
    switch (type) {
      case 'BRANCH':
        this.color = 0x8b4513; // brown
        this.y = canvasHeight - 140;
        this.height = 20;
        break;
      case 'PIT':
        this.color = 0x000000; // black
        this.width = 60;
        this.height = 20;
        this.y = canvasHeight - 100;
        break;
      case 'MARSHMALLOW':
        this.color = 0xffffff; // white
        break;
      default:
        this.color = 0x888888;
    }

    const geometry = new THREE.BoxGeometry(this.width, this.height, 1);
    const material = new THREE.MeshBasicMaterial({ color: this.color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.updateMeshPosition();
  }

  update(scrollSpeed) {
    this.x -= scrollSpeed;
    this.updateMeshPosition();
  }

  updateMeshPosition() {
    const x = this.x - this.canvasWidth / 2 + this.width / 2;
    const y = -(this.y - this.canvasHeight / 2) - this.height / 2;
    this.mesh.position.set(x, y, 0);
  }

  checkCollision(player) {
    // Use three.js Box3 for AABB collision.
    const playerBox = player.getBox3();
    const thisBox = this.getBox3();
    if (!thisBox.intersectsBox(playerBox)) return null;
    if (this.type === 'BRANCH' && !player.isSliding) return 'HIT';
    if (this.type === 'PIT' && player.isGrounded) return 'HIT';
    if (this.type === 'MARSHMALLOW') return 'SLOW';
    return null;
  }

  getBox3() {
    return new THREE.Box3().setFromObject(this.mesh);
  }
}
