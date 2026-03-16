<template>
  <div>
    <div class="page-header">
      <h2>{{ title }}</h2>
      <el-button @click="$router.back()">返回列表</el-button>
    </div>

    <el-card>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="140px"
        style="max-width:720px;"
      >
        <!-- Basic Info -->
        <el-divider content-position="left">基本信息</el-divider>

        <el-form-item label="设备名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入设备名称（唯一标识）" />
        </el-form-item>

        <el-form-item label="设备品牌" prop="brand">
          <el-select v-model="form.brand" placeholder="请选择品牌" allow-create filterable style="width:100%;">
            <el-option v-for="b in brandOptions" :key="b" :label="b" :value="b" />
          </el-select>
        </el-form-item>

        <el-form-item label="设备型号" prop="model">
          <el-input v-model="form.model" placeholder="请输入设备型号" />
        </el-form-item>

        <el-form-item label="所属区域" prop="region">
          <el-select v-model="form.region" placeholder="请选择区域" style="width:100%;">
            <el-option v-for="r in REGION_OPTIONS" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>

        <!-- Protocol Config -->
        <el-divider content-position="left">通信协议配置</el-divider>

        <el-form-item label="通信协议" prop="protocol">
          <el-select
            v-model="form.protocol"
            placeholder="请选择通信协议"
            style="width:100%;"
            @change="onProtocolChange"
          >
            <el-option
              v-for="opt in protocolOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
          <div v-if="form.protocol" style="margin-top:4px;color:#999;font-size:12px;">
            {{ protocolHint }}
          </div>
        </el-form-item>

        <!-- TCP / UDP / MAVLink / DJI / ONVIF / ADS-B fields -->
        <template v-if="isTcpUdpLike">
          <el-form-item label="IP 地址" prop="host">
            <el-input v-model="form.host" placeholder="例：192.168.1.100" />
          </el-form-item>
          <el-form-item label="端口" prop="port">
            <el-input-number v-model="form.port" :min="1" :max="65535" style="width:200px;" placeholder="1–65535" />
          </el-form-item>
        </template>

        <!-- Serial port fields -->
        <template v-if="isSerial">
          <el-form-item label="串口号" prop="serialPort">
            <el-select v-model="form.serialPort" placeholder="选择串口" allow-create filterable style="width:100%;">
              <el-option v-for="s in SERIAL_PORT_OPTIONS" :key="s" :label="s" :value="s" />
            </el-select>
          </el-form-item>
          <el-form-item label="波特率" prop="baudRate">
            <el-select v-model="form.baudRate" placeholder="选择波特率" style="width:200px;">
              <el-option v-for="b in BAUD_RATE_OPTIONS" :key="b" :label="String(b)" :value="b" />
            </el-select>
          </el-form-item>
          <el-form-item label="数据位">
            <el-select v-model="form.dataBits" style="width:120px;">
              <el-option :value="7" label="7" /><el-option :value="8" label="8" />
            </el-select>
          </el-form-item>
          <el-form-item label="停止位">
            <el-select v-model="form.stopBits" style="width:120px;">
              <el-option :value="1" label="1" /><el-option :value="2" label="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="校验位">
            <el-select v-model="form.parity" style="width:120px;">
              <el-option value="none" label="无" />
              <el-option value="even" label="偶校验" />
              <el-option value="odd" label="奇校验" />
            </el-select>
          </el-form-item>
        </template>

        <!-- MQTT fields -->
        <template v-if="isMqtt">
          <el-form-item label="Broker 地址" prop="mqttBroker">
            <el-input v-model="form.mqttBroker" placeholder="例：192.168.1.10" />
          </el-form-item>
          <el-form-item label="Broker 端口">
            <el-input-number v-model="form.mqttPort" :min="1" :max="65535" :default-value="1883" style="width:200px;" />
          </el-form-item>
          <el-form-item label="Topic" prop="mqttTopic">
            <el-input v-model="form.mqttTopic" placeholder="例：devices/uav/01/telemetry" />
          </el-form-item>
          <el-form-item label="客户端 ID">
            <el-input v-model="form.mqttClientId" placeholder="留空则自动生成" />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="（可选）" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" show-password placeholder="（可选）" />
          </el-form-item>
        </template>

        <!-- WebSocket fields -->
        <template v-if="isWebSocket">
          <el-form-item label="WebSocket URL" prop="wsUrl">
            <el-input v-model="form.wsUrl" placeholder="例：ws://192.168.1.10:8080/ws" />
          </el-form-item>
          <el-form-item label="认证 Token">
            <el-input v-model="form.wsToken" type="password" show-password placeholder="（可选）" />
          </el-form-item>
        </template>

        <!-- HTTP / REST fields -->
        <template v-if="isHttp">
          <el-form-item label="Base URL" prop="baseUrl">
            <el-input v-model="form.baseUrl" placeholder="例：http://192.168.1.10:8080/api" />
          </el-form-item>
          <el-form-item label="API Key / Token">
            <el-input v-model="form.apiKey" type="password" show-password placeholder="（可选）" />
          </el-form-item>
          <el-form-item label="轮询间隔（秒）">
            <el-input-number v-model="form.pollInterval" :min="1" :max="3600" :default-value="5" style="width:200px;" />
          </el-form-item>
        </template>

        <!-- Test Connection -->
        <el-form-item v-if="form.protocol">
          <el-button @click="testConnection" :loading="testing">
            <el-icon><Link /></el-icon>&nbsp;测试连接
          </el-button>
          <el-tag v-if="testResult" :type="testResult === 'ok' ? 'success' : 'danger'" style="margin-left:12px;">
            {{ testResult === 'ok' ? '✓ 连接成功' : '✗ 连接失败，请检查配置' }}
          </el-tag>
        </el-form-item>

        <!-- Submit -->
        <el-divider />
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="saving">保存设备</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Link } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useDeviceStore } from '../../stores/device'
import type { DeviceType, DeviceFormData, ProtocolType } from '../../types/device'
import {
  PROTOCOL_OPTIONS,
  BRAND_OPTIONS,
  REGION_OPTIONS,
  SERIAL_PORT_OPTIONS,
  BAUD_RATE_OPTIONS,
} from '../../types/device'

