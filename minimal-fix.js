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

// 修复初始化和事件
function fixTouchEvents() {
    console.log('正在修复触摸事件...');
    
    // 检查是否是iPad或其他触摸设备
    const isTablet = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isTablet) {
        console.log('检测到iPad/触摸设备，添加触摸事件修复');
        
        // 修复所有按钮的触摸事件
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(btn => {
            // 移除已有的事件监听器（避免重复）
            btn.removeEventListener('touchstart', touchStartHandler);
            btn.removeEventListener('touchend', touchEndHandler);
            
            // 添加新的触摸事件监听器
            btn.addEventListener('touchstart', touchStartHandler, {passive: false});
            btn.addEventListener('touchend', touchEndHandler, {passive: false});
        });
        
        // 修复自定义选择器
        fixCustomSelectors();
        
        // 添加全局捕获点击事件
        document.addEventListener('click', function(e) {
            console.log('捕获到全局点击事件:', e.target.tagName, e.target.className);
        }, {capture: true});
        
        // 修复iPad上的输入问题
        const userInput = document.getElementById('userInput');
        if (userInput) {
            userInput.addEventListener('focus', function() {
                console.log('输入框获得焦点');
                // 延迟滚动以适应键盘弹出
                setTimeout(() => {
                    window.scrollTo(0, 0);
                    document.body.scrollTop = 0;
                }, 300);
            });
        }
    }
}

// 修复自定义选择器
function fixCustomSelectors() {
    // 监听选择器的动态添加
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // 元素节点
                        // 检查是否是自定义选择器或包含选择器
                        const selectors = node.querySelectorAll ? 
                            node.querySelectorAll('.custom-language-selector, .custom-model-selector') : [];
                        
                        if (node.classList && 
                            (node.classList.contains('custom-language-selector') || 
                             node.classList.contains('custom-model-selector')) || 
                            selectors.length > 0) {
                            
                            console.log('检测到选择器被添加，添加触摸事件');
                            
                            // 为所有选择器头部添加触摸事件
                            const headers = node.querySelectorAll ? 
                                node.querySelectorAll('.language-select-header, .model-select-header') : 
                                document.querySelectorAll('.language-select-header, .model-select-header');
                            
                            headers.forEach(header => {
                                header.removeEventListener('touchend', selectorHeaderTouchHandler);
                                header.addEventListener('touchend', selectorHeaderTouchHandler, {passive: false});
                            });
                            
                            // 为所有选项添加触摸事件
                            const options = node.querySelectorAll ? 
                                node.querySelectorAll('.language-option, .model-option') : 
                                document.querySelectorAll('.language-option, .model-option');
                            
                            options.forEach(option => {
                                option.removeEventListener('touchend', optionTouchHandler);
                                option.addEventListener('touchend', optionTouchHandler, {passive: false});
                            });
                        }
                    }
                });
            }
        });
    });
    
    // 开始观察document.body的变化
    observer.observe(document.body, { childList: true, subtree: true });
}

// 按钮触摸开始处理
function touchStartHandler(e) {
    console.log('触摸开始:', this.id || this.className);
    this.classList.add('touch-active');
}

// 按钮触摸结束处理
function touchEndHandler(e) {
    console.log('触摸结束:', this.id || this.className);
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('touch-active');
    
    // 根据按钮ID触发相应的操作
    if (this.id === 'sendBtn') {
        console.log('触发发送消息');
        if (typeof sendMessage === 'function') {
            sendMessage();
        }
    } else if (this.id === 'newChatBtn') {
        console.log('触发新对话');
        if (typeof createNewChat === 'function') {
            createNewChat();
        }
    } else if (this.id === 'settingsBtn') {
        console.log('触发打开设置');
        if (typeof openSettings === 'function') {
            openSettings();
        }
    } else if (this.id === 'clearAllChats') {
        console.log('触发清空所有对话');
        if (typeof confirmClearAllChats === 'function') {
            confirmClearAllChats();
        }
    } else if (this.classList.contains('prompt-btn')) {
        console.log('触发示例提示');
        const promptText = this.textContent.trim();
        const userInput = document.getElementById('userInput');
        if (userInput && typeof sendMessage === 'function') {
            userInput.value = promptText;
            userInput.style.height = 'auto';
            userInput.style.height = userInput.scrollHeight + 'px';
            sendMessage();
        }
    } else if (this.classList.contains('delete-chat-btn')) {
        console.log('触发删除对话');
        const chatId = this.closest('.chat-item').getAttribute('data-id');
        if (chatId && typeof confirmDeleteChat === 'function') {
            confirmDeleteChat(chatId);
        }
    }
}

