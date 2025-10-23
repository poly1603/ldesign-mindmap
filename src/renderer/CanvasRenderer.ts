/**
 * @ldesign/mindmap - Canvas 渲染器
 */

import type { MindNode } from '../core/Node';
import type { ViewportTransform, Bounds, NodeStyle, ConnectionStyle } from '../types';
import { RENDER, DEFAULT_CONNECTION_STYLE } from '../utils/constants';
import { isRectIntersect, normalizePadding, measureText, wrapText } from '../utils/helpers';

/**
 * Canvas 渲染器
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number;
  
  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    
    container.appendChild(this.canvas);
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法创建 Canvas 2D 上下文');
    }
    this.ctx = ctx;
    
    this.dpr = RENDER.devicePixelRatio;
    this.resize();
  }
  
  /**
   * 调整大小
   */
  resize(): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    
    const rect = parent.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    
    this.ctx.scale(this.dpr, this.dpr);
  }
  
  /**
   * 清空画布
   */
  clear(): void {
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;
    this.ctx.clearRect(0, 0, width, height);
  }
  
  /**
   * 渲染
   */
  render(rootNode: MindNode, transform: ViewportTransform, visibleBounds: Bounds): void {
    this.clear();
    
    this.ctx.save();
    this.ctx.translate(transform.x, transform.y);
    this.ctx.scale(transform.scale, transform.scale);
    
    // 渲染连接线
    this.renderConnections(rootNode, visibleBounds);
    
    // 渲染节点
    this.renderNodes(rootNode, visibleBounds);
    
    this.ctx.restore();
  }
  
  /**
   * 渲染节点
   */
  private renderNodes(node: MindNode, visibleBounds: Bounds): void {
    // 检查节点是否在可见区域内
    if (!this.isNodeVisible(node, visibleBounds)) {
      return;
    }
    
    // 渲染当前节点
    this.renderNode(node);
    
    // 递归渲染子节点
    if (node.expanded) {
      for (const child of node.children) {
        if (!child.hidden) {
          this.renderNodes(child, visibleBounds);
        }
      }
    }
  }
  
  /**
   * 渲染单个节点
   */
  private renderNode(node: MindNode): void {
    const { x, y, width, height, style } = node;
    
    this.ctx.save();
    
    // 绘制阴影
    if (style.shadowBlur) {
      this.ctx.shadowBlur = style.shadowBlur;
      this.ctx.shadowColor = style.shadowColor || 'rgba(0, 0, 0, 0.2)';
      this.ctx.shadowOffsetX = style.shadowOffsetX || 0;
      this.ctx.shadowOffsetY = style.shadowOffsetY || 2;
    }
    
    // 设置透明度
    this.ctx.globalAlpha = style.opacity !== undefined ? style.opacity : 1;
    
    // 绘制形状
    this.drawShape(node);
    
    // 绘制边框
    if (style.borderWidth && style.borderWidth > 0) {
      this.ctx.strokeStyle = style.borderColor || '#000';
      this.ctx.lineWidth = style.borderWidth;
      this.setLineStyle(style.borderStyle || 'solid');
      this.ctx.stroke();
    }
    
    // 重置阴影
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    // 绘制图标
    if (style.icon) {
      this.drawIcon(node);
    }
    
    // 绘制文本
    this.drawText(node);
    
    // 绘制选中状态
    if (node.selected) {
      this.drawSelection(node);
    }
    
    this.ctx.restore();
  }
  
  /**
   * 绘制形状
   */
  private drawShape(node: MindNode): void {
    const { x, y, width, height, style } = node;
    const shape = style.shape || 'rounded';
    
    this.ctx.beginPath();
    
    switch (shape) {
      case 'rectangle':
        this.ctx.rect(x, y, width, height);
        break;
        
      case 'rounded': {
        const radius = style.borderRadius || 4;
        this.roundRect(x, y, width, height, radius);
        break;
      }
        
      case 'circle':
      case 'ellipse': {
        const cx = x + width / 2;
        const cy = y + height / 2;
        const rx = width / 2;
        const ry = height / 2;
        this.ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        break;
      }
        
      case 'diamond': {
        const cx = x + width / 2;
        const cy = y + height / 2;
        this.ctx.moveTo(cx, y);
        this.ctx.lineTo(x + width, cy);
        this.ctx.lineTo(cx, y + height);
        this.ctx.lineTo(x, cy);
        this.ctx.closePath();
        break;
      }
        
      case 'hexagon': {
        const cx = x + width / 2;
        const cy = y + height / 2;
        const rx = width / 2;
        const ry = height / 2;
        
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          const px = cx + rx * Math.cos(angle);
          const py = cy + ry * Math.sin(angle);
          
          if (i === 0) {
            this.ctx.moveTo(px, py);
          } else {
            this.ctx.lineTo(px, py);
          }
        }
        this.ctx.closePath();
        break;
      }
        
      default:
        this.ctx.rect(x, y, width, height);
    }
    
    // 填充背景
    if (style.backgroundColor) {
      this.ctx.fillStyle = style.backgroundColor;
      this.ctx.fill();
    }
  }
  
  /**
   * 绘制圆角矩形
   */
  private roundRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.arcTo(x + width, y, x + width, y + radius, radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.arcTo(x, y + height, x, y + height - radius, radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.arcTo(x, y, x + radius, y, radius);
    this.ctx.closePath();
  }
  
  /**
   * 设置线条样式
   */
  private setLineStyle(style: string): void {
    switch (style) {
      case 'dashed':
        this.ctx.setLineDash([5, 5]);
        break;
      case 'dotted':
        this.ctx.setLineDash([2, 2]);
        break;
      case 'double':
        // 双线样式需要特殊处理
        this.ctx.setLineDash([]);
        break;
      default:
        this.ctx.setLineDash([]);
    }
  }
  
  /**
   * 绘制图标
   */
  private drawIcon(node: MindNode): void {
    // 图标绘制逻辑（可以集成图标库）
    // 这里先留空，后续可以集成 FontAwesome 或其他图标库
  }
  
  /**
   * 绘制文本
   */
  private drawText(node: MindNode): void {
    const { x, y, width, height, style } = node;
    const padding = normalizePadding(style.padding || [12, 20, 12, 20]);
    const text = typeof node.text === 'string' ? node.text : node.getPlainText();
    
    this.ctx.fillStyle = style.textColor || '#000';
    this.ctx.font = this.getFont(style);
    this.ctx.textAlign = style.textAlign || 'center';
    this.ctx.textBaseline = 'middle';
    
    const textX = x + padding[3] + (width - padding[1] - padding[3]) / 2;
    const textY = y + height / 2;
    
    // 简单文本绘制（不换行）
    this.ctx.fillText(text, textX, textY);
  }
  
  /**
   * 获取字体字符串
   */
  private getFont(style: NodeStyle): string {
    const fontSize = style.fontSize || 14;
    const fontWeight = style.fontWeight || '400';
    const fontStyle = style.fontStyle || 'normal';
    const fontFamily = style.fontFamily || 'sans-serif';
    
    return `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  }
  
  /**
   * 绘制选中状态
   */
  private drawSelection(node: MindNode): void {
    const { x, y, width, height } = node;
    const padding = RENDER.selectionPadding;
    
    this.ctx.strokeStyle = RENDER.selectionBorderColor;
    this.ctx.lineWidth = RENDER.selectionBorderWidth;
    this.setLineStyle(RENDER.selectionBorderStyle);
    
    this.ctx.strokeRect(
      x - padding,
      y - padding,
      width + padding * 2,
      height + padding * 2
    );
    
    this.ctx.setLineDash([]);
  }
  
  /**
   * 渲染连接线
   */
  private renderConnections(node: MindNode, visibleBounds: Bounds): void {
    if (!node.expanded) {
      return;
    }
    
    for (const child of node.children) {
      if (!child.hidden) {
        this.renderConnection(node, child);
        this.renderConnections(child, visibleBounds);
      }
    }
  }
  
  /**
   * 渲染单条连接线
   */
  private renderConnection(from: MindNode, to: MindNode): void {
    const style: ConnectionStyle = { ...DEFAULT_CONNECTION_STYLE };
    
    this.ctx.save();
    this.ctx.strokeStyle = style.strokeColor || '#999';
    this.ctx.lineWidth = style.strokeWidth || 2;
    this.setLineStyle(style.strokeStyle || 'solid');
    
    const type = style.type || 'bezier';
    
    switch (type) {
      case 'bezier':
        this.drawBezierConnection(from, to);
        break;
      case 'straight':
        this.drawStraightConnection(from, to);
        break;
      case 'polyline':
        this.drawPolylineConnection(from, to);
        break;
      case 'orthogonal':
        this.drawOrthogonalConnection(from, to);
        break;
    }
    
    this.ctx.stroke();
    this.ctx.restore();
  }
  
  /**
   * 绘制贝塞尔曲线连接
   */
  private drawBezierConnection(from: MindNode, to: MindNode): void {
    const fromX = from.x + from.width;
    const fromY = from.y + from.height / 2;
    const toX = to.x;
    const toY = to.y + to.height / 2;
    
    const offset = RENDER.connectionBezierOffset;
    const cp1x = fromX + offset;
    const cp1y = fromY;
    const cp2x = toX - offset;
    const cp2y = toY;
    
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toX, toY);
  }
  
  /**
   * 绘制直线连接
   */
  private drawStraightConnection(from: MindNode, to: MindNode): void {
    const fromX = from.x + from.width;
    const fromY = from.y + from.height / 2;
    const toX = to.x;
    const toY = to.y + to.height / 2;
    
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
  }
  
  /**
   * 绘制折线连接
   */
  private drawPolylineConnection(from: MindNode, to: MindNode): void {
    const fromX = from.x + from.width;
    const fromY = from.y + from.height / 2;
    const toX = to.x;
    const toY = to.y + to.height / 2;
    
    const midX = (fromX + toX) / 2;
    
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(midX, fromY);
    this.ctx.lineTo(midX, toY);
    this.ctx.lineTo(toX, toY);
  }
  
  /**
   * 绘制正交连接
   */
  private drawOrthogonalConnection(from: MindNode, to: MindNode): void {
    // 简化版正交连接
    this.drawPolylineConnection(from, to);
  }
  
  /**
   * 检查节点是否可见
   */
  private isNodeVisible(node: MindNode, bounds: Bounds): boolean {
    return isRectIntersect(node.rect, {
      x: bounds.minX,
      y: bounds.minY,
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY,
    });
  }
  
  /**
   * 获取 Canvas 元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
  
  /**
   * 销毁
   */
  destroy(): void {
    this.canvas.remove();
  }
}

