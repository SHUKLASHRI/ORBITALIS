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
  barycenter: Vector3D;
  onFpsUpdate?: (fps: number) => void;
}

export function ThreeViewport({
  bodies,
  config,
  selectedBodyId,
  onSelectBody,
  focusedBodyId,
  barycenter,
  onFpsUpdate,
}: ThreeViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Mesh and trail registries
  const bodyMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const trailLinesRef = useRef<Map<string, THREE.Line>>(new Map());
  const velocityArrowsRef = useRef<Map<string, THREE.ArrowHelper>>(new Map());
  const sharedSphereGeom = useRef<THREE.SphereGeometry>(new THREE.SphereGeometry(1, 32, 24));
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  // Mutable refs for animation loop
  const bodiesRef = useRef(bodies);
  const configRef = useRef(config);
  const selectedBodyIdRef = useRef(selectedBodyId);
  const focusedBodyIdRef = useRef(focusedBodyId);
  const barycenterRef = useRef(barycenter);

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
  }, [focusedBodyId]);

  useEffect(() => {
    barycenterRef.current = barycenter;
  }, [barycenter]);

  // Initial Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene with Deep Near-Black Astronomical Void
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080d);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.01,
      2000
    );
    camera.position.set(0, 16, 28);
    cameraRef.current = camera;

    // 3. High-Precision WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: config.renderQuality !== 'performance',
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.2;
    controls.maxDistance = 800;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Lighting: Central stellar emitter + ambient fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const sunPointLight = new THREE.PointLight(0xffffff, 2.5, 600, 1.2);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    // 6. Deep Space Background Starfield (Subtle & Non-distracting)
    const starCount = 2000;
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
        starColors[i * 3] = 0.8; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 1.0;
      } else if (t < 0.15) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.85; starColors[i * 3 + 2] = 0.7;
      } else {
        starColors[i * 3] = 0.9; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 0.9;
      }
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    });
    const starField = new THREE.Points(starGeom, starMaterial);
    scene.add(starField);

    // 7. Scientific Ecliptic Coordinate Grid (Hairline Grid)
    const grid = new THREE.GridHelper(60, 60, 0x1f2937, 0x111827);
    grid.position.y = -0.01;
    scene.add(grid);
    gridHelperRef.current = grid;

    // 8. Barycentre Marker (Technical Crosshair Reticle)
    const baryGroup = new THREE.Group();
    baryGroup.name = 'BarycenterMarker';
    const baryLineMat = new THREE.LineBasicMaterial({ color: 0xd97706, linewidth: 1 });
    const baryGeomX = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.2, 0, 0), new THREE.Vector3(0.2, 0, 0)]);
    const baryGeomZ = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -0.2), new THREE.Vector3(0, 0, 0.2)]);
    baryGroup.add(new THREE.Line(baryGeomX, baryLineMat));
    baryGroup.add(new THREE.Line(baryGeomZ, baryLineMat));
    scene.add(baryGroup);

    // 9. Render & Animation Loop
    let animId: number;
    let frameCount = 0;
    let lastFpsTime = performance.now();

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      frameCount++;
      if (time - lastFpsTime >= 1000) {
        onFpsUpdate?.(Math.round((frameCount * 1000) / (time - lastFpsTime)));
        frameCount = 0;
        lastFpsTime = time;
      }

      controls.update();

      const curBodies = bodiesRef.current;
      const curConfig = configRef.current;
      const curFocusedId = focusedBodyIdRef.current;
      const curBary = barycenterRef.current;

      // Toggle grid
      if (gridHelperRef.current) {
        gridHelperRef.current.visible = curConfig.showGrid;
      }

      // Update Barycentre
      baryGroup.visible = curConfig.showBarycenter;
      if (baryGroup.visible) {
        baryGroup.position.set(curBary.x, curBary.y, curBary.z);
      }

      // Camera auto-tracking
      if (curFocusedId) {
        const targetBody = curBodies.find((b) => b.id === curFocusedId);
        if (targetBody) {
          const targetVec = new THREE.Vector3(targetBody.position.x, targetBody.position.y, targetBody.position.z);
          controls.target.lerp(targetVec, 0.08);
        }
      } else if (curConfig.showBarycenter && curBodies.length > 0) {
        controls.target.lerp(new THREE.Vector3(curBary.x, curBary.y, curBary.z), 0.04);
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

          // Star Photosphere Glow (Subtle & Natural, Not Neon)
          if (isStar) {
            const coronaGeom = new THREE.SphereGeometry(1.2, 16, 16);
            const coronaMat = new THREE.MeshBasicMaterial({
              color: 0xffe066,
              transparent: true,
              opacity: 0.2,
              side: THREE.BackSide,
            });
            const corona = new THREE.Mesh(coronaGeom, coronaMat);
            group.add(corona);
          }

          // Saturn Rings (Physical Mesh)
          if (b.rings) {
            const ringGeom = new THREE.RingGeometry(b.rings.innerRadius, b.rings.outerRadius, 48);
            ringGeom.rotateX(Math.PI / 2);
            const ringMat = new THREE.MeshStandardMaterial({
              color: new THREE.Color(b.rings.color),
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.65,
              roughness: 0.8,
            });
            const ring = new THREE.Mesh(ringGeom, ringMat);
            group.add(ring);
          }

          // Technical Selection Reticle (Square Brackets, Not Neon Pill)
          const reticleGeom = new THREE.RingGeometry(1.2, 1.25, 4);
          reticleGeom.rotateX(Math.PI / 2);
          reticleGeom.rotateY(Math.PI / 4);
          const reticleMat = new THREE.MeshBasicMaterial({
            color: 0x58a6ff,
            side: THREE.DoubleSide,
          });
          const reticle = new THREE.Mesh(reticleGeom, reticleMat);
          reticle.name = 'reticle';
          reticle.visible = false;
          group.add(reticle);

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

        // Reticle Selection Highlight
        const reticle = group.getObjectByName('reticle');
        if (reticle) {
          reticle.visible = b.id === selectedBodyIdRef.current;
          reticle.scale.set(radius * 1.3, radius * 1.3, radius * 1.3);
        }

        // Velocity Vectors (Clean ArrowHelper)
        if (curConfig.showVectors) {
          let arrow = velocityArrowsRef.current.get(b.id);
          const speed = Math.hypot(b.velocity.x, b.velocity.y, b.velocity.z);

          if (speed > 1e-4) {
            const dir = new THREE.Vector3(b.velocity.x, b.velocity.y, b.velocity.z).normalize();
            const length = Math.min(2.5, speed * 0.18 + 0.2);

            if (!arrow) {
              arrow = new THREE.ArrowHelper(dir, group.position, length, 0x10b981, 0.15, 0.1);
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

        // 3D Orbital Trails
        if (curConfig.showTrails && b.trail && b.trail.length > 2) {
          let line = trailLinesRef.current.get(b.id);
          if (!line) {
            const lineGeom = new THREE.BufferGeometry();
            const lineMat = new THREE.LineBasicMaterial({
              color: new THREE.Color(b.color),
              transparent: true,
              opacity: 0.35,
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
          line.geometry.attributes.position.needsUpdate = true;
          line.visible = true;
        } else {
          const line = trailLinesRef.current.get(b.id);
          if (line) line.visible = false;
        }
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Raycasting for object selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      if (!container || !camera) return;
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const interactiveMeshes: THREE.Object3D[] = [];
      bodyMeshesRef.current.forEach((grp) => {
        const sph = grp.getObjectByName('sphere');
        if (sph) interactiveMeshes.push(sph);
      });

      const intersects = raycaster.intersectObjects(interactiveMeshes);
      if (intersects.length > 0) {
        const parentGrp = intersects[0].object.parent;
        if (parentGrp) {
          const bodyId = parentGrp.name.replace('Body_', '');
          onSelectBody(bodyId);
        }
      }
    };

    container.addEventListener('click', handlePointerDown);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('click', handlePointerDown);
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [config.renderQuality, onFpsUpdate, onSelectBody]);

  return <div ref={containerRef} className="relative w-full h-full cursor-grab active:cursor-grabbing select-none" />;
}