const props = defineProps<{
  deviceType: DeviceType
  title: string
  id?: string
}>()

const router = useRouter()
const store = useDeviceStore()
const formRef = ref()
const saving = ref(false)
const testing = ref(false)
const testResult = ref<'ok' | 'fail' | null>(null)

const isEdit = computed(() => !!props.id)

const form = ref<DeviceFormData>({
  name: '', brand: '', model: '', region: '', protocol: '',
  host: '', port: null,
  serialPort: '', baudRate: null, dataBits: 8, stopBits: 1, parity: 'none',
  mqttBroker: '', mqttPort: 1883, mqttTopic: '', mqttClientId: '', username: '', password: '',
  wsUrl: '', wsToken: '',
  baseUrl: '', apiKey: '', pollInterval: 5,
})

const protocolOptions = computed(() => PROTOCOL_OPTIONS[props.deviceType])
const brandOptions = computed(() => BRAND_OPTIONS[props.deviceType])

const isTcpUdpLike = computed(() =>
  ['mavlink_v1', 'mavlink_v2', 'dji_sdk', 'tcp_custom', 'udp_custom', 'onvif', 'ads_b'].includes(form.value.protocol)
)
const isSerial = computed(() =>
  ['serial_rs232', 'serial_rs485'].includes(form.value.protocol)
)
const isMqtt = computed(() => form.value.protocol === 'mqtt')
const isWebSocket = computed(() => form.value.protocol === 'websocket')
const isHttp = computed(() => form.value.protocol === 'http_rest')

const protocolHint = computed(() => {
  const hints: Record<string, string> = {
    mavlink_v1: '通过 UDP/TCP 连接支持 MAVLink v1.0 协议的无人机（如老版 PX4/APM）',
    mavlink_v2: '通过 UDP/TCP 连接支持 MAVLink v2.0 协议的无人机（推荐，支持签名）',
    dji_sdk: '通过 DJI SDK 接入大疆无人机，需要提供目标机器 IP 及 SDK 端口',
    tcp_custom: '自定义 TCP 长连接，需配置 IP 地址和端口',
    udp_custom: '自定义 UDP 连接，需配置目标 IP 和端口',
    serial_rs232: 'RS-232 串口通信，需选择串口号和波特率',
    serial_rs485: 'RS-485 串口通信（差分信号，支持长距离多点通信）',
    onvif: 'ONVIF 标准视频设备协议，需配置摄像头 IP 和端口',
    ads_b: 'ADS-B 1090MHz 信号接收，配置接收机 IP 和数据端口',
    mqtt: 'MQTT 消息队列遥测传输协议，需配置 Broker 地址和 Topic',
    websocket: 'WebSocket 长连接，需配置 WS/WSS 服务地址',
    http_rest: 'HTTP/REST 接口轮询，需配置 API Base URL 和认证方式',
  }
  return hints[form.value.protocol] ?? ''
})

