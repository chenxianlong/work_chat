# 企业微信用户账号ID打印功能

## 功能概述

已成功为企业微信消息接收服务器添加了用户账号ID打印功能。当用户在企业微信聊天窗口发送消息时，服务器会自动打印出发送消息用户的账号ID。

## 已实现的功能

### 1. 用户账号ID打印
- **位置**: `routes/wechat.js` 第 58-65 行
- **功能**: 当接收到企业微信消息时，会在控制台打印：
  - 用户账号ID (`FromUserName`)
  - 消息类型 (`MsgType`)
  - 消息时间
  - 格式化的分隔线便于识别

### 2. 签名验证修复
- **修复内容**: 
  - 修正了 `utils/crypto.js` 中的签名验证算法
  - 区分URL验证和消息接收的签名计算方式
  - 消息接收时包含加密内容进行签名验证

### 3. 服务器配置
- **端口**: 80 (标准HTTP端口)
- **URL验证接口**: `GET /wechat`
- **消息接收接口**: `POST /wechat`
- **健康检查**: `GET /health`

## 使用方法

### 1. 启动服务器
```bash
node app.js
```

### 2. 企业微信后台配置
在企业微信管理后台配置应用回调URL：
- **URL**: `http://your-domain.com/wechat`
- **Token**: `zcSsI8UBxnkn1wHPdK2EFDE`
- **EncodingAESKey**: `2lRNMrsDNgDP9taC3e6XgsKXcP7jfgmwn38tt1C25lh`

### 3. 查看用户ID
当用户在企业微信中发送消息时，控制台会显示类似以下信息：
```
==================================================
收到用户消息 - 用户账号ID: user_123456789
消息类型: text
消息时间: 2025-11-14T09:30:00.000Z
==================================================
```

## 测试功能

项目包含测试脚本用于验证功能：

### 1. 生成测试消息
```bash
node test_message.js
```

### 2. 发送测试请求
```bash
curl -X POST -H "Content-Type: application/xml" -d @test_request.xml "http://localhost:80/wechat?msg_signature=xxx&timestamp=xxx&nonce=xxx"
```

## 文件结构

```
work_chat/
├── app.js                 # 主应用文件
├── config.js             # 配置文件
├── routes/wechat.js       # 企业微信路由处理
├── utils/crypto.js       # 加密解密工具
├── test_message.js       # 测试消息生成脚本
├── test_request.xml      # 测试请求XML文件
└── USER_ID_PRINT_FEATURE.md  # 本说明文档
```

## 注意事项

1. **端口权限**: 使用80端口需要管理员权限
2. **防火墙**: 确保服务器防火墙允许80端口的入站连接
3. **域名配置**: 生产环境需要配置域名和SSL证书
4. **企业微信配置**: 确保企业微信后台的Token和EncodingAESKey与服务器配置一致

## 功能验证

服务器启动后，可以通过以下方式验证功能：

1. **URL验证**: 访问 `http://localhost:80/wechat?msg_signature=xxx&timestamp=xxx&nonce=xxx&echostr=xxx`
2. **健康检查**: 访问 `http://localhost:80/health`
3. **消息测试**: 使用测试脚本或直接在企业微信中发送消息

## 扩展功能

当前实现为基础的用户ID打印功能，可以在此基础上扩展：
- 用户消息日志记录
- 用户行为分析
- 自动回复功能
- 消息统计等

## 技术支持

如有问题，请检查：
1. 服务器是否正常启动
2. 端口是否被占用
3. 企业微信配置是否正确
4. 网络连接是否正常
