/**
 * cli/commands/push.js
 * Push .runner-data to git repository
 */

const git = require("../../adapters/git");
const { getTimestamp } = require("../../utils/time");

async function run(config, logger) {
  logger.info("Pushing .runner-data to git...");

  if (!config.gitEnabled) {
    logger.warn("Git push disabled (GIT_PUSH_ENABLED=0)");
    return { success: false };
  }

  if (!git.isAvailable()) {
    throw new Error("Git is not available");
  }

  if (!git.isGitRepo(config.cwd)) {
    throw new Error("Not a git repository");
  }

  const timestamp = getTimestamp();
  const message = `[runner-sync] Update .runner-data at ${timestamp}`;

  const pushed = await git.commitAndPush(message, config.gitBranch, {
    logger,
    cwd: config.cwd,
  });

  if (pushed) {
    logger.success("Pushed to git repository");
    return { success: true };
  } else {
    logger.info("No changes to push");
    return { success: true, noChanges: true };
  }
}

module.exports = { run };
