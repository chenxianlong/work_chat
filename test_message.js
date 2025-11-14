const crypto = require('crypto');
const { encryptAES } = require('./utils/crypto');
const config = require('./config');

// 模拟企业微信消息格式
const testMessage = `
<xml>
  <ToUserName><![CDATA[corp]]></ToUserName>
  <FromUserName><![CDATA[test_user_12345]]></FromUserName>
  <CreateTime>1234567890</CreateTime>
  <MsgType><![CDATA[text]]></MsgType>
  <Content><![CDATA[这是一条测试消息]]></Content>
  <MsgId>1234567890123456</MsgId>
  <AgentID>1000097</AgentID>
</xml>
`.trim();

console.log('测试消息内容:');
console.log(testMessage);
console.log('\n' + '='.repeat(50));

// 加密消息
try {
  const encryptedMsg = encryptAES(testMessage, config.corpId, config.encodingAESKey);
  console.log('加密后的消息:', encryptedMsg);
  
  // 生成签名
  const timestamp = Date.now().toString();
  const nonce = Math.random().toString(36).substr(2, 15);
  const { getSignature } = require('./utils/crypto');
  const signature = getSignature(config.token, timestamp, nonce);
  
  console.log('\n生成的请求参数:');
  console.log('timestamp:', timestamp);
  console.log('nonce:', nonce);
  console.log('signature:', signature);
  
  // 构造完整的XML请求
  const requestXml = `
<xml>
  <Encrypt><![CDATA[${encryptedMsg}]]></Encrypt>
  <MsgSignature><![CDATA[${signature}]]></MsgSignature>
  <TimeStamp>${timestamp}</TimeStamp>
  <Nonce><![CDATA[${nonce}]]></Nonce>
</xml>
  `.trim();
  
  console.log('\n完整的请求XML:');
  console.log(requestXml);
  
  console.log('\n' + '='.repeat(50));
  console.log('测试完成！现在可以使用以下命令测试消息接收:');
  console.log(`curl -X POST -H "Content-Type: application/xml" -d '${requestXml}' http://localhost:3000/wechat`);
  
} catch (error) {
  console.error('测试失败:', error);
}
