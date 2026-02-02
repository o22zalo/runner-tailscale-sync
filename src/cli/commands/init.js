/**
 * cli/commands/init.js
 * Initialize Tailscale and detect previous runner
 */

const tailscale = require("../../adapters/tailscale");
const fs_adapter = require("../../adapters/fs");
const runnerDetector = require("../../core/runner-detector");

async function run(config, logger) {
  logger.info("Initializing runner sync...");

  // Setup directories
  const dirs = config.getDirectoriesToEnsure();
  fs_adapter.ensureDirs(dirs);
  logger.success(`Created ${dirs.length} directories`);

  // Connect to Tailscale
  if (config.tailscaleEnable) {
    logger.info("Connecting to Tailscale...");

    const installed = tailscale.install(logger);
    if (!installed) {
      throw new Error("Failed to install Tailscale");
    }

    await tailscale.login(
      config.tailscaleClientId,
      config.tailscaleClientSecret,
      config.tailscaleTags,
      logger,
      config
    );

    const ip = tailscale.getIP(logger);
    const hostname = tailscale.getHostname(logger);

    logger.success(`Tailscale connected: ${ip || hostname}`);

    // Detect previous runner
    const detection = await runnerDetector.detectPreviousRunner(config, logger);

    if (detection.previousRunner) {
      logger.success(`Previous runner: ${detection.previousRunner.hostname}`);
      logger.info(`  IP: ${detection.previousRunner.ips[0]}`);
    } else {
      logger.info("No previous runner found - this is the first runner");
    }

    return {
      success: true,
      tailscale: { ip, hostname },
      previousRunner: detection.previousRunner,
    };
  } else {
    logger.info("Tailscale disabled - skipping network setup");
    return {
      success: true,
    };
  }
}

module.exports = { run };
