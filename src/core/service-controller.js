/**
 * core/service-controller.js
 * Stop/Start services trên runners qua SSH
 */

const ssh = require("../adapters/ssh");

/**
 * Parse input
 */
function parseInput(config, previousRunner, logger) {
  return {
    remoteHost: previousRunner?.dnsName || previousRunner?.ips?.[0],
    services: config.servicesToStop,
    sshPath: config.sshPath,
    logger,
  };
}

/**
 * Validate
 */
function validate(input) {
  const errors = [];

  if (!input.remoteHost) {
    errors.push("Remote host is required");
  }

  if (!input.services || input.services.length === 0) {
    errors.push("No services specified to stop");
  }

  return errors;
}

/**
 * Plan
 */
function plan(input) {
  return {
    action: "stop_remote_services",
    host: input.remoteHost,
    services: input.services,
    sshPath: input.sshPath,
  };
}

/**
 * Execute - stop services
 */
async function execute(planResult, input) {
  const { logger } = input;

  logger.info(`Stopping services on ${planResult.host}...`);

  // Check SSH connection first
  const connected = ssh.checkConnection(planResult.host, {
    logger,
    sshPath: planResult.sshPath,
  });

  if (!connected) {
    logger.warn(`Cannot connect to ${planResult.host} via SSH - services may still be running`);
    return {
      success: false,
      stoppedServices: [],
    };
  }

  // Stop services
  await ssh.stopServices(planResult.host, planResult.services, {
    logger,
    sshPath: planResult.sshPath,
  });

  return {
    success: true,
    stoppedServices: planResult.services,
  };
}

/**
 * Report
 */
function report(result, input) {
  const { logger } = input;

  if (result.success) {
    logger.success(`Stopped ${result.stoppedServices.length} services`);
    return {
      success: true,
      stoppedServices: result.stoppedServices,
    };
  } else {
    logger.warn("Failed to stop some services");
    return {
      success: false,
      stoppedServices: [],
    };
  }
}

/**
 * Main stop services function
 */
async function stopRemoteServices(config, previousRunner, logger) {
  if (!previousRunner) {
    logger.info("No previous runner - skipping service stop");
    return { success: true, stoppedServices: [] };
  }

  // Step 1: Parse Input
  const input = parseInput(config, previousRunner, logger);

  // Step 2: Validate
  const errors = validate(input);
  if (errors.length > 0) {
    // Not critical - just warn
    logger.warn(`Service stop validation: ${errors.join(", ")}`);
    return { success: true, stoppedServices: [] };
  }

  // Step 3: Plan
  const planResult = plan(input);

  // Step 4: Execute
  const execResult = await execute(planResult, input);

  // Step 5: Report
  return report(execResult, input);
}

module.exports = {
  stopRemoteServices,
  parseInput,
  validate,
  plan,
  execute,
  report,
};
