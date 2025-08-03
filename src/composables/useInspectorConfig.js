// Vue组件：配置管理器
import { ref, computed, nextTick } from 'vue'

export function useInspectorConfig() {
  // 响应式状态
  const config = ref({
    items: [
      {
        id: 'default',
        name: '默认项目',
        prompt: `\${html}请分析这个元素的CSS样式和布局特点。`
      }
    ]
  })

  const currentItemId = ref('default')
  const showCustomForm = ref(false)
  const newItemName = ref('')
  const customInput = ref(null)

  // 新增编辑功能的状态
  const editingItemId = ref(null)
  const editingItemName = ref('')
  const editInput = ref(null)

  // 计算属性
  const currentItem = computed(() => {
    return config.value.items.find(item => item.id === currentItemId.value)
  })

  const currentPrompt = computed({
    get() {
      return currentItem.value?.prompt || ''
    },
    set(value) {
      if (currentItem.value) {
        currentItem.value.prompt = value
        saveConfig()
      }
    }
  })

  // 方法
  const loadConfig = async () => {
    try {
      const result = await chrome.storage.sync.get(['inspectorConfig'])
      if (result.inspectorConfig && result.inspectorConfig.items && Array.isArray(result.inspectorConfig.items)) {
        config.value = result.inspectorConfig
        // 确保当前选择的项目存在
        if (!config.value.items.find(item => item.id === currentItemId.value)) {
          currentItemId.value = config.value.items[0]?.id || 'default'
        }
      } else {
        // 如果没有有效配置，使用默认配置
        config.value = {
          items: [
            {
              id: 'default',
              name: '默认项目',
              prompt: '请分析这个元素的CSS样式和布局特点。'
            }
          ]
        }
        currentItemId.value = 'default'
        // 保存默认配置
        await saveConfig()
      }
    } catch (error) {
      console.error('加载配置失败:', error)
      // 出错时使用默认配置
      config.value = {
        items: [
          {
            id: 'default',
            name: '默认项目',
            prompt: '请分析这个元素的CSS样式和布局特点。'
          }
        ]
      }
      currentItemId.value = 'default'
    }
  }

  const saveConfig = async () => {
    try {
      await chrome.storage.sync.set({ inspectorConfig: config.value })
    } catch (error) {
      console.error('保存配置失败:', error)
    }
  }

  const onItemChange = () => {
    saveConfig()
  }

  const onPromptChange = () => {
    saveConfig()
  }

  const showAddForm = () => {
    showCustomForm.value = true
    newItemName.value = ''
    nextTick(() => {
      customInput.value?.focus()
    })
  }

  const addNewItem = () => {
    if (!newItemName.value.trim()) {
      return
    }

    const newId = Date.now().toString()
    const newItem = {
      id: newId,
      name: newItemName.value.trim(),
      prompt: '请分析这个元素的CSS样式和布局特点。'
    }

    config.value.items.push(newItem)
    currentItemId.value = newId
    showCustomForm.value = false
    newItemName.value = ''
    saveConfig()
  }

  const cancelAdd = () => {
    showCustomForm.value = false
    newItemName.value = ''
  }

  const deleteCurrentItem = () => {
    if (config.value.items.length <= 1) {
      alert('至少需要保留一个项目')
      return
    }

    const currentIndex = config.value.items.findIndex(item => item.id === currentItemId.value)
    if (currentIndex === -1) return

    config.value.items.splice(currentIndex, 1)

    // 选择下一个可用的项目
    if (currentIndex < config.value.items.length) {
      currentItemId.value = config.value.items[currentIndex].id
    } else if (config.value.items.length > 0) {
      currentItemId.value = config.value.items[config.value.items.length - 1].id
    }

    saveConfig()
  }

  // 新增编辑相关方法
  const startEditItem = (itemId) => {
    const item = config.value.items.find(i => i.id === itemId)
    if (item) {
      editingItemId.value = itemId
      editingItemName.value = item.name
      nextTick(() => {
        editInput.value?.focus()
        editInput.value?.select()
      })
    }
  }

  const saveEditItem = () => {
    if (!editingItemName.value.trim()) {
      cancelEditItem()
      return
    }

    const item = config.value.items.find(i => i.id === editingItemId.value)
    if (item) {
      item.name = editingItemName.value.trim()
      saveConfig()
    }

    editingItemId.value = null
    editingItemName.value = ''
  }

  const cancelEditItem = () => {
    editingItemId.value = null
    editingItemName.value = ''
  }

  const handleEditKeydown = (event) => {
    if (event.key === 'Enter') {
      saveEditItem()
    } else if (event.key === 'Escape') {
      cancelEditItem()
    }
  }

  // 初始化
  loadConfig()

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
    onItemChange,
    onPromptChange,
    showAddForm,
    addNewItem,
    cancelAdd,
    deleteCurrentItem,
    startEditItem,
    saveEditItem,
    cancelEditItem,
    handleEditKeydown
  }
}
