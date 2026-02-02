#!/usr/bin/env node
/**
 * bin/runner-sync.js
 * CLI entry point
 */

const path = require("path");
const Config = require("../src/utils/config");
const Logger = require("../src/utils/logger");
const { parseArgs, printHelp } = require("../src/cli/parser");
const pkg = require("../package.json");

// Parse arguments
const { command, options } = parseArgs(process.argv);

// Handle help
if (options.help) {
  printHelp();
  process.exit(0);
}

// Handle version
if (command === "version") {
  console.log(`${pkg.name} v${pkg.version}`);
  process.exit(0);
}

// Create config
const config = new Config(options);

// Create logger
const logger = new Logger({
  packageName: pkg.name,
  version: pkg.version,
  command,
  verbose: options.verbose,
  quiet: options.quiet,
});

// Print banner
logger.printBanner();

// Run command
(async () => {
  try {
    let commandModule;

    switch (command) {
      case "init":
        commandModule = require("../src/cli/commands/init");
        break;
      case "sync":
        commandModule = require("../src/cli/commands/sync");
        break;
      case "push":
        commandModule = require("../src/cli/commands/push");
        break;
      case "status":
        commandModule = require("../src/cli/commands/status");
        break;
      default:
        logger.error(`Unknown command: ${command}`);
        printHelp();
        process.exit(1);
    }

    const result = await commandModule.run(config, logger);

    if (result.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    logger.error(err.message);

    if (options.verbose && err.stack) {
      logger.debug(err.stack);
    }

    // Exit with appropriate code
    const exitCode = err.exitCode || 1;
    process.exit(exitCode);
  }
})();
