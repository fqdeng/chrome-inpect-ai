<template>
  <div>
    <div class="header">
      <div class="title">🔍 Element Inspector v1.0</div>
    </div>

    <!-- URL管理区域 -->
    <div class="url-section">
      <div class="current-tab-info" v-if="currentTab.url">
        <div class="tab-title">{{ currentTab.title }}</div>
        <div class="tab-url">{{ currentTab.url }}</div>
        <button @click="saveCurrentUrl" class="save-url-btn">
          保存当前URL
        </button>
      </div>

      <!-- URL列表 -->
      <div class="config-section" v-if="config.urls.length > 0">
        <div class="config-title">🔗 已保存的URLs</div>
        <div class="url-list">
          <div
            v-for="urlItem in config.urls"
            :key="urlItem.id"
            class="url-item"
          >
            <div class="url-info" @click="openUrl(urlItem.url)">
              <div class="url-title">{{ urlItem.title }}</div>
              <div class="url-address">{{ urlItem.url }}</div>
              <div class="url-time">保存于: {{ urlItem.savedAt }}</div>
            </div>
            <button
              @click="deleteUrl(urlItem.id)"
              class="delete-url-btn"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="config-title">⚙️ 配置设置</div>
      <div class="form-group">
        <label class="form-label" for="itemSelect">选择项目：</label>
        <div style="display: flex; gap: 8px;">
          <div class="custom-select" style="flex: 1;">
            <select
              id="itemSelect"
              v-model="currentItemId"
              @change="onItemChange"
              class="form-select"
            >
              <option
                v-for="item in config.items"
                :key="item.id"
                :value="item.id"
              >
                {{ item.name }}
              </option>
            </select>
            <button
              @click="startEditItem(currentItemId)"
              class="edit-btn"
              type="button"
              title="编辑当前项目名称"
            >
              ✏️
            </button>
          </div>
          <button
            @click="showAddForm"
            class="add-btn"
            type="button"
            title="添加新项目"
          >
            +
          </button>
          <button
            @click="deleteCurrentItem"
            class="delete-btn"
            type="button"
            title="删除当前项目"
          >
            ×
          </button>
        </div>
      </div>

      <!-- 编辑项目名称的弹窗 -->
      <div v-if="editingItemId" class="edit-overlay" @click="cancelEditItem">
        <div class="edit-modal" @click.stop>
          <div class="edit-title">编辑项目名称</div>
          <input
            ref="editInput"
            v-model="editingItemName"
            class="edit-input"
            type="text"
            placeholder="输入项目名称"
          />
          <div class="edit-buttons">
            <button @click="saveEditItem" class="save-btn">保存</button>
            <button @click="cancelEditItem" class="cancel-btn">取消</button>
          </div>
        </div>
      </div>

      <!-- 添加新项目表单 -->
      <div v-if="showCustomForm" class="form-group">
        <label class="form-label">新项目名称：</label>
        <div style="display: flex; gap: 8px;">
          <input
            ref="customInput"
            v-model="newItemName"
            @keyup.enter="addNewItem"
            @keyup="(e) => e.key === 'Escape' && cancelAdd()"
            class="form-input"
            type="text"
            placeholder="输入项目名称"
          />
          <button @click="addNewItem" class="save-btn">保存</button>
          <button @click="cancelAdd" class="cancel-btn">取消</button>
        </div>
      </div>

      <div v-if="!showCustomForm" class="form-group">
        <label class="form-label" for="promptText">Prompt内容：</label>
        <textarea
          id="promptText"
          v-model="currentPrompt"
          @input="onPromptChange"
          class="form-textarea"
          rows="6"
          placeholder="请输入提示词，${html} 会被替换成选中的元素"
        ></textarea>
      </div>
    </div>

    <div class="instructions">
      <div class="config-title"> ℹ️ 使用帮助</div>
      <div class="step">
        <div class="step-number">1</div>
        <div class="step-text">
          按住 <span class="keyboard-key">Left Ctrl</span> 键
        </div>
      </div>

      <div class="step">
        <div class="step-number">2</div>
        <div class="step-text">
          鼠标悬停在想要检查的元素上
        </div>
      </div>

      <div class="step">
        <div class="step-number">3</div>
        <div class="step-text">
          点击元素获取详细样式信息
        </div>
      </div>

      <div class="step">
        <div class="step-number">4</div>
        <div class="step-text">
          在浏览器控制台查看结果
        </div>
      </div>
    </div>

    <div class="status">
      ✅ 插件已激活，可以开始使用！
    </div>

    <div class="footer">
      打开开发者工具 (F12) 查看控制台输出
    </div>
  </div>
