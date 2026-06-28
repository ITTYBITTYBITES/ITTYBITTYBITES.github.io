/**
 * ITTYBITTYBITES AD-BRIDGE INTEGRATION (Phase 7)
 * Bridges Google AdSense into a Three.js THREE.CSS3DObject.
 * Spawns immersive floating 3D holographic "Sponsored Nodes" in the peripheral space.
 */

class AdManager {
  /**
   * Constructs the 3D Ad Bridge.
   * @param {THREE.Scene} scene - Active 3D scene.
   * @param {THREE.Camera} camera - Active camera.
   */
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.adObjects = [];
    this.isDormant = false;

    this.init();
  }

  /**
   * Initializes the ad manager and preloads the Google AdSense standard library.
   */
  init() {
    this.injectAdSenseScript();
  }

  /**
   * Safely injects the main Google AdSense library if not already present.
   */
  injectAdSenseScript() {
    if (document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return;
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1566091161594729";
    document.head.appendChild(script);
    console.log("⚡ [AdManager] Google AdSense library injected.");
  }

  /**
   * Spawns a floating 3D "Sponsored Node" containing an AdSense unit.
   * @param {number} x - position X.
   * @param {number} y - position Y.
   * @param {number} z - position Z.
   */
  spawnSponsoredNode(x, y, z) {
    if (!this.scene) return;

    console.log(`⚡ [AdManager] Spawning 3D Sponsored Hologram Node at coordinate: (${x}, ${y}, ${z})`);

    // 1. Construct the DOM element representing the ad board
    const container = document.createElement("div");
    container.className = "cyber-ad-board";
    container.style.width = "300px";
    container.style.height = "250px";
    container.style.background = "#050811";
    container.style.border = "2px solid #ff5ee7"; // neon pink high-contrast frame
    container.style.borderRadius = "8px";
    container.style.boxShadow = "0 0 20px rgba(255, 94, 231, 0.4)";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.overflow = "hidden";

    // Header label
    const header = document.createElement("div");
    header.style.background = "#ff5ee7";
    header.style.color = "#000";
    header.style.fontFamily = "monospace";
    header.style.fontSize = "10px";
    header.style.fontWeight = "bold";
    header.style.padding = "4px 8px";
    header.style.textTransform = "uppercase";
    header.style.letterSpacing = "0.1em";
    header.textContent = "◈ SPONSORED DIRECT LINK ◈";
    container.appendChild(header);

    // Ad slot container
    const adSlotArea = document.createElement("div");
    adSlotArea.style.flex = "1";
    adSlotArea.style.display = "flex";
    adSlotArea.style.alignItems = "center";
    adSlotArea.style.justify = "center";
    adSlotArea.innerHTML = `
      <ins class="adsbygoogle"
           style="display:inline-block;width:300px;height:250px"
           data-ad-client="ca-pub-1566091161594729"
           data-ad-slot="default"></ins>
    `;
    container.appendChild(adSlotArea);

    // 2. Wrap inside THREE.CSS3DObject
    const cssObject = new THREE.CSS3DObject(container);
    cssObject.position.set(x, y, z);
    
    // Scale down slightly to fit the 3D coordinates system nicely
    cssObject.scale.set(0.015, 0.015, 0.015);
    
    // Rotate slightly towards the camera path
    cssObject.rotation.y = Math.PI / 4; 

    this.scene.add(cssObject);
    this.adObjects.push(cssObject);

    // 3. Trigger AdSense pushing
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn("⚠️ [AdManager] AdSense push skipped (blocked or sandbox context):", err.message);
    }

    // 4. Construct a complementary WebGL stand/frame behind the DOM object for cohesive rendering
    const standGeo = new THREE.BoxGeometry(4.7, 4.0, 0.1);
    const standMat = new THREE.MeshPhongMaterial({
      color: 0x111625,
      emissive: 0x050811,
      shininess: 10,
      wireframe: true
    });
    const standMesh = new THREE.Mesh(standGeo, standMat);
    standMesh.position.set(x, y, z - 0.05);
    standMesh.rotation.y = Math.PI / 4;
    
    this.scene.add(standMesh);
  }

  /**
   * Suspends and hides all sponsored ad boards during active gameplay.
   * Completely hides the parent container to protect performance and policy compliance.
   */
  pause() {
    this.isDormant = true;
    const cssContainer = document.getElementById("css3d-renderer-container");
    if (cssContainer) {
      cssContainer.style.display = "none";
    }
    console.log("💤 [AdManager] Ad bridge entering dormant state.");
  }

  /**
   * Resumes rendering and restores visibility of all 3D ad boards.
   */
  resume() {
    this.isDormant = false;
    const cssContainer = document.getElementById("css3d-renderer-container");
    if (cssContainer) {
      cssContainer.style.display = "block";
    }
    console.log("⚡ [AdManager] Ad bridge resumed.");
  }

  /**
   * Destroys all spawned instances.
   */
  destroy() {
    this.adObjects.forEach(obj => {
      if (obj.parent) {
        obj.parent.remove(obj);
      }
    });
    this.adObjects = [];
  }
}

// Instantiated globally
window.ibbAds = null;
