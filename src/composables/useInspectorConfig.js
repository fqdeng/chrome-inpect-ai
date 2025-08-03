// Vue组件：配置管理器
import { ref, reactive, onMounted, watch, nextTick } from 'vue'

// 默认项目列表
export const DEFAULT_ITEMS = [
  { id: 'css-not-work', name: 'CSS工作错误', prompt: '帮我分析这个CSS问题，找出可能的错误原因和解决方案 ${html}' },
  { id: 'style', name: '样式分析', prompt: '请分析这个元素的样式，包括CSS属性和视觉效果 ${html}' },
  { id: 'layout', name: '布局分析', prompt: '帮我分析这个布局结构，包括定位、尺寸和排列方式 ${html}' },
]

// 配置管理服务
export const ConfigManager = {
  async getConfig() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['config'], (result) => {
        const defaultConfig = {
          currentItem: 'css-not-work',
          items: DEFAULT_ITEMS,
        }
        resolve(result.config || defaultConfig)
      })
    })
  },

  async saveConfig(config) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ config }, () => {
        console.log('配置已保存:', config)
        resolve()
      })
    })
  }
}

// 防抖工具函数
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Vue Composition API Hook
export function useInspectorConfig() {
  // 响应式状态
  const config = reactive({
    currentItem: 'css-not-work',
    items: [...DEFAULT_ITEMS]
  })

  const currentItemId = ref('css-not-work')
  const currentPrompt = ref('')
  const showCustomForm = ref(false)
  const newItemName = ref('')
  const customInput = ref(null)

  // 防抖的保存函数
  const debouncedSave = debounce(saveConfig, 500)

  // 加载配置
  async function loadConfig() {
    try {
      const loadedConfig = await ConfigManager.getConfig()

      // 确保 items 是数组
      if (!Array.isArray(loadedConfig.items)) {
        console.warn('配置中的 items 不是数组，使用默认配置')
        loadedConfig.items = [...DEFAULT_ITEMS]
      }

      Object.assign(config, loadedConfig)
      currentItemId.value = config.currentItem
      loadCurrentPrompt()
      console.log('配置已加载:', config)
    } catch (error) {
      console.error('加载配置失败:', error)
      // 如果加载失败，使用默认配置
      config.items = [...DEFAULT_ITEMS]
      config.currentItem = 'css-not-work'
      currentItemId.value = 'css-not-work'
      loadCurrentPrompt()
    }
  }

  // 保存配置
  async function saveConfig() {
    try {
      // 确保 items 是数组
      if (!Array.isArray(config.items)) {
        console.warn('config.items 不是数组，重置为默认配置')
        config.items = [...DEFAULT_ITEMS]
      }

      // 更新当前项目的prompt
      const itemIndex = config.items.findIndex(item => item.id === currentItemId.value)
      if (itemIndex !== -1) {
        config.items[itemIndex].prompt = currentPrompt.value
      }

      // 更新当前选中的项目
      config.currentItem = currentItemId.value

      await ConfigManager.saveConfig({ ...config })
    } catch (error) {
      console.error('保存配置失败:', error)
    }
  }

  // 加载当前项目的prompt
  function loadCurrentPrompt() {
    // 确保 items 是数组
    if (!Array.isArray(config.items)) {
      console.warn('config.items 不是数组，重置为默认配置')
      config.items = [...DEFAULT_ITEMS]
    }

    const currentItem = config.items.find(item => item.id === currentItemId.value)
    currentPrompt.value = currentItem?.prompt || ''
  }

  // 事件处理函数
  const onItemChange = async () => {
    debugger;
    // 先保存当前配置（保存旧项目的 prompt）
    await saveConfig()
    // 然后加载新项目的 prompt
    loadCurrentPrompt()
  }

  const onPromptChange = () => {
    debouncedSave()
  }

  const showAddForm = async () => {
    showCustomForm.value = true
    await nextTick()
    customInput.value?.focus()
  }

  const addNewItem = async () => {
    const name = newItemName.value.trim()
    if (!name) {
      alert('项目名称不能为空')
      return
    }

    // 检查是否已存在同名项目
    const existingItem = config.items.find(item => item.name === name)
    if (existingItem) {
      alert('项目名称已存在')
      return
    }

    // 生成唯一ID
    const newItemId = 'custom_' + Date.now()

    // 添加到项目列表
    const newItem = { id: newItemId, name, prompt: '' }
    config.items.push(newItem)

    // 选择新项目
    currentItemId.value = newItemId
    currentPrompt.value = ''

    // 清空表单
    newItemName.value = ''
    showCustomForm.value = false

    // 保存配置
    await saveConfig()
  }

  const cancelAdd = () => {
    newItemName.value = ''
    showCustomForm.value = false
  }

  const deleteCurrentItem = async () => {
    // 不允许删除默认项目
    const isDefault = DEFAULT_ITEMS.some(item => item.id === currentItemId.value)
    if (isDefault) {
      alert('不能删除默认项目')
      return
    }

    if (!confirm('确定要删除这个项目吗？')) {
      return
    }

    // 从项目列表中移除
    config.items = config.items.filter(item => item.id !== currentItemId.value)

    // 选择第一个项目
    const firstItem = config.items[0]
    if (firstItem) {
      currentItemId.value = firstItem.id
      loadCurrentPrompt()
    }

    // 隐藏添加表单
    showCustomForm.value = false

    // 保存配置
    await saveConfig()
  }

  // 生命周期
  onMounted(() => {
    loadConfig()
  })

  return {
    // 状态
    config,
    currentItemId,
    currentPrompt,
    showCustomForm,
    newItemName,
    customInput,

    // 方法
    onItemChange,
    onPromptChange,
    showAddForm,
    addNewItem,
    cancelAdd,
    deleteCurrentItem
  }
}
