/**
 * 生成BCrypt密码哈希
 * 用于创建管理员账号密码
 */
const bcrypt = require('bcrypt');

const password = process.argv[2] || 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nSQL for admin account:');
  console.log(`INSERT INTO admins (username, password, nickname, status) VALUES ('admin', '${hash}', '系统管理员', 1);`);
});
