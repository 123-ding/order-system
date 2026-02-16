# 点菜系统移动端

基于 Vue 3 + Vant UI 构建的移动端订餐应用。

## 技术栈

- **Vue 3.4** - 渐进式 JavaScript 框架
- **Vant 4.8** - 轻量、可靠的移动端组件库
- **Vue Router 4.2** - 官方路由管理器
- **Pinia 2.1** - 新一代状态管理库
- **Axios 1.6** - HTTP 客户端
- **Vite 5.0** - 下一代前端构建工具
- **Day.js 1.11** - 轻量级日期处理库

## 功能特性

### 核心功能

- 🏠 **首页** - 轮播图、分类导航、推荐菜品
- 🍜 **菜品浏览** - 分类筛选、搜索、下拉刷新、懒加载
- 📝 **菜品详情** - 图片轮播、评价展示、购物车
- 📅 **日期选择** - 日历组件选择送达日期和时段
- 🛒 **购物车** - 商品管理、优惠券、订单结算
- 📦 **订单管理** - 订单列表、订单详情、状态追踪
- ⭐ **订单评价** - 评分、图片上传、标签选择
- 👤 **个人中心** - 用户信息、订单统计、功能菜单

### 技术亮点

- ✅ 使用 **Composition API** 和 `<script setup>` 语法
- ✅ **Pinia** 状态管理（用户、购物车）
- ✅ **JWT** 认证拦截器
- ✅ **懒加载组件** 优化性能
- ✅ **橙色主题**（#FF6B35）统一设计
- ✅ **移动端优化**：下拉刷新、上拉加载
- ✅ **微信 JSSDK** 封装（支付、分享等）
- ✅ **中文界面** 用户友好

## 项目结构

```
src/
├── api/              # API 接口层
│   ├── request.js    # Axios 实例配置（JWT 拦截器）
│   └── mobile.js     # 移动端 API 方法
├── router/           # 路由配置
│   └── index.js      # 路由定义和守卫
├── store/            # Pinia 状态管理
│   └── index.js      # 用户和购物车 store
├── utils/            # 工具函数
│   └── wechat.js     # 微信 JSSDK 封装
├── views/            # 页面组件
│   ├── home/         # 首页
│   ├── dishes/       # 菜品列表
│   ├── dish-detail/  # 菜品详情
│   ├── calendar/     # 日期选择
│   ├── cart/         # 购物车
│   ├── orders/       # 订单列表
│   ├── order-detail/ # 订单详情
│   ├── review/       # 订单评价
│   └── profile/      # 个人中心
├── App.vue           # 根组件（含底部导航）
└── main.js           # 应用入口
```

## 开始使用

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:5174` 启动

### 生产构建

```bash
npm run build
```

### 预览构建产物

```bash
npm run preview
```

## 环境变量

创建 `.env.local` 文件配置 API 地址：

```bash
VITE_API_BASE_URL=http://your-api-server:3000/api
```

## 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 轮播图、分类、推荐菜品 |
| `/dishes` | 菜品列表 | 搜索、分类筛选 |
| `/dish-detail/:id` | 菜品详情 | 详情、评价、加购物车 |
| `/calendar` | 日期选择 | 选择送达日期和时段 |
| `/cart` | 购物车 | 商品管理、优惠券 |
| `/orders` | 订单列表 | 全部/待支付/配送中/已完成 |
| `/order-detail/:id` | 订单详情 | 订单信息、状态追踪 |
| `/review/:orderId` | 订单评价 | 评分、图片、标签 |
| `/profile` | 个人中心 | 用户信息、功能入口 |

## 状态管理

### 用户 Store (useUserStore)

```javascript
const userStore = useUserStore()

// 登录状态
userStore.isLoggedIn

// 用户信息
userStore.userInfo

// 设置 Token
userStore.setToken(token)

// 退出登录
userStore.logout()
```

### 购物车 Store (useCartStore)

```javascript
const cartStore = useCartStore()

// 购物车商品
cartStore.items

// 总数量
cartStore.totalCount

// 总价格
cartStore.totalPrice

// 添加商品
cartStore.addToCart(dish, quantity)

// 更新数量
cartStore.updateQuantity(dishId, quantity)

// 移除商品
cartStore.removeFromCart(dishId)

// 清空购物车
cartStore.clearCart()
```

## 组件使用

本项目使用 **Vant 4.x** 组件库，已按需引入常用组件：

- **导航组件**：NavBar, Tabbar, Tabs
- **展示组件**：Image, Swipe, Card, Tag, Empty, Skeleton
- **表单组件**：Field, Form, Stepper, Rate, Uploader, Calendar
- **反馈组件**：Toast, Dialog, Loading
- **业务组件**：SubmitBar, PullRefresh, List

## 微信集成

支持微信公众号内的功能调用：

```javascript
import wechat from '@/utils/wechat'

// 初始化微信 SDK
await wechat.init(config)

// 分享到朋友圈
wechat.shareToTimeline(options)

// 分享给朋友
wechat.shareToFriend(options)

// 微信支付
await wechat.pay(paymentInfo)
```

## 开发建议

1. **组件拆分**：复杂页面可拆分为子组件
2. **API 模拟**：当前使用模拟数据，请替换为实际 API
3. **图片优化**：使用 CDN 或图片压缩
4. **路由鉴权**：完善登录拦截逻辑
5. **错误处理**：完善全局错误处理
6. **性能优化**：使用路由懒加载、图片懒加载

## 注意事项

- 本项目为移动端应用，请使用移动设备或浏览器开发者工具的移动模式访问
- 当前使用模拟数据，需要连接实际后端 API
- 图片链接使用 Unsplash，实际部署时请替换为自己的图片资源
- 微信相关功能需要在微信公众号环境中测试

## 浏览器支持

- iOS Safari 10+
- Android Chrome 60+
- 微信浏览器

## 许可证

MIT
