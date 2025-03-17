# KenAi - 基于 DeepSeek 的智能助手

KenAi 是一个使用 DeepSeek API 构建的网页版聊天机器人，提供智能对话服务。

## 功能特点

- 基于 DeepSeek 模型的智能对话
- 支持 Markdown 格式的回复，包括代码高亮
- 多对话管理，可以创建和切换不同的对话
- 本地保存对话历史
- 可自定义 API 密钥和模型选择
- 响应式设计，适配不同设备

## 使用方法

1. 克隆或下载本仓库
2. 在浏览器中打开 `index.html` 文件
3. 在设置中配置你的 DeepSeek API 密钥
4. 开始与 KenAi 对话

## 配置说明

在使用前，你需要：

1. 获取 DeepSeek API 密钥
2. 在应用设置中填入你的 API 密钥
3. 选择合适的模型（DeepSeek Chat 或 DeepSeek Coder）

## 注意事项

- 本应用需要有效的 DeepSeek API 密钥才能正常工作
- 所有对话数据仅保存在本地浏览器中，不会上传到服务器
- API 调用会产生费用，请参考 DeepSeek 的定价策略

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Marked.js (Markdown 渲染)
- Highlight.js (代码高亮)
- Font Awesome (图标) 