const crypto = require('crypto');
const config = require('./config');

/**
 * 计算签名
 */
function getSignature(token, timestamp, nonce, echostr = '') {
  const tmpArr = [token, timestamp, nonce, echostr].sort();
  const tmpStr = tmpArr.join('');
  const sha1 = crypto.createHash('sha1');
  sha1.update(tmpStr);
  return sha1.digest('hex');
}

/**
 * AES加密 - 模拟企业微信的echostr加密
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

/**
 * 测试URL验证
 */
function testURLValidation() {
  const timestamp = Date.now().toString();
  const nonce = Math.random().toString(36).substr(2, 15);
  
  // 创建一个真实的echostr（加密的消息）
  const originalMsg = 'test_verification_message';
  const encryptedEchostr = encryptAES(originalMsg, config.corpId, config.encodingAESKey);
  
  // 计算正确的签名
  const signature = getSignature(config.token, timestamp, nonce, encryptedEchostr);
  
  console.log('测试参数:');
  console.log('Token:', config.token);
  console.log('Timestamp:', timestamp);
  console.log('Nonce:', nonce);
  console.log('Original Message:', originalMsg);
  console.log('Encrypted Echostr:', encryptedEchostr);
  console.log('Signature:', signature);
  
  // 构造测试URL
  const testUrl = `http://localhost:3000/wechat?msg_signature=${signature}&timestamp=${timestamp}&nonce=${nonce}&echostr=${encodeURIComponent(encryptedEchostr)}`;
  console.log('\n测试URL:', testUrl);
  
  return testUrl;
}

// 运行测试
const testUrl = testURLValidation();
console.log('\n请手动访问上述URL进行测试，或使用以下命令:');
console.log(`curl -X GET "${testUrl}"`);
