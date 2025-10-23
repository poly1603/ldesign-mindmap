/**
 * @ldesign/mindmap - TypeScript 类型定义
 */

/** 基础几何类型 */
export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Point, Size {}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** 节点形状 */
export type NodeShape = 'rectangle' | 'rounded' | 'circle' | 'diamond' | 'hexagon' | 'ellipse';

/** 节点边框样式 */
export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double';

/** 连接线类型 */
export type ConnectionType = 'bezier' | 'straight' | 'polyline' | 'orthogonal';

/** 布局类型 */
export type LayoutType = 'tree' | 'fishbone' | 'orgchart' | 'logic' | 'bubble' | 'timeline';

/** 布局方向 */
export type LayoutDirection = 'horizontal' | 'vertical' | 'radial';

/** 节点样式配置 */
export interface NodeStyle {
  // 颜色
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  
  // 边框
  borderWidth?: number;
  borderStyle?: BorderStyle;
  borderRadius?: number;
  
  // 形状和大小
  shape?: NodeShape;
  width?: number | 'auto';
  height?: number | 'auto';
  padding?: number | [number, number] | [number, number, number, number];
  
  // 阴影和效果
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  opacity?: number;
  
  // 字体
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textAlign?: 'left' | 'center' | 'right';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  
  // 图标和图片
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  image?: string;
  imageSize?: number;
  imageFit?: 'cover' | 'contain' | 'fill';
}

/** 连接线样式配置 */
export interface ConnectionStyle {
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  type?: ConnectionType;
  animated?: boolean;
  arrow?: boolean;
  arrowSize?: number;
}

/** 富文本内容 */
export interface RichTextContent {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  link?: string;
}

/** 节点数据 */
export interface NodeData {
  id: string;
  text: string | RichTextContent[];
  children?: NodeData[];
  
  // 样式
  style?: NodeStyle;
  
  // 状态
  expanded?: boolean;
  selected?: boolean;
  hidden?: boolean;
  
  // 标签和类型
  tags?: string[];
  type?: string;
  
  // 自定义数据
  data?: Record<string, any>;
  
  // 位置信息（由布局引擎计算）
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/** 思维导图配置 */
export interface MindMapConfig {
  // 容器
  container: HTMLElement | string;
  
  // 数据
  data?: NodeData;
  
  // 布局
  layout?: LayoutType;
  layoutDirection?: LayoutDirection;
  
  // 样式
  theme?: string | ThemeConfig;
  nodeStyle?: Partial<NodeStyle>;
  connectionStyle?: Partial<ConnectionStyle>;
  
  // 交互
  readonly?: boolean;
  draggable?: boolean;
  zoomable?: boolean;
  pannable?: boolean;
  
  // 缩放
  minZoom?: number;
  maxZoom?: number;
  zoomSpeed?: number;
  initialZoom?: number;
  
  // 快捷键
  shortcuts?: boolean;
  customShortcuts?: Record<string, () => void>;
  
  // 导出
  exportPadding?: number;
  exportScale?: number;
  
  // 事件回调
  onNodeClick?: (node: NodeData, event: MouseEvent) => void;
  onNodeDblClick?: (node: NodeData, event: MouseEvent) => void;
  onNodeContextMenu?: (node: NodeData, event: MouseEvent) => void;
  onNodeChange?: (node: NodeData) => void;
  onSelectionChange?: (nodes: NodeData[]) => void;
  onLayoutChange?: (layout: LayoutType) => void;
  onZoomChange?: (zoom: number) => void;
}

/** 主题配置 */
export interface ThemeConfig {
  name: string;
  mode?: 'light' | 'dark';
  
  // 全局颜色
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  
  // 节点样式
  nodeStyle?: NodeStyle;
  rootNodeStyle?: NodeStyle;
  childNodeStyle?: NodeStyle;
  
  // 连接线样式
  connectionStyle?: ConnectionStyle;
  
  // 字体
  fontFamily?: string;
  fontSize?: number;
  
  // 间距
  nodeSpacing?: number;
  levelSpacing?: number;
}

/** 布局配置 */
export interface LayoutConfig {
  type: LayoutType;
  direction?: LayoutDirection;
  nodeSpacing?: number;
  levelSpacing?: number;
  centered?: boolean;
  compact?: boolean;
  
  // 树形布局专用
  branchSpacing?: number;
  
  // 鱼骨图专用
  fishboneAngle?: number;
  
  // 气泡图专用
  bubbleForce?: number;
  bubbleRadius?: number;
  
  // 时间轴专用
  timelineSpacing?: number;
  timelineVertical?: boolean;
}

/** 插件接口 */
export interface Plugin {
  name: string;
  version?: string;
  install(mindmap: any): void;
  uninstall?(): void;
}

/** 命令接口（用于撤销重做） */
export interface Command {
  name: string;
  execute(): void;
  undo(): void;
  redo?(): void;
  canMerge?(other: Command): boolean;
  merge?(other: Command): void;
}

/** 事件类型 */
export type EventType = 
  | 'node:click'
  | 'node:dblclick'
  | 'node:contextmenu'
  | 'node:add'
  | 'node:remove'
  | 'node:update'
  | 'node:select'
  | 'node:deselect'
  | 'node:expand'
  | 'node:collapse'
  | 'node:drag:start'
  | 'node:drag:move'
  | 'node:drag:end'
  | 'layout:change'
  | 'zoom:change'
  | 'pan:change'
  | 'render:before'
  | 'render:after'
  | 'history:change';

/** 事件处理器 */
export type EventHandler = (data?: any) => void;

/** 导出格式 */
export type ExportFormat = 'png' | 'svg' | 'pdf' | 'json' | 'markdown' | 'freemind' | 'xmind';

/** 导出选项 */
export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  scale?: number;
  padding?: number;
  backgroundColor?: string;
  quality?: number; // PNG/JPEG 质量
  includeHidden?: boolean;
}

/** 搜索选项 */
export interface SearchOptions {
  query: string;
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
  tags?: string[];
  type?: string;
}

/** 搜索结果 */
export interface SearchResult {
  node: NodeData;
  matches: Array<{
    field: string;
    text: string;
    start: number;
    end: number;
  }>;
}

/** 历史状态 */
export interface HistoryState {
  timestamp: number;
  data: NodeData;
  description?: string;
}

/** 渲染上下文 */
export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  svgLayer: SVGSVGElement;
  viewportTransform: {
    x: number;
    y: number;
    scale: number;
  };
  visibleBounds: Bounds;
}

