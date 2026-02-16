# 快速开始指南

## 1️⃣ 启动开发服务器

```bash
# 进入项目目录
cd mobile-frontend

# 安装依赖（如果还没安装）
npm install

# 启动开发服务器
npm run dev
```

访问: http://localhost:5174

## 2️⃣ 浏览器设置

### Chrome 开发者工具
1. 按 `F12` 打开开发者工具
2. 点击设备模拟按钮（Toggle device toolbar）或按 `Ctrl + Shift + M`
3. 选择移动设备（如 iPhone 12 Pro）
4. 刷新页面

### 推荐设备尺寸
- iPhone 12 Pro (390 x 844)
- iPhone SE (375 x 667)
- Samsung Galaxy S20 (360 x 800)

## 3️⃣ 页面导航

### 底部导航栏
- **首页** - 浏览推荐菜品、分类
- **订单** - 查看订单列表和详情
- **我的** - 个人中心和设置

### 主要流程

#### 🛒 下单流程
1. 首页浏览推荐菜品
2. 点击菜品进入详情页
3. 选择数量，加入购物车
4. 进入购物车，选择送达日期
5. 结算并提交订单

#### 📝 评价流程
1. 进入"订单"页面
2. 找到已完成的订单
3. 点击"去评价"按钮
4. 填写评分和内容
5. 上传图片（可选）
6. 提交评价

## 4️⃣ 功能测试

### 测试登录状态
当前默认未登录，某些页面会提示需要登录：
- 购物车
- 订单列表
- 个人中心

可以手动设置 localStorage 模拟登录：
```javascript
// 在浏览器控制台执行
localStorage.setItem('token', 'test-token-123')
localStorage.setItem('userInfo', JSON.stringify({
  id: 1,
  name: '测试用户',
  phone: '138****5678'
}))
```

### 测试购物车
1. 在首页或菜品列表点击"加入购物车"
2. 点击浮动购物车按钮或底部导航进入购物车
3. 调整商品数量
4. 选择送达日期
5. 点击"结算"提交订单

### 测试订单
1. 进入"订单"页面查看模拟订单
2. 点击订单卡片查看详情
3. 测试订单操作：
   - 待支付订单：支付、取消
   - 配送中订单：确认收货
   - 已完成订单：评价、删除

## 5️⃣ 开发指南

### 修改 API 地址
编辑 `.env.development` 文件：
```bash
VITE_API_BASE_URL=http://your-backend-server:3000/api
```

### 添加新页面
1. 在 `src/views/` 创建新目录
2. 创建 `index.vue` 组件
3. 在 `src/router/index.js` 添加路由配置

### 添加新 API
在 `src/api/mobile.js` 添加 API 方法：
```javascript
export const myApi = {
  getData() {
    return request.get('/my-endpoint')
  }
}
```

### 修改主题色
在 `src/App.vue` 中修改 CSS 变量：
```css
:root {
  --primary-color: #FF6B35;  /* 修改为你的颜色 */
}
```

## 6️⃣ 生产构建

### 构建应用
```bash
npm run build
```

构建产物在 `dist/` 目录。

### 预览构建
```bash
npm run preview
```

访问: http://localhost:4173

### 部署到服务器
将 `dist/` 目录内容上传到服务器：
```bash
# 示例：使用 scp
scp -r dist/* user@server:/var/www/html/

# 或使用 rsync
rsync -avz dist/ user@server:/var/www/html/
```

## 7️⃣ 常见问题

### Q: 页面显示空白
A: 检查浏览器控制台是否有错误，确认依赖已安装

### Q: API 请求失败
A: 检查 `.env` 文件中的 API 地址是否正确

### Q: 图片显示不出来
A: 当前使用 Unsplash 图片，需要网络连接。可替换为本地图片

### Q: 提示需要登录
A: 在控制台设置 localStorage 或实现登录页面

### Q: 构建失败
A: 确认 Node.js 版本 >= 16，删除 node_modules 重新安装

## 8️⃣ 技术支持

### 文档
- [Vue 3 文档](https://cn.vuejs.org/)
- [Vant 4 文档](https://vant-ui.github.io/vant/#/zh-CN)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [Vite 文档](https://cn.vitejs.dev/)

### 调试技巧
1. 使用 Vue DevTools 调试组件和状态
2. 使用 Network 面板查看 API 请求
3. 使用 Console 查看日志输出
4. 使用 Mobile 模拟器测试响应式

## 🎉 开始体验

现在你可以开始探索和开发了！

```bash
npm run dev
```

打开浏览器，切换到移动设备模式，享受开发！
