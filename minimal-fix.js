// 创建 AI 消息函数
function createAIMessage(content) {
    const chatContainer = document.getElementById('chatContainer');
    
    // 创建消息组
    const messageGroup = document.createElement('div');
    messageGroup.className = 'message-group';
    
    // 创建消息
    const message = document.createElement('div');
    message.className = 'message ai-message';
    
    // 创建头像
    const avatar = document.createElement('div');
    avatar.className = 'avatar ai-avatar';
    avatar.textContent = 'K';
    
    // 创建消息内容
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // 使用 marked 解析 Markdown
    if (window.marked) {
        // 配置 marked 以使用 highlight.js
        marked.setOptions({
            highlight: function(code, lang) {
                if (window.hljs && lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(lang, code).value;
                }
                return code;
            }
        });
        
        // 解析 Markdown
        messageContent.innerHTML = marked(content);
        
        // 为代码块添加样式
        const codeBlocks = messageContent.querySelectorAll('pre code');
        if (window.hljs && codeBlocks.length > 0) {
            codeBlocks.forEach(block => {
                hljs.highlightBlock(block);
            });
        }
    } else {
        // 简单处理换行
        messageContent.innerHTML = content.replace(/\n/g, '<br>');
    }
    
    // 组装消息
    message.appendChild(avatar);
    message.appendChild(messageContent);
    messageGroup.appendChild(message);
    
    // 添加到聊天容器
    chatContainer.appendChild(messageGroup);
    
    // 滚动到底部
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 获取翻译函数
function getTranslation(key) {
    const language = localStorage.getItem('language') || 'zh';
    
    const translations = {
        zh: {
            you: '你',
            thinking: '正在思考',
            apiKeyRequired: '请先在设置中配置 KenAi API 密钥',
            apiRequestFailed: 'API 请求失败',
            error: '发生错误',
            settings: '设置',
            apiKey: 'KenAi API 密钥',
            modelSelect: '模型选择',
            apiBaseUrl: 'API 基础 URL',
            apiBaseUrlHint: '默认使用 DeepSeek API: https://api.deepseek.com/v1',
            saveSettings: '保存设置',
            clearAllChats: '清空所有聊天',
            confirmClearAll: '确定要删除所有对话吗？此操作无法撤销。',
            cancel: '取消',
            confirm: '确定',
            newChat: '开启新对话'
        },
        en: {
            you: 'You',
            thinking: 'Thinking',
            apiKeyRequired: 'Please configure your KenAi API key in settings first',
            apiRequestFailed: 'API request failed',
            error: 'Error',
            settings: 'Settings',
            apiKey: 'KenAi API Key',
            modelSelect: 'Model Selection',
            apiBaseUrl: 'API Base URL',
            apiBaseUrlHint: 'Default uses DeepSeek API: https://api.deepseek.com/v1',
            saveSettings: 'Save Settings',
            clearAllChats: 'Clear All Chats',
            confirmClearAll: 'Are you sure you want to delete all conversations? This action cannot be undone.',
            cancel: 'Cancel',
            confirm: 'Confirm',
            newChat: 'New Chat'
        }
    };
    
    return translations[language][key] || key;
}

// 在初始化时调用修复函数
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 已加载完成，应用修复');
    
    // 加载保存的设置
    const apiKey = localStorage.getItem('apiKey');
    const apiBaseUrl = localStorage.getItem('apiBaseUrl');
    const model = localStorage.getItem('model');
    const language = localStorage.getItem('language');
    
    // 设置 API 密钥
    const apiKeyInput = document.getElementById('apiKey');
    if (apiKey && apiKeyInput) {
        apiKeyInput.value = apiKey;
    }
    
    // 设置 API 基础 URL
    const apiBaseUrlInput = document.getElementById('apiBaseUrl');
    if (apiBaseUrl && apiBaseUrlInput) {
        apiBaseUrlInput.value = apiBaseUrl;
    }
    
    // 设置模型
    const modelSelectInput = document.getElementById('modelSelect');
    if (model && modelSelectInput) {
        modelSelectInput.value = model;
    }
    
    // 设置语言
    const languageSelectInput = document.getElementById('languageSelect');
    if (language && languageSelectInput) {
        languageSelectInput.value = language;
    }
}); 