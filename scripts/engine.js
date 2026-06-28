/**
 * ITTYBITTYBITES HUB ENGINE (Phase 19 - Command Console Integration)
 * Robust ES6 Platform Orchestration, Telemetry, Spatial HUD, Audio, Ad-Bridge, and Command Dock Integration
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
    this.activeCategory = "ALL";
    this.isSidebarMinimized = false;
    
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

    // Compile unique categories from registry for dynamic HUD selection
    const categories = ["ALL", ...new Set(this.registry.map(item => item.category))];
    const categoryOptions = categories.map(cat => `<option value="${cat}">${cat === "ALL" ? "❖ ALL CATEGORIES" : cat}</option>`).join("");

    // Setup and Populate Persistent Command Dock Sidebar elements (Phase 19)
    this.initCommandDockSidebar(categoryOptions);

    // Reset viewport and insert separate layers for WebGL Portal vs Iframe Sandbox
    viewport.innerHTML = `
      <!-- WebGL Portal Layer -->
      <div id="spatial-portal-container" style="width: 100%; height: 100%; position: relative;">
        <!-- CSS3D ad overlay layer (Phase 7) -->
        <div id="css3d-renderer-container" style="position: absolute; inset: 0; pointer-events: none; z-index: 5;"></div>

        <!-- HUD Overlay (Phase 5 / Phase 10 / Phase 11 / Phase 12 / Phase 19) -->
        <div id="hud-overlay" class="hidden-hud" style="z-index: 10;">
          <div class="hud-left">
            <span id="hud-breadcrumb">Hub &gt; Navigation</span>
            <div class="filter-wrapper">
              <select id="hud-category-select" class="hud-select" title="Filter 3D Nodes by Category">
                ${categoryOptions}
              </select>
            </div>
          </div>
          <div class="hud-right">
            <button id="hud-home-btn" class="hud-btn" title="Reset Camera to Tunnel Entrance">
              ⌂ Home Portal
            </button>
            <button id="hud-tour-btn" class="hud-btn secondary" title="Guided Spatial Tour">
              ☄ Guided Tour
            </button>
            <button id="hud-panic-btn" class="hud-btn danger" title="Clear Service Worker Cache and Force Reload">
              ⚡ Re-sync Panic
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

    // Bind Category Filter changes inside HUD dropdown
    const catSelect = document.getElementById("hud-category-select");
    if (catSelect) {
      catSelect.addEventListener("change", (e) => {
        this.activeCategory = e.target.value;
        // Sync with sidebar select box
        const sideSelect = document.getElementById("sidebar-category-select");
        if (sideSelect) sideSelect.value = this.activeCategory;
        if (this.spatialController) {
          this.spatialController.filterCategory(this.activeCategory);
        }
      });
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

    // Bind Panic Re-sync Button
    const panicBtn = document.getElementById("hud-panic-btn");
    if (panicBtn) {
      panicBtn.addEventListener("click", () => {
        console.log("⚡ [Panic Button] Clearing Service Worker Cache and forcing hard reload...");
        if ("serviceWorker" in navigator) {
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.map((name) => caches.delete(name))
            );
          }).then(() => {
            location.reload(true);
          });
        } else {
          location.reload(true);
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
          <div class="tip-kicker">3D Command Console</div>
          <div class="tip-title">${data.title}</div>
          <div class="tip-action">CLICK NODE TO LAUNCH</div>
        `;
        tooltip.style.display = "block";
      } else {
        tooltip.style.display = "none";
      }
    });

    // Listen for the engagement event to reveal HUD and sidebar UI elements (Phase 11)
    window.addEventListener("ibb-hub-engaged", () => {
      console.log("🎬 [Cinematic Cold Boot] Engagement handshake received. Revealing cockpit HUD...");
      
      const targetHud = document.getElementById("hud-overlay");
      if (targetHud) {
        targetHud.classList.remove("hidden-hud");
      }
      
      this.maximizeSidebar(); // Maximize sidebar automatically on initial engage
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
   * Builds and binds event handlers for the persistent Command Dock Sidebar (Phase 19).
   */
  initCommandDockSidebar(categoryOptions) {
    const sidebar = document.getElementById("hub-sidebar");
    const sideSelect = document.getElementById("sidebar-category-select");
    const sideList = document.getElementById("sidebar-game-list");
    const collapseBtn = document.getElementById("sidebar-collapse-btn");
    const expandTab = document.getElementById("sidebar-expand-tab");

    if (sidebar) {
      sidebar.classList.add("hidden-ui"); // Start hidden for Cold Boot
    }

    // Populate Sidebar Category dropdown
    if (sideSelect) {
      sideSelect.innerHTML = categoryOptions;
      sideSelect.addEventListener("change", (e) => {
        this.activeCategory = e.target.value;
        // Sync with HUD select box
        const hudSelect = document.getElementById("hud-category-select");
        if (hudSelect) hudSelect.value = this.activeCategory;
        if (this.spatialController) {
          this.spatialController.filterCategory(this.activeCategory);
        }
      });
    }

    // Populate Sidebar Games Directory List
    if (sideList) {
      sideList.innerHTML = this.registry.map(item => 
        `<div class="panel-node-item nav-node-btn" data-node-id="${item.id}">❖ ${item.title.toUpperCase()}</div>`
      ).join("");

      // Bind sidebar list clicks directly to mountNode (which dives and mounts)
      const listItems = sideList.querySelectorAll(".panel-node-item");
      listItems.forEach(btn => {
        btn.addEventListener("click", () => {
          this.mountNode(btn.getAttribute("data-node-id"));
        });
      });
    }

    // Bind Collapse Button click
    if (collapseBtn) {
      collapseBtn.addEventListener("click", () => this.minimizeSidebar());
    }

    // Bind Expand Tab click
    if (expandTab) {
      expandTab.addEventListener("click", () => this.maximizeSidebar());
    }
  }

  /**
   * Slides the Command Dock Sidebar off-screen and shows the minimized expand tab.
   */
  minimizeSidebar() {
    const sidebar = document.getElementById("hub-sidebar");
    const expandTab = document.getElementById("sidebar-expand-tab");
    
    if (sidebar) {
      sidebar.classList.add("minimized");
      sidebar.classList.add("hidden-ui");
    }
    
    if (expandTab) {
      expandTab.style.display = "block";
    }

    this.isSidebarMinimized = true;
    console.log("💤 [Command Dock] Sidebar minimized to standby tab.");
  }

  /**
   * Slides the Command Dock Sidebar back into view and hides the expand tab.
   */
  maximizeSidebar() {
    const sidebar = document.getElementById("hub-sidebar");
    const expandTab = document.getElementById("sidebar-expand-tab");

    if (sidebar) {
      sidebar.classList.remove("minimized");
      sidebar.classList.remove("hidden-ui");
    }

    if (expandTab) {
      expandTab.style.display = "none";
    }

    this.isSidebarMinimized = false;
    console.log("⚡ [Command Dock] Sidebar maximized.");
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

      // Maximize sidebar automatically when returning to portal view! (Phase 19)
      this.maximizeSidebar();

      // Restore HUD breadcrumb and filter
      const breadcrumb = document.getElementById("hud-breadcrumb");
      if (breadcrumb) {
        breadcrumb.textContent = "Hub > Navigation";
      }

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
   * Instantly restores the portal canvas without executing fly-back camera tweens.
   */
  showPortalImmediate() {
    const portalContainer = document.getElementById("spatial-portal-container");
    const frameContainer = document.getElementById("game-frame-container");
    const exitBtn = document.getElementById("hub-exit-btn");

    if (portalContainer && frameContainer && exitBtn) {
      frameContainer.style.display = "none";
      frameContainer.innerHTML = "";
      portalContainer.style.display = "block";
      exitBtn.style.display = "none";

      this.maximizeSidebar(); // Maximize sidebar on instant return

      const hud = document.getElementById("hud-overlay");
      if (hud) {
        hud.classList.remove("hidden-hud");
      }

      if (window.ibbAudio) {
        window.ibbAudio.startAmbience();
      }

      if (window.ibbAds) {
        window.ibbAds.resume();
      }

      if (this.spatialController) {
        // Bypass cold boot nodes and force full load
        this.spatialController.isEngaged = true;
        this.spatialController.updateTelemetryStats(this.telemetry.stats);
        this.spatialController.resume();
        // Snap camera back to entrance instantly
        this.spatialController.camera.position.set(0, 0, 0);
        this.spatialController.camera.lookAt(new THREE.Vector3(0, 0, -100));
      }
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

    if (!isPortalActive) {
      // If switching games from sidebar while playing, snap back to portal instantly first, then dive!
      this.showPortalImmediate();
    }

    if (this.spatialController) {
      this.isMounting = true;
      // Trigger smooth camera fly dive to the selected 3D node
      this.spatialController.diveToNode(nodeId, () => {
        this.mountNodeImmediate(node);
        this.isMounting = false;
      });
    } else {
      this.mountNodeImmediate(node);
    }
  }

  /**
   * Performs the immediate mounting of the game iframe inside the workspace.
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

    // 4. Automatically minimize the sidebar Command Dock to standby during active gameplay! (Phase 19)
    this.minimizeSidebar();

    // 5. Clear previous active context and display viewport frame
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
