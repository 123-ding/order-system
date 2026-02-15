/**
 * 微信公众号配置
 */
require('dotenv').config();

module.exports = {
  appId: process.env.WECHAT_APP_ID || '',
  appSecret: process.env.WECHAT_APP_SECRET || '',
  token: process.env.WECHAT_TOKEN || '',
  encodingAESKey: process.env.WECHAT_ENCODING_AES_KEY || '',
  
  // 微信API地址
  apiUrl: {
    accessToken: 'https://api.weixin.qq.com/cgi-bin/token',
    userInfo: 'https://api.weixin.qq.com/cgi-bin/user/info',
    oauth2AccessToken: 'https://api.weixin.qq.com/sns/oauth2/access_token',
    oauth2UserInfo: 'https://api.weixin.qq.com/sns/userinfo',
    sendTemplate: 'https://api.weixin.qq.com/cgi-bin/message/template/send'
  },
  
  // 模板消息ID（需要在微信公众平台配置）
  templateIds: {
    orderCreated: 'YOUR_TEMPLATE_ID_1', // 下单成功通知
    orderStatusChange: 'YOUR_TEMPLATE_ID_2', // 订单状态变更
    delivery: 'YOUR_TEMPLATE_ID_3' // 配送提醒
  }
};
