<template>
  <div>
    <div class="header">
      <div class="title">🔍 Element Inspector v1.0</div>
    </div>

    <div class="config-section">
      <div class="config-title">⚙️ 配置设置</div>
      <div class="form-group">
        <label class="form-label" for="itemSelect">选择项目：</label>
        <div style="display: flex; gap: 8px;">
          <select
            id="itemSelect"
            v-model="currentItemId"
            @change="onItemChange"
            class="form-select"
            style="flex: 1;"
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

      <div v-if="showCustomForm" class="form-group">
        <label class="form-label" for="customItemInput">新项目名称：</label>
        <div style="display: flex; gap: 8px;">
          <input
            id="customItemInput"
            v-model="newItemName"
            @keypress.enter="addNewItem"
            class="form-input"
            type="text"
            placeholder="输入项目名称..."
            ref="customInput"
          >
          <button @click="addNewItem" class="save-btn" type="button">保存</button>
          <button @click="cancelAdd" class="cancel-btn" type="button">取消</button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="promptTextarea">提示内容：</label>
        <textarea
          id="promptTextarea"
          v-model="currentPrompt"
          @input="onPromptChange"
          class="form-textarea"
          placeholder="请输入提示内容..."
        ></textarea>
      </div>
    </div>

    <div class="instructions">
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
    return useInspectorConfig()
  }
}
</script>
