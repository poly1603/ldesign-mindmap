/**
 * @ldesign/mindmap - 事件总线
 */

import type { EventType, EventHandler } from '../types';

export class EventBus {
  private events: Map<EventType, Set<EventHandler>>;
  
  constructor() {
    this.events = new Map();
  }
  
  /**
   * 订阅事件
   */
  on(event: EventType, handler: EventHandler): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    this.events.get(event)!.add(handler);
    
    // 返回取消订阅函数
    return () => this.off(event, handler);
  }
  
  /**
   * 订阅一次性事件
   */
  once(event: EventType, handler: EventHandler): void {
    const wrapper: EventHandler = (data) => {
      handler(data);
      this.off(event, wrapper);
    };
    
    this.on(event, wrapper);
  }
  
  /**
   * 取消订阅
   */
  off(event: EventType, handler?: EventHandler): void {
    if (!handler) {
      // 移除所有监听器
      this.events.delete(event);
      return;
    }
    
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    }
  }
  
  /**
   * 触发事件
   */
  emit(event: EventType, data?: any): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }
  
  /**
   * 清空所有事件监听器
   */
  clear(): void {
    this.events.clear();
  }
  
  /**
   * 获取事件监听器数量
   */
  listenerCount(event?: EventType): number {
    if (event) {
      return this.events.get(event)?.size || 0;
    }
    
    let count = 0;
    this.events.forEach(handlers => {
      count += handlers.size;
    });
    return count;
  }
  
  /**
   * 获取所有事件名称
   */
  eventNames(): EventType[] {
    return Array.from(this.events.keys());
  }
}

