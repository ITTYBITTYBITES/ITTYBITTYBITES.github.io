/**
 * ITTYBITTYBITES HUB ENGINE (Phase 7)
 * Robust ES6 Platform Orchestration, Telemetry, Spatial HUD, Audio, and Ad-Bridge Orchestration
 */

class IttyBittyBitesEngine {
  /**
   * Accepts a registry (from manifest.json) at startup.
   * @param {Array} registry - The catalog registry of games/nodes.
   */
  constructor(registry) {
    this.registry = registry || [];
    this.activeNodeId = null;
    this.isMounting = false;
    
    // Instantiates TelemetryManager to manage LocalStorage and heartbeat synchronization
    this.telemetry = new TelemetryManager();

    // 3D Spatial Navigation Controller
    this.spatialController = null;

    console.log("✓ [IttyBittyBitesEngine] Instantiated with", this.registry.length, "registered nodes.");
  }

  /**
   * Initializes structural viewport layers (Spatial Canvas and HUD Overlay & Game Frame Container)
   */
  initViewportLayers() {
    const viewport = document.getElementById("hub-viewport");
    if (!viewport) return;

    // Reset viewport and insert separate layers for WebGL Portal vs Iframe Sandbox
    viewport.innerHTML = `
      <!-- WebGL Portal Layer -->
      <div id="spatial-portal-container" style="width: 100%; height: 100%; position: relative;">
        <!-- CSS3D ad overlay layer (Phase 7) -->
        <div id="css3d-renderer-container" style="position: absolute; inset: 0; pointer-events: none; z-index: 5;"></div>

        <!-- HUD Overlay (Phase 5) -->
        <div id="hud-overlay" style="z-index: 10;">
          <div class="hud-left">
            <span id="hud-breadcrumb">Hub &gt; Navigation</span>
          </div>
          <div class="hud-right">
            <button id="hud-home-btn" class="hud-btn" title="Reset Camera to Tunnel Entrance">
              ⌂ Home Portal
            </button>
            <button id="hud-tour-btn" class="hud-btn secondary" title="Guided Spatial Tour">
              ☄ Guided Tour
            </button>
          </div>
        </div>

        <div id="spatial-node-tooltip" class="glowing-tooltip" style="display: none; z-index: 10;"></div>
      </div>
      
      <!-- Interactive Iframe Sandbox Layer -->
      <div id="game-frame-container" style="width: 100%; height: 100%; display: none; position: relative;"></div>

      <!-- Floating Portal Return Action Overlay -->
      <button id="hub-exit-btn" class="exit-overlay-btn" style="display: none;">
        ❖ Return to 3D Navigation Hub
      </button>
    `;

    // Bind action event to Return button
    const exitBtn = document.getElementById("hub-exit-btn");
    if (exitBtn) {
      exitBtn.addEventListener("click", () => this.showPortal());
    }

    // Bind HUD buttons
    const homeBtn = document.getElementById("hud-home-btn");
    if (homeBtn) {
      homeBtn.addEventListener("click", () => {
        if (this.spatialController) {
          this.spatialController.resetToEntrance();
        }
      });
    }

    const tourBtn = document.getElementById("hud-tour-btn");
    if (tourBtn) {
      tourBtn.addEventListener("click", () => {
        if (this.spatialController) {
          this.spatialController.startGuidedTour();
        }
      });
    }

    // Connect tooltip UI overlay events dispatched by spatial_controller.js
    const tooltip = document.getElementById("spatial-node-tooltip");
    window.addEventListener("ibb-node-hover", (event) => {
      if (!tooltip) return;
      const data = event.detail;
      if (data) {
        tooltip.innerHTML = `
          <div class="tip-kicker">3D Vector Node</div>
          <div class="tip-title">${data.title}</div>
          <div class="tip-action">CLICK NODE TO PLAY</div>
        `;
        tooltip.style.display = "block";
      } else {
        tooltip.style.display = "none";
      }
    });

    // Boot up the 3D Spatial Controller environment inside the portal container
    const portalContainer = document.getElementById("spatial-portal-container");
    if (portalContainer) {
      this.spatialController = new SpatialController(
        portalContainer,
        this.registry,
        (nodeId) => this.mountNode(nodeId),
        this.telemetry.stats
      );
    }
  }

