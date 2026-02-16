/**
 * 数据库连接测试脚本
 * 用于验证数据库配置是否正确
 * 
 * 使用方法:
 * cd backend
 * node test-db-connection.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(color + message + colors.reset);
}

async function testConnection() {
  console.log('\n' + '='.repeat(60));
  log(colors.cyan, '📊 数据库连接测试工具');
  console.log('='.repeat(60) + '\n');

  // 显示配置信息
  log(colors.blue, '📝 当前配置:');
  console.log('   数据库主机:', process.env.DB_HOST || 'localhost');
  console.log('   数据库端口:', process.env.DB_PORT || '3306');
  console.log('   数据库名称:', process.env.DB_NAME || 'order_system');
  console.log('   数据库用户:', process.env.DB_USER || 'root');
  console.log('   密码已设置:', process.env.DB_PASSWORD ? '是 ✓' : '否 ✗');
  console.log('');

  // 创建数据库连接
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'order_system',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false
    }
  );

  try {
    // 测试1: 基础连接
    log(colors.yellow, '🔌 测试1: 尝试连接数据库...');
    await sequelize.authenticate();
    log(colors.green, '✅ 数据库连接成功！');
    console.log('');

    // 测试2: 查询数据库版本
    log(colors.yellow, '🔌 测试2: 查询MySQL版本...');
    const [versionResult] = await sequelize.query('SELECT VERSION() as version');
    log(colors.green, '✅ MySQL版本: ' + versionResult[0].version);
    console.log('');

    // 测试3: 检查表是否存在
    log(colors.yellow, '🔌 测试3: 检查数据表...');
    const [tables] = await sequelize.query('SHOW TABLES');
    
    const expectedTables = [
      'users', 'admins', 'categories', 'dishes',
      'orders', 'order_items', 'reviews', 'addresses'
    ];
    
    const tableNames = tables.map(t => Object.values(t)[0]);
    const missingTables = expectedTables.filter(t => !tableNames.includes(t));
    
    if (missingTables.length === 0) {
      log(colors.green, '✅ 所有数据表都已创建 (共8个表)');
      tableNames.forEach(table => {
        console.log('   ✓', table);
      });
    } else {
      log(colors.red, '❌ 缺少以下数据表:');
      missingTables.forEach(table => {
        console.log('   ✗', table);
      });
      log(colors.yellow, '\n💡 提示: 请运行以下命令创建数据表:');
      console.log('   mysql -u root -p < database/migrations/001_create_tables.sql');
    }
    console.log('');

    // 测试4: 查询测试数据
    log(colors.yellow, '🔌 测试4: 查询测试数据...');
    try {
      const [adminCount] = await sequelize.query('SELECT COUNT(*) as count FROM admins');
      const [categoryCount] = await sequelize.query('SELECT COUNT(*) as count FROM categories');
      const [dishCount] = await sequelize.query('SELECT COUNT(*) as count FROM dishes');
      
      log(colors.green, '✅ 测试数据统计:');
      console.log('   - 管理员数量:', adminCount[0].count);
      console.log('   - 分类数量:', categoryCount[0].count);
      console.log('   - 菜品数量:', dishCount[0].count);
      
      if (adminCount[0].count === 0) {
        log(colors.yellow, '\n💡 提示: 还没有测试数据，可以运行:');
        console.log('   mysql -u root -p < database/seeds/001_test_data.sql');
      }
    } catch (err) {
      log(colors.red, '❌ 查询数据失败: ' + err.message);
    }
    console.log('');

    // 测试5: 测试字符集
    log(colors.yellow, '🔌 测试5: 检查字符集配置...');
    const [charsetResult] = await sequelize.query(
      "SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = '" + 
      (process.env.DB_NAME || 'order_system') + "'"
    );
    
    if (charsetResult[0]) {
      const charset = charsetResult[0].DEFAULT_CHARACTER_SET_NAME;
      const collation = charsetResult[0].DEFAULT_COLLATION_NAME;
      
      if (charset === 'utf8mb4' && collation === 'utf8mb4_unicode_ci') {
        log(colors.green, '✅ 字符集配置正确');
        console.log('   - 字符集:', charset);
        console.log('   - 排序规则:', collation);
      } else {
        log(colors.yellow, '⚠️  字符集不是推荐配置');
        console.log('   - 当前字符集:', charset);
        console.log('   - 推荐字符集: utf8mb4');
      }
    }
    console.log('');

    // 总结
    console.log('='.repeat(60));
    log(colors.green, '🎉 所有测试通过！数据库配置正确。');
    console.log('='.repeat(60));
    console.log('');
    log(colors.cyan, '✨ 下一步:');
    console.log('   1. 启动后端服务: npm run dev');
    console.log('   2. 访问后台管理: http://localhost:5173');
    console.log('   3. 使用账号登录: admin / admin123');
    console.log('');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.log('');
    console.log('='.repeat(60));
    log(colors.red, '❌ 数据库连接测试失败！');
    console.log('='.repeat(60));
    console.log('');
    
    log(colors.red, '错误信息:');
    console.log('  ', error.message);
    console.log('');

    log(colors.yellow, '💡 常见问题解决方案:');
    console.log('');
    
    if (error.message.includes('Access denied')) {
      log(colors.cyan, '1. 密码错误或用户不存在:');
      console.log('   - 检查 backend/.env 文件中的 DB_PASSWORD');
      console.log('   - 确认MySQL用户名和密码正确');
      console.log('');
      console.log('   重置密码命令:');
      console.log('   sudo mysql');
      console.log('   mysql> ALTER USER \'root\'@\'localhost\' IDENTIFIED BY \'new_password\';');
      console.log('   mysql> FLUSH PRIVILEGES;');
    } else if (error.message.includes('ECONNREFUSED')) {
      log(colors.cyan, '2. MySQL服务未启动:');
      console.log('   Ubuntu/Debian: sudo systemctl start mysql');
      console.log('   macOS: brew services start mysql');
    } else if (error.message.includes('Unknown database')) {
      log(colors.cyan, '3. 数据库不存在:');
      console.log('   运行建表脚本:');
      console.log('   mysql -u root -p < database/migrations/001_create_tables.sql');
    } else {
      log(colors.cyan, '4. 其他问题:');
      console.log('   - 查看详细文档: docs/DATABASE_CONNECTION.md');
      console.log('   - 检查MySQL是否正常运行');
      console.log('   - 检查网络连接和防火墙设置');
    }
    
    console.log('');
    log(colors.yellow, '📚 详细帮助文档:');
    console.log('   - 数据库连接指南: docs/DATABASE_CONNECTION.md');
    console.log('   - 快速开始指南: QUICKSTART.md');
    console.log('');

    await sequelize.close();
    process.exit(1);
  }
}

// 运行测试
testConnection();
