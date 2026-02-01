/**
 * 输入处理系统
 * 处理键盘输入，管理方向控制
 */

import { Direction } from '../types/index.js';

export class InputHandler {
  private currentDirection: Direction = Direction.NONE;
  private nextDirection: Direction = Direction.NONE;
  private keys: Set<string> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  /**
   * 设置键盘事件监听
   */
  private setupEventListeners(): void {
    document.addEventListener('keydown', (e) => {
      this.handleKeyDown(e);
    });

    document.addEventListener('keyup', (e) => {
      this.handleKeyUp(e);
    });
  }

  /**
   * 处理按键按下
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // 防止方向键滚动页面
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
    }

    this.keys.add(event.key);

    // 方向键映射
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.nextDirection = Direction.UP;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.nextDirection = Direction.DOWN;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.nextDirection = Direction.LEFT;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.nextDirection = Direction.RIGHT;
        break;
    }
  }

  /**
   * 处理按键释放
   */
  private handleKeyUp(event: KeyboardEvent): void {
    this.keys.delete(event.key);
  }

  /**
   * 获取当前方向
   */
  getCurrentDirection(): Direction {
    return this.currentDirection;
  }

  /**
   * 获取下一个方向（待处理的方向）
   */
  getNextDirection(): Direction {
    return this.nextDirection;
  }

  /**
   * 确认方向改变
   */
  confirmDirectionChange(): void {
    this.currentDirection = this.nextDirection;
  }

  /**
   * 重置下一个方向
   */
  resetNextDirection(): void {
    this.nextDirection = this.currentDirection;
  }

  /**
   * 设置当前方向
   */
  setCurrentDirection(direction: Direction): void {
    this.currentDirection = direction;
  }

  /**
   * 检查按键是否被按下
   */
  isKeyPressed(key: string): boolean {
    return this.keys.has(key);
  }

  /**
   * 清理所有按键状态
   */
  reset(): void {
    this.currentDirection = Direction.NONE;
    this.nextDirection = Direction.NONE;
    this.keys.clear();
  }
}
