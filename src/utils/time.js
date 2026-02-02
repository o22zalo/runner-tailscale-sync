/**
 * time.js
 * Vietnam timezone utilities (Asia/Ho_Chi_Minh)
 */

const VN_OFFSET = 7 * 60; // UTC+7 in minutes

/**
 * Lấy thời gian Việt Nam hiện tại
 * @returns {Date}
 */
function getVietnamTime() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (VN_OFFSET * 60000));
}

/**
 * Format thời gian theo format cụ thể
 * @param {Date} date 
 * @param {string} format - 'yyMMdd', 'HHmm', 'yyMMdd-HHmmss', etc
 * @returns {string}
 */
function formatVietnamTime(date, format = 'yyMMdd-HHmmss') {
  const yy = String(date.getFullYear()).slice(-2);
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('yy', yy)
    .replace('MM', MM)
    .replace('dd', dd)
    .replace('HH', HH)
    .replace('mm', mm)
    .replace('ss', ss);
}

/**
 * Tạo version string theo format: 1.yyMMdd.1HHmm
 * @returns {string}
 */
function generateVersion() {
  const vnTime = getVietnamTime();
  const yyMMdd = formatVietnamTime(vnTime, 'yyMMdd');
  const HHmm = formatVietnamTime(vnTime, 'HHmm');
  return `1.${yyMMdd}.1${HHmm}`;
}

/**
 * Tạo timestamp string cho logs
 * @returns {string}
 */
function getTimestamp() {
  return formatVietnamTime(getVietnamTime(), 'yyMMdd-HHmmss');
}

module.exports = {
  getVietnamTime,
  formatVietnamTime,
  generateVersion,
  getTimestamp,
};
