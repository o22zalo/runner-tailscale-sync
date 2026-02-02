/**
 * cli/commands/status.js
 * Show Tailscale status and runner info
 */

const tailscale = require("../../adapters/tailscale");
const fs_adapter = require("../../adapters/fs");

async function run(config, logger) {
  logger.info("Checking runner status...");

  // Tailscale status
  if (config.tailscaleEnable) {
    const status = tailscale.getStatus(logger);

    if (status) {
      logger.info("━━━ Tailscale Status ━━━");
      logger.info(`Backend: ${status.BackendState}`);

      if (status.Self) {
        logger.info(`Hostname: ${status.Self.HostName || "N/A"}`);
        logger.info(`DNS: ${status.Self.DNSName || "N/A"}`);
        logger.info(`IPs: ${status.Self.TailscaleIPs?.join(", ") || "N/A"}`);
      }

      if (status.Peer && Object.keys(status.Peer).length > 0) {
        logger.info(`Peers: ${Object.keys(status.Peer).length} connected`);

        // Show peers with same tag
        const peers = tailscale.findPeersWithTag(config.tailscaleTags, logger);
        if (peers.length > 0) {
          logger.info(`\nPeers with tag '${config.tailscaleTags}':`);
          peers.forEach((peer, i) => {
            logger.info(`  ${i + 1}. ${peer.hostname} (${peer.ips[0]})`);
          });
        }
      }
    } else {
      logger.warn("Tailscale not connected");
    }
  } else {
    logger.info("Tailscale disabled");
  }

  // Runner data directory
  logger.info("\n━━━ Runner Data ━━━");
  if (fs_adapter.exists(config.runnerDataDir)) {
    const size = fs_adapter.getDirSize(config.runnerDataDir);
    logger.info(`Directory: ${config.runnerDataDir}`);
    logger.info(`Size: ${fs_adapter.formatBytes(size)}`);
  } else {
    logger.warn(`Directory not found: ${config.runnerDataDir}`);
  }

  return { success: true };
}

module.exports = { run };
