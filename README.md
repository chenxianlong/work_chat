# 企业微信消息接收服务器

这是一个基于 Node.js + Express 的企业微信消息接收服务器，实现了URL验证和消息接收功能。

## 项目结构

```
work_chat/
├── package.json          # 项目配置和依赖
├── config.js             # 企业微信配置信息
├── app.js                # 主应用入口
├── routes/
│   └── wechat.js         # 企业微信路由处理
├── utils/
│   └── crypto.js         # 加密解密工具函数
└── README.md             # 项目说明文档
```

## 配置信息

### 企业微信配置
- **企业ID**: wx85fc4916842bb0d4
- **应用ID**: 1000097
- **应用Secret**: erK80cuwAkD4U6clnjA91oF7G5_0VzMdik5A9vFEsSk
- **Token**: zcSsI8UBxnkn1wHPdK2EFDE
- **EncodingAESKey**: 2lRNMrsDNgDP9taC3e6XgsKXcP7jfgmwn38tt1C25lh

### 服务器配置
- **域名**: aigc.dgcu.edu.cn
- **端口**: 80
- **回调URL**: http://aigc.dgcu.edu.cn/wechat

## 安装和运行

### 1. 安装依赖
```bash
npm install
```

### 2. 启动服务器
```bash
npm start
```

或者使用开发模式（需要安装 nodemon）：
```bash
npm run dev
```

### 3. 服务器启动后
服务器将在 http://localhost:80 启动，提供以下接口：
- **根路径**: http://localhost:80
- **URL验证**: http://localhost:80/wechat (GET)
- **消息接收**: http://localhost:80/wechat (POST)
- **健康检查**: http://localhost:80/health

## 企业微信后台配置

在企业微信管理后台，进入应用管理，选择您的应用，配置接收消息：

1. **URL**: `http://aigc.dgcu.edu.cn/wechat`
2. **Token**: `zcSsI8UBxnkn1wHPdK2EFDE`
3. **EncodingAESKey**: `2lRNMrsDNgDP9taC3e6XgsKXcP7jfgmwn38tt1C25lh`
4. **消息加解密方式**: 选择安全模式

## 功能说明

### URL验证
当企业微信首次配置回调URL时，会发送验证请求：
- 接收 GET 请求，包含 msg_signature、timestamp、nonce、echostr 参数
- 验证签名有效性
- 解密 echostr 并返回

### 消息接收
接收企业微信推送的各种消息：
- **文本消息**: 自动回复收到的文本内容
- **图片消息**: 回复确认信息
- **语音消息**: 回复确认信息
- **视频消息**: 回复确认信息
- **事件消息**: 处理关注/取消关注等事件

### 安全机制
- SHA1 签名验证
- AES-256-CBC 消息加密解密
- 企业ID验证

## 部署说明

### 生产环境部署
1. 确保服务器端口 80 可访问（需要管理员权限）
2. 配置防火墙规则
3. 使用 PM2 或类似工具进行进程管理
4. 配置 HTTPS（推荐）

### 使用 PM2 部署
```bash
npm install -g pm2
pm2 start app.js --name "work-chat-server"
pm2 save
pm2 startup
```

### 注意事项
- 在Windows上使用80端口需要管理员权限
- 如果80端口被占用，可以修改config.js中的端口配置
- 建议在生产环境中使用反向代理（如Nginx）

## 测试

### 本地测试
1. 以管理员身份启动服务器
2. 访问 http://localhost:80 查看服务器状态
3. 访问 http://localhost:80/health 检查健康状态

### URL验证测试
企业微信会自动发送验证请求，检查服务器日志确认验证是否成功。

### 消息接收测试
在企业微信中向应用发送消息，查看服务器日志和回复情况。

## 日志说明

服务器会输出详细的日志信息：
- 请求时间和方法
- 请求参数
- 消息处理过程
- 错误信息

## 故障排除

### 常见问题
1. **URL验证失败**: 检查 Token 和 EncodingAESKey 配置
2. **消息接收失败**: 检查签名验证和加密解密逻辑
3. **网络连接问题**: 检查防火墙和端口配置

### 调试建议
1. 查看服务器控制台日志
2. 使用 curl 或 Postman 测试接口
3. 检查企业微信后台配置

## 技术支持

如有问题，请检查：
1. Node.js 版本（建议 v14+）
2. 依赖包是否正确安装
3. 企业微信配置是否正确
4. 网络连接是否正常
