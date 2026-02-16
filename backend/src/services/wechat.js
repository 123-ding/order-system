/**
 * 微信服务
 */
const axios = require('axios');
const redisClient = require('../config/redis');
const wechatConfig = require('../config/wechat');

class WechatService {
  /**
   * 获取access_token
   */
  async getAccessToken() {
    try {
      // 尝试从Redis获取
      const cached = await redisClient.get('wechat_access_token');
      if (cached) {
        return cached;
      }

      // 从微信服务器获取
      const response = await axios.get(wechatConfig.apiUrl.accessToken, {
        params: {
          grant_type: 'client_credential',
          appid: wechatConfig.appId,
          secret: wechatConfig.appSecret
        }
      });

      if (response.data.access_token) {
        // 缓存到Redis，有效期7000秒（微信access_token有效期7200秒）
        await redisClient.setEx('wechat_access_token', 7000, response.data.access_token);
        return response.data.access_token;
      }

      throw new Error('获取access_token失败');
    } catch (error) {
      console.error('获取微信access_token失败:', error);
      throw error;
    }
  }

  /**
   * 通过code获取用户信息
   */
  async getUserInfoByCode(code) {
    try {
      // 获取access_token和openid
      const tokenResponse = await axios.get(wechatConfig.apiUrl.oauth2AccessToken, {
        params: {
          appid: wechatConfig.appId,
          secret: wechatConfig.appSecret,
          code: code,
          grant_type: 'authorization_code'
        }
      });

      const { access_token, openid } = tokenResponse.data;

      if (!access_token || !openid) {
        throw new Error('获取用户信息失败');
      }

      // 获取用户信息
      const userResponse = await axios.get(wechatConfig.apiUrl.oauth2UserInfo, {
        params: {
          access_token: access_token,
          openid: openid,
          lang: 'zh_CN'
        }
      });

      return userResponse.data;
    } catch (error) {
      console.error('获取微信用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 发送模板消息
   */
  async sendTemplateMessage(openid, templateId, data, url = '') {
    try {
      const access_token = await this.getAccessToken();

      const response = await axios.post(
        `${wechatConfig.apiUrl.sendTemplate}?access_token=${access_token}`,
        {
          touser: openid,
          template_id: templateId,
          url: url,
          data: data
        }
      );

      return response.data;
    } catch (error) {
      console.error('发送模板消息失败:', error);
      throw error;
    }
  }
}

module.exports = new WechatService();
