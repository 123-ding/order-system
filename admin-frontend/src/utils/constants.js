export const ORDER_STATUS = {
  pending: { label: '待确认', type: 'info' },
  confirmed: { label: '已确认', type: 'primary' },
  loading: { label: '装货中', type: 'warning' },
  in_transit: { label: '运输中', type: '' },
  arrived: { label: '已到港', type: 'success' },
  completed: { label: '已完成', type: 'success' },
  cancelled: { label: '已取消', type: 'danger' }
}

export const VESSEL_STATUS = {
  available: { label: '可用', type: 'success' },
  at_sea: { label: '航行中', type: 'primary' },
  loading: { label: '装卸货中', type: 'warning' },
  maintenance: { label: '维修中', type: 'danger' },
  docked: { label: '停靠中', type: 'info' }
}

export const CARGO_STATUS = {
  pending: { label: '待装载', type: 'info' },
  loaded: { label: '已装载', type: 'primary' },
  in_transit: { label: '运输中', type: '' },
  unloading: { label: '卸货中', type: 'warning' },
  delivered: { label: '已交付', type: 'success' },
  damaged: { label: '受损', type: 'danger' }
}

export const USER_ROLES = {
  admin: { label: '管理员', type: 'danger' },
  operator: { label: '操作员', type: 'warning' },
  customer: { label: '客户', type: 'primary' },
  viewer: { label: '查看者', type: 'info' }
}

export const CARGO_TYPES = ['集装箱', '散货', '液体货', '滚装货物', '冷藏货', '危险品']

export const PORTS = [
  '上海港', '宁波港', '广州港', '深圳港', '青岛港',
  '天津港', '大连港', '福州港', '厦门港', '武汉港'
]
