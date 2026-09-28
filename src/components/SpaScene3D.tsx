"use client";

import { useEffect, useRef, useState } from "react";
// @ts-ignore
import * as THREE from "three";
// @ts-ignore
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export default function SpaScene3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 450;

    // --- Scene & Fog (Transparent Background & White Fog) ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#ffffff", 0.04);

    // --- Camera Setup (Zoomed out to show the complete model) ---
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(3.5, 3.3, 4.3);
    camera.lookAt(0, 0.28, -0.12);

    // --- Renderer Setup (Ultra-Photorealistic) ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer, more realistic shadows
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25; // Brighter exposure for clean spa look
    container.appendChild(renderer.domElement);

    // --- Studio Room Environment for True PBR Reflections ---
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv).texture;

    // --- Programmatic Textures (Bump Maps for Realism) ---
    const createNoiseTexture = (size = 512, intensity = 0.5, repeat = 4) => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const imgData = ctx.createImageData(size, size);
        for (let i = 0; i < imgData.data.length; i += 4) {
          const val = (Math.random() * 255 * intensity) + (255 * (1 - intensity));
          imgData.data[i] = val;
          imgData.data[i + 1] = val;
          imgData.data[i + 2] = val;
          imgData.data[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeat, repeat);
      return tex;
    };
    
    // Very subtle grain for leather and mattress
    const leatherBump = createNoiseTexture(512, 0.2, 2);
    const fabricBump = createNoiseTexture(512, 0.1, 4);

    // --- Cinematic Lights ---
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.3);
    scene.add(ambientLight);

    const mainSpotLight = new THREE.SpotLight("#fff9ed", 12);
    mainSpotLight.position.set(3, 5, -3);
    mainSpotLight.angle = Math.PI / 3;
    mainSpotLight.penumbra = 0.6;
    mainSpotLight.castShadow = true;
    mainSpotLight.shadow.mapSize.width = 2048;
    mainSpotLight.shadow.mapSize.height = 2048;
    mainSpotLight.shadow.bias = -0.0001;
    mainSpotLight.shadow.camera.near = 1;
    mainSpotLight.shadow.camera.far = 10;
    scene.add(mainSpotLight);

    const softFillLight = new THREE.DirectionalLight("#e0f2fe", 1.5);
    softFillLight.position.set(-4, 2, 4);
    scene.add(softFillLight);

    // --- High-End Materials ---
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: "#f5cd51", // Perfect Polished Gold
      metalness: 1.0,
      roughness: 0.1,
      clearcoat: 0.2,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.5,
    });

    const whiteCabinetMat = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: 0.05,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.2,
    });

    const pinkMattressMat = new THREE.MeshPhysicalMaterial({
      color: "#f5a3b7", // Real warm pink
      roughness: 0.9,
      metalness: 0.0,
      bumpMap: fabricBump,
      bumpScale: 0.0015,
      clearcoat: 0.0,
      envMapIntensity: 0.4,
    });

    const ceramicBasinMat = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: 0.01,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      side: THREE.DoubleSide,
      envMapIntensity: 2.0, // High reflection for porcelain
    });

    const blackLeatherMat = new THREE.MeshPhysicalMaterial({
      color: "#1a1a1a",
      roughness: 0.6,
      metalness: 0.1,
      bumpMap: leatherBump,
      bumpScale: 0.003,
      clearcoat: 0.3,
      clearcoatRoughness: 0.5,
    });

    // --- Geometry Helper: Beveled Rounded Box ---
    const createRoundedBox = (width: number, length: number, depth: number, radius: number, bevelThickness: number) => {
      const shape = new THREE.Shape();
      shape.moveTo(-width/2 + radius, -length/2);
      shape.lineTo(width/2 - radius, -length/2);
      shape.quadraticCurveTo(width/2, -length/2, width/2, -length/2 + radius);
      shape.lineTo(width/2, length/2 - radius);
      shape.quadraticCurveTo(width/2, length/2, width/2 - radius, length/2);
      shape.lineTo(-width/2 + radius, length/2);
      shape.quadraticCurveTo(-width/2, length/2, -width/2, length/2 - radius);
      shape.lineTo(-width/2, -length/2 + radius);
      shape.quadraticCurveTo(-width/2, -length/2, -width/2 + radius, -length/2);
      
      const geo = new THREE.ExtrudeGeometry(shape, { 
        depth: depth, bevelEnabled: true, bevelSegments: 32, steps: 1, bevelSize: bevelThickness, bevelThickness: bevelThickness 
      });
      geo.center();
      geo.rotateX(-Math.PI / 2);
      return geo;
    };

    // --- Build the Product Showcase ---
    const spaBedGroup = new THREE.Group();
    const geometriesToDispose: THREE.BufferGeometry[] = [];

    // 1. Cabinet Base
    const cabinetGeo = createRoundedBox(1.1, 1.7, 0.45, 0.06, 0.015);
    geometriesToDispose.push(cabinetGeo);
    const cabinet = new THREE.Mesh(cabinetGeo, whiteCabinetMat);
    cabinet.position.set(0, 0.25, 0.35);
    cabinet.castShadow = true;
    cabinet.receiveShadow = true;
    spaBedGroup.add(cabinet);

    // Gold Trim Frames
    const frameGeo = createRoundedBox(1.125, 1.725, 0.015, 0.06, 0.008);
    geometriesToDispose.push(frameGeo);
    const frameTop = new THREE.Mesh(frameGeo, goldMat);
    frameTop.position.set(0, 0.485, 0.35);
    frameTop.castShadow = true;
    spaBedGroup.add(frameTop);
    
    const frameBottom = new THREE.Mesh(frameGeo, goldMat);
    frameBottom.position.set(0, 0.02, 0.35);
    spaBedGroup.add(frameBottom);

    // 2. Pink Mattress Cushion
    const mattressGeo = createRoundedBox(1.12, 1.78, 0.16, 0.12, 0.04);
    geometriesToDispose.push(mattressGeo);
    const mattress = new THREE.Mesh(mattressGeo, pinkMattressMat);
    mattress.position.set(0, 0.58, 0.35);
    mattress.castShadow = true;
    mattress.receiveShadow = true;
    spaBedGroup.add(mattress);

    // 3. Ceramic Sink Basin
    // Using an inverted open sphere for a perfect bowl
    const basinGeo = new THREE.SphereGeometry(0.48, 128, 64, 0, Math.PI * 2, 0, Math.PI / 2);
    basinGeo.rotateX(Math.PI);
    geometriesToDispose.push(basinGeo);
    const basin = new THREE.Mesh(basinGeo, ceramicBasinMat);
    basin.scale.set(1.2, 0.6, 1.05);
    basin.position.set(0, 0.65, -0.75);
    basin.castShadow = true;
    basin.receiveShadow = true;
    spaBedGroup.add(basin);

    // Soft Pink transition sheet (bridges mattress and sink)
    const sheetGeo = createRoundedBox(1.0, 0.3, 0.01, 0.02, 0.01);
    geometriesToDispose.push(sheetGeo);
    const sheet = new THREE.Mesh(sheetGeo, pinkMattressMat);
    sheet.position.set(0, 0.66, -0.4);
    sheet.rotation.x = Math.PI / 12; // sloped down into sink
    sheet.castShadow = true;
    spaBedGroup.add(sheet);

    // Gold Drain
    const drainGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.01, 64);
    geometriesToDispose.push(drainGeo);
    const drain = new THREE.Mesh(drainGeo, goldMat);
    drain.position.set(0, 0.365, -0.75);
    spaBedGroup.add(drain);

    // 4. Black Leather Headrest
    const headrestGeo = createRoundedBox(0.38, 0.22, 0.07, 0.08, 0.025);
    geometriesToDispose.push(headrestGeo);
    const headrest = new THREE.Mesh(headrestGeo, blackLeatherMat);
    headrest.position.set(0, 0.58, -0.66);
    headrest.rotation.x = Math.PI / 18;
    headrest.castShadow = true;
    spaBedGroup.add(headrest);

    // 5. Golden Halo Water Arch
    const archGeo = new THREE.TorusGeometry(0.32, 0.018, 64, 128, Math.PI);
    geometriesToDispose.push(archGeo);
    const arch = new THREE.Mesh(archGeo, goldMat);
    arch.position.set(0, 0.78, -0.85);
    arch.castShadow = true;
    spaBedGroup.add(arch);

    // Arch supports
    const supportGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.25, 32);
    geometriesToDispose.push(supportGeo);
    const leftSupport = new THREE.Mesh(supportGeo, goldMat);
    leftSupport.position.set(-0.32, 0.65, -0.85);
    leftSupport.castShadow = true;
    spaBedGroup.add(leftSupport);
    
    const rightSupport = leftSupport.clone();
    rightSupport.position.x = 0.32;
    spaBedGroup.add(rightSupport);

    // 6. Folded Spa Towel (Replaces mannequin for a high-end product showcase look)
    const towelGeo = createRoundedBox(0.6, 0.8, 0.08, 0.06, 0.02);
    geometriesToDispose.push(towelGeo);
    const towelMat = new THREE.MeshPhysicalMaterial({ 
      color: "#ffffff", roughness: 1.0, bumpMap: fabricBump, bumpScale: 0.002, clearcoat: 0 
    });
    const towel = new THREE.Mesh(towelGeo, towelMat);
    towel.position.set(0, 0.7, 0.5);
    towel.rotation.y = Math.PI / 16;
    towel.castShadow = true;
    spaBedGroup.add(towel);

    // 7. Floor Shadow Catcher (Grounds the object in reality)
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    geometriesToDispose.push(floorGeo);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.08 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0; // Exactly at bottom of cabinet
    floor.receiveShadow = true;
    spaBedGroup.add(floor);
    
    // Center entire setup
    spaBedGroup.position.set(0, -0.35, 0);
    scene.add(spaBedGroup);

    // --- Hyper-Realistic Flowing Water ---
    // Continuous flowing streams from the arch down to the basin
    const streamCount = 12;
    const streamGroup = new THREE.Group();
    const streams: { mesh: THREE.Mesh; seed: number }[] = [];
    
    const streamGeo = new THREE.CylinderGeometry(0.003, 0.002, 0.4, 8);
    // Shift geometry so origin is at the top (makes scaling down from arch easier)
    streamGeo.translate(0, -0.2, 0);
    geometriesToDispose.push(streamGeo);

    const streamMat = new THREE.MeshPhysicalMaterial({
      color: "#dbf4ff",
      transmission: 1.0,
      ior: 1.33,
      roughness: 0.0,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });

    for (let i = 0; i < streamCount; i++) {
      // distribute along the arch PI length
      const angle = (i / (streamCount - 1)) * (Math.PI * 0.8) + (Math.PI * 0.1); 
      const x = Math.cos(angle) * 0.32;
      const y = Math.sin(angle) * 0.32 + 0.78; // Y pos of arch
      const z = -0.85;

      const streamMesh = new THREE.Mesh(streamGeo, streamMat);
      streamMesh.position.set(x, y, z);
      
      // Calculate length to hit the basin bottom (approx y = 0.38)
      const streamLength = y - 0.38; 
      streamMesh.scale.set(1, streamLength / 0.4, 1); // stretch cylinder to exact length
      
      streamGroup.add(streamMesh);
      streams.push({ mesh: streamMesh, seed: Math.random() * 100 });
    }
    spaBedGroup.add(streamGroup);

    // Splash particles at the bottom of the streams
    const splashCount = 100;
    const splashGeo = new THREE.SphereGeometry(0.004, 8, 8);
    geometriesToDispose.push(splashGeo);
    const splashDrops = new THREE.InstancedMesh(splashGeo, streamMat, splashCount);
    const dummy = new THREE.Object3D();
    const splashData = Array.from({ length: splashCount }, () => ({
      x: (Math.random() - 0.5) * 0.5,
      y: 0.38 + Math.random() * 0.05,
      z: -0.85 + (Math.random() - 0.5) * 0.15,
      vx: (Math.random() - 0.5) * 0.02,
      vy: Math.random() * 0.03,
      vz: (Math.random() - 0.5) * 0.02,
    }));
    splashDrops.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    spaBedGroup.add(splashDrops);

    // --- Interactive Controls & Smooth Auto-Rotation ---
    let targetRotationX = -0.15;
    let targetRotationY = -0.4;
    let currentRotationX = -0.15;
    let currentRotationY = -0.4;

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / width * 2 - 1;
      const y = -(event.clientY - rect.top) / height * 2 + 1;
      targetRotationY = x * 0.6;
      targetRotationX = -0.15 + y * 0.25;
    };

    container.addEventListener("mousemove", onMouseMove);
    setLoading(false);

    // --- Animation Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation for camera/scene rotation
      currentRotationX += (targetRotationX - currentRotationX) * 0.06;
      currentRotationY += (targetRotationY - currentRotationY) * 0.06;

      spaBedGroup.rotation.x = currentRotationX;
      spaBedGroup.rotation.y = (elapsedTime * 0.1) + currentRotationY;

      // Animate Water Streams (undulate thickness to simulate flowing liquid)
      streams.forEach((stream) => {
        const timeScale = elapsedTime * 15 + stream.seed;
        // Pulse the X/Z scale rapidly
        const pulse = 0.6 + Math.sin(timeScale) * 0.4; 
        stream.mesh.scale.x = pulse;
        stream.mesh.scale.z = pulse;
      });

      // Animate Splash Particles
      for (let i = 0; i < splashCount; i++) {
        const data = splashData[i];
        data.x += data.vx;
        data.y += data.vy;
        data.z += data.vz;
        data.vy -= 0.002; // gravity

        // Reset particle if it falls back to the basin floor
        if (data.y < 0.38) {
          data.x = (Math.random() - 0.5) * 0.5;
          data.y = 0.38;
          data.z = -0.85 + (Math.random() - 0.5) * 0.15;
          data.vy = Math.random() * 0.02 + 0.01;
        }

        dummy.position.set(data.x, data.y, data.z);
        dummy.updateMatrix();
        splashDrops.setMatrixAt(i, dummy.matrix);
      }
      splashDrops.instanceMatrix.needsUpdate = true;

      // Slowly orbit main light to cast dynamic shadows
      mainSpotLight.position.x = 3 + Math.sin(elapsedTime * 0.2) * 1.5;
      mainSpotLight.position.z = -3 + Math.cos(elapsedTime * 0.2) * 1.5;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationFrameId);

      scene.clear();
      geometriesToDispose.forEach(geo => geo.dispose());
      goldMat.dispose();
      whiteCabinetMat.dispose();
      pinkMattressMat.dispose();
      ceramicBasinMat.dispose();
      blackLeatherMat.dispose();
      towelMat.dispose();
      streamMat.dispose();
      floorMat.dispose();
      leatherBump.dispose();
      fabricBump.dispose();
      roomEnv.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isClient]);

  if (!isClient) return <div style={{ height: "600px", width: "100%", background: "transparent" }}></div>;

  return (
    <div style={{ position: "relative", width: "100%", height: "600px", overflow: "hidden", background: "transparent" }}>
      {loading && (
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", background: "#ffffff" }}>
          <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid rgba(228, 189, 78, 0.1)", borderTop: "3px solid var(--gold, #e4bd4e)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        </div>
      )}
      
      <div ref={containerRef} style={{ width: "100%", height: "100%", cursor: "grab" }} />

      <div style={{
        position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)",
        background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(0, 0, 0, 0.04)",
        padding: "8px 16px", borderRadius: "20px", color: "rgba(0, 0, 0, 0.6)",
        fontFamily: "var(--font-poppins, sans-serif)", fontSize: "11px", letterSpacing: "1.5px",
        pointerEvents: "none", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "8px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)"
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--gold, #e4bd4e)" }}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        <span>Vista 360° Interactiva</span>
      </div>

      <style jsx global>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
