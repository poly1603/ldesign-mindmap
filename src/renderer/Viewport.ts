/**
 * @ldesign/mindmap - 视口管理器
 */

import type { Point, Bounds } from '../types';
import { clamp, lerp, easeInOutCubic } from '../utils/helpers';
import { EventBus } from '../core/EventBus';
import { EVENTS, ANIMATION } from '../utils/constants';

/**
 * 视口变换
 */
export interface ViewportTransform {
  x: number;
  y: number;
  scale: number;
}

/**
 * 视口管理器
 */
export class Viewport {
  private container: HTMLElement;
  private eventBus: EventBus;
  private transform: ViewportTransform;
  
  private minScale: number;
  private maxScale: number;
  private zoomSpeed: number;
  
  private isDragging = false;
  private dragStart: Point = { x: 0, y: 0 };
  private dragOffset: Point = { x: 0, y: 0 };
  
  private animationId: number | null = null;
  
  constructor(
    container: HTMLElement,
    eventBus: EventBus,
    options: {
      minScale?: number;
      maxScale?: number;
      zoomSpeed?: number;
      initialScale?: number;
      initialPosition?: Point;
    } = {}
  ) {
    this.container = container;
    this.eventBus = eventBus;
    
    this.minScale = options.minScale || 0.1;
    this.maxScale = options.maxScale || 5;
    this.zoomSpeed = options.zoomSpeed || 0.1;
    
    this.transform = {
      x: options.initialPosition?.x || 0,
      y: options.initialPosition?.y || 0,
      scale: options.initialScale || 1,
    };
  }
  
  /**
   * 获取当前变换
   */
  getTransform(): ViewportTransform {
    return { ...this.transform };
  }
  
  /**
   * 设置变换
   */
  setTransform(transform: Partial<ViewportTransform>, animate = false): void {
    const newTransform = {
      x: transform.x !== undefined ? transform.x : this.transform.x,
      y: transform.y !== undefined ? transform.y : this.transform.y,
      scale: transform.scale !== undefined ? clamp(transform.scale, this.minScale, this.maxScale) : this.transform.scale,
    };
    
    if (animate) {
      this.animateTransform(newTransform);
    } else {
      this.applyTransform(newTransform);
    }
  }
  
  /**
   * 应用变换
   */
  private applyTransform(transform: ViewportTransform): void {
    this.transform = transform;
    this.eventBus.emit(EVENTS.ZOOM_CHANGE, this.transform.scale);
    this.eventBus.emit(EVENTS.PAN_CHANGE, { x: this.transform.x, y: this.transform.y });
  }
  
  /**
   * 动画变换
   */
  private animateTransform(target: ViewportTransform): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    
    const start = { ...this.transform };
    const startTime = Date.now();
    const duration = ANIMATION.zoomDuration;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const t = easeInOutCubic(progress);
      
      this.applyTransform({
        x: lerp(start.x, target.x, t),
        y: lerp(start.y, target.y, t),
        scale: lerp(start.scale, target.scale, t),
      });
      
      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.animationId = null;
      }
    };
    
    animate();
  }
  
  /**
   * 缩放
   */
  zoom(delta: number, center?: Point): void {
    const factor = 1 + delta * this.zoomSpeed;
    const newScale = clamp(this.transform.scale * factor, this.minScale, this.maxScale);
    
    if (newScale === this.transform.scale) {
      return;
    }
    
    // 如果指定了中心点，以该点为中心缩放
    if (center) {
      const ratio = newScale / this.transform.scale;
      this.transform.x = center.x - (center.x - this.transform.x) * ratio;
      this.transform.y = center.y - (center.y - this.transform.y) * ratio;
    }
    
    this.transform.scale = newScale;
    this.eventBus.emit(EVENTS.ZOOM_CHANGE, this.transform.scale);
  }
  
  /**
   * 放大
   */
  zoomIn(center?: Point): void {
    this.zoom(1, center);
  }
  
  /**
   * 缩小
   */
  zoomOut(center?: Point): void {
    this.zoom(-1, center);
  }
  
  /**
   * 重置缩放
   */
  resetZoom(animate = true): void {
    this.setTransform({ scale: 1 }, animate);
  }
  
  /**
   * 平移
   */
  pan(dx: number, dy: number): void {
    this.transform.x += dx;
    this.transform.y += dy;
    this.eventBus.emit(EVENTS.PAN_CHANGE, { x: this.transform.x, y: this.transform.y });
  }
  
  /**
   * 居中显示
   */
  centerTo(point: Point, animate = true): void {
    const rect = this.container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    this.setTransform({
      x: centerX - point.x * this.transform.scale,
      y: centerY - point.y * this.transform.scale,
    }, animate);
  }
  
  /**
   * 适应视图
   */
  fitBounds(bounds: Bounds, padding = 50, animate = true): void {
    const rect = this.container.getBoundingClientRect();
    
    const boundsWidth = bounds.maxX - bounds.minX;
    const boundsHeight = bounds.maxY - bounds.minY;
    
    const scaleX = (rect.width - padding * 2) / boundsWidth;
    const scaleY = (rect.height - padding * 2) / boundsHeight;
    const scale = clamp(Math.min(scaleX, scaleY), this.minScale, this.maxScale);
    
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    
    this.setTransform({
      x: rect.width / 2 - centerX * scale,
      y: rect.height / 2 - centerY * scale,
      scale,
    }, animate);
  }
  
  /**
   * 获取可见区域边界
   */
  getVisibleBounds(): Bounds {
    const rect = this.container.getBoundingClientRect();
    const { x, y, scale } = this.transform;
    
    return {
      minX: -x / scale,
      minY: -y / scale,
      maxX: (rect.width - x) / scale,
      maxY: (rect.height - y) / scale,
    };
  }
  
  /**
   * 屏幕坐标转换为世界坐标
   */
  screenToWorld(point: Point): Point {
    const { x, y, scale } = this.transform;
    return {
      x: (point.x - x) / scale,
      y: (point.y - y) / scale,
    };
  }
  
  /**
   * 世界坐标转换为屏幕坐标
   */
  worldToScreen(point: Point): Point {
    const { x, y, scale } = this.transform;
    return {
      x: point.x * scale + x,
      y: point.y * scale + y,
    };
  }
  
  /**
   * 开始拖拽
   */
  startDrag(point: Point): void {
    this.isDragging = true;
    this.dragStart = point;
    this.dragOffset = { x: this.transform.x, y: this.transform.y };
  }
  
  /**
   * 拖拽移动
   */
  drag(point: Point): void {
    if (!this.isDragging) {
      return;
    }
    
    this.transform.x = this.dragOffset.x + (point.x - this.dragStart.x);
    this.transform.y = this.dragOffset.y + (point.y - this.dragStart.y);
    this.eventBus.emit(EVENTS.PAN_CHANGE, { x: this.transform.x, y: this.transform.y });
  }
  
  /**
   * 结束拖拽
   */
  endDrag(): void {
    this.isDragging = false;
  }
  
  /**
   * 是否正在拖拽
   */
  get dragging(): boolean {
    return this.isDragging;
  }
  
  /**
   * 销毁
   */
  destroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

