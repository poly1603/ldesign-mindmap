/**
 * @ldesign/mindmap - 节点模型
 */

import type { NodeData, NodeStyle, Point, Rect, RichTextContent } from '../types';
import { generateId, deepClone, mergeStyle } from '../utils/helpers';
import { DEFAULT_NODE_STYLE, DEFAULT_ROOT_NODE_STYLE } from '../utils/constants';

/**
 * 思维导图节点类
 */
export class MindNode {
  id: string;
  text: string | RichTextContent[];
  children: MindNode[];
  parent: MindNode | null;
  style: NodeStyle;
  data: Record<string, any>;
  
  // 状态
  expanded: boolean;
  selected: boolean;
  hidden: boolean;
  
  // 标签和类型
  tags: string[];
  type?: string;
  
  // 位置和尺寸（由布局引擎计算）
  x: number;
  y: number;
  width: number;
  height: number;
  
  // 缓存的渲染信息
  private _rect?: Rect;
  private _centerPoint?: Point;
  
  constructor(data: Partial<NodeData> = {}) {
    this.id = data.id || generateId('node');
    this.text = data.text || '新节点';
    this.children = [];
    this.parent = null;
    this.style = mergeStyle(DEFAULT_NODE_STYLE, data.style);
    this.data = data.data || {};
    
    this.expanded = data.expanded !== false;
    this.selected = data.selected || false;
    this.hidden = data.hidden || false;
    
    this.tags = data.tags || [];
    this.type = data.type;
    
    this.x = data.x || 0;
    this.y = data.y || 0;
    this.width = data.width || 0;
    this.height = data.height || 0;
    
    // 递归创建子节点
    if (data.children) {
      this.children = data.children.map(childData => {
        const child = new MindNode(childData);
        child.parent = this;
        return child;
      });
    }
  }
  
  /**
   * 是否为根节点
   */
  get isRoot(): boolean {
    return this.parent === null;
  }
  
  /**
   * 是否为叶子节点
   */
  get isLeaf(): boolean {
    return this.children.length === 0;
  }
  
  /**
   * 获取深度（从根节点开始为 0）
   */
  get depth(): number {
    let depth = 0;
    let node: MindNode | null = this;
    while (node.parent) {
      depth++;
      node = node.parent;
    }
    return depth;
  }
  
  /**
   * 获取层级（从根节点开始为 1）
   */
  get level(): number {
    return this.depth + 1;
  }
  
  /**
   * 获取根节点
   */
  get root(): MindNode {
    let node: MindNode = this;
    while (node.parent) {
      node = node.parent;
    }
    return node;
  }
  
  /**
   * 获取节点矩形
   */
  get rect(): Rect {
    if (!this._rect || this._rect.x !== this.x || this._rect.y !== this.y) {
      this._rect = {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
      };
    }
    return this._rect;
  }
  
  /**
   * 获取中心点
   */
  get centerPoint(): Point {
    if (!this._centerPoint) {
      this._centerPoint = {
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
      };
    }
    return this._centerPoint;
  }
  
  /**
   * 获取可见子节点
   */
  get visibleChildren(): MindNode[] {
    if (!this.expanded) {
      return [];
    }
    return this.children.filter(child => !child.hidden);
  }
  
  /**
   * 获取所有后代节点
   */
  get descendants(): MindNode[] {
    const result: MindNode[] = [];
    
    const traverse = (node: MindNode) => {
      for (const child of node.children) {
        result.push(child);
        traverse(child);
      }
    };
    
    traverse(this);
    return result;
  }
  
  /**
   * 获取所有祖先节点
   */
  get ancestors(): MindNode[] {
    const result: MindNode[] = [];
    let node: MindNode | null = this.parent;
    
    while (node) {
      result.push(node);
      node = node.parent;
    }
    
    return result;
  }
  
  /**
   * 获取兄弟节点
   */
  get siblings(): MindNode[] {
    if (!this.parent) {
      return [];
    }
    return this.parent.children.filter(child => child !== this);
  }
  
  /**
   * 获取前一个兄弟节点
   */
  get previousSibling(): MindNode | null {
    if (!this.parent) {
      return null;
    }
    const index = this.parent.children.indexOf(this);
    return index > 0 ? this.parent.children[index - 1] : null;
  }
  
  /**
   * 获取后一个兄弟节点
   */
  get nextSibling(): MindNode | null {
    if (!this.parent) {
      return null;
    }
    const index = this.parent.children.indexOf(this);
    return index < this.parent.children.length - 1 ? this.parent.children[index + 1] : null;
  }
  
  /**
   * 添加子节点
   */
  addChild(data: Partial<NodeData> | MindNode, index?: number): MindNode {
    const child = data instanceof MindNode ? data : new MindNode(data);
    child.parent = this;
    
    if (typeof index === 'number' && index >= 0 && index <= this.children.length) {
      this.children.splice(index, 0, child);
    } else {
      this.children.push(child);
    }
    
    return child;
  }
  
  /**
   * 移除子节点
   */
  removeChild(child: MindNode | string): boolean {
    const index = typeof child === 'string'
      ? this.children.findIndex(c => c.id === child)
      : this.children.indexOf(child);
    
    if (index !== -1) {
      const removedChild = this.children[index];
      removedChild.parent = null;
      this.children.splice(index, 1);
      return true;
    }
    
    return false;
  }
  
  /**
   * 移除所有子节点
   */
  removeAllChildren(): void {
    for (const child of this.children) {
      child.parent = null;
    }
    this.children = [];
  }
  
  /**
   * 移除自身
   */
  remove(): boolean {
    if (this.parent) {
      return this.parent.removeChild(this);
    }
    return false;
  }
  
