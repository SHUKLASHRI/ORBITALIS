import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { CelestialBody, SimulationConfig, Vector3D } from '../physics/types';

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

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.01,
      1500
    );
    camera.position.set(0, 14, 24);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: config.renderQuality !== 'performance',
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.5;
    controls.maxDistance = 600;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunPointLight = new THREE.PointLight(0xffffff, 2.5, 400);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    // 6. Deep Space Starfield (1500 Background Stars)
    const starCount = 1800;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 300 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = radius * Math.cos(phi);

      const colorTint = Math.random();
      if (colorTint > 0.8) {
        starColors[i * 3] = 0.7; starColors[i * 3 + 1] = 0.85; starColors[i * 3 + 2] = 1.0;
      } else if (colorTint < 0.2) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.8; starColors[i * 3 + 2] = 0.6;
      } else {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 1.0; starColors[i * 3 + 2] = 1.0;
      }
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    const starField = new THREE.Points(starGeom, starMaterial);
    scene.add(starField);

    // 7. Ecliptic Coordinate Grid
    const grid = new THREE.GridHelper(50, 50, 0x00f0ff, 0x1e293b);
    grid.position.y = -0.01;
    scene.add(grid);
    gridHelperRef.current = grid;

    // 8. Barycenter Marker
    const baryGeom = new THREE.RingGeometry(0.08, 0.12, 16);
    baryGeom.rotateX(Math.PI / 2);
    const baryMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
    const baryMesh = new THREE.Mesh(baryGeom, baryMat);
    baryMesh.name = 'BarycenterMarker';
    scene.add(baryMesh);

    // 9. Animation & Render Loop
    let animId: number;
    let frameCount = 0;
    let lastFpsTime = performance.now();

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);

      // FPS tracking
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

      // Toggle grid visibility
      if (gridHelperRef.current) {
        gridHelperRef.current.visible = curConfig.showGrid;
      }

      // Update Barycenter marker
      baryMesh.visible = curConfig.showBarycenter;
      if (baryMesh.visible) {
        baryMesh.position.set(curBary.x, curBary.y, curBary.z);
      }

      // Camera auto-focus tracking
      if (curFocusedId) {
        const targetBody = curBodies.find((b) => b.id === curFocusedId);
        if (targetBody) {
          const targetVec = new THREE.Vector3(targetBody.position.x, targetBody.position.y, targetBody.position.z);
          controls.target.lerp(targetVec, 0.08);
        }
      } else if (curConfig.showBarycenter && curBodies.length > 0) {
        controls.target.lerp(new THREE.Vector3(curBary.x, curBary.y, curBary.z), 0.04);
      }

      // Synchronize 3D Body Meshes
      const activeIds = new Set(curBodies.map((b) => b.id));

      // Remove meshes for deleted bodies
      bodyMeshesRef.current.forEach((meshGroup, id) => {
        if (!activeIds.has(id)) {
          scene.remove(meshGroup);
          bodyMeshesRef.current.delete(id);
        }
      });

      // Remove obsolete trails
      trailLinesRef.current.forEach((line, id) => {
        if (!activeIds.has(id)) {
          scene.remove(line);
          trailLinesRef.current.delete(id);
        }
      });

      // Update or create meshes for bodies
      for (const b of curBodies) {
        let group = bodyMeshesRef.current.get(b.id);

        if (!group) {
          group = new THREE.Group();
          group.name = `Body_${b.id}`;

          // Sphere Mesh
          const isStar = b.type === 'star';
          const material = isStar
            ? new THREE.MeshBasicMaterial({ color: b.color })
            : new THREE.MeshStandardMaterial({
                color: b.color,
                roughness: 0.6,
                metalness: 0.1,
              });

          const sphere = new THREE.Mesh(sharedSphereGeom.current, material);
          sphere.name = 'sphere';
          group.add(sphere);

          // Star Corona Atmospheric Halo
          if (isStar) {
            const glowGeom = new THREE.SphereGeometry(1.3, 16, 16);
            const glowMat = new THREE.MeshBasicMaterial({
              color: b.color,
              transparent: true,
              opacity: 0.25,
              side: THREE.BackSide,
            });
            const glow = new THREE.Mesh(glowGeom, glowMat);
            glow.name = 'glow';
            group.add(glow);
          }

          // Planetary Rings (e.g. Saturn)
          if (b.rings) {
            const ringGeom = new THREE.RingGeometry(b.rings.innerRadius, b.rings.outerRadius, 32);
            ringGeom.rotateX(Math.PI / 2);
            const ringMat = new THREE.MeshBasicMaterial({
              color: new THREE.Color(b.rings.color),
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.7,
            });
            const ring = new THREE.Mesh(ringGeom, ringMat);
            group.add(ring);
          }

          // Target Selection Ring
          const selGeom = new THREE.RingGeometry(1.4, 1.5, 32);
          selGeom.rotateX(Math.PI / 2);
          const selMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
          });
          const selMesh = new THREE.Mesh(selGeom, selMat);
          selMesh.name = 'selectionRing';
          selMesh.visible = false;
          group.add(selMesh);

          scene.add(group);
          bodyMeshesRef.current.set(b.id, group);
        }

        // Position & Scale
        group.position.set(b.position.x, b.position.y, b.position.z);
        const radius = b.visualRadius || 0.1;
        const sphereMesh = group.getObjectByName('sphere');
        if (sphereMesh) {
          sphereMesh.scale.set(radius, radius, radius);
        }

        // Selection ring update
        const selMesh = group.getObjectByName('selectionRing');
        if (selMesh) {
          selMesh.visible = b.id === selectedBodyIdRef.current;
          selMesh.scale.set(radius, radius, radius);
        }

        // Update 3D Orbital Trails
        if (curConfig.showTrails && b.trail && b.trail.length > 2) {
          let line = trailLinesRef.current.get(b.id);
          if (!line) {
            const lineGeom = new THREE.BufferGeometry();
            const lineMat = new THREE.LineBasicMaterial({
              color: b.color,
              transparent: true,
              opacity: 0.45,
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

    // Click Raycasting for Body Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      if (!container || !camera) return;
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Collect all sphere meshes in bodies
      const interactiveMeshes: THREE.Object3D[] = [];
      bodyMeshesRef.current.forEach((group) => {
        const sphere = group.getObjectByName('sphere');
        if (sphere) interactiveMeshes.push(sphere);
      });

      const intersects = raycaster.intersectObjects(interactiveMeshes);
      if (intersects.length > 0) {
        const clickedSphere = intersects[0].object;
        const parentGroup = clickedSphere.parent;
        if (parentGroup) {
          const bodyId = parentGroup.name.replace('Body_', '');
          onSelectBody(bodyId);
        }
      }
    };

    container.addEventListener('click', handlePointerDown);

    // Resize handler
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

