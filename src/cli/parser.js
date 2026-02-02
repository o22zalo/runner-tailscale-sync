/**
 * cli/parser.js
 * Parse command-line arguments
 */

/**
 * Parse command line arguments
 * Returns: { command, options }
 */
function parseArgs(argv) {
  const args = argv.slice(2); // Remove node and script path

  const options = {
    cwd: null,
    verbose: false,
    quiet: false,
    help: false,
  };

  let command = "sync"; // Default command

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // Commands
    if (arg === "init" || arg === "sync" || arg === "push" || arg === "status") {
      command = arg;
      continue;
    }

    // Options
    if (arg === "--cwd" && i + 1 < args.length) {
      options.cwd = args[++i];
      continue;
    }

    if (arg === "--verbose" || arg === "-v") {
      options.verbose = true;
      continue;
    }

    if (arg === "--quiet" || arg === "-q") {
      options.quiet = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--version") {
      command = "version";
      continue;
    }
  }

  return { command, options };
}

/**
 * Print help
 */
function printHelp() {
  console.log(`
runner-tailscale-sync - Đồng bộ runner data qua Tailscale network

USAGE:
  runner-sync [command] [options]

COMMANDS:
  init       Khởi tạo Tailscale và detect previous runner
  sync       Full sync workflow (init + pull + stop services + push git)
  push       Push .runner-data to git only
  status     Show Tailscale status
  --version  Show version

OPTIONS:
  --cwd <path>    Set working directory (default: current dir)
  --verbose, -v   Enable verbose logging
  --quiet, -q     Suppress non-error output
  --help, -h      Show this help

ENVIRONMENT VARIABLES:
  TAILSCALE_CLIENT_ID       OAuth client ID (required if TAILSCALE_ENABLE=1)
  TAILSCALE_CLIENT_SECRET   OAuth client secret (required if TAILSCALE_ENABLE=1)
  TAILSCALE_TAGS            Tailscale tags (default: tag:ci)
  TAILSCALE_ENABLE          Enable Tailscale (0 or 1, default: 0)
  SERVICES_TO_STOP          Comma-separated services to stop (default: cloudflared,pocketbase,http-server)
  GIT_PUSH_ENABLED          Enable git push (0 or 1, default: 1)
  GIT_BRANCH                Git branch (default: main)
  TOOL_CWD                  Working directory (can be overridden by --cwd)

EXAMPLES:
  # Full sync with Tailscale
  TAILSCALE_ENABLE=1 runner-sync

  # Just push to git
  runner-sync push

  # Custom working directory
  runner-sync --cwd /path/to/project

  # Verbose mode
  runner-sync -v

For more info: https://github.com/yourname/runner-tailscale-sync
`);
}

module.exports = {
  parseArgs,
  printHelp,
};
