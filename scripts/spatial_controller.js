/**
 * 3D SPATIAL TUNNEL CONTROLLER (Phase 16 - Spatial Browser Conversion)
 * Orchestrates a high-fidelity spatial browser tunnel.
 * Replaces abstract shapes with interactive 3D CSS3D Holographic Preview Windows,
 * featuring real-time Depth-Of-Field (DoF) blurring, fading, and cinematic morph launches.
 */

class SpatialController {
  /**
   * Constructs the 3D spatial tunnel interface.
   * @param {HTMLElement} container - DOM element to render WebGL canvas.
   * @param {Array} registry - Active game nodes manifest catalog.
   * @param {Function} onNodeSelected - Callback triggered on node selection.
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
    this.composer = null; 
    this.css3dRenderer = null; 
    
    this.tunnelRings = [];
    this.nodeMeshes = []; // Stores the 3D CSS3D holographic preview panels (Phase 16)
    this.signpostMeshes = [];
    this.animationFrameId = null;
    
    // Interaction states
    this.isTransitioning = false;
    this.activeCategory = "ALL";

    // Responsive design dimensions
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    this.init();
  }

  /**
   * Initializes Three.js environment, geometries, and post-processing passes.
   */
  init() {
    // 1. Create Scene & Black Fog for depth fade
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030509);
    this.scene.fog = new THREE.FogExp2(0x030509, 0.015);

