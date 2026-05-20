import * as THREE from 'three';

export default class CollectibleMesh {
  constructor(type, canvasWidth, canvasHeight) {
    this.type = type;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.width = 30;
    this.height = 30;
    this.x = canvasWidth + Math.random() * 500;
    this.y = canvasHeight - 100 - this.height - Math.random() * 50;
    this.collected = false;
    // Determine colour and points based on type
    switch (type) {
      case 'RAINBOW':
        this.color = 0xff0000; // start with red (placeholder)
        break;
      case 'ICECREAM':
        this.color = 0xff69b4; // pink
        break;
      case 'COOKIE':
        this.color = 0x8b4513; // brown
        break;
      default:
        this.color = 0xffffff;
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

  getBox3() {
    return new THREE.Box3().setFromObject(this.mesh);
  }
}
