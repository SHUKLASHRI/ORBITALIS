import * as THREE from 'three';

// High-resolution real planetary surface texture maps hosted on public web CDNs (NASA / Wikimedia / Three.js)
export const WEB_TEXTURE_MAPS: Record<string, string> = {
  sun: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/lava/lavatile.jpg',
  mercury: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/moon_1024.jpg',
  venus: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Venus_atmosphere-crop.jpg/1024px-Venus_atmosphere-crop.jpg',
  earth: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
  moon: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg',
  mars: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/1024px-OSIRIS_Mars_true_color.jpg',
  jupiter: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Jupiter.jpg/1024px-Jupiter.jpg',
  saturn: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Saturn_%28planet%29_large.jpg/1024px-Saturn_%28planet%29_large.jpg',
  uranus: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Uranus2.jpg/1024px-Uranus2.jpg',
  neptune: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Neptune.jpg/1024px-Neptune.jpg',
};

class TextureService {
  private loader: THREE.TextureLoader = new THREE.TextureLoader();
  private cache: Map<string, THREE.Texture> = new Map();

  getTexture(keyOrUrl: string): THREE.Texture | null {
    const url = WEB_TEXTURE_MAPS[keyOrUrl.toLowerCase()] || keyOrUrl;
    if (!url.startsWith('http')) return null;

    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // Load texture cross-origin directly from the web
    try {
      const texture = this.loader.load(
        url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.ClampToEdgeWrapping;
        },
        undefined,
        (err) => {
          console.warn(`Web texture load fallback for ${keyOrUrl}:`, err);
        }
      );
      this.cache.set(url, texture);
      return texture;
    } catch {
      return null;
    }
  }
}

export const textureService = new TextureService();

