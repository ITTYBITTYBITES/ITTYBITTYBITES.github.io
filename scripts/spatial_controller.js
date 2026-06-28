/**
 * 3D SPATIAL TUNNEL CONTROLLER (Phase 8 - Holographic Overhaul)
 * Orchestrates a high-fidelity holographic WebGL post-processing pipeline
 * featuring UnrealBloom, Chromatic Aberration, and custom Fresnel Edge-Glow Shader nodes.
 */

// 1. Custom Fresnel Holographic Edge-Glow Shader Definition
const FresnelShader = {
  uniforms: {
    "color": { value: new THREE.Color(0x5fe8ff) },
    "glowInternal": { value: 0.25 },
    "glowPower": { value: 3.0 },
    "glowIntensity": { value: 1.35 }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    uniform float glowInternal;
    uniform float glowPower;
    uniform float glowIntensity;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      // Fresnel edge lighting calculation based on camera perspective angle
      float intensity = pow(1.0 - max(dot(normal, viewDir), 0.0), glowPower) * glowIntensity;
      gl_FragColor = vec4(color, glowInternal + intensity);
    }
  `
};

// 2. Custom Chromatic Aberration Post-Processing Shader Definition
const ChromaticAberrationShader = {
  uniforms: {
    "tDiffuse": { value: null },
    "uAmount": { value: 0.0025 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uAmount;
    varying vec2 vUv;
    void main() {
      // Offset red and blue channels slightly to simulate a lens projection refraction
      vec4 cr = texture2D(tDiffuse, vUv + vec2(uAmount, 0.0));
      vec4 cg = texture2D(tDiffuse, vUv);
      vec4 cb = texture2D(tDiffuse, vUv - vec2(uAmount, 0.0));
      gl_FragColor = vec4(cr.r, cg.g, cb.b, cg.a);
    }
  `
};

class SpatialController {
  /**
   * Constructs the 3D spatial tunnel interface.
   * @param {HTMLElement} container - DOM element to render WebGL canvas.
   * @param {Array} registry - Active game nodes manifest catalog.
   * @param {Function} onNodeSelected - Callback triggered on raycast node clicks.
   * @param {Object} telemetryStats - Current user statistics database.
   */
  constructor(container, registry, onNodeSelected, telemetryStats) {
    this.container = container;
    this.registry = registry || [];
    this.onNodeSelected = onNodeSelected;
    this.telemetryStats = telemetryStats || { gamesPlayed: {} };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null; // EffectComposer post-processing
    this.css3dRenderer = null; // CSS3DRenderer for HTML boards
    
    this.tunnelRings = [];
    this.nodeMeshes = [];
    this.signpostMeshes = [];
    this.animationFrameId = null;
    
    // Raycaster states
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredMesh = null;

    // Transition Locks
    this.isTransitioning = false;

    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.init();
  }

  /**
   * Initializes Three.js environment, geometries, materials, and post-processing passes.
   */
  init() {
    // 1. Create Scene & Black Fog for depth fade
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x04060b);
    this.scene.fog = new THREE.FogExp2(0x04060b, 0.015);

