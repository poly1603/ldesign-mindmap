/**
 * @ldesign/mindmap - 命令模式基类
 */

import type { Command } from '../types';

/**
 * 抽象命令基类
 */
export abstract class BaseCommand implements Command {
  abstract name: string;
  
  abstract execute(): void;
  abstract undo(): void;
  
  redo(): void {
    this.execute();
  }
  
  canMerge(other: Command): boolean {
    return false;
  }
  
  merge(other: Command): void {
    // 子类可以重写此方法实现命令合并
  }
}

/**
 * 命令历史管理器
 */
export class CommandHistory {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxStackSize: number = 100;
  private isExecuting: boolean = false;
  
  constructor(maxStackSize = 100) {
    this.maxStackSize = maxStackSize;
  }
  
  /**
   * 执行命令
   */
  execute(command: Command): void {
    if (this.isExecuting) {
      return;
    }
    
    this.isExecuting = true;
    
    try {
      command.execute();
      
      // 尝试与栈顶命令合并
      const lastCommand = this.undoStack[this.undoStack.length - 1];
      if (lastCommand && lastCommand.canMerge(command)) {
        lastCommand.merge(command);
      } else {
        this.undoStack.push(command);
        
        // 限制栈大小
        if (this.undoStack.length > this.maxStackSize) {
          this.undoStack.shift();
        }
      }
      
      // 清空重做栈
      this.redoStack = [];
    } finally {
      this.isExecuting = false;
    }
  }
  
  /**
   * 撤销
   */
  undo(): boolean {
    if (this.undoStack.length === 0 || this.isExecuting) {
      return false;
    }
    
    this.isExecuting = true;
    
    try {
      const command = this.undoStack.pop()!;
      command.undo();
      this.redoStack.push(command);
      return true;
    } finally {
      this.isExecuting = false;
    }
  }
  
  /**
   * 重做
   */
  redo(): boolean {
    if (this.redoStack.length === 0 || this.isExecuting) {
      return false;
    }
    
    this.isExecuting = true;
    
    try {
      const command = this.redoStack.pop()!;
      command.redo();
      this.undoStack.push(command);
      return true;
    } finally {
      this.isExecuting = false;
    }
  }
  
  /**
   * 清空历史
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
  
  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.undoStack.length > 0 && !this.isExecuting;
  }
  
  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.redoStack.length > 0 && !this.isExecuting;
  }
  
  /**
   * 获取撤销栈大小
   */
  get undoStackSize(): number {
    return this.undoStack.length;
  }
  
  /**
   * 获取重做栈大小
   */
  get redoStackSize(): number {
    return this.redoStack.length;
  }
  
  /**
   * 获取历史记录列表
   */
  getHistory(): Array<{ name: string; type: 'undo' | 'redo' }> {
    return [
      ...this.undoStack.map(cmd => ({ name: cmd.name, type: 'undo' as const })),
      ...this.redoStack.map(cmd => ({ name: cmd.name, type: 'redo' as const })),
    ];
  }
}

