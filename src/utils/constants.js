/**
 * constants.js
 * Định nghĩa các hằng số dùng chung
 */

module.exports = {
  // Exit codes
  EXIT_SUCCESS: 0,
  EXIT_UNKNOWN: 1,
  EXIT_VALIDATION: 2,
  EXIT_NETWORK: 10,
  EXIT_PROCESS: 20,

  // Directories
  RUNNER_DATA_DIR: ".runner-data",
  LOGS_DIR: "logs",
  PID_DIR: "pid",
  DATA_SERVICES_DIR: "data-services",
  TMP_DIR: "tmp",

  // Tailscale
  DEFAULT_TAG: "tag:ci",
  CONNECTION_TIMEOUT: 30000,
  STATUS_CHECK_INTERVAL: 2000,

  // Sync
  RSYNC_TIMEOUT: 300000, // 5 minutes
  SSH_TIMEOUT: 60000,    // 1 minute

  // Git
  GIT_RETRY_COUNT: 3,
  GIT_RETRY_DELAY: 2000,
};