    // 2. Setup Camera
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 0, 10); // Center camera in tunnel entrance

    // 3. Setup WebGL Renderer with custom options for post-processing buffer support
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);

    // 4. Setup THREE.CSS3DRenderer for dynamic 3D HTML ad boards
    const cssContainer = document.getElementById("css3d-renderer-container");
    if (cssContainer) {
      this.css3dRenderer = new THREE.CSS3DRenderer();
      this.css3dRenderer.setSize(this.width, this.height);
      cssContainer.appendChild(this.css3dRenderer.domElement);
    }

    // 5. Setup Ambient & Point Lights
    const ambientLight = new THREE.AmbientLight(0x111625);
    this.scene.add(ambientLight);

    const pointLightCyan = new THREE.PointLight(0x5fe8ff, 3, 50);
    pointLightCyan.position.set(0, 5, 0);
    this.scene.add(pointLightCyan);

    const pointLightPink = new THREE.PointLight(0xff5ee7, 3, 50);
    pointLightPink.position.set(0, -5, -20);
    this.scene.add(pointLightPink);

    // 6. Setup Post-Processing EffectComposer Pipeline
    this.setupPostProcessingPipeline();

    // 7. Construct Vector Glowing Ring Tunnel
    this.buildVectorTunnel();

    // 8. Spawn Holographic Fresnel Nodes, Fast-Travel Signposts, and Sponsored Ad boards
    this.spawnManifestNodes();
    this.spawnSignposts();
    this.spawnAdBoards();

    // 9. Bind Listeners
    this.bindEvents();

    // 10. Launch Loop
    this.animate();
  }

  /**
   * Constructs the Post-Processing chain: UnrealBloom and Chromatic Aberration.
   */
  setupPostProcessingPipeline() {
    this.composer = new THREE.EffectComposer(this.renderer);
    
    // 1. Render Pass
    const renderPass = new THREE.RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // 2. UnrealBloomPass for glowing vector light bleeding
    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      1.8,  // Strength: bright bleed
      0.45, // Radius
      0.15  // Threshold (low allows rich colors to bloom)
    );
    this.composer.addPass(bloomPass);

    // 3. Chromatic Aberration Shader Pass for holographic lens separation
    const chromaticPass = new THREE.ShaderPass(ChromaticAberrationShader);
    chromaticPass.uniforms["uAmount"].value = 0.0022; // Subtle glitchy separation
    this.composer.addPass(chromaticPass);
  }

  /**
   * Initializes the AdManager bridge and spawns float boards in the peripheral margins.
   */
  spawnAdBoards() {
    if (typeof AdManager !== "undefined") {
      window.ibbAds = new AdManager(this.scene, this.camera);
      // Spawn two distinct 3D Sponsored Hologram Nodes in peripheral zones
      window.ibbAds.spawnSponsoredNode(-5.8, 1.8, -25.0); // Left side midway
      window.ibbAds.spawnSponsoredNode(5.8, -1.8, -60.0);  // Right side deeper
    }
  }

  /**
   * Updates telemetry stats and re-sorts node positions dynamically.
   */
  updateTelemetryStats(newStats) {
    this.telemetryStats = newStats || { gamesPlayed: {} };
    console.log("🌀 [3D Spatial] Telemetry updated. Re-ranking node Z-depths...");
    this.reorderNodesDynamically();
  }

  /**
   * Generates concentric vector grid rings simulating a spatial speed-tunnel.
   */
  buildVectorTunnel() {
    const ringCount = 20; 
    const ringSpacing = 12; 
    
    for (let i = 0; i < ringCount; i++) {
      const radius = 8 + Math.sin(i * 0.5) * 1.5;
      const geometry = new THREE.TorusGeometry(radius, 0.06, 8, 16);
      
      const color = i % 2 === 0 ? 0x5fe8ff : 0xff5ee7;
      
      // Use basic material with high color values to intensify bloom pass
      const material = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: 0.45 - (i / ringCount) * 0.25
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, 0, -i * ringSpacing);
      
      this.scene.add(mesh);
      this.tunnelRings.push(mesh);
    }
  }

  /**
   * Maps nodes to beautiful semi-transparent holographic shapes utilizing a custom Fresnel Shader.
   */
  spawnManifestNodes() {
    const sortedRegistry = this.getSortedRegistry();

    sortedRegistry.forEach((item, index) => {
      let geometry;
      if (item.category.includes("3D WebGL")) {
        geometry = new THREE.OctahedronGeometry(1.0, 0);
      } else if (item.category.includes("Physics")) {
        geometry = new THREE.IcosahedronGeometry(0.9, 0);
      } else if (item.category.includes("Classics")) {
        geometry = new THREE.BoxGeometry(0.85, 0.85, 0.85);
      } else {
        geometry = new THREE.TetrahedronGeometry(1.0, 0);
      }

      const baseColor = 0x5fe8ff; // Glowing neon cyan

      // Instantiate Custom Fresnel Shader Material for holographic depth
      const customFresnelMat = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(FresnelShader.uniforms),
        vertexShader: FresnelShader.vertexShader,
        fragmentShader: FresnelShader.fragmentShader,
        transparent: true,
        depthWrite: false, // smooth depth blending
        blending: THREE.NormalBlending
      });

      customFresnelMat.uniforms["color"].value = new THREE.Color(baseColor);
      customFresnelMat.uniforms["glowInternal"].value = 0.22;
      customFresnelMat.uniforms["glowPower"].value = 3.2;
      customFresnelMat.uniforms["glowIntensity"].value = 1.45;

      const mesh = new THREE.Mesh(geometry, customFresnelMat);

      const angle = index * 0.8;
      const spiralRadius = 4.2;
      const x = Math.cos(angle) * spiralRadius;
      const y = Math.sin(angle) * spiralRadius;
      const z = -index * 7.5 + 4; 

      mesh.position.set(x, y, z);
      mesh.userData = { 
        nodeId: item.id,
        title: item.id.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        baseColor: baseColor,
        hoverColor: 0xffe27a, // Yellow glow on hover
        angle: angle,
        index: index,
        priority: item.priority_score || 50
      };

      this.scene.add(mesh);
      this.nodeMeshes.push(mesh);
    });
  }

  /**
   * Sort comparator combining unplayed state and priority_score ranking.
   */
  getSortedRegistry() {
    const gamesPlayed = this.telemetryStats ? this.telemetryStats.gamesPlayed || {} : {};
    
    return [...this.registry].sort((a, b) => {
      const aPlayed = (gamesPlayed[a.id] || 0) > 0;
      const bPlayed = (gamesPlayed[b.id] || 0) > 0;
      
      // Unplayed nodes first
      if (aPlayed !== bPlayed) {
        return aPlayed ? 1 : -1;
      }
      
      // Within same play state, sort by priority_score descending
      const aPriority = a.priority_score || 50;
      const bPriority = b.priority_score || 50;
      return bPriority - aPriority;
    });
  }

  /**
   * Smoothly animates nodes to their newly calculated Z-depths on telemetry sync.
   */
  reorderNodesDynamically() {
    const sortedRegistry = this.getSortedRegistry();

    sortedRegistry.forEach((item, sortedIndex) => {
      const mesh = this.nodeMeshes.find(m => m.userData.nodeId === item.id);
      if (!mesh) return;

      const newAngle = sortedIndex * 0.8;
      const spiralRadius = 4.2;
      const newX = Math.cos(newAngle) * spiralRadius;
      const newY = Math.sin(newAngle) * spiralRadius;
      const newZ = -sortedIndex * 7.5 + 4;

      mesh.userData.angle = newAngle;
      mesh.userData.index = sortedIndex;

      // Tween each mesh to its new ranked coordinate
      new TWEEN.Tween(mesh.position)
        .to({ x: newX, y: newY, z: newZ }, 1500)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    });
  }

  /**
   * Generates Fast-Travel directional pointer signposts at tunnel limits.
   */
  spawnSignposts() {
    this.registry.forEach((item, index) => {
      if (index !== 0 && index !== this.registry.length - 1) return;

      const isFirst = index === 0;
      const geometry = new THREE.ConeGeometry(0.5, 1.4, 4);
      
      // Holographic Fresnel shader on signposts too for visual consistency!
      const customFresnelMat = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(FresnelShader.uniforms),
        vertexShader: FresnelShader.vertexShader,
        fragmentShader: FresnelShader.fragmentShader,
        transparent: true,
        depthWrite: false
      });

      customFresnelMat.uniforms["color"].value = new THREE.Color(0xff5ee7); // Pink base
      customFresnelMat.uniforms["glowInternal"].value = 0.35;
      customFresnelMat.uniforms["glowPower"].value = 2.5;
      customFresnelMat.uniforms["glowIntensity"].value = 1.6;

      const mesh = new THREE.Mesh(geometry, customFresnelMat);
      
      if (isFirst) {
        mesh.rotation.x = -Math.PI / 2; // Point forward
        mesh.position.set(0, -2.5, 6); // Entrance
        mesh.userData = {
          isSignpost: true,
          type: "deep-storage",
          title: "Fast-Travel // Deep Storage Zone",
          hoverColor: 0xffe27a,
          baseColor: 0xff5ee7
        };
      } else {
        mesh.rotation.x = Math.PI / 2; // Point backward
        mesh.position.set(0, -2.5, -120); // Deep end
        mesh.userData = {
          isSignpost: true,
          type: "entrance-zone",
          title: "Fast-Travel // Return Entrance",
          hoverColor: 0xffe27a,
          baseColor: 0xff5ee7
        };
      }

      this.scene.add(mesh);
      this.signpostMeshes.push(mesh);
    });
  }

  /**
   * Listens to resize, mouse move, and touch/click interactions.
   */
  bindEvents() {
    this.onResizeBound = this.handleResize.bind(this);
    this.onMouseMoveBound = this.handleMouseMove.bind(this);
    this.onClickBound = this.handleMouseClick.bind(this);

    window.addEventListener("resize", this.onResizeBound);
    this.renderer.domElement.addEventListener("mousemove", this.onMouseMoveBound);
    this.renderer.domElement.addEventListener("click", this.onClickBound);
  }

  /**
   * Resizes WebGL and CSS3D rendering context boundaries.
   */
  handleResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    if (this.camera && this.renderer) {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    }

    if (this.composer) {
      this.composer.setSize(this.width, this.height);
    }

    if (this.css3dRenderer) {
      this.css3dRenderer.setSize(this.width, this.height);
    }
  }

  /**
   * Tracks cursor movements over WebGL viewport for Raycasting.
   */
  handleMouseMove(event) {
    if (this.isTransitioning) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / this.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / this.height) * 2 + 1;

    const targets = [...this.nodeMeshes, ...this.signpostMeshes];

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(targets);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      
      if (this.hoveredMesh !== hit) {
        if (this.hoveredMesh) {
          // Reset previous mesh Fresnel color uniform
          const prevColor = this.hoveredMesh.userData.baseColor;
          if (this.hoveredMesh.material.uniforms) {
            this.hoveredMesh.material.uniforms["color"].value.setHex(prevColor);
          }
          this.hoveredMesh.scale.set(1.0, 1.0, 1.0);
        }
        
        this.hoveredMesh = hit;
        // Hover highlight: shift Fresnel uniform color to neon yellow
        if (hit.material.uniforms) {
          hit.material.uniforms["color"].value.setHex(hit.userData.hoverColor);
        }
        this.hoveredMesh.scale.set(1.25, 1.25, 1.25);
        this.renderer.domElement.style.cursor = "pointer";

        // Play high-frequency hover ping sound!
        if (window.ibbAudio) {
          window.ibbAudio.playHoverPing();
        }

        this.dispatchEvent("ibb-node-hover", { 
          id: hit.userData.nodeId, 
          title: hit.userData.title 
        });
      }
    } else {
      if (this.hoveredMesh) {
        // Restore base color uniform
        const prevColor = this.hoveredMesh.userData.baseColor;
        if (this.hoveredMesh.material.uniforms) {
          this.hoveredMesh.material.uniforms["color"].value.setHex(prevColor);
        }
        this.hoveredMesh.scale.set(1.0, 1.0, 1.0);
        this.hoveredMesh = null;
        this.renderer.domElement.style.cursor = "default";
        
        this.dispatchEvent("ibb-node-hover", null);
      }
    }
  }

  /**
   * Direct trigger mapping back to engine interface on node click.
   */
  handleMouseClick() {
    if (this.isTransitioning) return;

    if (this.hoveredMesh) {
      if (this.hoveredMesh.userData.isSignpost) {
        const type = this.hoveredMesh.userData.type;
        if (type === "deep-storage") {
          this.travelToZCoordinate(-110);
        } else if (type === "entrance-zone") {
          this.resetToEntrance();
        }
      } else {
        const clickedId = this.hoveredMesh.userData.nodeId;
        console.log(`🎯 [3D Spatial] Raycast Selected: '${clickedId}'`);
        this.onNodeSelected(clickedId);
      }
    }
  }

  /**
   * Animates camera smoothly to a specific Z-axis depth coordinate.
   */
  travelToZCoordinate(targetZ) {
    this.isTransitioning = true;
    this.dispatchEvent("ibb-node-hover", null);

    console.log(`🚀 [Fast-Travel] Tweening camera to depth Z=${targetZ}`);

    // Play woosh transition sound!
    if (window.ibbAudio) {
      window.ibbAudio.playWoosh();
    }

    new TWEEN.Tween(this.camera.position)
      .to({ x: 0, y: 0, z: targetZ }, 1800)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.lookAt(new THREE.Vector3(0, 0, targetZ - 100));
      })
      .onComplete(() => {
        this.isTransitioning = false;
        console.log(`✓ [Fast-Travel] Camera arrived at Z=${targetZ}`);
      })
      .start();
  }

  /**
   * Tweens camera coordinates to focus right in front of the selected node.
   */
  diveToNode(nodeId, onComplete) {
    const mesh = this.nodeMeshes.find(m => m.userData.nodeId === nodeId);
    if (!mesh) {
      if (onComplete) onComplete();
      return;
    }

    this.isTransitioning = true;
    this.renderer.domElement.style.cursor = "default";
    this.dispatchEvent("ibb-node-hover", null);

    const targetZ = mesh.position.z + 2.2;
    const targetX = mesh.position.x;
    const targetY = mesh.position.y;

    console.log(`🌀 [3D Spatial] Launching camera dive to node: ${nodeId} at Z=${targetZ}`);

    // Play woosh transition sound!
    if (window.ibbAudio) {
      window.ibbAudio.playWoosh();
    }

    new TWEEN.Tween(this.camera.position)
      .to({ x: targetX, y: targetY, z: targetZ }, 1400)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.lookAt(mesh.position);
      })
      .onComplete(() => {
        this.isTransitioning = false;
        if (onComplete) onComplete();
      })
      .start();
  }

  /**
   * Tweens camera coordinates back to the entrance position.
   */
  resetToEntrance() {
    this.isTransitioning = true;
    this.dispatchEvent("ibb-node-hover", null);
    console.log(`🌀 [3D Spatial] Resetting camera smoothly to entrance: (0, 0, 10)`);

    // Play woosh transition sound!
    if (window.ibbAudio) {
      window.ibbAudio.playWoosh();
    }

    const targetLookAt = new THREE.Vector3(0, 0, -100);

    new TWEEN.Tween(this.camera.position)
      .to({ x: 0, y: 0, z: 10 }, 1400)
      .easing(TWEEN.Easing.Cubic.Out)
      .onUpdate(() => {
        this.camera.lookAt(targetLookAt);
      })
      .onComplete(() => {
        this.isTransitioning = false;
        console.log(`✓ [3D Spatial] Camera returned to entrance.`);
      })
      .start();
  }

  /**
   * Cinematic guided tour down the entire tunnel structure.
   */
  startGuidedTour() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.dispatchEvent("ibb-node-hover", null);

    console.log("🎬 [Guided Tour] Starting cinematic spatial tour...");

    // Play woosh transition sound!
    if (window.ibbAudio) {
      window.ibbAudio.playWoosh();
    }

    const originalPos = { x: 0, y: 0, z: 10 };
    const deepPos = { x: 0, y: 0, z: -110 };
    const lookAtTarget = new THREE.Vector3(0, 0, -200);

    const tourForward = new TWEEN.Tween(this.camera.position)
      .to(deepPos, 3000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        this.camera.lookAt(lookAtTarget);
      });

    const tourReturn = new TWEEN.Tween(this.camera.position)
      .to(originalPos, 3000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        this.camera.lookAt(new THREE.Vector3(0, 0, -100));
      })
      .onComplete(() => {
        this.isTransitioning = false;
        console.log("🎬 [Guided Tour] Cinematic tour completed.");
      });

    tourForward.chain(tourReturn);
    tourForward.start();
  }

  /**
   * Custom event dispatcher helper.
   */
  dispatchEvent(name, detail) {
    const event = new CustomEvent(name, { detail });
    window.dispatchEvent(event);
  }

  /**
   * Core animation loop driving WebGL/CSS3D renders and real-time audio depth-tuning.
   */
  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    // Update TWEEN engines
    TWEEN.update();

    const time = Date.now() * 0.001;

    // 1. Rotate vector tunnel rings
    this.tunnelRings.forEach((ring, index) => {
      ring.rotation.z += 0.002 * (index % 2 === 0 ? 1 : -1);
      ring.position.x = Math.sin(time + index * 0.3) * 0.08;
    });

    // 2. Float and rotate nodes
    this.nodeMeshes.forEach(mesh => {
      mesh.rotation.y += 0.015;
      mesh.rotation.x += 0.005;

      const floatOffset = Math.sin(time * 1.5 + mesh.userData.index) * 0.15;
      mesh.position.y = Math.sin(mesh.userData.angle) * 4.2 + floatOffset;
    });

    // 3. Spin and pulse Signposts
    this.signpostMeshes.forEach(sign => {
      sign.rotation.y += 0.03;
      const pulse = 1.0 + Math.sin(time * 3.0) * 0.1;
      sign.scale.set(pulse, pulse, pulse);
    });

    // 4. Update Web Audio depth low-pass filter in real-time tracking camera Z position!
    if (window.ibbAudio) {
      window.ibbAudio.updateDepth(this.camera.position.z);
    }

    // 5. Render WebGL Composer post-processing pipeline (UnrealBloom + Chromatic Aberration)
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    // 6. Render CSS3D Frame (Phase 7)
    if (this.css3dRenderer && (!window.ibbAds || !window.ibbAds.isDormant)) {
      this.css3dRenderer.render(this.scene, this.camera);
    }
  }

  /**
   * Suspends spatial render loop cleanly.
   */
  pause() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Resumes rendering and updates aspect variables.
   */
  resume() {
    if (!this.animationFrameId) {
      this.handleResize();
      this.animate();
    }
  }

  /**
   * Destroys context bindings cleanly.
   */
  destroy() {
    this.pause();
    
    window.removeEventListener("resize", this.onResizeBound);
    this.renderer.domElement.removeEventListener("mousemove", this.onMouseMoveBound);
    this.renderer.domElement.removeEventListener("click", this.onClickBound);

    if (this.renderer && this.renderer.domElement.parentNode) {
      this.container.removeChild(this.renderer.domElement);
    }
    
    const cssContainer = document.getElementById("css3d-renderer-container");
    if (cssContainer && this.css3dRenderer && this.css3dRenderer.domElement.parentNode) {
      cssContainer.removeChild(this.css3dRenderer.domElement);
    }

    if (window.ibbAds) {
      window.ibbAds.destroy();
      window.ibbAds = null;
    }

    this.nodeMeshes.forEach(mesh => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    });

    this.tunnelRings.forEach(ring => {
      ring.geometry.dispose();
      ring.material.dispose();
    });

    this.signpostMeshes.forEach(sign => {
      sign.geometry.dispose();
      sign.material.dispose();
    });
  }
}
