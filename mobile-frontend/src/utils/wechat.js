/**
 * 微信 JSSDK 工具类
 * 用于微信公众号内的功能调用
 */

class WeChatSDK {
  constructor() {
    this.isReady = false
    this.wx = null
  }

  /**
   * 初始化微信 SDK
   * @param {Object} config - 微信配置信息
   */
  async init(config) {
    return new Promise((resolve, reject) => {
      // 检查是否在微信环境
      if (!this.isWeChat()) {
        console.warn('Not in WeChat environment')
        reject(new Error('Not in WeChat'))
        return
      }

      // 动态加载微信 JSSDK
      if (!window.wx) {
        const script = document.createElement('script')
        script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js'
        script.onload = () => {
          this.configWx(config, resolve, reject)
        }
        script.onerror = reject
        document.head.appendChild(script)
      } else {
        this.configWx(config, resolve, reject)
      }
    })
  }

  /**
   * 配置微信 SDK
   */
  configWx(config, resolve, reject) {
    this.wx = window.wx

    this.wx.config({
      debug: config.debug || false,
      appId: config.appId,
      timestamp: config.timestamp,
      nonceStr: config.nonceStr,
      signature: config.signature,
      jsApiList: config.jsApiList || [
        'updateAppMessageShareData',
        'updateTimelineShareData',
        'onMenuShareAppMessage',
        'onMenuShareTimeline',
        'chooseImage',
        'uploadImage',
        'previewImage',
        'getLocation',
        'openLocation',
        'scanQRCode',
        'chooseWXPay'
      ]
    })

    this.wx.ready(() => {
      this.isReady = true
      resolve(this.wx)
    })

    this.wx.error((err) => {
      console.error('WeChat SDK Error:', err)
      reject(err)
    })
  }

  /**
   * 判断是否在微信环境
   */
  isWeChat() {
    const ua = navigator.userAgent.toLowerCase()
    return ua.includes('micromessenger')
  }

  /**
   * 分享到朋友圈
   */
  shareToTimeline(options) {
    if (!this.isReady) {
      console.warn('WeChat SDK not ready')
      return
    }

    this.wx.updateTimelineShareData({
      title: options.title,
      link: options.link,
      imgUrl: options.imgUrl,
      success: options.success,
      cancel: options.cancel
    })
  }

  /**
   * 分享给朋友
   */
  shareToFriend(options) {
    if (!this.isReady) {
      console.warn('WeChat SDK not ready')
      return
    }

    this.wx.updateAppMessageShareData({
      title: options.title,
      desc: options.desc,
      link: options.link,
      imgUrl: options.imgUrl,
      success: options.success,
      cancel: options.cancel
    })
  }

  /**
   * 选择图片
   */
  chooseImage(options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        reject(new Error('WeChat SDK not ready'))
        return
      }

      this.wx.chooseImage({
        count: options.count || 9,
        sizeType: options.sizeType || ['original', 'compressed'],
        sourceType: options.sourceType || ['album', 'camera'],
        success: (res) => {
          resolve(res.localIds)
        },
        fail: reject
      })
    })
  }

  /**
   * 预览图片
   */
  previewImage(current, urls) {
    if (!this.isReady) {
      console.warn('WeChat SDK not ready')
      return
    }

    this.wx.previewImage({
      current: current,
      urls: urls
    })
  }

  /**
   * 获取地理位置
   */
  getLocation(type = 'wgs84') {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        reject(new Error('WeChat SDK not ready'))
        return
      }

      this.wx.getLocation({
        type: type,
        success: resolve,
        fail: reject
      })
    })
  }

  /**
   * 打开地图查看位置
   */
  openLocation(options) {
    if (!this.isReady) {
      console.warn('WeChat SDK not ready')
      return
    }

    this.wx.openLocation({
      latitude: options.latitude,
      longitude: options.longitude,
      name: options.name,
      address: options.address,
      scale: options.scale || 14
    })
  }

  /**
   * 扫一扫
   */
  scanQRCode(options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        reject(new Error('WeChat SDK not ready'))
        return
      }

      this.wx.scanQRCode({
        needResult: options.needResult !== false ? 1 : 0,
        scanType: options.scanType || ['qrCode', 'barCode'],
        success: (res) => {
          resolve(res.resultStr)
        },
        fail: reject
      })
    })
  }

  /**
   * 微信支付
   */
  pay(options) {
    return new Promise((resolve, reject) => {
      if (!this.isReady) {
        reject(new Error('WeChat SDK not ready'))
        return
      }

      this.wx.chooseWXPay({
        timestamp: options.timestamp,
        nonceStr: options.nonceStr,
        package: options.package,
        signType: options.signType || 'MD5',
        paySign: options.paySign,
        success: resolve,
        fail: reject
      })
    })
  }
}

export default new WeChatSDK()
