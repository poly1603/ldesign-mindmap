/**
 * @ldesign/mindmap - 常量定义
 */

/** 默认节点样式 */
export const DEFAULT_NODE_STYLE = {
  backgroundColor: '#ffffff',
  borderColor: '#3b82f6',
  textColor: '#1f2937',
  borderWidth: 2,
  borderStyle: 'solid' as const,
  borderRadius: 4,
  shape: 'rounded' as const,
  width: 'auto' as const,
  height: 'auto' as const,
  padding: [12, 20, 12, 20] as [number, number, number, number],
  fontSize: 14,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: '400' as const,
  fontStyle: 'normal' as const,
  textAlign: 'center' as const,
  textDecoration: 'none' as const,
  opacity: 1,
};

/** 默认根节点样式 */
export const DEFAULT_ROOT_NODE_STYLE = {
  ...DEFAULT_NODE_STYLE,
  backgroundColor: '#3b82f6',
  textColor: '#ffffff',
  borderColor: '#2563eb',
  fontSize: 18,
  fontWeight: '600' as const,
  padding: [16, 32, 16, 32] as [number, number, number, number],
};

/** 默认连接线样式 */
export const DEFAULT_CONNECTION_STYLE = {
  strokeColor: '#94a3b8',
  strokeWidth: 2,
  strokeStyle: 'solid' as const,
  type: 'bezier' as const,
  animated: false,
  arrow: false,
  arrowSize: 8,
};

/** 默认配置 */
export const DEFAULT_CONFIG = {
  layout: 'tree' as const,
  layoutDirection: 'horizontal' as const,
  readonly: false,
  draggable: true,
  zoomable: true,
  pannable: true,
  minZoom: 0.1,
  maxZoom: 5,
  zoomSpeed: 0.1,
  initialZoom: 1,
  shortcuts: true,
  exportPadding: 20,
  exportScale: 2,
};

/** 默认布局配置 */
export const DEFAULT_LAYOUT_CONFIG = {
  nodeSpacing: 40,
  levelSpacing: 80,
  centered: true,
  compact: false,
  branchSpacing: 20,
  fishboneAngle: 45,
  bubbleForce: 0.5,
  bubbleRadius: 200,
  timelineSpacing: 100,
  timelineVertical: false,
};

/** 快捷键映射 */
export const DEFAULT_SHORTCUTS = {
  // 节点操作
  'Enter': 'addSiblingNode',
  'Tab': 'addChildNode',
  'Delete': 'removeNode',
  'Backspace': 'removeNode',
  'Space': 'toggleExpand',
  'F2': 'editNode',
  'Escape': 'cancelEdit',
  
  // 导航
  'ArrowUp': 'selectPreviousNode',
  'ArrowDown': 'selectNextNode',
  'ArrowLeft': 'selectParentNode',
  'ArrowRight': 'selectChildNode',
  
  // 编辑
  'Ctrl+C': 'copy',
  'Ctrl+V': 'paste',
  'Ctrl+X': 'cut',
  'Ctrl+D': 'duplicate',
  
  // 历史
  'Ctrl+Z': 'undo',
  'Ctrl+Y': 'redo',
  'Ctrl+Shift+Z': 'redo',
  
  // 视图
  'Ctrl+0': 'resetZoom',
  'Ctrl+=': 'zoomIn',
  'Ctrl+-': 'zoomOut',
  'Ctrl+1': 'fitView',
  
  // 全选
  'Ctrl+A': 'selectAll',
};

/** 形状绘制参数 */
export const SHAPE_PARAMS = {
  diamond: {
    points: 4,
  },
  hexagon: {
    points: 6,
  },
  circle: {
    segments: 32,
  },
};

/** 动画参数 */
export const ANIMATION = {
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  expandCollapseDuration: 200,
  zoomDuration: 150,
  panDuration: 200,
};

/** 渲染参数 */
export const RENDER = {
  devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
  dirtyRectPadding: 10,
  textMaxWidth: 300,
  textLineHeight: 1.5,
  connectionBezierOffset: 50,
  selectionPadding: 4,
  selectionBorderWidth: 2,
  selectionBorderColor: '#3b82f6',
  selectionBorderStyle: 'dashed' as const,
  hoverBorderColor: '#60a5fa',
  focusBorderColor: '#2563eb',
};

/** Canvas 性能优化参数 */
export const PERFORMANCE = {
  maxVisibleNodes: 1000,
  virtualScrollThreshold: 500,
  renderBatchSize: 50,
  debounceDelay: 16, // ~60fps
  throttleDelay: 100,
};

/** 导出参数 */
export const EXPORT = {
  png: {
    defaultScale: 2,
    maxWidth: 4096,
    maxHeight: 4096,
    quality: 0.95,
  },
  svg: {
    defaultPadding: 20,
  },
  pdf: {
    defaultScale: 1.5,
    margin: 20,
    format: 'a4' as const,
  },
};

/** Z-Index 层级 */
export const Z_INDEX = {
  canvas: 1,
  svgLayer: 2,
  editor: 3,
  tooltip: 100,
  contextMenu: 200,
  modal: 1000,
};

/** 事件名称 */
export const EVENTS = {
  NODE_CLICK: 'node:click',
  NODE_DBLCLICK: 'node:dblclick',
  NODE_CONTEXTMENU: 'node:contextmenu',
  NODE_ADD: 'node:add',
  NODE_REMOVE: 'node:remove',
  NODE_UPDATE: 'node:update',
  NODE_SELECT: 'node:select',
  NODE_DESELECT: 'node:deselect',
  NODE_EXPAND: 'node:expand',
  NODE_COLLAPSE: 'node:collapse',
  NODE_DRAG_START: 'node:drag:start',
  NODE_DRAG_MOVE: 'node:drag:move',
  NODE_DRAG_END: 'node:drag:end',
  LAYOUT_CHANGE: 'layout:change',
  ZOOM_CHANGE: 'zoom:change',
  PAN_CHANGE: 'pan:change',
  RENDER_BEFORE: 'render:before',
  RENDER_AFTER: 'render:after',
  HISTORY_CHANGE: 'history:change',
} as const;

/** 内置主题名称 */
export const BUILTIN_THEMES = [
  'default',
  'classic',
  'modern',
  'tech',
  'business',
  'minimal',
  'colorful',
  'nature',
  'ocean',
  'sunset',
  'dark',
  'highContrast',
] as const;

/** 错误消息 */
export const ERROR_MESSAGES = {
  CONTAINER_NOT_FOUND: '找不到指定的容器元素',
  INVALID_NODE_DATA: '无效的节点数据',
  INVALID_LAYOUT_TYPE: '无效的布局类型',
  INVALID_EXPORT_FORMAT: '无效的导出格式',
  PLUGIN_NOT_FOUND: '找不到指定的插件',
  CANVAS_NOT_SUPPORTED: '当前浏览器不支持 Canvas',
  SVG_NOT_SUPPORTED: '当前浏览器不支持 SVG',
} as const;

