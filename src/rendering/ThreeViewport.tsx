import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { CelestialBody, SimulationConfig, Vector3D } from '../physics/types';
import { textureService } from './textures';

interface ThreeViewportProps {
  bodies: CelestialBody[];
  config: SimulationConfig;
  selectedBodyId: string | null;
  onSelectBody: (id: string | null) => void;
  focusedBodyId: string | null;
  isFollowingBody?: boolean;
  barycenter: Vector3D;
  onFpsUpdate?: (fps: number) => void;
  showAsteroidBelt?: boolean;
}

export function ThreeViewport({
  bodies,
  config,
  selectedBodyId,
  onSelectBody,
  focusedBodyId,
  isFollowingBody = false,
  barycenter,
  onFpsUpdate,
  showAsteroidBelt = true,
}: ThreeViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Mesh registries
  const bodyMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const trailLinesRef = useRef<Map<string, THREE.Line>>(new Map());
  const velocityArrowsRef = useRef<Map<string, THREE.ArrowHelper>>(new Map());
  const sharedSphereGeom = useRef<THREE.SphereGeometry>(new THREE.SphereGeometry(1, 32, 24));
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const asteroidInstancedRef = useRef<THREE.InstancedMesh | null>(null);
  const asteroidDataRef = useRef<{ radius: number; angle: number; speed: number; y: number; scale: number; rotX: number; rotY: number }[]>([]);

  // State refs for animation loop
  const bodiesRef = useRef(bodies);
  const configRef = useRef(config);
  const selectedBodyIdRef = useRef(selectedBodyId);
  const focusedBodyIdRef = useRef(focusedBodyId);
  const isFollowingBodyRef = useRef(isFollowingBody);
  const barycenterRef = useRef(barycenter);
  const prevFollowPosRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    bodiesRef.current = bodies;
  }, [bodies]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    selectedBodyIdRef.current = selectedBodyId;
  }, [selectedBodyId]);

  useEffect(() => {
    focusedBodyIdRef.current = focusedBodyId;
    // Reset follow tracking baseline on focus target change
    prevFollowPosRef.current = null;
  }, [focusedBodyId]);

  useEffect(() => {
    isFollowingBodyRef.current = isFollowingBody;
    prevFollowPosRef.current = null;
  }, [isFollowingBody]);

  useEffect(() => {
    barycenterRef.current = barycenter;
  }, [barycenter]);

  // Initial Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene with Deep Space Obsidian Void
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080B12);
    sceneRef.current = scene;

    // 2. Camera with Microscopic Near Plane and Extended Far Range
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.005,
      4000
    );
    camera.position.set(0, 18, 30);
    cameraRef.current = camera;

    // 3. WebGL Renderer with Logarithmic Depth Buffer to Eliminate Space Clipping
    const renderer = new THREE.WebGLRenderer({
      antialias: config.renderQuality !== 'performance',
      powerPreference: 'high-performance',
      alpha: false,
      logarithmicDepthBuffer: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls with Close Zoom Support
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.02;
    controls.maxDistance = 1500;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Lighting: Central Sun radiance + Soft ambient
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunPointLight = new THREE.PointLight(0xffffff, 2.8, 600, 1.2);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    // 6. Deep Space Background Starfield
    const starCount = 3000;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 350 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = radius * Math.cos(phi);

      const t = Math.random();
      if (t > 0.85) {
        starColors[i * 3] = 0.7; starColors[i * 3 + 1] = 0.85; starColors[i * 3 + 2] = 1.0;
      } else if (t < 0.15) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.8; starColors[i * 3 + 2] = 0.6;
      } else {
        starColors[i * 3] = 0.9; starColors[i * 3 + 1] = 0.92; starColors[i * 3 + 2] = 0.95;
      }
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    const starField = new THREE.Points(starGeom, starMaterial);
    scene.add(starField);

    // 7. Subtle Deep-Space Cosmic Nebula Particles
    const nebulaCount = 400;
    const nebulaGeom = new THREE.BufferGeometry();
    const nebulaPos = new Float32Array(nebulaCount * 3);
    const nebulaColors = new Float32Array(nebulaCount * 3);

    for (let i = 0; i < nebulaCount; i++) {
      const r = 250 + Math.random() * 300;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.PI / 2 + (Math.random() - 0.5) * 0.7;

      nebulaPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      nebulaPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.4;
      nebulaPos[i * 3 + 2] = r * Math.cos(ph);

      // Deep cyan & indigo cosmic glow
      nebulaColors[i * 3] = 0.1 + Math.random() * 0.15;
      nebulaColors[i * 3 + 1] = 0.15 + Math.random() * 0.2;
      nebulaColors[i * 3 + 2] = 0.35 + Math.random() * 0.35;
    }
    nebulaGeom.setAttribute('position', new THREE.BufferAttribute(nebulaPos, 3));
    nebulaGeom.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));

    const nebulaMaterial = new THREE.PointsMaterial({
      size: 5.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nebulaField = new THREE.Points(nebulaGeom, nebulaMaterial);
    scene.add(nebulaField);

    // 8. Ecliptic Coordinate Grid with DepthWrite Disabled to Prevent Planet Slicing
    const grid = new THREE.GridHelper(60, 60, 0x263447, 0x141E2B);
    grid.position.y = -0.01;
    if (grid.material instanceof THREE.Material) {
      grid.material.depthWrite = false;
      grid.material.transparent = true;
      grid.material.opacity = 0.25;
    }
    scene.add(grid);
    gridHelperRef.current = grid;

    // 9. Asteroid Belt InstancedMesh (1,200 Realistic Asteroids)
    const asteroidCount = 1200;
    const asteroidGeom = new THREE.DodecahedronGeometry(0.016, 1);
    const asteroidMat = new THREE.MeshStandardMaterial({
      color: 0x8a929e,
      roughness: 0.85,
      metalness: 0.1,
    });
    const asteroidMesh = new THREE.InstancedMesh(asteroidGeom, asteroidMat, asteroidCount);
    asteroidMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Object3D();
    const asteroidData: { radius: number; angle: number; speed: number; y: number; scale: number; rotX: number; rotY: number }[] = [];

    for (let i = 0; i < asteroidCount; i++) {
      // Mars-Jupiter Asteroid Belt: 2.2 to 3.4 AU
      const r = 2.2 + Math.random() * 1.2;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.sqrt(4 * Math.PI * Math.PI / Math.pow(r, 3)); // Keplerian orbital speed
      const y = (Math.random() - 0.5) * 0.14;
      const scale = 0.5 + Math.random() * 1.3;

      asteroidData.push({
        radius: r,
        angle,
        speed,
        y,
        scale,
        rotX: Math.random() * Math.PI,
        rotY: Math.random() * Math.PI,
      });

      dummy.position.set(r * Math.cos(angle), y, r * Math.sin(angle));
      dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.4), scale);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      dummy.updateMatrix();
      asteroidMesh.setMatrixAt(i, dummy.matrix);
    }
    asteroidMesh.instanceMatrix.needsUpdate = true;
    scene.add(asteroidMesh);
    asteroidInstancedRef.current = asteroidMesh;
    asteroidDataRef.current = asteroidData;

    // 10. Click Selection Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const targetMeshes: THREE.Object3D[] = [];
      bodyMeshesRef.current.forEach((group) => {
        const sphere = group.getObjectByName('sphere');
        if (sphere) targetMeshes.push(sphere);
      });

      const intersects = raycaster.intersectObjects(targetMeshes);
      if (intersects.length > 0) {
        const parent = intersects[0].object.parent;
        if (parent && parent.name.startsWith('Body_')) {
          const bodyId = parent.name.replace('Body_', '');
          onSelectBody(bodyId);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // 11. Window Resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 12. Animation Render Loop
    let animId: number;
    let frameCount = 0;
    let fpsTimer = performance.now();
    let lastAnimTime = performance.now();

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);

      const dt = Math.min(0.05, (currentTime - lastAnimTime) / 1000);
      lastAnimTime = currentTime;

      // Update FPS counter
      frameCount++;
      if (currentTime - fpsTimer >= 1000) {
        if (onFpsUpdate) onFpsUpdate(frameCount);
        frameCount = 0;
        fpsTimer = currentTime;
      }

      const curBodies = bodiesRef.current;
      const curConfig = configRef.current;
      const curFocusedId = focusedBodyIdRef.current;
      const isFollowing = isFollowingBodyRef.current;

      // Camera auto-tracking & following
      if (curFocusedId) {
        const targetBody = curBodies.find((b) => b.id === curFocusedId);
        if (targetBody) {
          const curPos = new THREE.Vector3(targetBody.position.x, targetBody.position.y, targetBody.position.z);

          if (isFollowing) {
            // Camera follow: displace camera by the exact movement delta of the body
            if (prevFollowPosRef.current) {
              const delta = curPos.clone().sub(prevFollowPosRef.current);
              camera.position.add(delta);
              controls.target.add(delta);
            } else {
              controls.target.copy(curPos);
            }
            prevFollowPosRef.current = curPos.clone();
          } else {
            // Focus smooth lerp
            controls.target.lerp(curPos, 0.08);
          }
        }
      } else if (curConfig.showBarycenter && curBodies.length > 0) {
        controls.target.lerp(new THREE.Vector3(barycenterRef.current.x, barycenterRef.current.y, barycenterRef.current.z), 0.04);
      }

      // Update Asteroid Belt Orbiting
      if (asteroidInstancedRef.current && showAsteroidBelt && !curConfig.isPaused) {
        const simSpeed = curConfig.timeMultiplier || 1.0;
        const dummyAsteroid = new THREE.Object3D();
        const aMesh = asteroidInstancedRef.current;
        const aData = asteroidDataRef.current;

        for (let i = 0; i < aData.length; i++) {
          const ast = aData[i];
          ast.angle += ast.speed * dt * 0.15 * simSpeed;

          dummyAsteroid.position.set(
            ast.radius * Math.cos(ast.angle),
            ast.y,
            ast.radius * Math.sin(ast.angle)
          );
          dummyAsteroid.scale.set(ast.scale, ast.scale, ast.scale);
          dummyAsteroid.rotation.set(ast.rotX, ast.rotY + ast.angle, 0);
          dummyAsteroid.updateMatrix();
          aMesh.setMatrixAt(i, dummyAsteroid.matrix);
        }
        aMesh.instanceMatrix.needsUpdate = true;
      }

      // Clean up meshes of deleted bodies
      const activeIds = new Set(curBodies.map((b) => b.id));
      bodyMeshesRef.current.forEach((meshGroup, id) => {
        if (!activeIds.has(id)) {
          scene.remove(meshGroup);
          bodyMeshesRef.current.delete(id);
        }
      });

      trailLinesRef.current.forEach((line, id) => {
        if (!activeIds.has(id)) {
          scene.remove(line);
          trailLinesRef.current.delete(id);
        }
      });

      velocityArrowsRef.current.forEach((arrow, id) => {
        if (!activeIds.has(id)) {
          scene.remove(arrow);
          velocityArrowsRef.current.delete(id);
        }
      });

      // Synchronize 3D meshes with real web textures
      for (const b of curBodies) {
        let group = bodyMeshesRef.current.get(b.id);

        if (!group) {
          group = new THREE.Group();
          group.name = `Body_${b.id}`;

          // Sphere Mesh with Web CDN Texture
          const isStar = b.type === 'star';
          const webTex = curConfig.useRealisticTextures && b.textureUrl
            ? textureService.getTexture(b.textureUrl)
            : null;

          const material = isStar
            ? new THREE.MeshBasicMaterial({
                color: b.color,
                map: webTex || undefined,
              })
            : new THREE.MeshStandardMaterial({
                color: webTex ? 0xffffff : b.color,
                map: webTex || undefined,
                roughness: 0.65,
                metalness: 0.1,
              });

          const sphere = new THREE.Mesh(sharedSphereGeom.current, material);
          sphere.name = 'sphere';
          group.add(sphere);

          // Star Photosphere Radiance (DepthWrite disabled, unit geometry dynamically scaled)
          if (isStar) {
            const coronaGeom = new THREE.SphereGeometry(1.0, 32, 24);
            const coronaMat = new THREE.MeshBasicMaterial({
              color: 0xffaa22,
              transparent: true,
              opacity: 0.22,
              side: THREE.BackSide,
              depthWrite: false,
              blending: THREE.AdditiveBlending,
            });
            const corona = new THREE.Mesh(coronaGeom, coronaMat);
            corona.name = 'corona';
            group.add(corona);
          }

          // Saturn Rings (Normalized unit geometry, DepthWrite disabled to prevent cutting into planet sphere)
          if (b.rings) {
            const ringGeom = new THREE.RingGeometry(1.3, 2.3, 64);
            ringGeom.rotateX(Math.PI / 2);
            const ringMat = new THREE.MeshStandardMaterial({
              color: new THREE.Color(b.rings.color),
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.85,
              roughness: 0.8,
              depthWrite: false,
            });
            const ring = new THREE.Mesh(ringGeom, ringMat);
            ring.name = 'ring';
            group.add(ring);
          }

          // Technical 4-Corner Bracket Reticle: ┌ ┐ / └ ┘
          const bracketGroup = new THREE.Group();
          bracketGroup.name = 'reticle';
          const bracketMat = new THREE.LineBasicMaterial({
            color: 0x8797FF,
            linewidth: 2,
            depthTest: false, // Prevents reticle from clipping inside planet sphere
          });
          const sz = 1.35;
          const len = 0.45;

          // 4 Corner L-Shapes in X-Y plane (billboarded)
          const cornerPoints: THREE.Vector3[][] = [
            // Top-Left: ┌
            [new THREE.Vector3(-sz, sz - len, 0), new THREE.Vector3(-sz, sz, 0), new THREE.Vector3(-sz + len, sz, 0)],
            // Top-Right: ┐
            [new THREE.Vector3(sz - len, sz, 0), new THREE.Vector3(sz, sz, 0), new THREE.Vector3(sz, sz - len, 0)],
            // Bottom-Left: └
            [new THREE.Vector3(-sz, -sz + len, 0), new THREE.Vector3(-sz, -sz, 0), new THREE.Vector3(-sz + len, -sz, 0)],
            // Bottom-Right: ┘
            [new THREE.Vector3(sz - len, -sz, 0), new THREE.Vector3(sz, -sz, 0), new THREE.Vector3(sz, -sz + len, 0)],
          ];

          for (const pts of cornerPoints) {
            const geom = new THREE.BufferGeometry().setFromPoints(pts);
            bracketGroup.add(new THREE.Line(geom, bracketMat));
          }

          bracketGroup.visible = false;
          group.add(bracketGroup);

          scene.add(group);
          bodyMeshesRef.current.set(b.id, group);
        }

        // Update Position & Scale
        group.position.set(b.position.x, b.position.y, b.position.z);
        const radius = Math.max(0.02, b.visualRadius || 0.1);
        const sphereMesh = group.getObjectByName('sphere');
        if (sphereMesh) {
          sphereMesh.scale.set(radius, radius, radius);
        }

        // Dynamically scale corona to star radius
        const coronaMesh = group.getObjectByName('corona');
        if (coronaMesh) {
          coronaMesh.scale.set(radius * 1.25, radius * 1.25, radius * 1.25);
        }

        // Dynamically scale planetary rings with planet radius
        const ringMesh = group.getObjectByName('ring');
        if (ringMesh) {
          ringMesh.scale.set(radius, radius, radius);
        }

        // Reticle Selection Highlight & Billboard facing camera
        const reticle = group.getObjectByName('reticle');
        if (reticle) {
          const isSelected = b.id === selectedBodyIdRef.current;
          reticle.visible = isSelected;
          if (isSelected) {
            reticle.scale.set(radius * 1.25, radius * 1.25, radius * 1.25);
            reticle.quaternion.copy(camera.quaternion); // Always face camera
          }
        }

        // Velocity Vectors
        if (curConfig.showVectors) {
          let arrow = velocityArrowsRef.current.get(b.id);
          const speed = Math.hypot(b.velocity.x, b.velocity.y, b.velocity.z);

          if (speed > 1e-4) {
            const dir = new THREE.Vector3(b.velocity.x, b.velocity.y, b.velocity.z).normalize();
            const length = Math.min(2.5, speed * 0.18 + 0.2);

            if (!arrow) {
              arrow = new THREE.ArrowHelper(dir, group.position, length, 0x5FD5E8, 0.15, 0.1);
              scene.add(arrow);
              velocityArrowsRef.current.set(b.id, arrow);
            } else {
              arrow.position.copy(group.position);
              arrow.setDirection(dir);
              arrow.setLength(length, 0.15, 0.1);
              arrow.visible = true;
            }
          } else if (arrow) {
            arrow.visible = false;
          }
        } else {
          const arrow = velocityArrowsRef.current.get(b.id);
          if (arrow) arrow.visible = false;
        }

        // 3D Orbital Trajectory Trails
        if (curConfig.showTrails && b.trail && b.trail.length > 2) {
          let line = trailLinesRef.current.get(b.id);
          if (!line) {
            const lineGeom = new THREE.BufferGeometry();
            const lineMat = new THREE.LineBasicMaterial({
              color: new THREE.Color(b.color),
              transparent: true,
              opacity: 0.45,
              depthWrite: false,
            });
            line = new THREE.Line(lineGeom, lineMat);
            scene.add(line);
            trailLinesRef.current.set(b.id, line);
          }

          const points = new Float32Array(b.trail.length * 3);
          for (let i = 0; i < b.trail.length; i++) {
            points[i * 3] = b.trail[i].x;
            points[i * 3 + 1] = b.trail[i].y;
            points[i * 3 + 2] = b.trail[i].z;
          }

          line.geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
          line.geometry.setDrawRange(0, b.trail.length);
          line.visible = true;
        } else {
          const line = trailLinesRef.current.get(b.id);
          if (line) line.visible = false;
        }
      }

      // Update grid visibility
      if (gridHelperRef.current) {
        gridHelperRef.current.visible = curConfig.showGrid;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [config.renderQuality, onFpsUpdate, onSelectBody, showAsteroidBelt]);

  return <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing" />;
}
