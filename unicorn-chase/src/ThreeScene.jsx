import * as THREE from 'three';

/**
 * Simple wrapper for a three.js scene used by the unicorn‑chase game.
 * Provides an OrthographicCamera, a WebGLRenderer, basic lighting,
 * and convenience methods for adding/removing objects and handling resize.
 */
class ThreeScene {
  constructor({ width = 800, height = 600 } = {}) {
    // Create scene
    this.scene = new THREE.Scene();

    // Orthographic camera that matches 2‑D canvas coordinates
    const left = -width / 2;
    const right = width / 2;
    const top = height / 2;
    const bottom = -height / 2;
    const near = 0.1;
    const far = 1000;
    this.camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
    this.camera.position.set(0, 0, 500);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Basic ambient and directional lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(0, 200, 200);
    this.scene.add(dirLight);
  }

  /** Add a THREE.Object3D (mesh, group, etc.) to the scene */
  add(object) {
    this.scene.add(object);
  }

  /** Remove a THREE.Object3D from the scene */
  remove(object) {
    this.scene.remove(object);
  }

  /** Resize the renderer and update the camera orthographic bounds */
  resize(width, height) {
    this.renderer.setSize(width, height);
    const left = -width / 2;
    const right = width / 2;
    const top = height / 2;
    const bottom = -height / 2;
    this.camera.left = left;
    this.camera.right = right;
    this.camera.top = top;
    this.camera.bottom = bottom;
    this.camera.updateProjectionMatrix();
  }

  /** Render the scene */
  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

export default ThreeScene;

