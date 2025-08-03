# Chrome Element Inspector AI - Vue3版本

## 🎉 重构完成

已成功将原有的vanilla JavaScript代码重构为现代化的Vue3组件架构！

## 📁 项目结构

```
chrome-inspect-ai/
├── src/
│   ├── main.js                    # Vue应用入口文件
│   ├── components/
│   │   └── InspectorPopup.vue     # 主要的Vue组件
│   └── composables/
│       └── useInspectorConfig.js  # 配置管理的Composition API
├── dist/                          # 构建输出目录（Chrome插件可用）
├── popup.html                     # 弹窗HTML模板
├── manifest.json                  # Chrome插件配置
├── package.json                   # 项目依赖和脚本
├── vite.config.js                 # Vite构建配置
└── content.js/content.css         # 内容脚本文件
```

## 🚀 Vue3重构亮点

### 1. 组件化架构
- **InspectorPopup.vue**: 单文件组件，模板、逻辑、样式分离
- **useInspectorConfig.js**: Composition API Hook，可复用的逻辑

### 2. 现代化特性
- ✅ Vue3 Composition API
- ✅ 响应式数据管理 (reactive, ref)
- ✅ 生命周期钩子 (onMounted)
- ✅ 监听器 (watch)
- ✅ 模板引用 (ref)

### 3. 改进功能
- 🔄 自动保存配置 (防抖)
- 📝 动态添加/删除项目
- 💾 Chrome存储API集成
- 🎯 焦点管理优化

## 🛠️ 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 构建Chrome插件
npm run build:chrome
```

## 📦 安装Chrome插件

1. 运行 `npm run build:chrome` 构建插件
2. 打开Chrome浏览器，访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist` 目录

## 🎯 使用方法

1. 点击浏览器工具栏中的插件图标
2. 在弹窗中配置AI提示模板
3. 按住 `Ctrl` 键并点击页面元素
4. 在开发者工具控制台查看AI分析结果

## 💡 技术栈

- **Vue3**: 现代化的前端框架
- **Vite**: 快速的构建工具
- **Chrome Extensions API**: 浏览器扩展功能
- **CSS3**: 现代化的样式设计

## 🔧 核心改进

### 原有vanilla JS问题：
- 手动DOM操作复杂
- 状态管理混乱
- 代码可维护性差
- 没有组件复用

### Vue3重构优势：
- 声明式UI渲染
- 响应式状态管理
- 组件化开发
- TypeScript友好
- 更好的开发体验

## 🎨 组件特性

### InspectorPopup组件
- 配置项目选择器
- 动态添加/删除项目
- 实时提示内容编辑
- 使用说明展示
- 响应式布局

### useInspectorConfig Hook
- 配置数据管理
- Chrome存储集成
- 防抖保存优化
- 项目CRUD操作
- 状态同步
