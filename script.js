document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 加载完成，开始初始化...');
    
    const loginContainer = document.getElementById('loginContainer');
    const appContainer = document.getElementById('appContainer');
    const loginBtn = document.getElementById('loginBtn');
    const passwordInput = document.getElementById('password');
    
    // 设置密码
    const correctPassword = 'kenai160325';
    
    // 检查是否已登录
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        console.log('用户已登录，初始化应用...');
        loginContainer.style.display = 'none';
        appContainer.style.display = 'flex';
        // 确保在已登录状态下初始化应用
        setTimeout(() => {
            initializeApp();
        }, 100);
    }
    
    // 添加登录事件监听
    loginBtn.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    
    // 处理登录
    function handleLogin() {
        const password = passwordInput.value;
        
        // 移除可能存在的错误提示
        const existingError = document.querySelector('.login-error');
        if (existingError) {
            existingError.remove();
        }
        
        if (password === correctPassword) {
            // 保存登录状态
            localStorage.setItem('isLoggedIn', 'true');
            loginContainer.style.display = 'none';
            appContainer.style.display = 'flex';
            // 登录成功后初始化应用
            setTimeout(() => {
                initializeApp();
            }, 100);
        } else {
            // 显示错误信息
            const errorDiv = document.createElement('div');
            errorDiv.className = 'login-error';
            errorDiv.textContent = 'Incorrect password, please try again';
            passwordInput.parentNode.insertBefore(errorDiv, passwordInput.nextSibling);
            
            // 清空密码输入框
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
    
    // DOM 元素
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    const chatHistory = document.getElementById('chatHistory');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeModalBtn = document.querySelector('.close');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const apiKeyInput = document.getElementById('apiKey');
    const apiBaseUrlInput = document.getElementById('apiBaseUrl');
    const modelSelect = document.getElementById('modelSelect');
    const languageSelect = document.getElementById('languageSelect');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const promptButtons = document.querySelectorAll('.prompt-btn');
    const clearAllChatsBtn = document.getElementById('clearAllChats');

    console.log('DOM 元素已获取');
    console.log('示例提示按钮数量:', promptButtons.length);

    // 确保所有元素都存在
    if (!chatContainer || !userInput || !sendBtn || !newChatBtn || !chatHistory || 
        !settingsBtn || !settingsModal || !closeModalBtn || !saveSettingsBtn || 
        !apiKeyInput || !modelSelect || !welcomeMessage) {
        console.error('Some DOM elements are missing!');
        return;
    }

    // 多语言支持
    const translations = {
        zh: {
            newChat: '开启新对话',
            settings: '设置',
            today: '今天',
            clearAll: '清空所有聊天',
            sendMessage: '给 KenAi 发送消息',
            settingsTitle: '设置',
            apiKeyLabel: 'KenAi API 密钥',
            apiKeyPlaceholder: '输入你的 KenAi API 密钥',
            modelSelectLabel: '模型选择',
            apiBaseUrlLabel: 'API 基础 URL',
            apiBaseUrlPlaceholder: 'API 基础 URL',
            apiBaseUrlHint: '默认使用 DeepSeek API: https://api.deepseek.com/v1',
            languageSelectLabel: '语言 / Language',
            saveSettings: '保存设置',
            welcomeTitle: '我是 KenAi，很高兴见到你！',
            welcomeDesc: '我可以帮你写代码、读文件、写作各种创意内容，请把你的任务交给我吧～',
            examplePromptsTitle: '你可以尝试问我：',
            examplePrompt1: '解释量子计算的基本原理',
            examplePrompt2: '帮我写一个简单的Python爬虫',
            examplePrompt3: '推荐几本科幻小说',
            examplePrompt4: '如何提高英语口语水平',
            deleteChat: '删除对话',
            confirmDelete: '确定要删除这个对话吗？此操作无法撤销。',
            confirmClearAll: '确定要删除所有对话吗？此操作无法撤销。',
            cancel: '取消',
            confirm: '确定',
            apiKeyRequired: '请先在设置中配置 KenAi API 密钥',
            errorPrefix: '请求失败: ',
            thinking: '正在思考...',
            version: 'KenAi v1.0'
        },
        en: {
            newChat: 'New Chat',
            settings: 'Settings',
            today: 'Today',
            clearAll: 'Clear All Chats',
            sendMessage: 'Send a message to KenAi',
            settingsTitle: 'Settings',
            apiKeyLabel: 'KenAi API Key',
            apiKeyPlaceholder: 'Enter your KenAi API key',
            modelSelectLabel: 'Model Selection',
            apiBaseUrlLabel: 'API Base URL',
            apiBaseUrlPlaceholder: 'API Base URL',
            apiBaseUrlHint: 'Default: DeepSeek API: https://api.deepseek.com/v1',
            languageSelectLabel: 'Language / 语言',
            saveSettings: 'Save Settings',
            welcomeTitle: 'I am KenAi, nice to meet you!',
            welcomeDesc: 'I can help you write code, read files, create content, and more. What can I help you with today?',
            examplePromptsTitle: 'You can try asking me:',
            examplePrompt1: 'Explain the basic principles of quantum computing',
            examplePrompt2: 'Help me write a simple Python web scraper',
            examplePrompt3: 'Recommend some science fiction novels',
            examplePrompt4: 'How to improve my English speaking skills',
            deleteChat: 'Delete Chat',
            confirmDelete: 'Are you sure you want to delete this chat? This action cannot be undone.',
            confirmClearAll: 'Are you sure you want to delete all chats? This action cannot be undone.',
            cancel: 'Cancel',
            confirm: 'Confirm',
            apiKeyRequired: 'Please configure your KenAi API key in settings first',
            errorPrefix: 'Request failed: ',
            thinking: 'Thinking...',
            version: 'KenAi v1.0'
        }
    };

    // 状态变量
    let currentChatId = generateId();
    let conversations = {};
    let settings = {
        apiKey: localStorage.getItem('apiKey') || 'sk-9e6382d54ac645f691bc55191e7ac0e2',
        apiBaseUrl: localStorage.getItem('apiBaseUrl') || 'https://api.deepseek.com/v1',
        model: localStorage.getItem('model') || 'deepseek-chat',
        language: localStorage.getItem('language') || 'zh'
    };
    let isWaitingForResponse = false;
    let currentLanguage = settings.language;

    // 初始化应用
    function initializeApp() {
        // 加载设置和对话
        loadSettings();
        loadConversations();
        
        // 绑定事件监听器
        bindEventListeners();
        
        // 更新UI
        updateUILanguage();
        updateChatHistory();
        
        // 如果没有对话，创建新对话
        if (Object.keys(conversations).length === 0) {
            createNewChat();
        } else {
            // 加载最近的对话
            const chatIds = Object.keys(conversations).sort((a, b) => {
                return (conversations[b].createdAt || 0) - (conversations[a].createdAt || 0);
            });
            loadChat(chatIds[0]);
        }
    }

    // 绑定所有事件监听器
    function bindEventListeners() {
        // 输入框事件
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        userInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            if (this.scrollHeight < 50) {
                this.style.height = '50px';
            }
            if (this.scrollHeight > 200) {
                this.style.height = '200px';
                this.style.overflowY = 'auto';
            } else {
                this.style.overflowY = 'hidden';
            }
        });

        // 按钮事件
        sendBtn.addEventListener('click', sendMessage);
        newChatBtn.addEventListener('click', createNewChat);
        settingsBtn.addEventListener('click', openSettings);
        closeModalBtn.addEventListener('click', closeSettings);
        saveSettingsBtn.addEventListener('click', saveSettings);
        
        if (clearAllChatsBtn) {
            clearAllChatsBtn.addEventListener('click', confirmClearAllChats);
        }

        // 语言切换
        if (languageSelect) {
            languageSelect.addEventListener('change', function() {
                currentLanguage = this.value;
                updateUILanguage();
            });
        }

        // 点击模态框外部关闭
        window.onclick = function(event) {
            if (event.target === settingsModal) {
                closeSettings();
            }
        };

        // 绑定示例提示按钮
        bindPromptButtons();
    }

    // 绑定示例提示按钮
    function bindPromptButtons() {
        const promptBtns = document.querySelectorAll('.prompt-btn');
        promptBtns.forEach(button => {
            button.addEventListener('click', () => {
                const promptText = button.textContent.trim();
                if (userInput) {
                    userInput.value = promptText;
                    userInput.style.height = 'auto';
                    userInput.style.height = userInput.scrollHeight + 'px';
                    sendMessage();
                }
            });
        });
    }

    // 加载设置
    function loadSettings() {
        if (settings.apiKey) {
            apiKeyInput.value = settings.apiKey;
        }
        if (apiBaseUrlInput) {
            apiBaseUrlInput.value = settings.apiBaseUrl;
        }
        modelSelect.value = settings.model;
        languageSelect.value = settings.language;
    }

    // 更新UI语言
    function updateUILanguage() {
        // 更新按钮文本
        newChatBtn.innerHTML = `<i class="fas fa-plus"></i> ${translations[currentLanguage].newChat}`;
        settingsBtn.innerHTML = `<i class="fas fa-cog"></i> ${translations[currentLanguage].settings}`;
        
        // 更新聊天历史标题
        const chatHistoryHeader = document.querySelector('.chat-history-header');
        if (chatHistoryHeader) {
            chatHistoryHeader.childNodes[0].nodeValue = translations[currentLanguage].today;
        }
        
        // 更新清空所有聊天按钮
        if (clearAllChatsBtn) {
            clearAllChatsBtn.title = translations[currentLanguage].clearAll;
        }
        
        // 更新输入框占位符
        userInput.placeholder = translations[currentLanguage].sendMessage;
        
        // 更新设置模态框
        document.getElementById('settingsTitle').textContent = translations[currentLanguage].settingsTitle;
        document.getElementById('apiKeyLabel').textContent = translations[currentLanguage].apiKeyLabel;
        apiKeyInput.placeholder = translations[currentLanguage].apiKeyPlaceholder;
        document.getElementById('modelSelectLabel').textContent = translations[currentLanguage].modelSelectLabel;
        document.getElementById('apiBaseUrlLabel').textContent = translations[currentLanguage].apiBaseUrlLabel;
        apiBaseUrlInput.placeholder = translations[currentLanguage].apiBaseUrlPlaceholder;
        document.getElementById('apiBaseUrlHint').textContent = translations[currentLanguage].apiBaseUrlHint;
        document.getElementById('languageSelectLabel').textContent = translations[currentLanguage].languageSelectLabel;
        saveSettingsBtn.textContent = translations[currentLanguage].saveSettings;
        
        // 更新欢迎消息
        const welcomeTitle = welcomeMessage.querySelector('h2');
        if (welcomeTitle) {
            welcomeTitle.textContent = translations[currentLanguage].welcomeTitle;
        }
        
        const welcomeDesc = welcomeMessage.querySelector('p');
        if (welcomeDesc) {
            welcomeDesc.textContent = translations[currentLanguage].welcomeDesc;
        }
        
        // 更新示例提示
        const examplePromptsTitle = welcomeMessage.querySelector('h3');
        if (examplePromptsTitle) {
            examplePromptsTitle.textContent = translations[currentLanguage].examplePromptsTitle;
        }
        
        // 更新示例提示按钮
        const promptBtns = welcomeMessage.querySelectorAll('.prompt-btn');
        if (promptBtns.length >= 4) {
            promptBtns[0].textContent = translations[currentLanguage].examplePrompt1;
            promptBtns[1].textContent = translations[currentLanguage].examplePrompt2;
            promptBtns[2].textContent = translations[currentLanguage].examplePrompt3;
            promptBtns[3].textContent = translations[currentLanguage].examplePrompt4;
        }
        
        // 更新版本信息
        const versionInfo = document.querySelector('.app-version');
        if (versionInfo) {
            versionInfo.textContent = translations[currentLanguage].version;
        }
    }

    // 创建新对话
    function createNewChat() {
        // 生成新的聊天ID
        currentChatId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // 初始化新的对话
        conversations[currentChatId] = {
            messages: [],
            title: translations[currentLanguage].newChat,
            createdAt: Date.now(),
            id: currentChatId
        };
        
        // 清空消息容器
        chatContainer.innerHTML = '';
        
        // 重新创建并显示欢迎消息
        chatContainer.innerHTML = `
            <div class="welcome-message" id="welcomeMessage">
                <div class="welcome-logo">
                    <div class="welcome-icon">K</div>
                </div>
                <h2>${translations[currentLanguage].welcomeTitle}</h2>
                <p>${translations[currentLanguage].welcomeDesc}</p>
                <div class="example-prompts">
                    <h3>${translations[currentLanguage].examplePromptsTitle}</h3>
                    <div class="prompt-buttons">
                        <button class="prompt-btn">${translations[currentLanguage].examplePrompt1}</button>
                        <button class="prompt-btn">${translations[currentLanguage].examplePrompt2}</button>
                        <button class="prompt-btn">${translations[currentLanguage].examplePrompt3}</button>
                        <button class="prompt-btn">${translations[currentLanguage].examplePrompt4}</button>
                    </div>
                </div>
            </div>
        `;
        
        // 显示欢迎消息
        document.body.classList.remove('hide-welcome');
        
        // 重新绑定示例提示按钮事件
        bindPromptButtons();
        
        // 重置输入框
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // 更新聊天历史
        updateChatHistory();
        saveConversations();
        
        // 启用输入和发送
        userInput.disabled = false;
        sendBtn.disabled = false;
        isWaitingForResponse = false;
    }

    // 发送消息
    function sendMessage() {
        const message = userInput.value.trim();
        if (!message || isWaitingForResponse) return;
        
        // 检查API密钥
        if (!settings.apiKey) {
            alert(translations[currentLanguage].apiKeyRequired);
            openSettings();
            return;
        }
        
        // 立即隐藏欢迎消息
        document.body.classList.add('hide-welcome');
        
        // 如果当前没有活动的聊天ID，创建一个新的
        if (!currentChatId) {
            currentChatId = 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            conversations[currentChatId] = { 
                messages: [],
                title: translations[currentLanguage].newChat,
                createdAt: Date.now(),
                id: currentChatId
            };
            // 更新聊天历史，新创建的对话会显示在侧边栏
            updateChatHistory();
        }
        
        // 添加用户消息
        let messageGroup = document.createElement('div');
        messageGroup.className = 'message-group';
        chatContainer.appendChild(messageGroup);
        
        const userMessageElement = createMessageElement('user', message);
        messageGroup.appendChild(userMessageElement);
        
        // 保存用户消息到对话历史
        conversations[currentChatId].messages.push({
            role: 'user',
            content: message
        });
        
        // 如果这是第一条消息，更新对话标题
        if (conversations[currentChatId].messages.length === 1) {
            conversations[currentChatId].title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
            updateChatHistory();
        }
        
        saveConversations();
        
        // 清空输入框并调整高度
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // 滚动到底部
        scrollToBottom();
        
        // 添加"正在思考"消息
        const thinkingId = addThinkingMessage(messageGroup);
        
        // 设置等待状态
        isWaitingForResponse = true;
        sendBtn.disabled = true;
        
        // 准备请求数据
        const requestData = {
            model: settings.model,
            messages: conversations[currentChatId].messages,
            temperature: 0.7,
            max_tokens: 2000
        };
        
        // 发送请求到API
        fetch(`${settings.apiBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.apiKey}`
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(`API错误: ${err.error?.message || response.statusText}`);
                });
            }
            return response.json();
        })
        .then(data => {
            // 移除"正在思考"消息
            removeThinkingMessage(thinkingId);
            
            // 获取AI回复
            const aiResponse = data.choices[0].message.content;
            
            // 添加AI回复
            const aiMessageElement = createMessageElement('ai', aiResponse);
            messageGroup.appendChild(aiMessageElement);
            
            // 保存AI回复到对话历史
            conversations[currentChatId].messages.push({
                role: 'assistant',
                content: aiResponse
            });
            saveConversations();
            
            // 更新聊天历史
            updateChatHistory();
            
            // 滚动到底部
            scrollToBottom();
        })
        .catch(error => {
            console.error('Error:', error);
            
            // 移除"正在思考"消息
            removeThinkingMessage(thinkingId);
            
            // 添加错误消息
            addErrorMessage(messageGroup, `请求失败: ${error.message}`);
        })
        .finally(() => {
            // 重置等待状态
            isWaitingForResponse = false;
            sendBtn.disabled = false;
        });
    }

    // 创建消息元素
    function createMessageElement(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = `avatar ${role}-avatar`;
        avatar.textContent = role === 'user' ? '' : 'K';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // 确保 marked 和 hljs 已加载
        if (typeof marked !== 'undefined') {
            // 配置 marked 以使用 highlight.js
            marked.setOptions({
                highlight: function(code, lang) {
                    if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (e) {
                            console.error('代码高亮失败:', e);
                        }
                    }
                    return code;
                },
                breaks: true,      // 启用换行符转换为 <br>
                gfm: true,         // 启用 GitHub 风格的 Markdown
                headerIds: false,  // 禁用标题 ID 以避免冲突
                mangle: false,     // 禁用 @ 提及和 URL 的转义
                emoji: true        // 启用表情符号支持
            });
            
            try {
                // 移除内容首尾的空白字符
                content = content.trim();
                // 解析 Markdown 并保留表情符号
                let parsedContent = marked.parse(content);
                // 移除末尾的换行符
                parsedContent = parsedContent.replace(/\n$/, '');
                // 移除末尾的空段落（如果存在）
                parsedContent = parsedContent.replace(/<p>\s*<\/p>$/, '');
                messageContent.innerHTML = parsedContent;
                
                // 为代码块添加样式
                if (typeof hljs !== 'undefined') {
                    messageContent.querySelectorAll('pre code').forEach(block => {
                        try {
                            hljs.highlightElement(block);
                        } catch (e) {
                            console.error('代码高亮失败:', e);
                        }
                    });
                }
            } catch (e) {
                console.error('Markdown 解析失败:', e);
                messageContent.textContent = content;
            }
        } else {
            // 如果 marked 未加载，至少处理换行
            messageContent.innerHTML = content.trim().replace(/\n/g, '<br>').replace(/<br>$/, '');
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        return messageDiv;
    }

    // 添加"正在思考"消息
    function addThinkingMessage(messageGroup) {
        const id = 'thinking-' + generateId();
        
        // 创建思考消息容器
        const messageDiv = document.createElement('div');
        messageDiv.id = id;
        messageDiv.className = 'message ai-message thinking-message';
        
        // 添加 AI 头像
        const aiAvatar = document.createElement('div');
        aiAvatar.className = 'avatar ai-avatar';
        aiAvatar.textContent = 'K';
        messageDiv.appendChild(aiAvatar);
        
        // 创建消息内容容器
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // 获取当前语言
        const currentLang = localStorage.getItem('language') || 'zh';
        
        // 思考步骤的翻译
        const thinkingSteps = {
            zh: [
                "分析问题并理解用户意图",
                "检索相关知识和信息",
                "组织逻辑结构和论点",
                "生成初步回答",
                "检查回答的准确性和完整性",
                "优化表达方式和语言风格",
                "确保回答符合用户需求",
                "最终确认并输出回答"
            ],
            en: [
                "Analyzing the question and understanding user intent",
                "Retrieving relevant knowledge and information",
                "Organizing logical structure and arguments",
                "Generating initial response",
                "Checking response accuracy and completeness",
                "Optimizing expression and language style",
                "Ensuring response meets user requirements",
                "Final confirmation and output"
            ]
        };
        
        // 添加思考标题
        const thinkingHeader = document.createElement('div');
        thinkingHeader.className = 'thinking-status';
        const thinkingText = currentLang === 'zh' ? '已深度思考' : 'Deep thinking';
        const secondsText = currentLang === 'zh' ? '秒' : 'seconds';
        thinkingHeader.innerHTML = `<i class="fas fa-cog fa-spin"></i> ${thinkingText} (<span class="thinking-time">0</span> ${secondsText})`;
        messageContent.appendChild(thinkingHeader);
        
        // 添加思考过程容器
        const thinkingProcess = document.createElement('div');
        thinkingProcess.className = 'thinking-process';
        
        // 添加思考内容
        const thinkingContent = document.createElement('div');
        thinkingContent.className = 'thinking-content';
        thinkingProcess.appendChild(thinkingContent);
        
        // 添加折叠/展开按钮
        const thinkingToggle = document.createElement('div');
        thinkingToggle.className = 'thinking-toggle';
        const toggleText = currentLang === 'zh' ? '查看思考过程' : 'View thinking process';
        thinkingToggle.innerHTML = `<i class="fas fa-chevron-right"></i> ${toggleText}`;
        thinkingToggle.addEventListener('click', () => {
            thinkingContent.classList.toggle('collapsed');
            thinkingToggle.classList.toggle('collapsed');
            
            if (thinkingContent.classList.contains('collapsed')) {
                thinkingToggle.innerHTML = `<i class="fas fa-chevron-right"></i> ${currentLang === 'zh' ? '查看思考过程' : 'View thinking process'}`;
            } else {
                thinkingToggle.innerHTML = `<i class="fas fa-chevron-down"></i> ${currentLang === 'zh' ? '隐藏思考过程' : 'Hide thinking process'}`;
            }
        });
        
        // 初始状态为折叠
        thinkingContent.classList.add('collapsed');
        thinkingToggle.classList.add('collapsed');
        
        thinkingProcess.appendChild(thinkingToggle);
        messageContent.appendChild(thinkingProcess);
        messageDiv.appendChild(messageContent);
        messageGroup.appendChild(messageDiv);
        
        // 更新思考时间
        let seconds = 0;
        const timeInterval = setInterval(() => {
            seconds++;
            const timeSpan = messageDiv.querySelector('.thinking-time');
            if (timeSpan) {
                timeSpan.textContent = seconds;
            }
        }, 1000);
        
        // 逐步显示思考步骤，随机选择步骤
        let displayedSteps = new Set();
        const steps = thinkingSteps[currentLang];
        const stepInterval = setInterval(() => {
            if (displayedSteps.size < steps.length) {
                // 随机选择一个未显示的步骤
                let availableSteps = steps.filter((_, index) => !displayedSteps.has(index));
                if (availableSteps.length > 0) {
                    let randomStep = availableSteps[Math.floor(Math.random() * availableSteps.length)];
                    let randomIndex = steps.indexOf(randomStep);
                    displayedSteps.add(randomIndex);
                    
                    const stepElement = document.createElement('div');
                    stepElement.className = 'thinking-step';
                    stepElement.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> ${randomStep}`;
                    thinkingContent.appendChild(stepElement);
                }
            } else {
                clearInterval(stepInterval);
            }
        }, 1200);
        
        messageDiv.dataset.timeInterval = timeInterval;
        messageDiv.dataset.stepInterval = stepInterval;
        
        scrollToBottom();
        return id;
    }

    // 移除"正在思考"消息
    function removeThinkingMessage(id) {
        const messageDiv = document.getElementById(id);
        if (messageDiv) {
            clearInterval(messageDiv.dataset.timeInterval);
            clearInterval(messageDiv.dataset.stepInterval);
            messageDiv.remove();
        }
    }

    // 添加 AI 消息函数
    function addAIMessage(messageGroup, content) {
        // 创建 AI 消息元素
        const aiMessageElement = createMessageElement('assistant', content);
        messageGroup.appendChild(aiMessageElement);
        
        // 保存 AI 回复到对话历史
        conversations[currentChatId].messages.push({
            role: 'assistant',
            content: content
        });
        
        // 保存对话并滚动到底部
        saveConversations();
        scrollToBottom();
    }

    // 添加错误消息函数
    function addErrorMessage(messageGroup, errorText) {
        // 创建错误消息元素
        const errorMessage = document.createElement('div');
        errorMessage.className = 'message ai-message error-message';
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar ai-avatar';
        avatar.textContent = 'K';
        // 直接添加内联样式确保应用
        avatar.style.cssText = 'background: linear-gradient(135deg, #0084ff, #0070e0) !important; color: white !important; font-weight: bold !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 50% !important; width: 36px !important; height: 36px !important; flex-shrink: 0 !important; box-shadow: 0 2px 8px rgba(0, 132, 255, 0.2) !important; font-size: 16px !important;';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = `<p class="error-text">${errorText}</p>`;
        
        errorMessage.appendChild(avatar);
        errorMessage.appendChild(messageContent);
        messageGroup.appendChild(errorMessage);
        
        // 滚动到底部
        scrollToBottom();
    }

    // 加载保存的对话
    function loadConversations() {
        const savedConversations = localStorage.getItem('conversations');
        if (savedConversations) {
            try {
                // 解析保存的对话
                const parsed = JSON.parse(savedConversations);
                
                // 检查是否是有效的对象
                if (parsed && typeof parsed === 'object') {
                    // 过滤掉无效的对话
                    const validConversations = {};
                    Object.keys(parsed).forEach(key => {
                        if (parsed[key] && typeof parsed[key] === 'object') {
                            validConversations[key] = parsed[key];
                        }
                    });
                    
                    conversations = validConversations;
                    console.log('已加载保存的对话:', Object.keys(conversations).length);
                } else {
                    console.error('保存的对话格式无效');
                    conversations = {};
                }
            } catch (e) {
                console.error('加载对话失败:', e);
                conversations = {};
                // 清除可能损坏的数据
                localStorage.removeItem('conversations');
            }
        } else {
            console.log('没有找到保存的对话');
            conversations = {};
        }
    }

    // 保存对话到本地存储
    function saveConversations() {
        try {
            // 创建一个副本以避免循环引用
            const conversationsToSave = {};
            
            // 复制每个对话的必要数据
            Object.keys(conversations).forEach(chatId => {
                const chat = conversations[chatId];
                if (!chat) {
                    console.warn('尝试保存空对话:', chatId);
                    return;
                }
                
                conversationsToSave[chatId] = {
                    messages: chat.messages || [],
                    title: chat.title || translations[currentLanguage].newChat,
                    createdAt: chat.createdAt || Date.now(),
                    id: chatId
                };
            });
            
            // 确保保存前没有无效数据
            Object.keys(conversationsToSave).forEach(key => {
                if (!conversationsToSave[key] || !conversationsToSave[key].id) {
                    delete conversationsToSave[key];
                }
            });
            
            localStorage.setItem('conversations', JSON.stringify(conversationsToSave));
            console.log('对话已保存，当前对话数:', Object.keys(conversationsToSave).length);
        } catch (e) {
            console.error('保存对话失败:', e);
            // 如果是存储空间不足，尝试清理一些旧对话
            if (e.name === 'QuotaExceededError') {
                try {
                    // 获取所有对话ID并按时间排序
                    const chatIds = Object.keys(conversations).sort((a, b) => {
                        const timeA = conversations[a].createdAt || 0;
                        const timeB = conversations[b].createdAt || 0;
                        return timeA - timeB; // 最旧的在前面
                    });
                    
                    // 如果有超过10个对话，删除最旧的一半
                    if (chatIds.length > 10) {
                        const toDelete = Math.floor(chatIds.length / 2);
                        for (let i = 0; i < toDelete; i++) {
                            delete conversations[chatIds[i]];
                        }
                        
                        // 重新尝试保存
                        localStorage.setItem('conversations', JSON.stringify(conversations));
                        console.log('已清理旧对话并重新保存');
                    }
                } catch (cleanupError) {
                    console.error('清理旧对话失败:', cleanupError);
                }
            }
        }
    }

    // 更新聊天历史侧边栏
    function updateChatHistory() {
        // 清空当前历史
        chatHistory.innerHTML = '';
        
        // 获取所有对话ID
        const chatIds = Object.keys(conversations);
        
        // 如果没有对话，直接返回
        if (chatIds.length === 0) {
            console.log('没有对话可显示');
            return;
        }
        
        // 按创建时间排序，最新的在前面
        chatIds.sort((a, b) => {
            // 不再将当前对话特殊处理，只按创建时间排序
            const timeA = conversations[a].createdAt || 0;
            const timeB = conversations[b].createdAt || 0;
            return timeB - timeA;
        });
        
        console.log('排序后的对话ID:', chatIds);
        console.log('当前对话ID:', currentChatId);
        
        // 创建并添加每个对话项
        chatIds.forEach(chatId => {
            if (!conversations[chatId]) {
                console.warn('对话不存在:', chatId);
                return;
            }
            
            const chat = conversations[chatId];
            
            // 创建聊天项
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.setAttribute('data-id', chatId);
            
            // 如果是当前对话，添加active类
            if (chatId === currentChatId) {
                chatItem.classList.add('active');
            }
            
            // 创建聊天项容器
            const chatItemContainer = document.createElement('div');
            chatItemContainer.className = 'chat-item-container';
            
            // 创建聊天标题
            const chatTitle = document.createElement('div');
            chatTitle.className = 'chat-title';
            
            // 获取聊天标题
            let title = chat.title || translations[currentLanguage].newChat;
            chatTitle.textContent = title;
            
            // 创建删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-chat-btn';
            deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                confirmDeleteChat(chatId);
            });
            
            // 添加点击事件加载对话
            chatItemContainer.addEventListener('click', () => {
                loadChat(chatId);
            });
            
            // 组装聊天项
            chatItemContainer.appendChild(chatTitle);
            chatItemContainer.appendChild(deleteBtn);
            chatItem.appendChild(chatItemContainer);
            chatHistory.appendChild(chatItem);
        });
        
        console.log('聊天历史更新完成，显示的对话数量:', chatHistory.children.length);
    }

    // 加载对话
    function loadChat(chatId) {
        if (!conversations[chatId]) {
            console.error('未找到对话:', chatId);
            return;
        }
        
        currentChatId = chatId;
        chatContainer.innerHTML = '';
        
        const chat = conversations[chatId];
        
        // 如果没有消息，显示欢迎消息
        if (!chat.messages || chat.messages.length === 0) {
            document.body.classList.remove('hide-welcome');
            chatContainer.innerHTML = `
                <div class="welcome-message" id="welcomeMessage">
                    <div class="welcome-logo">
                        <div class="welcome-icon">K</div>
                    </div>
                    <h2>${translations[currentLanguage].welcomeTitle}</h2>
                    <p>${translations[currentLanguage].welcomeDesc}</p>
                    <div class="example-prompts">
                        <h3>${translations[currentLanguage].examplePromptsTitle}</h3>
                        <div class="prompt-buttons">
                            <button class="prompt-btn">${translations[currentLanguage].examplePrompt1}</button>
                            <button class="prompt-btn">${translations[currentLanguage].examplePrompt2}</button>
                            <button class="prompt-btn">${translations[currentLanguage].examplePrompt3}</button>
                            <button class="prompt-btn">${translations[currentLanguage].examplePrompt4}</button>
                        </div>
                    </div>
                </div>
            `;
            
            // 重新绑定示例提示按钮事件
            bindPromptButtons();
        } else {
            // 如果有消息，隐藏欢迎消息
            document.body.classList.add('hide-welcome');
            
            // 显示现有消息
            let currentMessageGroup = null;
            let lastRole = null;
            
            chat.messages.forEach(message => {
                if (message.role !== lastRole) {
                    currentMessageGroup = document.createElement('div');
                    currentMessageGroup.className = 'message-group';
                    chatContainer.appendChild(currentMessageGroup);
                    lastRole = message.role;
                }
                
                const messageElement = createMessageElement(message.role, message.content);
                if (currentMessageGroup) {
                    currentMessageGroup.appendChild(messageElement);
                }
            });
        }
        
        // 重置输入状态
        userInput.disabled = false;
        sendBtn.disabled = false;
        isWaitingForResponse = false;
        
        // 更新聊天历史
        updateChatHistory();
        
        // 滚动到底部
        scrollToBottom();
    }

    // 打开设置模态框
    function openSettings() {
        settingsModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }

    // 关闭设置模态框
    function closeSettings() {
        settingsModal.style.display = 'none';
        document.body.style.overflow = ''; // 恢复背景滚动
    }

    // 保存设置
    function saveSettings() {
        settings.apiKey = apiKeyInput.value.trim();
        settings.model = modelSelect.value;
        settings.language = languageSelect.value;
        
        if (apiBaseUrlInput) {
            settings.apiBaseUrl = apiBaseUrlInput.value.trim() || 'https://api.deepseek.com/v1';
        }
        
        localStorage.setItem('apiKey', settings.apiKey);
        localStorage.setItem('model', settings.model);
        localStorage.setItem('apiBaseUrl', settings.apiBaseUrl);
        localStorage.setItem('language', settings.language);
        
        // 更新当前语言
        currentLanguage = settings.language;
        
        // 更新UI语言
        updateUILanguage();
        
        closeSettings();
    }

    // 滚动到底部
    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // 生成唯一ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    // 显示确认对话框
    function showConfirmDialog(title, message, confirmCallback) {
        // 移除可能存在的旧对话框
        const existingOverlay = document.querySelector('.overlay');
        const existingDialog = document.querySelector('.confirm-dialog');
        
        if (existingOverlay) {
            document.body.removeChild(existingOverlay);
        }
        
        if (existingDialog) {
            document.body.removeChild(existingDialog);
        }
        
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
        
        // 创建确认对话框
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        dialog.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="confirm-dialog-buttons">
                <button class="cancel-btn">${translations[currentLanguage].cancel}</button>
                <button class="confirm-btn">${translations[currentLanguage].confirm}</button>
            </div>
        `;
        document.body.appendChild(dialog);
        
        // 添加按钮事件
        const cancelBtn = dialog.querySelector('.cancel-btn');
        const confirmBtn = dialog.querySelector('.confirm-btn');
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            document.body.removeChild(dialog);
        });
        
        confirmBtn.addEventListener('click', () => {
            confirmCallback();
            document.body.removeChild(overlay);
            document.body.removeChild(dialog);
        });
        
        // 添加点击遮罩层关闭对话框
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                document.body.removeChild(dialog);
            }
        });
        
        // 添加键盘事件支持
        document.addEventListener('keydown', function escListener(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.body.removeChild(dialog);
                document.removeEventListener('keydown', escListener);
            }
        });
    }

    // 确认删除对话
    function confirmDeleteChat(chatId) {
        showConfirmDialog(
            translations[currentLanguage].deleteChat, 
            translations[currentLanguage].confirmDelete, 
            () => deleteChat(chatId)
        );
    }
    
    // 删除单个聊天
    function deleteChat(chatId) {
        // 删除对话
        delete conversations[chatId];
        saveConversations();
        
        // 如果删除的是当前对话，加载另一个对话或创建新对话
        if (chatId === currentChatId) {
            const remainingChats = Object.keys(conversations);
            if (remainingChats.length > 0) {
                loadChat(remainingChats[0]);
            } else {
                createNewChat();
            }
        }
        
        updateChatHistory();
    }
    
    // 确认清空所有聊天
    function confirmClearAllChats() {
        showConfirmDialog(
            translations[currentLanguage].clearAll, 
            translations[currentLanguage].confirmClearAll, 
            clearAllChats
        );
    }
    
    // 清空所有聊天
    function clearAllChats() {
        conversations = {};
        localStorage.removeItem('conversations');
        createNewChat();
        updateChatHistory();
    }

    // 初始化应用
    initializeApp();
}); 