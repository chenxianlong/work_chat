const crypto = require('crypto');

/**
 * 计算签名
 * @param {string} token - 企业微信设置的token
 * @param {string} timestamp - 时间戳
 * @param {string} nonce - 随机字符串
 * @returns {string} 签名字符串
 */
function getSignature(token, timestamp, nonce) {
  const tmpArr = [token, timestamp, nonce].sort();
  const tmpStr = tmpArr.join('');
  const sha1 = crypto.createHash('sha1');
  sha1.update(tmpStr);
  return sha1.digest('hex');
}

/**
 * 验证签名
 * @param {string} signature - 企业微信传来的签名
 * @param {string} token - 企业微信设置的token
 * @param {string} timestamp - 时间戳
 * @param {string} nonce - 随机字符串
 * @param {string} echostr - 回显字符串（可选）
 * @returns {boolean} 验证结果
 */
function verifySignature(signature, token, timestamp, nonce, echostr = '') {
  const tmpArr = [token, timestamp, nonce, echostr].sort();
  const tmpStr = tmpArr.join('');
  const sha1 = crypto.createHash('sha1');
  sha1.update(tmpStr);
  const tmpSignature = sha1.digest('hex');
  
  console.log('签名验证详情:', {
    input: [token, timestamp, nonce, echostr].sort(),
    calculated: tmpSignature,
    received: signature,
    match: tmpSignature === signature
  });
  
  return tmpSignature === signature;
}

/**
 * AES解密
 * @param {string} encryptedMsg - 加密的消息
 * @param {string} encodingAESKey - 企业微信设置的AES密钥
 * @returns {string} 解密后的消息
 */
function decryptAES(encryptedMsg, encodingAESKey) {
  const key = Buffer.from(encodingAESKey + '=', 'base64');
  const iv = key.slice(0, 16);
  
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    decipher.setAutoPadding(false);
    
    // 解密为Buffer
    let decryptedBuffer = Buffer.concat([
      decipher.update(encryptedMsg, 'base64'),
      decipher.final()
    ]);
    
    console.log('解密后Buffer长度:', decryptedBuffer.length);
    console.log('解密后Buffer内容:', decryptedBuffer.toString('hex').substring(0, 100) + '...');
    
    // 去除PKCS7补位
    const pad = decryptedBuffer[decryptedBuffer.length - 1];
    if (pad > 0 && pad <= 32) {
      decryptedBuffer = decryptedBuffer.slice(0, -pad);
      console.log('去除补位后长度:', decryptedBuffer.length);
    }
    
    // 去除前16位的随机字符串
    if (decryptedBuffer.length < 16) {
      throw new Error('解密数据长度不足');
    }
    
    const content = decryptedBuffer.slice(16);
    console.log('去除随机字符串后长度:', content.length);
    
    // 读取消息长度（4字节）
    if (content.length < 4) {
      throw new Error('消息长度数据不足');
    }
    
    const msgLen = content.readUInt32BE(0);
    console.log('消息长度:', msgLen);
    
    // 检查数据长度是否足够
    if (content.length < 4 + msgLen) {
      throw new Error(`消息数据长度不足，需要${4 + msgLen}，实际${content.length}`);
    }
    
    // 提取消息内容
    const message = content.slice(4, 4 + msgLen).toString('utf8');
    
    // 提取企业ID
    const fromCorpId = content.slice(4 + msgLen).toString('utf8');
    
    console.log('解密详情:', {
      msgLen,
      messageLength: message.length,
      message: message,
      fromCorpId: fromCorpId
    });
    
    return {
      message: message,
      fromCorpId: fromCorpId
    };
  } catch (error) {
    console.error('AES解密失败:', error);
    console.error('输入参数:', {
      encryptedMsgLength: encryptedMsg.length,
      encodingAESKeyLength: encodingAESKey.length
    });
    throw error;
  }
}

/**
 * AES加密
 * @param {string} msg - 要加密的消息
 * @param {string} corpId - 企业ID
 * @param {string} encodingAESKey - 企业微信设置的AES密钥
 * @returns {string} 加密后的消息
 */
function encryptAES(msg, corpId, encodingAESKey) {
  const key = Buffer.from(encodingAESKey + '=', 'base64');
  const iv = key.slice(0, 16);
  
  // 生成16位随机字符串
  const randomStr = crypto.randomBytes(16).toString('base64').slice(0, 16);
  
  // 计算消息长度
  const msgBuffer = Buffer.from(msg);
  const corpIdBuffer = Buffer.from(corpId);
  const msgLenBuffer = Buffer.alloc(4);
  msgLenBuffer.writeUInt32BE(msgBuffer.length, 0);
  
  // 拼接数据
  const data = Buffer.concat([
    Buffer.from(randomStr),
    msgLenBuffer,
    msgBuffer,
    corpIdBuffer
  ]);
  
  // PKCS7补位
  const blockSize = 32;
  const pad = blockSize - (data.length % blockSize);
  const padBuffer = Buffer.alloc(pad, pad);
  const paddedData = Buffer.concat([data, padBuffer]);
  
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(paddedData, null, 'base64');
  encrypted += cipher.final('base64');
  
  return encrypted;
}

module.exports = {
  getSignature,
  verifySignature,
  decryptAES,
  encryptAES
};
