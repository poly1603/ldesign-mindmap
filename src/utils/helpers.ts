/**
 * @ldesign/mindmap - 工具函数
 */

import type { Point, Rect, Bounds, NodeData, NodeStyle } from '../types';
import { DEFAULT_NODE_STYLE } from './constants';

/** 生成唯一 ID */
export function generateId(prefix = 'node'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/** 深度克隆对象 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  if (obj instanceof Object) {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  
  return obj;
}

/** 合并样式 */
export function mergeStyle(...styles: Array<Partial<NodeStyle> | undefined>): NodeStyle {
  const result: NodeStyle = { ...DEFAULT_NODE_STYLE };
  
  for (const style of styles) {
    if (style) {
      Object.assign(result, style);
    }
  }
  
  return result;
}

/** 标准化 padding */
export function normalizePadding(padding: number | [number, number] | [number, number, number, number]): [number, number, number, number] {
  if (typeof padding === 'number') {
    return [padding, padding, padding, padding];
  }
  if (padding.length === 2) {
    return [padding[0], padding[1], padding[0], padding[1]];
  }
  return padding;
}

/** 计算两点之间的距离 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** 计算两点之间的角度（弧度） */
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/** 判断点是否在矩形内 */
export function isPointInRect(point: Point, rect: Rect): boolean {
  return point.x >= rect.x &&
         point.x <= rect.x + rect.width &&
         point.y >= rect.y &&
         point.y <= rect.y + rect.height;
}

/** 判断两个矩形是否相交 */
export function isRectIntersect(rect1: Rect, rect2: Rect): boolean {
  return !(rect1.x + rect1.width < rect2.x ||
           rect2.x + rect2.width < rect1.x ||
           rect1.y + rect1.height < rect2.y ||
           rect2.y + rect2.height < rect1.y);
}

/** 计算矩形的边界 */
export function getRectBounds(rect: Rect): Bounds {
  return {
    minX: rect.x,
    minY: rect.y,
    maxX: rect.x + rect.width,
    maxY: rect.y + rect.height,
  };
}

/** 合并边界 */
export function mergeBounds(bounds1: Bounds, bounds2: Bounds): Bounds {
  return {
    minX: Math.min(bounds1.minX, bounds2.minX),
    minY: Math.min(bounds1.minY, bounds2.minY),
    maxX: Math.max(bounds1.maxX, bounds2.maxX),
    maxY: Math.max(bounds1.maxY, bounds2.maxY),
  };
}

/** 扩展边界 */
export function expandBounds(bounds: Bounds, padding: number): Bounds {
  return {
    minX: bounds.minX - padding,
    minY: bounds.minY - padding,
    maxX: bounds.maxX + padding,
    maxY: bounds.maxY + padding,
  };
}

/** 获取边界的中心点 */
export function getBoundsCenter(bounds: Bounds): Point {
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
}

/** 获取矩形的中心点 */
export function getRectCenter(rect: Rect): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

/** 防抖函数 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func.apply(this, args);
      timeout = null;
    }, wait);
  };
}

/** 节流函数 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    lastArgs = args;
    
    if (!timeout) {
      func.apply(this, args);
      lastArgs = null;
      
      timeout = setTimeout(() => {
        if (lastArgs) {
          func.apply(this, lastArgs);
          lastArgs = null;
        }
        timeout = null;
      }, wait);
    }
  };
}

/** 限制数值范围 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 线性插值 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/** 缓动函数 - easeInOutCubic */
export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** 遍历节点树 */
export function traverseTree(
  node: NodeData,
  callback: (node: NodeData, depth: number, parent: NodeData | null) => void | boolean,
  depth = 0,
  parent: NodeData | null = null
): void {
  const shouldContinue = callback(node, depth, parent);
  
  if (shouldContinue === false) {
    return;
  }
  
  if (node.children) {
    for (const child of node.children) {
      traverseTree(child, callback, depth + 1, node);
    }
  }
}

/** 查找节点 */
export function findNode(root: NodeData, predicate: (node: NodeData) => boolean): NodeData | null {
  let result: NodeData | null = null;
  
  traverseTree(root, (node) => {
    if (predicate(node)) {
      result = node;
      return false; // 停止遍历
    }
    return true;
  });
  
  return result;
}

/** 查找节点的父节点 */
export function findParentNode(root: NodeData, targetId: string): NodeData | null {
  let parent: NodeData | null = null;
  
  traverseTree(root, (node) => {
    if (node.children) {
      for (const child of node.children) {
        if (child.id === targetId) {
          parent = node;
          return false; // 停止遍历
        }
      }
    }
    return true;
  });
  
  return parent;
}

/** 获取节点路径 */
export function getNodePath(root: NodeData, targetId: string): NodeData[] {
  const path: NodeData[] = [];
  
  function findPath(node: NodeData): boolean {
    path.push(node);
    
    if (node.id === targetId) {
      return true;
    }
    
    if (node.children) {
      for (const child of node.children) {
        if (findPath(child)) {
          return true;
        }
      }
    }
    
    path.pop();
    return false;
  }
  
  findPath(root);
  return path;
}

/** 统计节点数量 */
export function countNodes(node: NodeData): number {
  let count = 1;
  
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  
  return count;
}

/** 获取树的最大深度 */
export function getTreeDepth(node: NodeData): number {
  if (!node.children || node.children.length === 0) {
    return 1;
  }
  
  let maxDepth = 0;
  for (const child of node.children) {
    maxDepth = Math.max(maxDepth, getTreeDepth(child));
  }
  
  return maxDepth + 1;
}

/** 颜色转换 - hex to rgba */
export function hexToRgba(hex: string, alpha = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** 颜色转换 - rgba to hex */
export function rgbaToHex(rgba: string): string {
  const matches = rgba.match(/\d+/g);
  if (!matches || matches.length < 3) return '#000000';
  
  const r = parseInt(matches[0]).toString(16).padStart(2, '0');
  const g = parseInt(matches[1]).toString(16).padStart(2, '0');
  const b = parseInt(matches[2]).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
}

/** 格式化文件大小 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/** 下载文件 */
export function downloadFile(content: string | Blob, filename: string, mimeType?: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 延迟释放 URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/** 测量文本宽度 */
export function measureText(text: string, font: string, ctx?: CanvasRenderingContext2D): number {
  if (ctx) {
    const prevFont = ctx.font;
    ctx.font = font;
    const width = ctx.measureText(text).width;
    ctx.font = prevFont;
    return width;
  }
  
  // 创建临时 canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  context.font = font;
  return context.measureText(text).width;
}

/** 换行文本 */
export function wrapText(text: string, maxWidth: number, font: string): string[] {
  const lines: string[] = [];
  const words = text.split(' ');
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = measureText(testLine, font);
    
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