  /**
   * Restores the 3D Tunnel Portal, restarts audio, and unloads running game buffers.
   */
  showPortal() {
    const portalContainer = document.getElementById("spatial-portal-container");
    const frameContainer = document.getElementById("game-frame-container");
    const exitBtn = document.getElementById("hub-exit-btn");

    if (portalContainer && frameContainer && exitBtn) {
      // 1. Hide active game frame layer
      frameContainer.style.display = "none";
      frameContainer.innerHTML = ""; // Unload memory buffers/WebAssembly

      // 2. Display 3D portal canvas layer
      portalContainer.style.display = "block";
      exitBtn.style.display = "none";

      this.activeNodeId = null;
      this.updateActiveNavigationUI(null);

      // 3. Resume audio drone ambience smoothly!
      if (window.ibbAudio) {
        window.ibbAudio.startAmbience();
      }

      // 4. Resume 3D ad bridge!
      if (window.ibbAds) {
        window.ibbAds.resume();
      }

      // 5. Resume Three.js render ticks
      if (this.spatialController) {
        // Sync newest played stats so nodes rearrange live!
        this.spatialController.updateTelemetryStats(this.telemetry.stats);
        this.spatialController.resume();
        this.spatialController.resetToEntrance();
      }

      console.log("❖ [IttyBittyBitesEngine] Returned to 3D Spatial Navigation Tunnel.");
    }
  }

  /**
   * Orchestrates the mounting of a node. Triggers spatial camera dive first!
   * @param {string} nodeId - The ID of the node to mount.
   */
  mountNode(nodeId) {
    if (this.isMounting) return; // Prevent duplicate transitions

    // Find the node configuration in the registry
    const node = this.registry.find(item => item.id === nodeId);
    if (!node) {
      console.error(`✗ [IttyBittyBitesEngine] Node with ID '${nodeId}' not found in registry.`);
      return;
    }

    // Determine if we are selecting from the 3D portal scene or from a sidebar click when game is already active
    const isPortalActive = document.getElementById("spatial-portal-container").style.display !== "none";

    // Update HUD breadcrumbs path
    const breadcrumb = document.getElementById("hud-breadcrumb");
    if (breadcrumb) {
      breadcrumb.textContent = `Hub > ${node.category} > ${node.id}`;
    }

    if (isPortalActive && this.spatialController) {
      this.isMounting = true;
      // Trigger smooth camera fly dive to the selected 3D node
      this.spatialController.diveToNode(nodeId, () => {
        this.mountNodeImmediate(node);
        this.isMounting = false;
      });
    } else {
      // Mount immediately if we are switching directly from another game session
      this.mountNodeImmediate(node);
    }
  }

