/**
 * TELEMETRY & STATE PERSISTENCE MANAGER
 * Coordinates local state, game interaction logs, session heartbeats, and storage sync
 */

class TelemetryManager {
  /**
   * Initializes the telemetry manager.
   * @param {string} storageKey - LocalStorage key to save stats.
   */
  constructor(storageKey = "ibb_user_stats") {
    this.storageKey = storageKey;
    this.stats = this.loadStats();
    this.listeners = [];
    this.sessionStartTime = Date.now();

    this.initSession();
  }

  /**
   * Safely loads stats from LocalStorage. Falls back to default schema.
   */
  loadStats() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        // Deep merge or validate structural integrity
        if (parsed && typeof parsed === "object") {
          return {
            sessionsCount: parsed.sessionsCount || 0,
            totalPlaytimeSeconds: parsed.totalPlaytimeSeconds || 0,
            gamesPlayed: parsed.gamesPlayed || {},
            lastActive: parsed.lastActive || null,
            createdTime: parsed.createdTime || new Date().toISOString(),
            history: parsed.history || []
          };
        }
      }
    } catch (e) {
      console.error("✗ [TelemetryManager] Failed to read from localStorage:", e);
    }
    return this.getDefaultStats();
  }

  /**
   * Default telemetry state schema.
   */
  getDefaultStats() {
    return {
      sessionsCount: 0,
      totalPlaytimeSeconds: 0,
      gamesPlayed: {},
      lastActive: null,
      createdTime: new Date().toISOString(),
      history: []
    };
  }

  /**
   * Persists current stats to LocalStorage and alerts all observers.
   */
  saveStats() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.stats));
      this.notifyListeners();
    } catch (e) {
      console.error("✗ [TelemetryManager] Failed to write to localStorage:", e);
    }
  }

  /**
   * Adds an observer function to listen to stats sync.
   * @param {Function} callback - Triggered whenever stats change.
   * @returns {Function} unsubscribe - Function to remove the listener.
   */
  subscribe(callback) {
    this.listeners.push(callback);
    // Execute immediately to catch initial state
    callback(this.stats);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notifies all observers and fires a global DOM event.
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.stats);
      } catch (e) {
        console.error("✗ [TelemetryManager] Subscriber callback error:", e);
      }
    });

    // Dispatch custom global window event
    const event = new CustomEvent("ibb-telemetry-sync", { detail: this.stats });
    window.dispatchEvent(event);
  }

  /**
   * Bootstraps a new session entry and persists it.
   */
  initSession() {
    this.stats.sessionsCount += 1;
    this.stats.lastActive = new Date().toISOString();

    // Log session history node
    const sessionLog = {
      sessionNumber: this.stats.sessionsCount,
      startTime: new Date().toISOString(),
      gamesPlayed: []
    };
    this.stats.history.push(sessionLog);

    // Prune excessive history logs to prevent unbounded storage inflation
    if (this.stats.history.length > 50) {
      this.stats.history.shift();
    }

    this.saveStats();
    this.startHeartbeat();
  }

  /**
   * Periodically updates user cumulative play seconds via heartbeat triggers.
   */
  startHeartbeat() {
    setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.round((now - this.sessionStartTime) / 1000);
      
      if (elapsedSeconds > 0) {
        this.stats.totalPlaytimeSeconds += elapsedSeconds;
        this.stats.lastActive = new Date().toISOString();
        this.sessionStartTime = now; // Shift time-anchor

        this.saveStats();
      }
    }, 5000); // 5-second precise heartbeat ticks
  }

  /**
   * Logs a gameplay event for the specified node/id.
   * @param {string} gameId - Unique ID of the game played.
   */
  recordGamePlay(gameId) {
    if (!gameId) return;

    // Increment play frequency
    if (!this.stats.gamesPlayed[gameId]) {
      this.stats.gamesPlayed[gameId] = 0;
    }
    this.stats.gamesPlayed[gameId] += 1;
    this.stats.lastActive = new Date().toISOString();

    // Append to current session's game history
    if (this.stats.history && this.stats.history.length > 0) {
      const currentSession = this.stats.history[this.stats.history.length - 1];
      if (!currentSession.gamesPlayed.includes(gameId)) {
        currentSession.gamesPlayed.push(gameId);
      }
    }

    this.saveStats();
    console.log(`📊 [Telemetry] Recorded engagement for node: '${gameId}'. Total plays: ${this.stats.gamesPlayed[gameId]}`);
  }
}