    // 2. Setup Camera. Boot state starts at Z=20
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 0, 20); 

    // 3. Setup WebGL Renderer with custom options for post-processing buffer support
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.container.appendChild(this.renderer.domElement);

    // 4. Setup THREE.CSS3DRenderer for dynamic 3D HTML elements
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

    // 6. Setup Post-Processing EffectComposer Pipeline (UnrealBloom + Chromatic Aberration)
    this.setupPostProcessingPipeline();

    // 7. Construct Vector Glowing Ring Tunnel
    this.buildVectorTunnel();

    // 8. Spatial Browser Conversion initialization (Phase 16)
    this.spawnManifestNodes();
    this.spawnSignposts();
    this.spawnAdBoards();

    // Camera entrance tween: Z=20 to Z=0 over 3 seconds
    this.isTransitioning = true;
    new TWEEN.Tween(this.camera.position)
      .to({ x: 0, y: 0, z: 0 }, 3000)
      .easing(TWEEN.Easing.Cubic.Out)
      .onComplete(() => {
        this.isTransitioning = false;
        console.log("✓ [3D Spatial] Camera arrived at portal root.");
      })
      .start();

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
  }

  /**
   * Initializes the AdManager bridge and spawns float boards in the peripheral margins.
   */
  spawnAdBoards() {
    if (typeof AdManager !== "undefined") {
      window.ibbAds = new AdManager(this.scene, this.camera);
      window.ibbAds.spawnSponsoredNode(-6.0, 2.8, -45.0); 
      window.ibbAds.spawnSponsoredNode(6.0, -2.8, -95.0);  
    }
  }

  /**
   * Sets active category filter and triggers a smooth re-ordering animation down the tunnel.
   */
  filterCategory(category) {
    this.activeCategory = category || "ALL";
    console.log(`🌀 [3D Spatial] Filtering by category: '${this.activeCategory}'. Rearranging tunnel...`);
    this.reorderNodesDynamically();
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
   * Spatial Browser Conversion: Renders 26 high-fidelity holographic preview windows
   * as CSS3DObjects in 3D tunnel coordinates, eliminating obsolete abstract shapes.
   */
  spawnManifestNodes() {
    const sortedRegistry = this.getSortedRegistry();

    sortedRegistry.forEach((item, index) => {
      // 1. Create high-fidelity DOM element data container for Phase 16
      const container = document.createElement("div");
      container.className = "holographic-preview-window";
      container.setAttribute("data-node-id", item.id);
      container.innerHTML = `
        <div class="panel-header">
          <span class="panel-title">${item.category.toUpperCase()}</span>
          <span class="panel-sub">PRIORITY: ${item.priority_score || 50}</span>
        </div>
        <div class="holographic-card-body">
          <h3>${item.title.toUpperCase()}</h3>
          <p>${item.description}</p>
        </div>
        <button class="panel-action-btn">
          ❖ ENGAGE PORTAL
        </button>
      `;

      // 2. Wrap inside THREE.CSS3DObject
      const cssObj = new THREE.CSS3DObject(container);

      // Compute spiral coordinate down Z-axis
      const angle = index * 0.8;
      const spiralRadius = 5.8; // Position in peripheral view flanking the central tunnel ring
      const x = Math.cos(angle) * spiralRadius;
      const y = Math.sin(angle) * spiralRadius;
      const z = -index * 12.0 + 4; // Extend Z spacing to prevent overlay clutter

      cssObj.position.set(x, y, z);
      cssObj.scale.set(0.015, 0.015, 0.015);
      
      // Orient the preview board slant inwards towards the incoming player camera path
      cssObj.lookAt(0, 0, z + 20);

      // 3. Add responsive hover/click interactivity directly via DOM listeners
      this._bindHUDPanelInteractions(cssObj, item.id);

      this.scene.add(cssObj);
      this.nodeMeshes.push(cssObj);
    });
  }

  /**
   * Binds clean hover audio pings and trigger dives directly on CSS3D DOM element layers.
   */
  _bindHUDPanelInteractions(cssObj, nodeId) {
    const el = cssObj.element;
    if (!el) return;

    // Hover-In Listener
    el.addEventListener("mouseenter", () => {
      if (this.isTransitioning) return;
      el.classList.add("hovered");
      
      // Scale up slightly for physical feedback
      new TWEEN.Tween(cssObj.scale)
        .to({ x: 0.018, y: 0.018, z: 0.018 }, 200)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

      if (window.ibbAudio) {
        window.ibbAudio.playHoverPing();
      }

      this.dispatchEvent("ibb-node-hover", { 
        id: nodeId, 
        title: nodeId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
      });
    });

    // Hover-Out Listener
    el.addEventListener("mouseleave", () => {
      el.classList.remove("hovered");
      new TWEEN.Tween(cssObj.scale)
        .to({ x: 0.015, y: 0.015, z: 0.015 }, 200)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

      this.dispatchEvent("ibb-node-hover", null);
    });

    // Click trigger to mount game
    el.addEventListener("click", () => {
      if (this.isTransitioning) return;
      console.log(`🎯 [3D Spatial HUD] Window selected: '${nodeId}'`);
      this.onNodeSelected(nodeId);
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
      const mesh = this.nodeMeshes.find(m => m.element && m.element.getAttribute("data-node-id") === item.id);
      if (!mesh) return;

      const newAngle = sortedIndex * 0.8;
      const spiralRadius = 5.8;
      const newX = Math.cos(newAngle) * spiralRadius;
      const newY = Math.sin(newAngle) * spiralRadius;
      const newZ = -sortedIndex * 12.0 + 4;

      // Tween position
      new TWEEN.Tween(mesh.position)
        .to({ x: newX, y: newY, z: newZ }, 1500)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

      // Recalculate slanted orientation
      const targetLookAt = new THREE.Vector3(0, 0, newZ + 20);
      mesh.lookAt(targetLookAt);
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

      customFresnelMat.uniforms["color"].value = new THREE.Color(0xff5ee7); 
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
        mesh.position.set(0, -2.5, -300); // Deep end corresponding to extended 12u spacing
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

    // Raycast only on the fast-travel signposts
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.signpostMeshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      
      if (this.hoveredMesh !== hit) {
        if (this.hoveredMesh && this.hoveredMesh.userData.isSignpost) {
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
      if (this.hoveredMesh && this.hoveredMesh.userData.isSignpost) {
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

    if (this.hoveredMesh && this.hoveredMesh.userData.isSignpost) {
      const type = this.hoveredMesh.userData.type;
      if (type === "deep-storage") {
        this.travelToZCoordinate(-280);
      } else if (type === "entrance-zone") {
        this.resetToEntrance();
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
   * Full-Screen Morph Focus Transition (Phase 16): Tweens camera coordinates
   * to align perfectly center-face in front of the selected CSS3D window panel.
   */
  diveToNode(nodeId, onComplete) {
    const mesh = this.nodeMeshes.find(m => m.element && m.element.getAttribute("data-node-id") === nodeId);
    if (!mesh) {
      if (onComplete) onComplete();
      return;
    }

    this.isTransitioning = true;
    this.dispatchEvent("ibb-node-hover", null);

    // Calculate morph focus: sit exactly 3.2 units directly flat-on facing the card
    const targetZ = mesh.position.z + 3.2;
    const targetX = mesh.position.x;
    const targetY = mesh.position.y;

    console.log(`🌀 [Focus Morph] Direct camera dive to preview card: ${nodeId} at Z=${targetZ}`);

    if (window.ibbAudio) {
      window.ibbAudio.playWoosh();
    }

    // 1. Animate camera position
    new TWEEN.Tween(this.camera.position)
      .to({ x: targetX, y: targetY, z: targetZ }, 1400)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        this.camera.lookAt(mesh.position);
      })
      .start();

    // 2. Morph the CSS3D container element: scale up massively to take up full-screen bounds
    new TWEEN.Tween(mesh.scale)
      .to({ x: 0.024, y: 0.024, z: 0.024 }, 1400)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onComplete(() => {
        this.isTransitioning = false;
        
        // Restore card scale for next unmount reset
        mesh.scale.set(0.015, 0.015, 0.015);
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
   */
  startGuidedTour(onComplete) {
    this.isTransitioning = true;
    this.dispatchEvent("ibb-node-hover", null);

    console.log("🎬 [Guided Tour] Starting cinematic spatial tour past signposts...");

    if (window.ibbAudio) {
      window.ibbAudio.playWoosh();
    }

    const originalPos = { x: 0, y: 0, z: 10 };
    const deepPos = { x: 0, y: 0, z: -250 };
    const endPos = { x: 0, y: 0, z: -300 };

    const lookAhead = new THREE.Vector3(0, 0, -400);

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
   * and Contextual Scaling (Depth-Of-Field optical blurs and fades).
   */
  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));

    TWEEN.update();

    const time = Date.now() * 0.001;

    // 1. Rotate vector tunnel rings
    this.tunnelRings.forEach((ring, index) => {
      ring.rotation.z += 0.002 * (index % 2 === 0 ? 1 : -1);
      ring.position.x = Math.sin(time + index * 0.3) * 0.08;
    });

    // 2. Float, rotate, pulse and apply Contextual Scaling to preview cards (Phase 16)
    this.nodeMeshes.forEach(mesh => {
      // Float mesh
      const floatOffset = Math.sin(time * 1.5 + mesh.userData.index) * 0.12;
      mesh.position.y = Math.sin(mesh.userData.angle) * 5.8 + floatOffset;

      // Calculate relative Z-axis distance to apply optical Depth-Of-Field (DoF) effects
      const distance = Math.abs(this.camera.position.z - mesh.position.z);
      
      let opacity = 1.0;
      let blurAmount = 0;

      // Setup depth threshold layers
      if (distance > 20) {
        // Fade out linearly as card gets further away
        opacity = 1.0 - (distance - 20) / 75;
        opacity = Math.max(0.04, Math.min(1.0, opacity));

        // Blur card proportionally to simulate a real lens blur
        blurAmount = Math.max(0, (distance - 20) * 0.075);
        blurAmount = Math.min(6, blurAmount); // cap maximum blur
      }

      // Filter category dimming overlays (Phase 10 integration)
      const matchesCategory = this.activeCategory === "ALL" || mesh.userData.category === this.activeCategory;
      if (!matchesCategory) {
        opacity *= 0.15; // heavily dim non-matching categories
        blurAmount = Math.max(blurAmount, 4.0); // add heavy constant blur
      }

      // Apply styles directly to CSS3D HTML DOM container element
      const el = mesh.element;
      if (el) {
        el.style.opacity = opacity;
        el.style.filter = `blur(${blurAmount}px)`;
        
        // Prevent click interactions on heavily faded or blurred elements
        if (opacity < 0.25 || this.isTransitioning) {
          el.style.pointerEvents = "none";
        } else {
          el.style.pointerEvents = "auto";
        }
      }
    });

    // 3. Spin and pulse Signposts
    this.signpostMeshes.forEach(sign => {
      sign.rotation.y += 0.03;
      const pulse = 1.0 + Math.sin(time * 3.0) * 0.1;
      sign.scale.set(pulse, pulse, pulse);
    });

    // 4. Update Web Audio depth low-pass filter
    if (window.ibbAudio) {
      window.ibbAudio.updateDepth(this.camera.position.z);
    }

    // 5. Render WebGL post-processing compositor
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    // 6. Render CSS3D Frame
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
      // Clean up DOM listeners if needed
      mesh.element.parentNode.removeChild(mesh.element);
    });

    this.signpostMeshes.forEach(sign => {
      sign.geometry.dispose();
      sign.material.dispose();
    });
  }
}