  /**
   * 移动节点到新父节点
   */
  moveTo(newParent: MindNode, index?: number): boolean {
    if (newParent === this || newParent.isDescendantOf(this)) {
      return false; // 不能移动到自己或子孙节点
    }
    
    // 从原父节点移除
    if (this.parent) {
      this.parent.removeChild(this);
    }
    
    // 添加到新父节点
    newParent.addChild(this, index);
    return true;
  }
  
  /**
   * 判断是否为指定节点的后代
   */
  isDescendantOf(node: MindNode): boolean {
    let current: MindNode | null = this.parent;
    while (current) {
      if (current === node) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }
  
  /**
   * 判断是否为指定节点的祖先
   */
  isAncestorOf(node: MindNode): boolean {
    return node.isDescendantOf(this);
  }
  
  /**
   * 展开节点
   */
  expand(): void {
    this.expanded = true;
  }
  
  /**
   * 折叠节点
   */
  collapse(): void {
    this.expanded = false;
  }
  
  /**
   * 切换展开/折叠状态
   */
  toggleExpand(): void {
    this.expanded = !this.expanded;
  }
  
  /**
   * 展开所有后代节点
   */
  expandAll(): void {
    this.expanded = true;
    for (const child of this.children) {
      child.expandAll();
    }
  }
  
  /**
   * 折叠所有后代节点
   */
  collapseAll(): void {
    this.expanded = false;
    for (const child of this.children) {
      child.collapseAll();
    }
  }
  
  /**
   * 选中节点
   */
  select(): void {
    this.selected = true;
  }
  
  /**
   * 取消选中
   */
  deselect(): void {
    this.selected = false;
  }
  
  /**
   * 切换选中状态
   */
  toggleSelect(): void {
    this.selected = !this.selected;
  }
  
  /**
   * 更新文本
   */
  setText(text: string | RichTextContent[]): void {
    this.text = text;
  }
  
  /**
   * 获取纯文本内容
   */
  getPlainText(): string {
    if (typeof this.text === 'string') {
      return this.text;
    }
    return this.text.map(item => item.text).join('');
  }
  
  /**
   * 更新样式
   */
  updateStyle(style: Partial<NodeStyle>): void {
    this.style = mergeStyle(this.style, style);
  }
  
  /**
   * 重置样式
   */
  resetStyle(): void {
    this.style = this.isRoot
      ? { ...DEFAULT_ROOT_NODE_STYLE }
      : { ...DEFAULT_NODE_STYLE };
  }
  
  /**
   * 添加标签
   */
  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }
  
  /**
   * 移除标签
   */
  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index !== -1) {
      this.tags.splice(index, 1);
    }
  }
  
  /**
   * 判断是否有指定标签
   */
  hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }
  
  /**
   * 克隆节点（深拷贝）
   */
  clone(includeChildren = true): MindNode {
    const clonedData = this.toJSON();
    
    if (!includeChildren) {
      delete clonedData.children;
    }
    
    // 生成新的 ID
    clonedData.id = generateId('node');
    
    return new MindNode(clonedData);
  }
  
  /**
   * 转换为 JSON 数据
   */
  toJSON(): NodeData {
    const data: NodeData = {
      id: this.id,
      text: deepClone(this.text),
      style: deepClone(this.style),
      expanded: this.expanded,
      selected: this.selected,
      hidden: this.hidden,
      tags: [...this.tags],
      data: deepClone(this.data),
    };
    
    if (this.type) {
      data.type = this.type;
    }
    
    if (this.children.length > 0) {
      data.children = this.children.map(child => child.toJSON());
    }
    
    return data;
  }
  
  /**
   * 从 JSON 数据创建节点
   */
  static fromJSON(data: NodeData): MindNode {
    return new MindNode(data);
  }
  
  /**
   * 遍历节点树
   */
  traverse(callback: (node: MindNode, depth: number) => void | boolean, depth = 0): void {
    const shouldContinue = callback(this, depth);
    
    if (shouldContinue === false) {
      return;
    }
    
    for (const child of this.children) {
      child.traverse(callback, depth + 1);
    }
  }
  
  /**
   * 查找节点
   */
  find(predicate: (node: MindNode) => boolean): MindNode | null {
    if (predicate(this)) {
      return this;
    }
    
    for (const child of this.children) {
      const found = child.find(predicate);
      if (found) {
        return found;
      }
    }
    
    return null;
  }
  
  /**
   * 查找所有匹配的节点
   */
  findAll(predicate: (node: MindNode) => boolean): MindNode[] {
    const results: MindNode[] = [];
    
    this.traverse(node => {
      if (predicate(node)) {
        results.push(node);
      }
    });
    
    return results;
  }
  
  /**
   * 统计节点数量（包括自身）
   */
  count(): number {
    let count = 1;
    for (const child of this.children) {
      count += child.count();
    }
    return count;
  }
  
  /**
   * 获取树的最大深度
   */
  getMaxDepth(): number {
    if (this.children.length === 0) {
      return 1;
    }
    
    let maxDepth = 0;
    for (const child of this.children) {
      maxDepth = Math.max(maxDepth, child.getMaxDepth());
    }
    
    return maxDepth + 1;
  }
  
  /**
   * 更新位置
   */
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this._rect = undefined;
    this._centerPoint = undefined;
  }
  
  /**
   * 更新尺寸
   */
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this._rect = undefined;
    this._centerPoint = undefined;
  }
  
  /**
   * 设置矩形
   */
  setRect(rect: Rect): void {
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
    this._rect = undefined;
    this._centerPoint = undefined;
  }
}

