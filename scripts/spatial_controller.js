/**
 * 3D SPATIAL TUNNEL CONTROLLER (Phase 11 & Phase 12 - Command Console Overhaul)
 * Orchestrates a high-fidelity holographic WebGL post-processing pipeline
 * featuring UnrealBloom, Chromatic Aberration, custom Fresnel Edge-Glow Shader nodes,
 * dynamic category filtering, signpost tours, and fully interactive 3D CSS3D HUD panels
 * flanking the central portal in real-time perspective.
 * Uses try-catch robust fallbacks to guarantee 100% operational boot on all browsers.
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
    this.nodeMeshes = []; // Stores the 3D CSS3D holographic preview panels (Phase 16)
    this.signpostMeshes = [];
    this.hudPanelObjects = []; // Phase 12 Command HUD Panels
    this.initHubNode = null; // Phase 11 'Initialize Hub' central node
    
    this.animationFrameId = null;
    
    // Raycaster states
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredMesh = null;

    // Transition Locks, Category Filters & PWA boots
    this.isTransitioning = false;
    this.activeCategory = "ALL";
    this.isEngaged = false; // Phase 11 Cinematic state lock

    // Responsive design dimensions
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
    this.scene.background = new THREE.Color(0x030509);
    this.scene.fog = new THREE.FogExp2(0x030509, 0.015);

    // 2. Setup Camera. Boot state starts further back at Z=20
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 0, 20); // Z=20 launch coordinate

    // 3. Setup WebGL Renderer with custom options for post-processing buffer support
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);

    // 4. Setup THREE.CSS3DRenderer for dynamic 3D HTML ad boards
    try {
      const cssContainer = document.getElementById("css3d-renderer-container");
      if (cssContainer && typeof THREE.CSS3DRenderer !== "undefined") {
        this.css3dRenderer = new THREE.CSS3DRenderer();
        this.css3dRenderer.setSize(this.width, this.height);
        cssContainer.appendChild(this.css3dRenderer.domElement);
      }
    } catch (e) {
      console.warn("⚠️ [3D Spatial] CSS3D Renderer failed to initialize.", e);
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

    // 6. Setup Post-Processing EffectComposer Pipeline with safe fallback
    this.setupPostProcessingPipeline();

    // 7. Construct Vector Glowing Ring Tunnel
    this.buildVectorTunnel();

    // 8. Phase 11 & Phase 12 Cinematic Cold Boot Branching
    if (!this.isEngaged) {
      // Spawn ONLY the central initialization portal node
      this.spawnInitializeHubNode();
      this.isTransitioning = true; // Block pointer events during camera boot

      // Smooth camera boot tween: Z=20 to Z=0 over 3 seconds
      new TWEEN.Tween(this.camera.position)
        .to({ x: 0, y: 0, z: 0 }, 3000)
        .easing(TWEEN.Easing.Cubic.Out)
        .onComplete(() => {
          this.isTransitioning = false;
          console.log("✓ [3D Spatial] Camera arrived at portal root.");
        })
        .start();
    } else {
      this.camera.position.set(0, 0, 0);
      this.spawnManifestNodes();
      this.spawnSignposts();
      this.spawnAdBoards();
      this.spawnHolographicHUDPanels();
    }

    // 9. Bind Listeners
    this.bindEvents();

    // 10. Launch Loop
    this.animate();
  }

  /**
   * Constructs the Post-Processing chain: UnrealBloom and Chromatic Aberration.
   * Leverages high-fidelity try-catch blocks to fallback smoothly on failure.
   */
  setupPostProcessingPipeline() {
    try {
      if (typeof THREE.EffectComposer === "undefined") {
        throw new Error("THREE.EffectComposer is not defined globally.");
      }

      this.composer = new THREE.EffectComposer(this.renderer);
      
      const renderPass = new THREE.RenderPass(this.scene, this.camera);
      this.composer.addPass(renderPass);

      const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(this.width, this.height),
        1.8,  
        0.45, 
        0.15  
      );
      this.composer.addPass(bloomPass);

      const chromaticPass = new THREE.ShaderPass(ChromaticAberrationShader);
      chromaticPass.uniforms["uAmount"].value = 0.0022; 
      this.composer.addPass(chromaticPass);

      console.log("✓ [3D Spatial] Post-processing pipeline successfully initialized.");
    } catch (err) {
      console.warn("⚠️ [3D Spatial] Post-processing components failed to load. Falling back to core WebGL rendering.", err.message);
      this.composer = null;
    }
  }

  /**
   * Spawns a single, highly distinct central holographic initialization portal node (Phase 11).
   */
  spawnInitializeHubNode() {
    const geometry = new THREE.IcosahedronGeometry(1.3, 0); // Large central polyhedron
    const baseColor = 0xffe27a; // Glowing bright gold

    const material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(FresnelShader.uniforms),
      vertexShader: FresnelShader.vertexShader,
      fragmentShader: FresnelShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    material.uniforms["color"].value = new THREE.Color(baseColor);
    material.uniforms["glowInternal"].value = 0.35;
    material.uniforms["glowPower"].value = 2.2;
    material.uniforms["glowIntensity"].value = 1.8;

    this.initHubNode = new THREE.Mesh(geometry, material);
    this.initHubNode.position.set(0, 0, -3.5); // Floating right in front of camera Z=0

    this.initHubNode.userData = {
      isInitNode: true,
      baseColor: baseColor,
      hoverColor: 0x5fe8ff, // Cyan hover outline
      title: "SYSTEM INITIALIZE"
    };

    this.scene.add(this.initHubNode);
    console.log("✓ [3D Spatial] Spanned central 'Initialize Hub' holographic node.");
  }

  /**
   * Triggers the holographic engagement sequence, unveiling the 26 mini-games,
   * signposts, and launching the cinematic guided tour (Phase 11).
   */
  engageHub() {
    if (this.isTransitioning || this.isEngaged) return;
    this.isTransitioning = true;

    console.log("⚡ [Cinematic Engage] Unlocking system, scaling out central node...");

    // Hide active tooltips
    this.dispatchEvent("ibb-node-hover", null);

    // 1. Play woosh and click sounds
    if (window.ibbAudio) {
      window.ibbAudio.playHoverPing();
      window.ibbAudio.playWoosh();
    }

    // 2. Animate central node shrinking to 0
    new TWEEN.Tween(this.initHubNode.scale)
      .to({ x: 0.001, y: 0.001, z: 0.001 }, 600)
      .easing(TWEEN.Easing.Back.In)
      .onComplete(() => {
        this.scene.remove(this.initHubNode);
        this.initHubNode.geometry.dispose();
        this.initHubNode.material.dispose();
        this.initHubNode = null;

        // 3. Set engagement flag
        this.isEngaged = true;

        // 4. Spawn 26 mini-games, signposts, and adboards
        this.spawnManifestNodes();
        this.spawnSignposts();
        this.spawnAdBoards();

        // 5. Spawn floating 3D Command HUD Console Panels (Phase 12 Overhaul!)
        this.spawnHolographicHUDPanels();

        // 6. Animate new WebGL nodes scaling up smoothly from 0 to 1
        this.nodeMeshes.forEach(mesh => {
          mesh.scale.set(0.001, 0.001, 0.001);
          new TWEEN.Tween(mesh.scale)
            .to({ x: 1, y: 1, z: 1 }, 1000)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();
        });

        this.signpostMeshes.forEach(mesh => {
          mesh.scale.set(0.001, 0.001, 0.001);
          new TWEEN.Tween(mesh.scale)
            .to({ x: 1, y: 1, z: 1 }, 1000)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();
        });

        // 7. Animate new CSS3D HUD panels scaling up smoothly from 0 to 1
        this.hudPanelObjects.forEach(panelObj => {
          panelObj.scale.set(0.0001, 0.0001, 0.0001);
          new TWEEN.Tween(panelObj.scale)
            .to({ x: 0.015, y: 0.015, z: 0.015 }, 1200)
            .easing(TWEEN.Easing.Back.Out)
            .start();
        });

        // 8. Trigger Guided Tour camera sweep immediately
        this.startGuidedTour(() => {
          this.isTransitioning = false; // Unlock inputs on completion
          console.log("⚡ [Cinematic Engage] Guided Tour completed. Transitioning UI...");
          
          // Dispatch engagement event to reveal cockpit HUD and overlay details
          window.dispatchEvent(new CustomEvent("ibb-hub-engaged"));
        });
      })
      .start();
  }

  /**
   * Spawns five high-fidelity floating 3D CSS3D HUD panels flanking the central portal
   * in exact perspective, matching the attached visual source of truth (Phase 12).
   */
  spawnHolographicHUDPanels() {
    if (!this.css3dRenderer) return;

    console.log("🌌 [3D HUD Console] Projecting interactive 3D console panels...");

    const spaceGames = this.registry.filter(g => g.category.includes("3D WebGL") || g.category.includes("Physics"));
    const retroGames = this.registry.filter(g => g.category.includes("Classics") || g.category.includes("Roguelikes") || g.category.includes("Raycasted"));
    const cogGames = this.registry.filter(g => g.category.includes("Cognitive") || g.category.includes("Reaction") || g.category.includes("Speed") || g.category.includes("Challenge"));

    // --- PANEL Left-1: COMPUTY 78 (Diagnostics Summary) ---
    const divL1 = document.createElement("div");
    divL1.className = "cyber-hud-panel";
    divL1.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">SYSTEM COMP/LTY</span>
        <span class="panel-sub">LIVE TELEMETRY</span>
      </div>
      <div class="hud-sparkline-area">
        <div class="hud-big-num">78</div>
        <svg class="sparkline-svg" viewBox="0 0 140 48">
          <path class="sparkline-path" d="M 0,24 Q 25,6 40,36 T 80,12 T 110,40 L 140,16"></path>
        </svg>
      </div>
      <div class="chart-bar-container">
        <div class="chart-bar-row">
          <span class="chart-bar-label">VRAM</span>
          <div class="chart-bar-track"><div class="chart-bar-fill" style="width: 82%;"></div></div>
          <span class="chart-bar-val">82%</span>
        </div>
        <div class="chart-bar-row">
          <span class="chart-bar-label">SENS</span>
          <div class="chart-bar-track"><div class="chart-bar-fill" style="width: 61%;"></div></div>
          <span class="chart-bar-val">61%</span>
        </div>
      </div>
    `;
    this._addHUDPanelObject(divL1, -6.5, 3.2, 2.0, 0.45);

    // --- PANEL Left-2: Space & Physics Games list ---
    const divL2 = document.createElement("div");
    divL2.className = "cyber-hud-panel";
    let listL2 = spaceGames.map(g => `<div class="panel-node-item" onclick="window.ibbEngine.mountNode('${g.id}')">❖ ${g.title.toUpperCase()}</div>`).join("");
    divL2.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">FLIGHT & PHYSICS SIMS</span>
        <span class="panel-sub">[${spaceGames.length} NODES]</span>
      </div>
      <div class="panel-node-list">
        ${listL2}
      </div>
    `;
    this._addHUDPanelObject(divL2, -6.5, 0.7, 2.0, 0.45);

    // --- PANEL Left-3: Classics & Mainstream Retro list ---
    const divL3 = document.createElement("div");
    divL3.className = "cyber-hud-panel";
    let listL3 = retroGames.map(g => `<div class="panel-node-item" onclick="window.ibbEngine.mountNode('${g.id}')">❖ ${g.title.toUpperCase()}</div>`).join("");
    divL3.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">RETRO CLASSICS CORE</span>
        <span class="panel-sub">[${retroGames.length} NODES]</span>
      </div>
      <div class="panel-node-list">
        ${listL3}
      </div>
    `;
    this._addHUDPanelObject(divL3, -6.5, -1.8, 2.0, 0.45);

    // --- PANEL Right-1: Cognitive & Speed Games list ---
    const divR1 = document.createElement("div");
    divR1.className = "cyber-hud-panel";
    let listR1 = cogGames.map(g => `<div class="panel-node-item" onclick="window.ibbEngine.mountNode('${g.id}')">❖ ${g.title.toUpperCase()}</div>`).join("");
    divR1.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">COGNITIVE ANCHOR LABS</span>
        <span class="panel-sub">[${cogGames.length} NODES]</span>
      </div>
      <div class="panel-node-list">
        ${listR1}
      </div>
    `;
    this._addHUDPanelObject(divR1, 6.5, 2.0, 2.0, -0.45);

    // --- PANEL Right-2: Diagnostics Circular Ring Chart (INNNIIL XIMIDION 48%) ---
    const divR2 = document.createElement("div");
    divR2.className = "cyber-hud-panel";
    divR2.innerHTML = `
      <div class="panel-header">
        <span class="panel-title">INNNIIL XIMIDION</span>
        <span class="panel-sub">48% PORTAL</span>
      </div>
      <div class="circle-chart-wrapper">
        <svg class="circle-chart-svg" viewBox="0 0 100 100">
          <circle class="circle-chart-bg" cx="50" cy="50" r="45"></circle>
          <circle class="circle-chart-ring" cx="50" cy="50" r="45"></circle>
        </svg>
        <span class="circle-chart-text">48%</span>
      </div>
      <button class="panel-action-btn" onclick="window.ibbEngine.mountNode('2-second-recognition-window')">
        ❖ ENGAGE APP PORTAL
      </button>
    `;
    this._addHUDPanelObject(divR2, 6.5, -1.5, 2.0, -0.45);
  }

  /**
   * Helper: Creates and adds a CSS3D HUD Panel object to the scene in slanted perspective.
   */
  _addHUDPanelObject(domElement, x, y, z, rotationY) {
    const cssObj = new THREE.CSS3DObject(domElement);
    cssObj.position.set(x, y, z);
    cssObj.scale.set(0.015, 0.015, 0.015);
    cssObj.rotation.y = rotationY;

    this.scene.add(cssObj);
    this.hudPanelObjects.push(cssObj);
  }

  /**
   * Initializes the AdManager bridge and spawns float boards in the peripheral margins.
   */
  spawnAdBoards() {
    if (typeof AdManager !== "undefined") {
      window.ibbAds = new AdManager(this.scene, this.camera);
      window.ibbAds.spawnSponsoredNode(-6.0, 2.2, -35.0); 
      window.ibbAds.spawnSponsoredNode(6.0, -2.2, -75.0);  
    }
  }

  /**
   * Sets active category filter and triggers a smooth re-ordering animation down the tunnel.
   * @param {string} category - Category title to focus on.
   */
  filterCategory(category) {
    if (!this.isEngaged) return; // Prevent filters during boot
    this.activeCategory = category || "ALL";
    console.log(`🌀 [3D Spatial] Filtering by category: '${this.activeCategory}'. Rearranging tunnel...`);
    this.reorderNodesDynamically();
  }

  /**
   * Updates telemetry stats and re-sorts node positions dynamically.
   */
  updateTelemetryStats(newStats) {
    this.telemetryStats = newStats || { gamesPlayed: {} };
    if (this.isEngaged) {
      console.log("🌀 [3D Spatial] Telemetry updated. Re-ranking node Z-depths...");
      this.reorderNodesDynamically();
    }
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

      const baseColor = 0x5fe8ff; 

      const customFresnelMat = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.clone(FresnelShader.uniforms),
        vertexShader: FresnelShader.vertexShader,
        fragmentShader: FresnelShader.fragmentShader,
        transparent: true,
        depthWrite: false, 
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
        category: item.category, 
        baseColor: baseColor,
        hoverColor: 0xffe27a,
        angle: angle,
        index: index,
        priority: item.priority_score || 50
      };

      this.scene.add(mesh);
      this.nodeMeshes.push(mesh);
    });
  }

  /**
   * Sort comparator combining category filtering, play history, and priority_score.
   */
  getSortedRegistry() {
    const gamesPlayed = this.telemetryStats ? this.telemetryStats.gamesPlayed || {} : {};
    
    return [...this.registry].sort((a, b) => {
      if (this.activeCategory !== "ALL") {
        const aMatches = a.category === this.activeCategory;
        const bMatches = b.category === this.activeCategory;
        if (aMatches !== bMatches) {
          return aMatches ? -1 : 1;
        }
      }

      const aPlayed = (gamesPlayed[a.id] || 0) > 0;
      const bPlayed = (gamesPlayed[b.id] || 0) > 0;
      if (aPlayed !== bPlayed) {
        return aPlayed ? 1 : -1;
      }
      
      const aPriority = a.priority_score || 50;
      const bPriority = b.priority_score || 50;
      return bPriority - aPriority;
    });
  }

  /**
   * Smoothly animates nodes to their newly calculated Z-depths on telemetry or category sync.
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

    // Phase 11 Cold Boot raycast limit
    if (!this.isEngaged) {
      if (this.initHubNode) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.initHubNode);
        if (intersects.length > 0) {
          if (this.hoveredMesh !== this.initHubNode) {
            this.hoveredMesh = this.initHubNode;
            if (this.initHubNode.material.uniforms) {
              this.initHubNode.material.uniforms["color"].value.setHex(this.initHubNode.userData.hoverColor);
            }
            this.initHubNode.scale.set(1.25, 1.25, 1.25);
            this.renderer.domElement.style.cursor = "pointer";

            if (window.ibbAudio) {
              window.ibbAudio.playHoverPing();
            }

            this.dispatchEvent("ibb-node-hover", { 
              id: "initialize", 
              title: "❖ INITIALIZE PORTAL HUB // ENGAGE" 
            });
          }
        } else {
          if (this.hoveredMesh) {
            if (this.initHubNode.material.uniforms) {
              this.initHubNode.material.uniforms["color"].value.setHex(this.initHubNode.userData.baseColor);
            }
            this.initHubNode.scale.set(1.0, 1.0, 1.0);
            this.hoveredMesh = null;
            this.renderer.domElement.style.cursor = "default";
            this.dispatchEvent("ibb-node-hover", null);
          }
        }
      }
      return;
    }

    // Standard engaged state raycasting
    const targets = [...this.nodeMeshes, ...this.signpostMeshes];

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(targets);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      
      if (this.activeCategory !== "ALL" && hit.userData.category !== this.activeCategory && !hit.userData.isSignpost) {
        return;
      }
      
      if (this.hoveredMesh !== hit) {
        if (this.hoveredMesh) {
          const prevColor = this.hoveredMesh.userData.baseColor;
          if (this.hoveredMesh.material.uniforms) {
            this.hoveredMesh.material.uniforms["color"].value.setHex(prevColor);
          }
          this.hoveredMesh.scale.set(1.0, 1.0, 1.0);
        }
        
        this.hoveredMesh = hit;
        if (hit.material.uniforms) {
          hit.material.uniforms["color"].value.setHex(hit.userData.hoverColor);
        }
        this.hoveredMesh.scale.set(1.25, 1.25, 1.25);
        this.renderer.domElement.style.cursor = "pointer";

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
      if (this.hoveredMesh.userData.isInitNode) {
        this.engageHub();
      } else if (this.hoveredMesh.userData.isSignpost) {
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
   * Runs the complete sequence and optional onComplete callback.
   * @param {Function} onComplete - Callback triggered when the tour completes.
   */
  startGuidedTour(onComplete) {
    this.isTransitioning = true;
    this.dispatchEvent("ibb-node-hover", null);

    console.log("🎬 [Guided Tour] Starting cinematic spatial tour past signposts...");

    if (window.ibbAudio) {
      window.ibbAudio.playWoosh();
    }

    const originalPos = { x: 0, y: 0, z: 10 };
    const deepPos = { x: 0, y: 0, z: -110 };
    const endPos = { x: 0, y: 0, z: -130 };

    const lookAhead = new THREE.Vector3(0, 0, -250);

    const tourForward = new TWEEN.Tween(this.camera.position)
      .to(deepPos, 2800)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.lookAt(lookAhead);
      });

    const tourCruise = new TWEEN.Tween(this.camera.position)
      .to(endPos, 1200)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(() => {
        this.camera.lookAt(lookAhead);
      });

    const tourReturn = new TWEEN.Tween(this.camera.position)
      .to(originalPos, 2800)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.lookAt(new THREE.Vector3(0, 0, -100));
      })
      .onComplete(() => {
        this.isTransitioning = false;
        console.log("🎬 [Guided Tour] Cinematic tour completed.");
        if (onComplete) onComplete();
      });

    tourForward.chain(tourCruise);
    tourCruise.chain(tourReturn);
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
   * Core animation loop driving WebGL/CSS3D renders, real-time audio depth-tuning,
   * and dynamic holographic pulsing/dimming animators.
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

    // 2. Cold Boot initial node spin (Phase 11)
    if (!this.isEngaged && this.initHubNode) {
      this.initHubNode.rotation.y += 0.02;
      this.initHubNode.rotation.x += 0.01;
      const pulse = 1.0 + Math.sin(time * 3.5) * 0.06;
      this.initHubNode.scale.set(pulse, pulse, pulse);
    }

    // 3. Float and rotate nodes. Apply pulsing and dimming.
    this.nodeMeshes.forEach(mesh => {
      mesh.rotation.y += 0.015;
      mesh.rotation.x += 0.005;

      const floatOffset = Math.sin(time * 1.5 + mesh.userData.index) * 0.15;
      mesh.position.y = Math.sin(mesh.userData.angle) * 4.2 + floatOffset;

      const matchesCategory = this.activeCategory === "ALL" || mesh.userData.category === this.activeCategory;

      if (matchesCategory) {
        const pulse = 1.0 + Math.sin(time * 4.5 + mesh.userData.index) * 0.08;
        mesh.scale.set(pulse, pulse, pulse);
        
        if (mesh.material.uniforms) {
          mesh.material.uniforms["glowIntensity"].value = 1.45 + Math.sin(time * 4.5) * 0.15;
        }
      } else {
        mesh.scale.set(0.65, 0.65, 0.65);
        if (mesh.material.uniforms) {
          mesh.material.uniforms["glowIntensity"].value = 0.25;
        }
      }
    });

    // 4. Spin and pulse Signposts
    this.signpostMeshes.forEach(sign => {
      sign.rotation.y += 0.03;
      const pulse = 1.0 + Math.sin(time * 3.0) * 0.1;
      sign.scale.set(pulse, pulse, pulse);
    });

    // 5. Update Web Audio depth low-pass filter
    if (window.ibbAudio) {
      window.ibbAudio.updateDepth(this.camera.position.z);
    }

    // 6. Render WebGL Composer post-processing pipeline (UnrealBloom + Chromatic Aberration)
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    // 7. Render CSS3D Frame (Phase 7)
    if (this.css3dRenderer && (!window.ibbAds || !window.ibbAds.isDormant)) {
      this.css3dRenderer.render(this.scene, this.camera);
    }
  }

  /**
   * Suspends spatial render loop cleanly.
   */
  pause() {
    this.isDormantCurrent = true;
    const cssContainer = document.getElementById("css3d-renderer-container");
    if (cssContainer) {
      cssContainer.style.display = "none";
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Resumes rendering and updates aspect variables.
   */
  resume() {
    this.isDormantCurrent = false;
    const cssContainer = document.getElementById("css3d-renderer-container");
    if (cssContainer) {
      cssContainer.style.display = "block";
    }
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

    this.hudPanelObjects.forEach(panelObj => {
      if (panelObj.element && panelObj.element.parentNode) {
        panelObj.element.parentNode.removeChild(panelObj.element);
      }
    });
    this.hudPanelObjects = [];

    if (this.initHubNode) {
      this.scene.remove(this.initHubNode);
      this.initHubNode.geometry.dispose();
      this.initHubNode.material.dispose();
    }
  }
}
