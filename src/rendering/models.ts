import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Pre-verified official NASA 3D Raw URLs (CORS: Access-Control-Allow-Origin: *)
export const NASA_3D_MODELS = {
  voyager: 'https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Voyager%20Probe%20(A)/Voyager%20Probe%20(A).glb',
  jwst: 'https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/James%20Webb%20Space%20Telescope%20(A)/James%20Webb%20Space%20Telescope%20(A).glb',
  bennu: 'https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/1999%20RQ36%20asteroid/1999%20RQ36%20asteroid.glb',
  pioneer: 'https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Pioneer%2010/Pioneer%2010.glb',
};

class ModelService {
  private loader = new GLTFLoader();
  private cache = new Map<string, THREE.Group>();
  private loading = new Map<string, Promise<THREE.Group | null>>();

  /**
   * Resolve known model keys or full direct HTTPS URLs
   */
  public resolveModelUrl(keyOrUrl: string): string {
    if (keyOrUrl in NASA_3D_MODELS) {
      return NASA_3D_MODELS[keyOrUrl as keyof typeof NASA_3D_MODELS];
    }
    return keyOrUrl;
  }

  /**
   * Asynchronously load and cache a GLB/GLTF model
   */
  public async loadModel(keyOrUrl: string): Promise<THREE.Group | null> {
    const url = this.resolveModelUrl(keyOrUrl);

    if (this.cache.has(url)) {
      return this.cache.get(url)!.clone(true);
    }

    if (this.loading.has(url)) {
      const group = await this.loading.get(url);
      return group ? group.clone(true) : null;
    }

    const promise = new Promise<THREE.Group | null>((resolve) => {
      this.loader.load(
        url,
        (gltf) => {
          const root = gltf.scene;

          // Compute bounding box to normalize scale and center pivot
          const box = new THREE.Box3().setFromObject(root);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // Center model at (0, 0, 0)
          root.position.sub(center);

          // Normalize so maximum dimension is 1.0 unit
          const maxDim = Math.max(size.x, size.y, size.z, 0.001);
          const scaleFactor = 1.0 / maxDim;
          root.scale.multiplyScalar(scaleFactor);

          const wrapper = new THREE.Group();
          wrapper.add(root);

          this.cache.set(url, wrapper);
          this.loading.delete(url);
          resolve(wrapper.clone(true));
        },
        undefined,
        (err) => {
          console.warn(`[ModelService] Failed to load 3D model: ${url}`, err);
          this.loading.delete(url);
          resolve(null);
        }
      );
    });

    this.loading.set(url, promise);
    return promise;
  }

  /**
   * Synchronous check if a model is already loaded in cache
   */
  public getLoadedModel(keyOrUrl: string): THREE.Group | null {
    const url = this.resolveModelUrl(keyOrUrl);
    const cached = this.cache.get(url);
    return cached ? cached.clone(true) : null;
  }
}

export const modelService = new ModelService();
