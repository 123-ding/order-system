export type DeviceType = 'uav' | 'detection' | 'sensing' | 'countermeasure'
export type DeviceStatus = 'online' | 'offline' | 'alarm' | 'disabled'
export type ProtocolType =
  | 'mavlink_v1'
  | 'mavlink_v2'
  | 'dji_sdk'
  | 'tcp_custom'
  | 'udp_custom'
  | 'serial_rs232'
  | 'serial_rs485'
  | 'mqtt'
  | 'websocket'
  | 'http_rest'
  | 'onvif'
  | 'ads_b'

export interface ProtocolOption {
  value: ProtocolType
  label: string
}

export interface Device {
  id: number
  name: string
  brand: string
  model: string
  deviceType: DeviceType
  region: string
  status: DeviceStatus
  protocol: ProtocolType
  host: string
  port: number
  serialPort?: string
  baudRate?: number
  mqttBroker?: string
  mqttTopic?: string
  username?: string
  wsUrl?: string
  baseUrl?: string
  apiKey?: string
  lastSeenAt?: string
  createdAt: string
}

export interface DeviceFormData {
  name: string
  brand: string
  model: string
  region: string
  protocol: ProtocolType | ''
  host: string
  port: number | null
  serialPort: string
  baudRate: number | null
  dataBits: number | null
  stopBits: number | null
  parity: string
  mqttBroker: string
  mqttPort: number | null
  mqttTopic: string
  mqttClientId: string
  username: string
  password: string
  wsUrl: string
  wsToken: string
  baseUrl: string
  apiKey: string
  pollInterval: number | null
}

// Protocols available per device type
export const PROTOCOL_OPTIONS: Record<DeviceType, ProtocolOption[]> = {
  uav: [
    { value: 'mavlink_v1', label: 'MAVLink v1.0' },
    { value: 'mavlink_v2', label: 'MAVLink v2.0' },
    { value: 'dji_sdk', label: 'DJI SDK' },
    { value: 'tcp_custom', label: '自定义 TCP' },
    { value: 'udp_custom', label: '自定义 UDP' },
  ],
  detection: [
    { value: 'tcp_custom', label: '自定义 TCP' },
    { value: 'udp_custom', label: '自定义 UDP' },
    { value: 'serial_rs232', label: '串口 RS-232' },
    { value: 'serial_rs485', label: '串口 RS-485' },
    { value: 'onvif', label: 'ONVIF' },
    { value: 'ads_b', label: 'ADS-B (1090MHz)' },
    { value: 'http_rest', label: 'HTTP / REST' },
  ],
  sensing: [
    { value: 'websocket', label: 'WebSocket' },
    { value: 'mqtt', label: 'MQTT' },
    { value: 'http_rest', label: 'HTTP / REST' },
    { value: 'tcp_custom', label: '自定义 TCP' },
    { value: 'udp_custom', label: '自定义 UDP' },
  ],
  countermeasure: [
    { value: 'tcp_custom', label: '自定义 TCP' },
    { value: 'udp_custom', label: '自定义 UDP' },
    { value: 'serial_rs232', label: '串口 RS-232' },
    { value: 'mqtt', label: 'MQTT' },
    { value: 'http_rest', label: 'HTTP / REST' },
  ],
}

export const BRAND_OPTIONS: Record<DeviceType, string[]> = {
  uav: ['大疆 (DJI)', '道通 (Autel)', '极飞', '亿航', '丰翼', '自研', '其他'],
  detection: ['华讯方舟', '东方网力', '成都瑞达', '安徽四创', '北斗星通', '自研', '其他'],
  sensing: ['航天恒星', '中电科', '成都振芯', '海康威视', '大华', '自研', '其他'],
  countermeasure: ['武汉华中天经', '成都锐盛', '西安意博宏', '北京纵横无人机', '自研', '其他'],
}

export const REGION_OPTIONS = ['北京', '上海', '广州', '深圳', '成都', '西安', '武汉', '杭州', '区域A', '区域B', '区域C']

export const SERIAL_PORT_OPTIONS = [
  '/dev/ttyUSB0', '/dev/ttyUSB1', '/dev/ttyS0', '/dev/ttyS1',
  'COM1', 'COM2', 'COM3', 'COM4',
]

export const BAUD_RATE_OPTIONS = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200]
