<template>
  <div>
    <div class="page-header">
      <h2>协议管理</h2>
      <el-button type="primary" :icon="Plus">新增协议模板</el-button>
    </div>

    <el-row :gutter="16">
      <el-col :span="8" v-for="proto in protocols" :key="proto.key">
        <el-card style="margin-bottom:16px;" shadow="hover">
          <template #header>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-weight:600;">{{ proto.name }}</span>
              <el-tag :type="proto.builtin ? 'success' : 'info'" size="small">
                {{ proto.builtin ? '内置' : '自定义' }}
              </el-tag>
            </div>
          </template>
          <p style="color:#666;font-size:13px;margin-bottom:12px;">{{ proto.description }}</p>
          <div style="display:flex;gap:4px;flex-wrap:wrap;">
            <el-tag v-for="t in proto.applicableTo" :key="t" size="small" type="info">{{ t }}</el-tag>
          </div>
          <div style="margin-top:12px;display:flex;gap:8px;">
            <el-button size="small">配置</el-button>
            <el-button size="small" type="primary" @click="testProto(proto.name)">测试</el-button>
            <el-button v-if="!proto.builtin" size="small" type="danger">删除</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const protocols = ref([
  { key: 'mavlink_v2', name: 'MAVLink v2.0', builtin: true, description: '用于无人机的轻量级报文协议，支持签名和组件消息', applicableTo: ['无人机'] },
  { key: 'mavlink_v1', name: 'MAVLink v1.0', builtin: true, description: 'MAVLink 第一版，兼容老版 PX4/APM 飞控', applicableTo: ['无人机'] },
  { key: 'dji_sdk', name: 'DJI SDK', builtin: true, description: '大疆官方 SDK 接入协议，支持 Matrice/Phantom 系列', applicableTo: ['无人机'] },
  { key: 'mqtt', name: 'MQTT v5.0', builtin: true, description: '物联网轻量级消息协议，支持 QoS 0/1/2', applicableTo: ['侦测设备', '反制设备'] },
  { key: 'onvif', name: 'ONVIF Profile S', builtin: true, description: '网络视频设备开放标准，支持 PTZ 控制', applicableTo: ['探测设备'] },
  { key: 'ads_b', name: 'ADS-B 1090MHz', builtin: true, description: '广播式自动相关监视，接收飞机/无人机广播位置信息', applicableTo: ['探测设备'] },
  { key: 'tcp_custom', name: '自定义 TCP', builtin: true, description: '通用 TCP 长连接，支持自定义帧解析规则', applicableTo: ['无人机', '探测设备', '侦测设备', '反制设备'] },
  { key: 'websocket', name: 'WebSocket', builtin: true, description: '基于 HTTP 升级的全双工通信协议', applicableTo: ['侦测设备'] },
  { key: 'http_rest', name: 'HTTP / REST', builtin: true, description: '标准 HTTP 接口轮询，支持 Bearer Token / API Key 认证', applicableTo: ['探测设备', '侦测设备', '反制设备'] },
])

function testProto(name: string) {
  ElMessage.info(`正在测试协议「${name}」连通性...`)
}
</script>
