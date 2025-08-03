class ElementInspector {
    constructor() {
        this.isCtrlPressed = false;
        this.isInspecting = false;
        this.lastHighlightedElement = null;
        this.overlay = null;
        this.popupMenu = null;
        this.currentMousePosition = {x: 0, y: 0}; // 存储当前鼠标位置
        this.isHoveringContextMenu = false; // 跟踪是否悬停在context menu上
        this.config = null; // 存储配置
        this.init();
    }

    async init() {
        // 首先获取配置
        await this.loadConfig();
        this.createOverlay();
        this.bindEvents();
        this.setupConfigListener();
        console.log('Element Inspector 已激活 - 按住 Ctrl 键并悬停元素进行检查');
    }

    // 从background.js获取配置
    async loadConfig() {
        try {
            const response = await this.sendMessageToBackground({action: 'getInspectorConfig'});
            if (response.success) {
                this.config = response.config;
                console.log('✅ 配置加载成功:', this.config);
                this.applyConfig();
            }
        } catch (error) {
            console.error('❌ 配置加载失败:', error);
        }
    }

    // 发送消息到background script
    sendMessageToBackground(message) {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response);
                }
            });
        });
    }

    // 监听配置更新
    setupConfigListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'configUpdated') {
                console.log('🔄 收到配置更新:', message.config);
                this.config = message.config;
                this.applyConfig();
                sendResponse({success: true});
            }
        });
    }

    // 应用配置
    applyConfig() {
        if (!this.config) return;
        console.log('🎨 配置已应用:', this.config);
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
      position: absolute;
      pointer-events: none;
      border: 2px solid #ff0000;
      background-color: rgba(255, 0, 0, 0.1);
      z-index: 2147483647;
      display: none;
      box-sizing: border-box;
    `;
        document.body.appendChild(this.overlay);
    }

    bindEvents() {
        // 监听键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.config && this.config.urls
                && this.config.urls.some(item => item.url === new URL(window.location.href).host)) {
                if (e.key === 'Control' && e.location === 1) { // Left Ctrl
                    this.isCtrlPressed = true;
                    this.startInspecting();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (this.config && this.config.urls
                && this.config.urls.some(item => item.url === new URL(window.location.href).host)) {
                if (e.key === 'Control' && e.location === 1) {
                    this.isCtrlPressed = false;
                    this.stopInspecting();
                }
            }
        });

        // 监听鼠标事件
        document.addEventListener('mousemove', (e) => {
            // 始终更新鼠标位置
            this.currentMousePosition.x = e.clientX;
            this.currentMousePosition.y = e.clientY;

            if (this.isCtrlPressed && this.isInspecting) {
                this.highlightElement(e);
            }
        });


        // 点击其他地方时隐藏自定义菜单
        document.addEventListener('click', () => {
            this.hideCustomContextMenu();
        });

        // 防止页面失焦时状态混乱
        window.addEventListener('blur', () => {
            this.isCtrlPressed = false;
            this.stopInspecting();
        });
    }

    startInspecting() {
        this.isInspecting = true;
        document.body.style.cursor = 'crosshair';
        console.log('🔍 检查模式已启动 - 移动鼠标悬停元素');

        // 获取当前鼠标位置并立即调用highlightElement
        const mockEvent = {
            clientX: this.currentMousePosition.x,
            clientY: this.currentMousePosition.y
        };

        this.highlightElement(mockEvent);
    }

    stopInspecting() {
        this.isInspecting = false;
        document.body.style.cursor = '';
        this.hideOverlay();
        console.log('🔍 检查模式已关闭');
    }

    highlightElement(e) {
        const element = document.elementFromPoint(e.clientX, e.clientY);
        console.log("🎯 鼠标悬停元素:", {element})
        if (!element || element === this.overlay) return;
        //如果元素是插件自身的元素 忽略
        if (element.classList.contains('element-inspector-overlay')
            || element.classList.contains('element-inspector-context-menu') ||
            element.classList.contains('context-menu-item')
        ) {
            return;
        }

        this.lastHighlightedElement = element;
        this.showOverlay(element);
        this.showPopupMenu(element)
        // 直接触发元素检查
        this.inspectElement(element);
    }

    showOverlay(element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        console.log('🎯 显示覆盖层:', {
            element: element.tagName,
            rect: rect,
            scrollTop: scrollTop,
            scrollLeft: scrollLeft,
            overlayElement: this.overlay
        });

        this.overlay.style.display = 'block';
        this.overlay.style.top = (rect.top + scrollTop) + 'px';
        this.overlay.style.left = (rect.left + scrollLeft) + 'px';
        this.overlay.style.width = rect.width + 'px';
        this.overlay.style.height = rect.height + 'px';
    }

    hideOverlay() {
        this.overlay.style.display = 'none';
    }

    // 创建自定义上下文菜单
    createPopupMenu() {
        if (this.popupMenu) return;

        this.popupMenu = document.createElement('div');
        this.popupMenu.className = 'element-inspector-context-menu';
        this.popupMenu.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      padding: 4px 0;
      min-width: 150px;
      z-index: 2147483648;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      display: none;
    `;

        // 添加菜单悬停事件监听器
        this.popupMenu.addEventListener('mouseenter', () => {
            this.isHoveringContextMenu = true;
            console.log('🎯 鼠标进入context menu');
        });

        this.popupMenu.addEventListener('mouseleave', () => {
            this.isHoveringContextMenu = false;
            console.log('🎯 鼠标离开context menu');

            // 如果已经不在检查模式且鼠标离开了菜单，则隐藏菜单
            if (!this.isInspecting) {
                this.hideCustomContextMenu();
            }
        });

        this.generateOptions();

        // 退出检查模式选项
        const exitOption = document.createElement('div');
        exitOption.className = 'context-menu-item';
        exitOption.innerHTML = '❌ 退出检查模式';
        exitOption.style.cssText = `
      color: #333;
      padding: 8px 16px;
      cursor: pointer;
      transition: background-color 0.2s;
    `;

        exitOption.addEventListener('mouseenter', () => {
            exitOption.style.backgroundColor = '#f0f0f0';
        });

        exitOption.addEventListener('mouseleave', () => {
            exitOption.style.backgroundColor = 'transparent';
        });

        exitOption.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isCtrlPressed = false;
            this.stopInspecting();
            this.hideCustomContextMenu();
        });

        this.popupMenu.appendChild(exitOption);
        document.body.appendChild(this.popupMenu);
    }

    generateOptions() {

        if (!this.config) {
            return;
        }

        // random emojis
        const emojis = ['🤖', '🔍', '🛠️', '📊', '💡', '⚙️', '📋', '📝', '📐', '🎨'];

        for (let item of this.config.items) {

            // AI 选项
            const aiOption = document.createElement('div');
            aiOption.className = 'context-menu-item';
            // 随机选择一个emoji
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            aiOption.innerHTML = randomEmoji + ' ' + item.name;
            aiOption.style.cssText = `
                color: #333;
                padding: 8px 16px;
                cursor: pointer;
                transition: background-color 0.2s;
              `;

            aiOption.addEventListener('mouseenter', () => {
                aiOption.style.backgroundColor = '#f0f0f0';
            });

            aiOption.addEventListener('mouseleave', () => {
                aiOption.style.backgroundColor = 'transparent';
            });

            aiOption.addEventListener('click', (e) => {
                e.stopPropagation();
                this.copyToClipboard(item.prompt);
                this.hideCustomContextMenu();
            });

            // 分隔线
            const separator = document.createElement('div');
            separator.style.cssText = `
                height: 1px;
                background: #e0e0e0;
                margin: 4px 0;
              `;

            this.popupMenu.appendChild(aiOption);
            this.popupMenu.appendChild(separator);
        }
    }

    showPopupMenu(element) {
        this.createPopupMenu();

        // 确保有被选中的元素
        if (!element) {
            console.log('❌ 没有选中的元素，无法显示弹出菜单');
            return;
        }

        // 获取被选中元素的位置信息
        const rect = element.getBoundingClientRect();

        // 获取页面滚动偏移量
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // 计算元素下方的绝对位置
        const elementBottom = rect.bottom + scrollTop;
        const elementLeft = rect.left + scrollLeft;

        console.log('🎯 显示自定义上下文菜单位置:', {
            element: element.tagName,
            elementRect: rect,
            scrollLeft,
            scrollTop,
            elementBottom,
            elementLeft
        });

        // 获取菜单尺寸和视窗尺寸
        const menuWidth = 150;
        const menuHeight = 80;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // 计算菜单位置，默认显示在元素下方
        let left = elementLeft + (rect.width / 2);
        let top = elementBottom + 5; // 在元素下方留5px间距

        // 检查右边界 - 如果菜单超出右边界，向左调整
        if (rect.left + menuWidth > viewportWidth) {
            left = elementLeft + rect.width - menuWidth;
            // 如果还是超出，则贴着右边界
            if (left < scrollLeft) {
                left = scrollLeft + viewportWidth - menuWidth - 10;
            }
        }

        // 检查下边界 - 如果菜单超出下边界，显示在元素上方
        if (rect.bottom + menuHeight + 5 > viewportHeight) {
            top = rect.top + scrollTop - menuHeight - 5; // 在元素上方留5px间距
            // 如果上方也没有足够空间，则贴着元素顶部显示
            if (rect.top < menuHeight + 5) {
                top = scrollTop + 10; // 贴着视窗顶部
            }
        }

        this.popupMenu.style.left = left + 'px';
        this.popupMenu.style.top = top + 'px';
        this.popupMenu.style.display = 'block';

        console.log('🎯 最终菜单位置:', {
            left,
            top,
            elementPosition: `${rect.left}, ${rect.top}, ${rect.width}x${rect.height}`
        });
    }

    // 隐藏自定义上下文菜单
    hideCustomContextMenu() {
        if (this.popupMenu) {
            this.popupMenu.style.display = 'none';
        }
    }

    // 处理AI分析
    copyToClipboard(prompt) {
        if (!this.lastHighlightedElement) {
            console.log('❌ 没有选中的元素');
            return;
        }
        //把 html element 转换成html代码字符串
        let htmlString = " " + this.lastHighlightedElement.outerHTML
        let result = prompt.replace('${html}', htmlString);
        if (result === undefined || result === null || result.trim() === '') {
            result = htmlString;
        }
        console.log('📋 复制到剪贴板:', result);
        navigator.clipboard.writeText(result)
            .then(() => {
                console.log('✅ 已复制到剪贴板');
            })
            .catch(err => {
                console.error('❌ 复制失败:', err);
            });
    }

    inspectElement(element) {
        const computedStyles = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        // 提取元素的基本信息
        const elementInfo = {
            tagName: element.tagName.toLowerCase(),
            id: element.id || null,
            className: element.className || null,
            textContent: element.textContent?.trim().substring(0, 100) || null
        };

        // 提取尺寸信息
        const dimensions = {
            width: rect.width,
            height: rect.height,
            offsetWidth: element.offsetWidth,
            offsetHeight: element.offsetHeight,
            clientWidth: element.clientWidth,
            clientHeight: element.clientHeight,
            scrollWidth: element.scrollWidth,
            scrollHeight: element.scrollHeight
        };

        // 提取盒模型信息
        const boxModel = {
            padding: {
                top: parseFloat(computedStyles.paddingTop),
                right: parseFloat(computedStyles.paddingRight),
                bottom: parseFloat(computedStyles.paddingBottom),
                left: parseFloat(computedStyles.paddingLeft)
            },
            border: {
                top: parseFloat(computedStyles.borderTopWidth),
                right: parseFloat(computedStyles.borderRightWidth),
                bottom: parseFloat(computedStyles.borderBottomWidth),
                left: parseFloat(computedStyles.borderLeftWidth)
            },
            margin: {
                top: parseFloat(computedStyles.marginTop),
                right: parseFloat(computedStyles.marginRight),
                bottom: parseFloat(computedStyles.marginBottom),
                left: parseFloat(computedStyles.marginLeft)
            }
        };

        // 提取重要样式
        const styles = {
            display: computedStyles.display,
            position: computedStyles.position,
            top: computedStyles.top,
            left: computedStyles.left,
            right: computedStyles.right,
            bottom: computedStyles.bottom,
            zIndex: computedStyles.zIndex,
            backgroundColor: computedStyles.backgroundColor,
            color: computedStyles.color,
            fontSize: computedStyles.fontSize,
            fontFamily: computedStyles.fontFamily,
            fontWeight: computedStyles.fontWeight,
            lineHeight: computedStyles.lineHeight,
            textAlign: computedStyles.textAlign,
            overflow: computedStyles.overflow,
            visibility: computedStyles.visibility,
            opacity: computedStyles.opacity,
            float: computedStyles.float,
            clear: computedStyles.clear,
            boxSizing: computedStyles.boxSizing,
            flexDirection: computedStyles.flexDirection,
            justifyContent: computedStyles.justifyContent,
            alignItems: computedStyles.alignItems,
            gridTemplateColumns: computedStyles.gridTemplateColumns,
            gridTemplateRows: computedStyles.gridTemplateRows
        };

        // 输出到控制台
        console.group(`🎯 元素检查结果: ${elementInfo.tagName}${elementInfo.id ? '#' + elementInfo.id : ''}${elementInfo.className ? '.' + String(elementInfo.className).split(' ').join('.') : ''}`);

        console.log('📋 元素信息:', elementInfo);
        console.log('📐 尺寸信息:', dimensions);
        console.log('📦 盒模型:', boxModel);
        console.log('🎨 样式信息:', styles);

        // 计算并显示总尺寸
        const totalWidth = dimensions.width + boxModel.padding.left + boxModel.padding.right +
            boxModel.border.left + boxModel.border.right +
            boxModel.margin.left + boxModel.margin.right;
        const totalHeight = dimensions.height + boxModel.padding.top + boxModel.padding.bottom +
            boxModel.border.top + boxModel.border.bottom +
            boxModel.margin.top + boxModel.margin.bottom;

        console.log('📊 总占用空间:', {
            totalWidth: totalWidth,
            totalHeight: totalHeight,
            breakdown: {
                content: `${dimensions.width} × ${dimensions.height}`,
                padding: `${boxModel.padding.top + boxModel.padding.bottom} × ${boxModel.padding.left + boxModel.padding.right}`,
                border: `${boxModel.border.top + boxModel.border.bottom} × ${boxModel.border.left + boxModel.border.right}`,
                margin: `${boxModel.margin.top + boxModel.margin.bottom} × ${boxModel.margin.left + boxModel.margin.right}`
            }
        });

        console.groupEnd();

        // 返回完整数据对象
        return {
            element: elementInfo,
            dimensions,
            boxModel,
            styles,
            totalDimensions: {totalWidth, totalHeight}
        };
    }


    destroy() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        if (this.popupMenu && this.popupMenu.parentNode) {
            this.popupMenu.parentNode.removeChild(this.popupMenu);
        }
        // 移除事件监听器会在页面刷新时自动清理
    }
}

// 初始化插件
let elementInspector = null;

// 确保DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        elementInspector = new ElementInspector();
    });
} else {
    elementInspector = new ElementInspector();
}

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (elementInspector) {
        elementInspector.destroy();
    }
});