  /**
   * Performs the immediate mounting of the game iframe inside the workspace.
   * @param {Object} node - Mapped registry item data.
   */
  mountNodeImmediate(node) {
    const portalContainer = document.getElementById("spatial-portal-container");
    const frameContainer = document.getElementById("game-frame-container");
    const exitBtn = document.getElementById("hub-exit-btn");

    if (!frameContainer || !portalContainer || !exitBtn) {
      console.error("✗ [IttyBittyBitesEngine] Viewport element layers missing.");
      return;
    }

    this.activeNodeId = node.id;
    console.log(`🚀 [IttyBittyBitesEngine] Ingesting sandbox iframe: ${node.id}`);

    // 1. Mute/Fade out synth drone ambience to avoid background audio bleed!
    if (window.ibbAudio) {
      window.ibbAudio.stopAmbience();
    }

    // 2. Shut down/Hide all 3D ad units to protect performance and policy compliance
    if (window.ibbAds) {
      window.ibbAds.pause();
    }

    // 3. Pause WebGL rendering loop to conserve battery/GPU resources in background
    if (this.spatialController) {
      this.spatialController.pause();
    }
    portalContainer.style.display = "none";

    // 4. Clear previous active context and display viewport frame
    frameContainer.innerHTML = "";
    frameContainer.style.display = "block";
    exitBtn.style.display = "flex";

    const isHtmlPage = node.path.endsWith(".html") || node.path.includes(".html#");
    
    if (isHtmlPage) {
      // Create a secure full-bleed iframe for WebGL games
      const iframe = document.createElement("iframe");
      iframe.src = node.path;
      iframe.className = "embedded-viewport-iframe";
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allow", "autoplay; payment; microphone; camera; midi; clipboard-write");
      iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-popups");
      
      // Spinner / loader overlay
      const spinner = document.createElement("div");
      spinner.className = "loading-spinner";
      spinner.textContent = `Loading ${node.id}...`;
      frameContainer.appendChild(spinner);

      iframe.addEventListener("load", () => {
        spinner.remove();
        console.log(`✓ [IttyBittyBitesEngine] Iframe loaded successfully: ${node.id}`);
      });

      frameContainer.appendChild(iframe);
    } else {
      // fallback text injection
      const fallback = document.createElement("div");
      fallback.className = "text-node-viewport";
      fallback.innerHTML = `
        <h2>${node.id.toUpperCase()}</h2>
        <span class="badge">${node.category}</span>
        <p>This resource has been mapped but contains no interactive index page.</p>
      `;
      frameContainer.appendChild(fallback);
    }

    // Update dynamic UI components (active classes)
    this.updateActiveNavigationUI(node.id);

    // Sync state directly with the TelemetryManager database
    this.telemetry.recordGamePlay(node.id);
  }

  /**
   * Updates CSS highlights for the navigation nodes to track active item.
   */
  updateActiveNavigationUI(nodeId) {
    const navButtons = document.querySelectorAll(".nav-node-btn");
    navButtons.forEach(btn => {
      if (btn.getAttribute("data-node-id") === nodeId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
}

// Global bootstrap orchestration
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("manifest.json");
    if (!response.ok) {
      throw new Error("HTTP status: " + response.status);
    }
    const registry = await response.json();
    
    // Instantiate engine globally
    window.ibbEngine = new IttyBittyBitesEngine(registry);

    // Initialize viewport structural layers
    window.ibbEngine.initViewportLayers();

    // Dynamically build navigation sidebar or dropdown header
    const navContainer = document.getElementById("hub-nav-links");
    if (navContainer) {
      // Group games by category for ultra-structured UI layout
      const categories = [...new Set(registry.map(item => item.category))];
      categories.forEach(category => {
        const catGroup = document.createElement("div");
        catGroup.className = "nav-category-group";
        
        const catHeader = document.createElement("h3");
        catHeader.textContent = category;
        catGroup.appendChild(catHeader);

        const items = registry.filter(item => item.category === category);
        items.forEach(item => {
          const btn = document.createElement("button");
          btn.className = "nav-node-btn";
          btn.setAttribute("data-node-id", item.id);
          btn.textContent = item.id.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
          
          btn.addEventListener("click", () => {
            window.ibbEngine.mountNode(item.id);
          });
          
          catGroup.appendChild(btn);
        });

        navContainer.appendChild(catGroup);
      });
    }

  } catch (err) {
    console.error("✗ [IttyBittyBitesEngine] System Bootstrap Failed:", err);
    const viewport = document.getElementById("hub-viewport");
    if (viewport) {
      viewport.innerHTML = `
        <div class="error-container">
          <h2>CRITICAL SYSTEM ERROR</h2>
          <p>Failed to initialize the ittybittybites Engine. Ensure manifest.json is accessible.</p>
          <pre>${err.message}</pre>
        </div>
      `;
    }
  }
});