</template>

<script>
import { useInspectorConfig } from '../composables/useInspectorConfig.js'

export default {
  name: 'InspectorPopup',
  setup() {
    const {
      config,
      currentItemId,
      currentPrompt,
      showCustomForm,
      newItemName,
      customInput,
      editingItemId,
      editingItemName,
      editInput,
      currentTab,
      onItemChange,
      onPromptChange,
      showAddForm,
      addNewItem,
      cancelAdd,
      deleteCurrentItem,
      startEditItem,
      saveEditItem,
      cancelEditItem,
      saveCurrentUrl,
      deleteUrl,
      openUrl,
      getCurrentTabInfo
    } = useInspectorConfig()

    const startInspection = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'startInspection',
            prompt: currentPrompt.value
          })
          window.close()
        }
      })
    }

    return {
      config,
      currentItemId,
      currentPrompt,
      showCustomForm,
      newItemName,
      customInput,
      editingItemId,
      editingItemName,
      editInput,
      currentTab,
      onItemChange,
      onPromptChange,
      showAddForm,
      addNewItem,
      cancelAdd,
      deleteCurrentItem,
      startEditItem,
      saveEditItem,
      cancelEditItem,
      saveCurrentUrl,
      deleteUrl,
      openUrl,
      startInspection
    }
  }
}
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  text-align: center;
  border-radius: 8px;
  margin-bottom: 8px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.config-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.config-title {
  font-size: 16px;
  font-weight: bold;
  color: #495057;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
  font-size: 14px;
}

.custom-select {
  position: relative;
  display: flex;
  align-items: center;
}

.form-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.form-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  resize: vertical;
  min-height: 120px;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.edit-btn {
  margin-left: 4px;
  padding: 8px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.edit-btn:hover {
  background: #5a6268;
}

.add-btn {
  padding: 8px 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

.add-btn:hover {
  background: #218838;
}

.delete-btn {
  padding: 8px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

.delete-btn:hover {
  background: #c82333;
}

.save-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn:hover {
  background: #0056b3;
}

.cancel-btn {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-btn:hover {
  background: #5a6268;
}

/* 编辑弹窗样式 */
.edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.edit-modal {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 300px;
}

.edit-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #495057;
}

.edit-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 16px;
}

.edit-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.edit-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 使用帮助样式 */
.instructions {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.step {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.step:last-child {
  margin-bottom: 0;
}

.step-number {
  background: #007bff;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
}

.keyboard-key {
  background: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 12px;
}

.status {
  text-align: center;
  padding: 12px;
  border-radius: 6px;
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.footer {
  text-align: center;
  margin-top: 16px;
  font-size: 12px;
  color: #666;
}

/* URL管理样式 */
.url-section {
  padding-bottom: 8px;
}

.current-tab-info {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.tab-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: 13px;
}

.tab-url {
  color: #666;
  font-size: 11px;
  word-break: break-all;
  margin-bottom: 8px;
}

.save-url-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.save-url-btn:hover {
  background: #0056b3;
}

.url-list {
  max-height: 200px;
  overflow-y: auto;
}

.url-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #fafafa;
}

.url-info {
  flex: 1;
  cursor: pointer;
  margin-right: 8px;
}

.url-info:hover {
  background: #f0f0f0;
  border-radius: 4px;
  padding: 4px;
  margin: -4px;
}

.url-title {
  font-weight: 500;
  font-size: 12px;
  color: #333;
  margin-bottom: 2px;
}

.url-address {
  font-size: 10px;
  color: #666;
  word-break: break-all;
  margin-bottom: 2px;
}

.url-time {
  font-size: 9px;
  color: #888;
}

.delete-url-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 10px;
}

.delete-url-btn:hover {
  background: #c82333;
}
</style>
