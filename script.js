document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 加载完成，开始初始化...');
    
    // 设置视口高度变量，解决iPad和移动设备上的视口问题
    setViewportHeight();
    
    // 添加视口大小变化监听
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    // DOM 元素
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    const chatHistory = document.getElementById('chatHistory');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeModalBtn = document.querySelector('.close');
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
        !settingsBtn || !settingsModal || !closeModalBtn || 
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
            version: 'KenAi v1.1',
            darkModeLabel: '深色模式',
            darkMode: '深色模式',
            settingsNote: '所有设置更改会自动保存'
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
            version: 'KenAi v1.1',
            darkModeLabel: 'Dark Mode',
            darkMode: 'Dark Mode',
            settingsNote: 'All settings are saved automatically'
        }
    };

    // 状态变量
    let currentChatId = generateId();
    let conversations = {};
    let settings = {
        apiKey: localStorage.getItem('apiKey') || 'sk-9e6382d54ac645f691bc55191e7ac0e2',
        apiBaseUrl: localStorage.getItem('apiBaseUrl') || 'https://api.deepseek.com/v1',
        model: localStorage.getItem('model') || 'deepseek-chat',
        language: localStorage.getItem('language') || 'en',
        darkMode: localStorage.getItem('darkMode') === 'true' || false
    };
    
    // 修改默认语言为中文
    settings.language = 'zh';
    
    // 确保语言设置正确且一致
    localStorage.setItem('language', settings.language);
    
    // 清除可能存在的登录状态
    localStorage.removeItem('isLoggedIn');
    
    let isWaitingForResponse = false;
    let currentLanguage = settings.language;

    // 全局变量，保存监听器函数引用
    let languageClickListener = null;
    let modelClickListener = null;

    // 全局变量，保存全局点击事件的监听器
    let globalClickListener = null;

    // 添加全局点击事件，用于关闭所有选择器
    function setupGlobalClickHandler() {
        document.addEventListener('click', function(event) {
            const selectors = document.querySelectorAll('.custom-language-selector, .custom-model-selector');
            selectors.forEach(selector => {
                if (!selector.contains(event.target)) {
                    selector.classList.remove('open');
                }
            });
        });
    }

    // 直接初始化应用
    initializeApp();

    // 将初始化自定义选择器的调用移动到这个函数中，确保只调用一次
    function initializeApp() {
        // 加载设置和对话
        loadSettings();
        loadConversations();
        
        // 绑定事件监听器
        bindEventListeners();
        
        // 添加全局点击事件处理
        setupGlobalClickHandler();
        
        // 在iPad上增强点击事件
        enhanceTouchEvents();
        
        // 更新UI
        updateUILanguage();
        updateChatHistory();
        
        // 应用深色模式
        applyDarkMode();
        
        // 确保自定义选择器初始化
        if (!document.querySelector('.custom-language-selector')) {
            initCustomLanguageSelector();
        }
        
        if (!document.querySelector('.custom-model-selector')) {
            initCustomModelSelector();
        }
        
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
    
    // 暴露关键函数到全局作用域，以便内联脚本能够访问它们
    window.sendMessage = sendMessage;
    window.createNewChat = createNewChat;
    window.openSettings = openSettings;
    window.closeSettings = closeSettings;
    window.confirmClearAllChats = confirmClearAllChats;
    window.confirmDeleteChat = confirmDeleteChat;
    window.loadChat = loadChat;
    window.initCustomLanguageSelector = initCustomLanguageSelector;
    window.initCustomModelSelector = initCustomModelSelector;
    window.updateCustomLanguageSelector = updateCustomLanguageSelector;
    window.updateCustomModelSelector = updateCustomModelSelector;
    window.applyDarkMode = applyDarkMode;
    window.updateUILanguage = updateUILanguage;
    window.enhanceTouchEvents = enhanceTouchEvents;

    // 增强iPad和触摸设备上的按钮点击事件
    function enhanceTouchEvents() {
        // 检查是否是iPad或其他触摸设备
        const isTablet = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        if (isTablet) {
            console.log('检测到iPad/触摸设备，增强触摸事件');
            
            // 增强所有按钮的触摸事件
            const allButtons = document.querySelectorAll('button');
            allButtons.forEach(btn => {
                // 添加触摸事件
                btn.addEventListener('touchstart', function(e) {
                    console.log('触摸开始:', this.className || this.id);
                    // 添加按下状态的视觉反馈
                    this.classList.add('touch-active');
                }, {passive: true});
                
                btn.addEventListener('touchend', function(e) {
                    console.log('触摸结束:', this.className || this.id);
                    // 移除按下状态
                    this.classList.remove('touch-active');
                    
                    // 阻止默认行为和冒泡，确保不触发多次点击
                    e.preventDefault();
                    
                    // 对于某些按钮，我们需要手动触发它们的点击事件
                    if (this.id === 'sendBtn') {
                        console.log('手动触发发送按钮点击');
                        sendMessage();
                    } else if (this.id === 'newChatBtn') {
                        console.log('手动触发新对话按钮点击');
                        createNewChat();
                    } else if (this.id === 'settingsBtn') {
                        console.log('手动触发设置按钮点击');
                        openSettings();
                    } else if (this.id === 'clearAllChats') {
                        console.log('手动触发清空对话按钮点击');
                        confirmClearAllChats();
                    } else if (this.classList.contains('prompt-btn')) {
                        console.log('手动触发示例提示按钮点击');
                        const promptText = this.textContent.trim();
                        if (userInput) {
                            userInput.value = promptText;
                            userInput.style.height = 'auto';
                            userInput.style.height = userInput.scrollHeight + 'px';
                            sendMessage();
                        }
                    } else if (this.classList.contains('delete-chat-btn')) {
                        console.log('手动触发删除对话按钮点击');
                        const chatId = this.closest('.chat-item').getAttribute('data-id');
                        if (chatId) {
                            confirmDeleteChat(chatId);
                        }
                    }
                }, {passive: false});
            });
            
            // 增强自定义选择器的触摸事件
            document.addEventListener('DOMNodeInserted', function(e) {
                if (e.target && (
                    e.target.classList && (
                        e.target.classList.contains('custom-language-selector') || 
                        e.target.classList.contains('custom-model-selector')
                    ) || 
                    e.target.querySelector && (
                        e.target.querySelector('.custom-language-selector') || 
                        e.target.querySelector('.custom-model-selector')
                    )
                )) {
                    console.log('检测到自定义选择器被添加，增强其触摸事件');
                    
                    // 增强语言选择器头部
                    const langHeaders = document.querySelectorAll('.language-select-header');
                    langHeaders.forEach(header => {
                        header.addEventListener('touchend', function(e) {
                            e.stopPropagation();
                            const customSelector = this.closest('.custom-language-selector');
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
                        }, {passive: false});
                    });
                    
                    // 增强模型选择器头部
                    const modelHeaders = document.querySelectorAll('.model-select-header');
                    modelHeaders.forEach(header => {
                        header.addEventListener('touchend', function(e) {
                            e.stopPropagation();
                            const customSelector = this.closest('.custom-model-selector');
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
                        }, {passive: false});
                    });
                    
                    // 增强语言选项
                    const langOptions = document.querySelectorAll('.language-option');
                    langOptions.forEach(option => {
                        option.addEventListener('touchend', function(e) {
                            e.stopPropagation();
                            const customSelector = this.closest('.custom-language-selector');
                            const headerText = customSelector.querySelector('.language-select-header-text');
                            const langSelect = document.getElementById('languageSelect');
                            
                            // 更新选中状态
                            document.querySelectorAll('.language-option').forEach(opt => opt.classList.remove('selected'));
                            this.classList.add('selected');
                            
                            // 更新标题文本
                            headerText.textContent = this.textContent;
                            
                            // 更新原生选择器的值
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
                        }, {passive: false});
                    });
                    
                    // 增强模型选项
                    const modelOptions = document.querySelectorAll('.model-option');
                    modelOptions.forEach(option => {
                        option.addEventListener('touchend', function(e) {
                            e.stopPropagation();
                            const customSelector = this.closest('.custom-model-selector');
                            const headerText = customSelector.querySelector('.model-select-header-text');
                            const modelSelect = document.getElementById('modelSelect');
                            
                            // 更新选中状态
                            document.querySelectorAll('.model-option').forEach(opt => opt.classList.remove('selected'));
                            this.classList.add('selected');
                            
                            // 更新标题文本
                            headerText.textContent = this.textContent;
                            
                            // 更新原生选择器的值
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
                        }, {passive: false});
                    });
                }
            });
            
            // 修复聊天历史点击
            const chatItems = document.querySelectorAll('.chat-item-container');
            chatItems.forEach(item => {
                item.addEventListener('touchend', function(e) {
                    e.stopPropagation();
                    const chatId = this.closest('.chat-item').getAttribute('data-id');
                    if (chatId) {
                        loadChat(chatId);
                    }
                }, {passive: false});
            });
        }
    }

    // 绑定所有事件监听器
    function bindEventListeners() {
        // 删除侧边栏切换功能
        const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
        if (toggleSidebarBtn) {
            toggleSidebarBtn.style.display = 'none';
        }

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
        
    if (clearAllChatsBtn) {
        clearAllChatsBtn.addEventListener('click', confirmClearAllChats);
    }

        // 语言切换
        if (languageSelect) {
            languageSelect.addEventListener('change', function() {
                currentLanguage = this.value;
                // 语言切换后立即更新UI
                updateUILanguage();
                // 立即保存设置
                localStorage.setItem('language', currentLanguage);
                settings.language = currentLanguage;
                
                // 更新自定义语言选择器
                updateCustomLanguageSelector();
            });
        }
        
        // 模型选择立即生效
        if (modelSelect) {
            modelSelect.addEventListener('change', function() {
                settings.model = this.value;
                // 保存设置到localStorage
                localStorage.setItem('model', settings.model);
                // 更新自定义模型选择器
                updateCustomModelSelector();
            });
        }
        
        // 深色模式切换 - 添加立即生效功能
        const darkModeSwitch = document.getElementById('darkModeSwitch');
        if (darkModeSwitch) {
            darkModeSwitch.addEventListener('change', function() {
                // 切换深色模式后立即生效
                settings.darkMode = this.checked;
                // 应用深色模式
                applyDarkMode();
                // 保存设置到localStorage
                localStorage.setItem('darkMode', settings.darkMode);
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
        
        // 设置深色模式开关状态
        const darkModeSwitch = document.getElementById('darkModeSwitch');
        if (darkModeSwitch) {
            darkModeSwitch.checked = settings.darkMode;
        }
        
        // 应用深色模式
        applyDarkMode();
        
        // 初始化自定义语言选择器
        initCustomLanguageSelector();
        // 初始化自定义模型选择器
        initCustomModelSelector();
    }

    // 初始化自定义语言选择器
    function initCustomLanguageSelector() {
        if (!languageSelect) return;
        
        // 检查是否已经存在自定义选择器，避免重复创建
        if (document.querySelector('.custom-language-selector')) return;
        
        // 使用更精确的选择器，确保获取到正确的select-container
        const languageSelectWrapper = languageSelect.parentElement;
        if (!languageSelectWrapper || !languageSelectWrapper.classList.contains('select-container')) return;
        
        // 创建自定义选择器结构
        const customSelector = document.createElement('div');
        customSelector.className = 'custom-language-selector';
        
        const header = document.createElement('div');
        header.className = 'language-select-header';
        
        const headerText = document.createElement('div');
        headerText.className = 'language-select-header-text';
        
        const arrow = document.createElement('div');
        arrow.className = 'language-select-arrow';
        
        const options = document.createElement('div');
        options.className = 'language-select-options';
        
        // 获取当前选中的语言
        const selectedValue = languageSelect.value;
        const selectedText = [...languageSelect.options].find(option => option.value === selectedValue)?.textContent || selectedValue;
        headerText.textContent = selectedText;
        
        // 添加选项
        [...languageSelect.options].forEach(option => {
            const optionEl = document.createElement('div');
            optionEl.className = 'language-option';
            if (option.value === selectedValue) {
                optionEl.classList.add('selected');
            }
            optionEl.textContent = option.textContent;
            options.appendChild(optionEl);
            
            // 添加点击事件
            optionEl.addEventListener('click', (e) => {
                e.stopPropagation();
                // 更新原生选择器的值
                languageSelect.value = option.value;
                
                // 触发change事件
                const event = new Event('change');
                languageSelect.dispatchEvent(event);
                
                // 更新UI
                headerText.textContent = option.textContent;
                document.querySelectorAll('.language-option').forEach(opt => opt.classList.remove('selected'));
                optionEl.classList.add('selected');
                
                // 关闭选项列表
                customSelector.classList.remove('open');
            });
        });
        
        // 添加点击事件以打开/关闭选项列表
        header.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止冒泡，避免触发全局点击
            
            // 关闭所有已打开的选择器，确保只有一个打开
            document.querySelectorAll('.custom-language-selector.open, .custom-model-selector.open').forEach(selector => {
                if (selector !== customSelector) {
                    selector.classList.remove('open');
                }
            });
            
            // 切换当前选择器
            customSelector.classList.toggle('open');
        });
        
        // 组装选择器
        header.appendChild(headerText);
        header.appendChild(arrow);
        customSelector.appendChild(header);
        customSelector.appendChild(options);
        
        // 添加到DOM
        languageSelectWrapper.insertBefore(customSelector, languageSelect);
    }

    // 初始化自定义模型选择器
    function initCustomModelSelector() {
        if (!modelSelect) return;
        
        // 检查是否已经存在自定义选择器，避免重复创建
        if (document.querySelector('.custom-model-selector')) return;
        
        // 使用更精确的选择器，确保获取到正确的select-container
        const modelSelectWrapper = modelSelect.parentElement;
        if (!modelSelectWrapper || !modelSelectWrapper.classList.contains('select-container')) return;
        
        // 创建自定义选择器结构
        const customSelector = document.createElement('div');
        customSelector.className = 'custom-model-selector';
        
        const header = document.createElement('div');
        header.className = 'model-select-header';
        
        const headerText = document.createElement('div');
        headerText.className = 'model-select-header-text';
        
        const arrow = document.createElement('div');
        arrow.className = 'model-select-arrow';
        
        const options = document.createElement('div');
        options.className = 'model-select-options';
        
        // 获取当前选中的模型
        const selectedValue = modelSelect.value;
        const selectedText = [...modelSelect.options].find(option => option.value === selectedValue)?.textContent || selectedValue;
        headerText.textContent = selectedText;
        
        // 添加选项
        [...modelSelect.options].forEach(option => {
            const optionEl = document.createElement('div');
            optionEl.className = 'model-option';
            if (option.value === selectedValue) {
                optionEl.classList.add('selected');
            }
            optionEl.textContent = option.textContent;
            options.appendChild(optionEl);
            
            // 添加点击事件
            optionEl.addEventListener('click', (e) => {
                e.stopPropagation();
                // 更新原生选择器的值
                modelSelect.value = option.value;
                
                // 触发change事件
                const event = new Event('change');
                modelSelect.dispatchEvent(event);
                
                // 更新UI
                headerText.textContent = option.textContent;
                document.querySelectorAll('.model-option').forEach(opt => opt.classList.remove('selected'));
                optionEl.classList.add('selected');
                
                // 关闭选项列表
                customSelector.classList.remove('open');
            });
        });
        
        // 添加点击事件以打开/关闭选项列表
        header.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止冒泡，避免触发全局点击
            
            // 关闭所有已打开的选择器，确保只有一个打开
            document.querySelectorAll('.custom-language-selector.open, .custom-model-selector.open').forEach(selector => {
                if (selector !== customSelector) {
                    selector.classList.remove('open');
                }
            });
            
            // 切换当前选择器
            customSelector.classList.toggle('open');
        });
        
        // 组装选择器
        header.appendChild(headerText);
        header.appendChild(arrow);
        customSelector.appendChild(header);
        customSelector.appendChild(options);
        
        // 添加到DOM
        modelSelectWrapper.insertBefore(customSelector, modelSelect);
    }

    // 更新自定义语言选择器
    function updateCustomLanguageSelector() {
        const headerText = document.querySelector('.language-select-header-text');
        if (!headerText) return;
        
        const selectedOption = [...languageSelect.options].find(option => option.value === languageSelect.value);
        if (selectedOption) {
            headerText.textContent = selectedOption.textContent;
        }
        
        const options = document.querySelectorAll('.language-option');
        options.forEach(option => {
            const optionText = option.textContent;
            if (optionText === selectedOption.textContent) {
                option.classList.add('selected');
        } else {
                option.classList.remove('selected');
            }
        });
    }

    // 更新自定义模型选择器
    function updateCustomModelSelector() {
        const headerText = document.querySelector('.model-select-header-text');
        if (!headerText) return;
        
        const selectedOption = [...modelSelect.options].find(option => option.value === modelSelect.value);
        if (selectedOption) {
            headerText.textContent = selectedOption.textContent;
        }
        
        const options = document.querySelectorAll('.model-option');
        options.forEach(option => {
            const optionText = option.textContent;
            if (optionText === selectedOption.textContent) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }

    // 应用深色模式
    function applyDarkMode() {
        if (settings.darkMode) {
            // 应用深色模式
            document.body.classList.add('dark-mode');
        } else {
            // 移除深色模式
            document.body.classList.remove('dark-mode');
        }
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
        document.getElementById('darkModeLabel').textContent = translations[currentLanguage].darkModeLabel;
        
        // 更新设置说明文本
        const settingsNoteEl = document.getElementById('settingsNote');
        if (settingsNoteEl) {
            settingsNoteEl.textContent = translations[currentLanguage].settingsNote;
        }
        
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
        
        // 更新自定义语言选择器
        updateCustomLanguageSelector();
        // 更新自定义模型选择器
        updateCustomModelSelector();
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
        
        // 检查是否是询问创建者的问题
        const creatorQuestions = [
            "who's your creator", 
            "who is your creator", 
            "who created you",
            "who made you",
            "your creator",
            "who built you",
            "who invented you",
            "who is your daddy",
            "who's your daddy"
        ];
        
        // 检查是否是询问名字的问题
        const nameQuestions = [
            "what's your name",
            "what is your name",
            "your name",
            "who are you",
            "tell me your name",
            "name"
        ];
        
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
        
        // 检查是否是关于创建者的问题
        const isCreatorQuestion = creatorQuestions.some(q => message.toLowerCase().includes(q.toLowerCase()));
        
        // 检查是否是关于名字的问题
        const isNameQuestion = nameQuestions.some(q => message.toLowerCase().includes(q.toLowerCase()));
        
        if (isCreatorQuestion) {
            // 直接添加自定义回复
            const aiResponse = "I was created by Ken Lin. While there isn't a single 'inventor', there's one guy named Evan Rey Battiston gave the idea of KenAi, and then created me! Let me know if you'd like to know more! 😊";
            
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
            return;
        }
        
        if (isNameQuestion) {
            // 直接添加自定义回复
            const aiResponse = "My name is KenAi. How can I help you today?";
            
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
            return;
        }
        
        // 检查API密钥
        if (!settings.apiKey) {
            alert(translations[currentLanguage].apiKeyRequired);
            openSettings();
            return;
        }
        
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
        
        // 修复AI头像样式问题，确保背景色和样式正确应用
        if (role === 'user') {
            avatar.textContent = '';
        } else {
            avatar.textContent = 'K';
            // 确保AI头像样式直接应用，避免CSS加载顺序问题
            avatar.style.background = 'linear-gradient(135deg, #0084ff, #0070e0)';
            avatar.style.color = 'white';
            avatar.style.fontWeight = 'bold';
            avatar.style.display = 'flex';
            avatar.style.alignItems = 'center';
            avatar.style.justifyContent = 'center';
            avatar.style.boxShadow = '0 2px 8px rgba(0, 132, 255, 0.2)';
        }
        
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
        // 直接添加内联样式确保应用
        aiAvatar.style.background = 'linear-gradient(135deg, #0084ff, #0070e0)';
        aiAvatar.style.color = 'white';
        aiAvatar.style.fontWeight = 'bold';
        aiAvatar.style.display = 'flex';
        aiAvatar.style.alignItems = 'center';
        aiAvatar.style.justifyContent = 'center';
        aiAvatar.style.boxShadow = '0 2px 8px rgba(0, 132, 255, 0.2)';
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
        // 直接更新表单值，不重新初始化
        apiKeyInput.value = settings.apiKey;
        if (apiBaseUrlInput) {
            apiBaseUrlInput.value = settings.apiBaseUrl;
        }
        modelSelect.value = settings.model;
        languageSelect.value = settings.language;
        
        // 设置深色模式开关状态
        const darkModeSwitch = document.getElementById('darkModeSwitch');
        if (darkModeSwitch) {
            darkModeSwitch.checked = settings.darkMode;
        }
        
        // 显示模态框
        settingsModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }

    // 关闭设置模态框
    function closeSettings() {
        // 关闭模态框时自动保存当前设置
        saveSettingsWithoutClosing();
        settingsModal.style.display = 'none';
        document.body.style.overflow = ''; // 恢复背景滚动
    }

    // 保存设置但不关闭模态框（用于自动保存场景）
    function saveSettingsWithoutClosing() {
        settings.apiKey = apiKeyInput.value.trim();
        settings.model = modelSelect.value;
        settings.language = languageSelect.value;
        
        // 获取深色模式设置
        const darkModeSwitch = document.getElementById('darkModeSwitch');
        if (darkModeSwitch) {
            settings.darkMode = darkModeSwitch.checked;
        }
        
        if (apiBaseUrlInput) {
            settings.apiBaseUrl = apiBaseUrlInput.value.trim() || 'https://api.deepseek.com/v1';
        }
        
        localStorage.setItem('apiKey', settings.apiKey);
        localStorage.setItem('model', settings.model);
        localStorage.setItem('apiBaseUrl', settings.apiBaseUrl);
        localStorage.setItem('language', settings.language);
        localStorage.setItem('darkMode', settings.darkMode);
    }

    // 保存设置并关闭模态框（保留但实际上不再使用）
    function saveSettings() {
        saveSettingsWithoutClosing();
        closeSettings();
    }

    // 滚动到底部
    function scrollToBottom() {
        // 立即滚动一次
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // 检测是否是iPad或平板设备
        const isTablet = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        if (isTablet) {
            // 在iPad上，增加多次延迟滚动以确保滚动到底部
            setTimeout(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 100);
            
            setTimeout(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 300);
            
            setTimeout(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 500);
        }
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

    // 设置准确的视口高度变量
    function setViewportHeight() {
        // 获取可视窗口的实际高度
        let vh = window.innerHeight * 0.01;
        // 设置CSS变量
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // 检测是否是iPad或平板设备
        const isTablet = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        if (isTablet) {
            // 修复iPad上的滚动问题
            scrollToBottom();
            
            // 修复输入区域的位置
            const inputContainer = document.querySelector('.input-container');
            if (inputContainer) {
                inputContainer.style.position = 'fixed';
                inputContainer.style.bottom = '0';
                inputContainer.style.left = '0';
                inputContainer.style.right = '0';
                inputContainer.style.width = '100%';
                inputContainer.style.zIndex = '100';
                
                // 考虑安全区域
                if (window.visualViewport) {
                    inputContainer.style.paddingBottom = 
                        `calc(env(safe-area-inset-bottom, 0px) + 10px)`;
                }
            }
        }
    }

    // 初始化应用
    initializeApp();
}); 