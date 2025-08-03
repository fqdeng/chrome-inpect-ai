// background.js - Chrome扩展后台脚本
console.log('🚀 Background script loaded');

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 Background收到消息:', request);

  if (request.action === 'getInspectorConfig') {
    // 从Chrome存储中获取配置
    chrome.storage.sync.get(['inspectorConfig'], (result) => {
      console.log('📖 从存储中读取配置:', result);

      // 如果没有配置，返回默认配置
      const config = result.inspectorConfig || {
        enabled: true,
        highlightColor: '#ff0000',
        showTooltip: true,
        autoScroll: false
      };

      sendResponse({ success: true, config: config });
    });

    // 返回true表示异步响应
    return true;
  }

  if (request.action === 'setInspectorConfig') {
    // 保存配置到Chrome存储
    chrome.storage.sync.set({ inspectorConfig: request.config }, () => {
      console.log('💾 配置已保存:', request.config);
      sendResponse({ success: true });
    });

    return true;
  }
});

// 监听存储变化
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.inspectorConfig) {
    console.log('🔄 配置已更新:', changes.inspectorConfig.newValue);

    // 通知所有content scripts配置已更新
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'configUpdated',
          config: changes.inspectorConfig.newValue
        }).catch(() => {
          // 忽略无法发送消息的标签页（如chrome://页面）
        });
      });
    });
  }
});
