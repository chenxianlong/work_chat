const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const wechatRoutes = require('./routes/wechat');

// 创建Express应用
const app = express();

// 中间件配置
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text({ type: 'application/xml' }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Query:', req.query);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// 路由配置
app.use('/', wechatRoutes);

// 根路径
app.get('/', (req, res) => {
  res.send(`
    <h1>企业微信消息接收服务器</h1>
    <p>服务器正在运行中...</p>
    <p>配置信息：</p>
    <ul>
      <li>企业ID: ${config.corpId}</li>
      <li>应用ID: ${config.agentId}</li>
      <li>端口: ${config.port}</li>
    </ul>
    <p>URL验证接口: <code>GET /wechat</code></p>
    <p>消息接收接口: <code>POST /wechat</code></p>
  `);
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).send('页面未找到');
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).send('服务器内部错误');
});

// 启动服务器
const server = app.listen(config.port, () => {
  console.log('='.repeat(50));
  console.log('企业微信消息接收服务器已启动');
  console.log('='.repeat(50));
  console.log(`服务器地址: http://localhost:${config.port}`);
  console.log(`URL验证接口: http://localhost:${config.port}/wechat`);
  console.log(`健康检查: http://localhost:${config.port}/health`);
  console.log('='.repeat(50));
  console.log('企业微信配置信息:');
  console.log(`企业ID: ${config.corpId}`);
  console.log(`应用ID: ${config.agentId}`);
  console.log(`Token: ${config.token}`);
  console.log('='.repeat(50));
  console.log('请确保在企业微信后台配置以下信息:');
  console.log(`URL: http://your-domain.com:${config.port}/wechat`);
  console.log(`Token: ${config.token}`);
  console.log(`EncodingAESKey: ${config.encodingAESKey}`);
  console.log('='.repeat(50));
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

module.exports = app;