// 选择器头部触摸处理
function selectorHeaderTouchHandler(e) {
    console.log('选择器头部触摸:', this.className);
    e.preventDefault();
    e.stopPropagation();
    
    const customSelector = this.closest('.custom-language-selector, .custom-model-selector');
    if (customSelector) {
        // 关闭所有其他选择器
        document.querySelectorAll('.custom-language-selector.open, .custom-model-selector.open').forEach(selector => {
            if (selector !== customSelector) {
                selector.classList.remove('open');
            }
        });
        
        // 切换当前选择器
        customSelector.classList.toggle('open');
    }
}

// 选项触摸处理
function optionTouchHandler(e) {
    console.log('选项触摸:', this.className);
    e.preventDefault();
    e.stopPropagation();
    
    if (this.classList.contains('language-option')) {
        const customSelector = this.closest('.custom-language-selector');
        const headerText = customSelector.querySelector('.language-select-header-text');
        const langSelect = document.getElementById('languageSelect');
        
        // 更新选中状态
        document.querySelectorAll('.language-option').forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        
        // 更新标题文本
        headerText.textContent = this.textContent;
        
        // 更新原生选择器
        if (langSelect) {
            // 找到匹配的选项
            const optionToSelect = [...langSelect.options].find(opt => opt.textContent === this.textContent);
            if (optionToSelect) {
                langSelect.value = optionToSelect.value;
                
                // 触发change事件
                const event = new Event('change');
                langSelect.dispatchEvent(event);
            }
        }
        
        // 关闭选择器
        customSelector.classList.remove('open');
    } else if (this.classList.contains('model-option')) {
        const customSelector = this.closest('.custom-model-selector');
        const headerText = customSelector.querySelector('.model-select-header-text');
        const modelSelect = document.getElementById('modelSelect');
        
        // 更新选中状态
        document.querySelectorAll('.model-option').forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        
        // 更新标题文本
        headerText.textContent = this.textContent;
        
        // 更新原生选择器
        if (modelSelect) {
            // 找到匹配的选项
            const optionToSelect = [...modelSelect.options].find(opt => opt.textContent === this.textContent);
            if (optionToSelect) {
                modelSelect.value = optionToSelect.value;
                
                // 触发change事件
                const event = new Event('change');
                modelSelect.dispatchEvent(event);
            }
        }
        
        // 关闭选择器
        customSelector.classList.remove('open');
    }
}

// 在初始化时调用修复函数
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 已加载完成，应用修复');
    
    // 强制设置初始语言为中文
    localStorage.setItem('language', 'zh');
    
    // 设置API密钥
    if (localStorage.getItem('apiKey')) {
        document.getElementById('apiKey').value = localStorage.getItem('apiKey');
    }
    
    // 设置API基础URL
    if (localStorage.getItem('apiBaseUrl')) {
        document.getElementById('apiBaseUrl').value = localStorage.getItem('apiBaseUrl');
    }
    
    // 设置模型选择
    if (localStorage.getItem('model')) {
        document.getElementById('modelSelect').value = localStorage.getItem('model');
    }
    
    // 设置语言选择
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = 'zh';
    }
    
    // 应用语言设置到UI
    if (typeof updateUILanguage === 'function') {
        updateUILanguage();
    }
    
    // 修复触摸事件
    fixTouchEvents();
    
    // 在页面完全加载后再次修复
    window.addEventListener('load', function() {
        console.log('页面完全加载，应用额外修复');
        setTimeout(fixTouchEvents, 500);
    });
}); 