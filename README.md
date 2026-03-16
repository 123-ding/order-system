# 低空智联网安全可信中台

本仓库包含两个子项目：

1. **低空智联网安全可信中台**（`low-altitude-platform/`）— 核心新项目
2. **点菜系统**（`README_order_system.md`）— 原有系统（历史保留）

---

## 低空智联网安全可信中台

一个面向低空无人机管控场景的 B/S 架构 Web 平台，统一接入各品牌无人机、探测设备、侦测设备和反制设备，通过下拉框选取通信协议（MAVLink/DJI SDK/MQTT/WebSocket/HTTP 等）和 IP 等参数完成设备配置。

### 主要功能

- 🚁 **无人机管理**：支持大疆、道通、极飞等品牌，MAVLink v1/v2、DJI SDK、TCP/UDP 协议
- 📡 **探测设备管理**：支持雷达、ADS-B、ONVIF 摄像头等，TCP/UDP/串口/HTTP 协议
- 🔍 **侦测设备管理**：射频频谱分析仪等，MQTT/WebSocket/HTTP 协议
- 🛡️ **反制设备管理**：压制干扰仪等，TCP/UDP/串口/MQTT 协议
- 🔔 **告警中心**：三级告警（紧急/严重/预警），实时推送，确认处置
- 📋 **协议管理**：内置 9 种协议模板，支持扩展
- 👤 **系统管理**：用户、角色权限（RBAC）、审计日志

### 文档

- [功能清单](./docs/功能清单.md)
- [需求规格说明书](./docs/需求规格说明书.md)
- [解决方案](./docs/解决方案.md)

### 快速启动

```bash
cd low-altitude-platform
npm install
npm run dev       # 开发模式
npm run build     # 生产构建
```

**演示账号**：admin / admin123

### 技术栈

- Vue 3 + TypeScript + Vite
- Element Plus（UI 组件库）
- Vue Router 4 + Pinia
- Axios

---

## 点菜系统（历史版本）

详见 [README_order_system.md](./README_order_system.md)