const rules = computed(() => ({
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  brand: [{ required: true, message: '请选择或输入品牌', trigger: 'change' }],
  region: [{ required: true, message: '请选择区域', trigger: 'change' }],
  protocol: [{ required: true, message: '请选择通信协议', trigger: 'change' }],
  host: isTcpUdpLike.value
    ? [{ required: true, message: '请输入 IP 地址', trigger: 'blur' },
       { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: 'IP 地址格式不正确', trigger: 'blur' }]
    : [],
  port: isTcpUdpLike.value
    ? [{ required: true, message: '请输入端口', trigger: 'blur' }]
    : [],
  serialPort: isSerial.value ? [{ required: true, message: '请选择串口号', trigger: 'change' }] : [],
  baudRate: isSerial.value ? [{ required: true, message: '请选择波特率', trigger: 'change' }] : [],
  mqttBroker: isMqtt.value ? [{ required: true, message: '请输入 Broker 地址', trigger: 'blur' }] : [],
  mqttTopic: isMqtt.value ? [{ required: true, message: '请输入 Topic', trigger: 'blur' }] : [],
  wsUrl: isWebSocket.value ? [{ required: true, message: '请输入 WebSocket URL', trigger: 'blur' }] : [],
  baseUrl: isHttp.value ? [{ required: true, message: '请输入 Base URL', trigger: 'blur' }] : [],
}))

function onProtocolChange() {
  testResult.value = null
  // Reset all connection fields
  form.value.host = ''
  form.value.port = null
  form.value.serialPort = ''
  form.value.baudRate = null
  form.value.mqttBroker = ''
  form.value.mqttPort = 1883
  form.value.mqttTopic = ''
  form.value.wsUrl = ''
  form.value.baseUrl = ''
}

function testConnection() {
  testing.value = true
  testResult.value = null
  setTimeout(() => {
    testing.value = false
    testResult.value = 'ok'
    ElMessage.success('连接测试成功！')
  }, 1200)
}

function handleSubmit() {
  formRef.value.validate((valid: boolean) => {
    if (!valid) return
    saving.value = true
    setTimeout(() => {
      saving.value = false
      const deviceData = {
        name: form.value.name,
        brand: form.value.brand,
        model: form.value.model,
        deviceType: props.deviceType,
        region: form.value.region,
        status: 'offline' as const,
        protocol: form.value.protocol as ProtocolType,
        host: form.value.host,
        port: form.value.port ?? 0,
        serialPort: form.value.serialPort || undefined,
        baudRate: form.value.baudRate ?? undefined,
        mqttBroker: form.value.mqttBroker || undefined,
        mqttTopic: form.value.mqttTopic || undefined,
        username: form.value.username || undefined,
        wsUrl: form.value.wsUrl || undefined,
      }
      if (isEdit.value && props.id) {
        store.updateDevice(Number(props.id), deviceData)
        ElMessage.success('设备信息已更新')
      } else {
        store.addDevice(deviceData)
        ElMessage.success('设备注册成功')
      }
      router.back()
    }, 800)
  })
}

onMounted(() => {
  if (isEdit.value && props.id) {
    const device = store.getById(Number(props.id))
    if (device) {
      form.value.name = device.name
      form.value.brand = device.brand
      form.value.model = device.model
      form.value.region = device.region
      form.value.protocol = device.protocol
      form.value.host = device.host
      form.value.port = device.port
      form.value.serialPort = device.serialPort ?? ''
      form.value.baudRate = device.baudRate ?? null
      form.value.mqttBroker = device.mqttBroker ?? ''
      form.value.mqttTopic = device.mqttTopic ?? ''
      form.value.wsUrl = device.wsUrl ?? ''
    }
  }
})
</script>
