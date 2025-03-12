// Store for active listeners with timestamps
interface Listener {
  ip: string;
  userAgent: string;
  lastSeen: number;
  connectionIds: Set<string>; // Track multiple connections per IP
}

class ListenerTracker {
  private ipListeners: Map<string, Listener> = new Map(); // Map of IP -> Listener
  private connectionMap: Map<string, string> = new Map(); // Map of connectionId -> IP
  private cleanupInterval: number;

  constructor(cleanupIntervalMs = 15000) {
    console.log("[ListenerTracker] Starting initialization...");
    // Run cleanup every 15 seconds by default
    this.cleanupInterval = setInterval(
      () => {
        console.log("[ListenerTracker] Running cleanup cycle...");
        this.cleanup();
      },
      cleanupIntervalMs,
    ) as unknown as number;
    console.log(
      "[ListenerTracker] Initialization complete with cleanup interval:",
      cleanupIntervalMs,
      "ms",
    );
  }

  // Generate a unique ID for each connection
  private generateConnectionId(ip: string, userAgent: string): string {
    return `${ip}-${userAgent}-${Date.now()}-${
      Math.random().toString(36).substring(2, 10)
    }`;
  }

  // Add or refresh a listener
  addListener(remoteAddr: Deno.NetAddr, userAgent: string): string {
    const ip = remoteAddr.hostname;
    const connectionId = this.generateConnectionId(ip, userAgent);

    // Store the connection ID -> IP mapping
    this.connectionMap.set(connectionId, ip);

    // Check if this IP is already being tracked
    if (this.ipListeners.has(ip)) {
      // Update existing IP's last seen time and add this connection ID
      const listener = this.ipListeners.get(ip)!;
      listener.lastSeen = Date.now();
      listener.connectionIds.add(connectionId);

      console.log(
        `[ListenerTracker] Additional connection from existing IP: ${ip}`,
      );
      console.log(
        `[ListenerTracker] This IP now has ${listener.connectionIds.size} active connections`,
      );
    } else {
      // Add new IP to tracker
      this.ipListeners.set(ip, {
        ip,
        userAgent,
        lastSeen: Date.now(),
        connectionIds: new Set([connectionId]),
      });

      console.log(
        `[ListenerTracker] New IP detected: ${ip} (${
          userAgent.substring(0, 30)
        }...)`,
      );
    }

    console.log(`[ListenerTracker] Current unique IPs: ${this.getCount()}`);

    return connectionId;
  }

  // Update the last seen timestamp for a listener
  updateListener(connectionId: string) {
    const ip = this.connectionMap.get(connectionId);
    if (ip && this.ipListeners.has(ip)) {
      const listener = this.ipListeners.get(ip)!;
      listener.lastSeen = Date.now();
      console.log(`[ListenerTracker] Updated last seen for IP: ${ip}`);
    }
  }

  // Remove a listener connection
  removeListener(connectionId: string) {
    const ip = this.connectionMap.get(connectionId);

    if (!ip) {
      console.log(
        `[ListenerTracker] Attempted to remove unknown listener: ${connectionId}`,
      );
      return;
    }

    const listener = this.ipListeners.get(ip);
    if (!listener) {
      console.log(
        `[ListenerTracker] Connection ID found but IP ${ip} not in listener map`,
      );
      this.connectionMap.delete(connectionId);
      return;
    }

    // Remove this connection ID from the IP's set of connections
    listener.connectionIds.delete(connectionId);
    console.log(
      `[ListenerTracker] Removed connection ${connectionId} from IP ${ip}`,
    );

    // If this IP has no more connections, remove the IP entirely
    if (listener.connectionIds.size === 0) {
      this.ipListeners.delete(ip);
      console.log(
        `[ListenerTracker] IP ${ip} has no more connections, removing from tracker`,
      );
    } else {
      console.log(
        `[ListenerTracker] IP ${ip} still has ${listener.connectionIds.size} active connections`,
      );
    }

    // Always remove the connection ID from the map
    this.connectionMap.delete(connectionId);

    console.log(
      `[ListenerTracker] Current unique IPs after removal: ${this.getCount()}`,
    );
  }

  // Get count of unique listeners (by IP)
  getCount(): number {
    return this.ipListeners.size;
  }

  // Clean up stale connections (older than 2 minutes)
  cleanup() {
    const now = Date.now();
    let removedIPs = 0;
    let removedConnections = 0;
    const staleConnectionIds: string[] = [];

    // First pass: find stale IPs and mark their connection IDs for removal
    for (const [ip, listener] of this.ipListeners.entries()) {
      if (now - listener.lastSeen > 60000) { // 1 minute timeout
        // Store all connection IDs to remove them from the connection map
        listener.connectionIds.forEach((id) => staleConnectionIds.push(id));

        // Remove the IP from tracking
        this.ipListeners.delete(ip);
        removedIPs++;
      }
    }

    // Second pass: remove the connection IDs from the connection map
    for (const id of staleConnectionIds) {
      this.connectionMap.delete(id);
      removedConnections++;
    }

    if (removedIPs > 0) {
      console.log(
        `[ListenerTracker] Cleanup: removed ${removedIPs} stale IPs (${removedConnections} connections)`,
      );
      console.log(
        `[ListenerTracker] Current unique IPs after cleanup: ${this.getCount()}`,
      );
    }
  }

  // Properly dispose of the interval when needed
  dispose() {
    clearInterval(this.cleanupInterval);
  }
}

// Singleton instance
export const listenerTracker = new ListenerTracker();
