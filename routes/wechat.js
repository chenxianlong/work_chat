const express = require('express');
const router = express.Router();
const { verifySignature, decryptAES, encryptAES } = require('../utils/crypto');
const config = require('../config');
const xml2js = require('xml2js');

/**
 * 企业微信URL验证和消息接收接口
 * GET: URL验证
 * POST: 消息接收
 */
router.all('/wechat', (req, res) => {
  const { msg_signature, timestamp, nonce, echostr } = req.query;
  
  // 验证必要参数
  if (!msg_signature || !timestamp || !nonce) {
    return res.status(400).send('缺少必要参数');
  }
  
  if (req.method === 'GET') {
    // URL验证模式 - 验证签名时需要包含echostr
    if (!verifySignature(msg_signature, config.token, timestamp, nonce, echostr || '')) {
      return res.status(403).send('签名验证失败');
    }
    // URL验证模式
    if (!echostr) {
      return res.status(400).send('缺少echostr参数');
    }
    
    try {
      // 解密echostr
      const decrypted = decryptAES(echostr, config.encodingAESKey);
      
      // 验证企业ID是否匹配
      if (decrypted.fromCorpId !== config.corpId) {
        return res.status(403).send('企业ID不匹配');
      }
      
      console.log('URL验证成功，企业ID:', decrypted.fromCorpId);
      res.send(decrypted.message);
      
    } catch (error) {
      console.error('URL验证失败:', error);
      res.status(500).send('验证失败');
    }
    
  } else if (req.method === 'POST') {
    // 消息接收模式
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        // 解析XML
        xml2js.parseString(body, { explicitArray: false }, (err, result) => {
          if (err) {
            console.error('XML解析失败:', err);
            return res.status(400).send('XML解析失败');
          }
          
          const xml = result.xml;
          console.log('接收到企业微信消息:', xml);
          
          // 验证签名（消息接收时需要包含加密内容）
          if (!verifySignature(msg_signature, config.token, timestamp, nonce, xml.Encrypt)) {
            return res.status(403).send('签名验证失败');
          }
          
          // 解密消息内容
          const decrypted = decryptAES(xml.Encrypt, config.encodingAESKey);
          
          // 验证企业ID
          if (decrypted.fromCorpId !== config.corpId) {
            return res.status(403).send('企业ID不匹配');
          }
          
          // 解析解密后的消息
          xml2js.parseString(decrypted.message, { explicitArray: false }, (err, msgResult) => {
            if (err) {
              console.error('消息解析失败:', err);
              return res.status(400).send('消息解析失败');
            }
            
            const message = msgResult.xml;
            console.log('解密后的消息内容:', message);
            
            // 打印用户账号ID
            if (message.FromUserName) {
              console.log('='.repeat(50));
              console.log('收到用户消息 - 用户账号ID:', message.FromUserName);
              console.log('消息类型:', message.MsgType);
              console.log('消息时间:', new Date().toISOString());
              console.log('='.repeat(50));
            }
            
            // 处理不同类型的消息
            handleMessage(message, req, res);
          });
        });
        
      } catch (error) {
        console.error('消息处理失败:', error);
        res.status(500).send('消息处理失败');
      }
    });
  }
});

/**
 * 处理不同类型的消息
 * @param {Object} message - 消息对象
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
function handleMessage(message, req, res) {
  const msgType = message.MsgType;
  const fromUser = message.FromUserName;
  const toUser = message.ToUserName;
  const createTime = Date.now().toString();
  
  let replyContent = '';
  
  switch (msgType) {
    case 'text':
      // 文本消息
      replyContent = `收到您的消息：${message.Content}`;
      break;
      
    case 'image':
      // 图片消息
      replyContent = '收到您发送的图片，谢谢！';
      break;
      
    case 'voice':
      // 语音消息
      replyContent = '收到您发送的语音，谢谢！';
      break;
      
    case 'video':
      // 视频消息
      replyContent = '收到您发送的视频，谢谢！';
      break;
      
    case 'event':
      // 事件消息
      if (message.Event === 'subscribe') {
        replyContent = '欢迎使用企业微信应用！';
      } else if (message.Event === 'unsubscribe') {
        replyContent = ''; // 取消关注不回复
      } else {
        replyContent = '收到事件消息';
      }
      break;
      
    default:
      replyContent = '收到消息，暂不支持此类型回复';
  }
  
  // 如果有回复内容，构造回复消息
  if (replyContent) {
    const replyXml = `
      <xml>
        <ToUserName><![CDATA[${fromUser}]]></ToUserName>
        <FromUserName><![CDATA[${toUser}]]></FromUserName>
        <CreateTime>${createTime}</CreateTime>
        <MsgType><![CDATA[text]]></MsgType>
        <Content><![CDATA[${replyContent}]]></Content>
      </xml>
    `;
    
    try {
      // 加密回复消息
      const encryptedReply = encryptAES(replyXml.trim(), config.corpId, config.encodingAESKey);
      const timestamp = Date.now().toString();
      const nonce = Math.random().toString(36).substr(2, 15);
      
      // 生成签名
      const { getSignature } = require('../utils/crypto');
      const signature = getSignature(config.token, timestamp, nonce);
      
      // 构造最终响应
      const responseXml = `
        <xml>
          <Encrypt><![CDATA[${encryptedReply}]]></Encrypt>
          <MsgSignature><![CDATA[${signature}]]></MsgSignature>
          <TimeStamp>${timestamp}</TimeStamp>
          <Nonce><![CDATA[${nonce}]]></Nonce>
        </xml>
      `;
      
      res.set('Content-Type', 'application/xml');
      res.send(responseXml.trim());
      
    } catch (error) {
      console.error('回复消息失败:', error);
      res.send('success'); // 即使回复失败，也要返回success避免企业微信重复推送
    }
  } else {
    // 无需回复
    res.send('success');
  }
}

module.exports = router;
