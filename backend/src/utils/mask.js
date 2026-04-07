/**
 * 数据脱敏工具
 */

/**
 * 手机号脱敏 - 隐藏中间4位
 * @param {string} phone - 手机号
 * @returns {string} 脱敏后的手机号
 */
function maskPhone(phone) {
  if (!phone || phone.length < 7) return phone;
  return phone.replace(/(\d{3})\d{4}(\d+)/, '$1****$2');
}

/**
 * 身份证号脱敏 - 隐藏中间部分
 * @param {string} idCard - 身份证号
 * @returns {string} 脱敏后的身份证号
 */
function maskIdCard(idCard) {
  if (!idCard || idCard.length < 8) return idCard;
  return idCard.replace(/(\d{4})\d+(\d{4})/, '$1**********$2');
}

/**
 * 邮箱脱敏
 * @param {string} email - 邮箱地址
 * @returns {string} 脱敏后的邮箱
 */
function maskEmail(email) {
  if (!email || !email.includes('@')) return email;
  const [name, domain] = email.split('@');
  const maskedName = name.length <= 2
    ? name[0] + '***'
    : name.substring(0, 2) + '***';
  return `${maskedName}@${domain}`;
}

module.exports = { maskPhone, maskIdCard, maskEmail };
