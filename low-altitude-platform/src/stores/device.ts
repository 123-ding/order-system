import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Device, DeviceType } from '../types/device'

// Mock data for demo
const mockDevices: Device[] = [
  {
    id: 1, name: 'DJI-M300-01', brand: '大疆 (DJI)', model: 'Matrice 300 RTK',
    deviceType: 'uav', region: '北京', status: 'online',
    protocol: 'mavlink_v2', host: '192.168.1.100', port: 14550,
    lastSeenAt: new Date().toISOString(), createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2, name: 'Autel-EVO-02', brand: '道通 (Autel)', model: 'EVO II Pro',
    deviceType: 'uav', region: '上海', status: 'offline',
    protocol: 'mavlink_v1', host: '192.168.1.101', port: 14550,
    createdAt: '2026-01-02T00:00:00Z',
  },
  {
    id: 3, name: 'RADAR-HW-01', brand: '华讯方舟', model: 'HX-1000',
    deviceType: 'detection', region: '北京', status: 'online',
    protocol: 'tcp_custom', host: '192.168.2.10', port: 8888,
    lastSeenAt: new Date().toISOString(), createdAt: '2026-01-03T00:00:00Z',
  },
  {
    id: 4, name: 'SPECTRUM-01', brand: '中电科', model: 'CETC-RF200',
    deviceType: 'sensing', region: '广州', status: 'alarm',
    protocol: 'mqtt', mqttBroker: '192.168.3.10', port: 1883,
    mqttTopic: 'sensing/spectrum/01', host: '192.168.3.10',
    lastSeenAt: new Date().toISOString(), createdAt: '2026-01-04T00:00:00Z',
  },
  {
    id: 5, name: 'JAM-RS-01', brand: '武汉华中天经', model: 'HZT-J500',
    deviceType: 'countermeasure', region: '深圳', status: 'online',
    protocol: 'tcp_custom', host: '192.168.4.10', port: 9999,
    lastSeenAt: new Date().toISOString(), createdAt: '2026-01-05T00:00:00Z',
  },
]

export const useDeviceStore = defineStore('device', () => {
  const devices = ref<Device[]>([...mockDevices])
  let nextId = mockDevices.length + 1

  function getByType(type: DeviceType) {
    return devices.value.filter((d) => d.deviceType === type)
  }

  function getById(id: number) {
    return devices.value.find((d) => d.id === id)
  }

  function addDevice(device: Omit<Device, 'id' | 'createdAt'>) {
    devices.value.push({
      ...device,
      id: nextId++,
      createdAt: new Date().toISOString(),
    })
  }

  function updateDevice(id: number, updates: Partial<Device>) {
    const idx = devices.value.findIndex((d) => d.id === id)
    if (idx !== -1) {
      devices.value[idx] = { ...devices.value[idx], ...updates }
    }
  }

  function removeDevice(id: number) {
    const idx = devices.value.findIndex((d) => d.id === id)
    if (idx !== -1) devices.value.splice(idx, 1)
  }

  return { devices, getByType, getById, addDevice, updateDevice, removeDevice }
})
