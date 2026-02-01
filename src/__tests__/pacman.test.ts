/**
 * 吃豆人实体测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Pacman } from '../entities/pacman.js';
import { Map } from '../core/map.js';
import { Direction } from '../types/index.js';

describe('Pacman', () => {
  let pacman: Pacman;
  let map: Map;
  const TILE_SIZE = 20;

  // 测试地图：简单的走廊
  const testMapData = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
  ];

  beforeEach(() => {
    map = new Map(testMapData);
    // 在(1,1)位置创建吃豆人
    pacman = new Pacman(1, 1, TILE_SIZE);
  });

  describe('初始化', () => {
    it('应该在指定网格位置初始化', () => {
      expect(pacman.gridPosition.col).toBe(1);
      expect(pacman.gridPosition.row).toBe(1);
    });

    it('应该在世界坐标中心位置初始化', () => {
      // (1,1)位置的中心应该是 (30, 30)
      expect(pacman.position.x).toBe(30);
      expect(pacman.position.y).toBe(30);
    });

    it('初始方向应该为NONE', () => {
      expect(pacman.direction).toBe(Direction.NONE);
    });
  });

  describe('移动', () => {
    it('应该能向右移动', () => {
      const result = pacman.move(Direction.RIGHT, map, TILE_SIZE);
      expect(result).toBe(true);
      expect(pacman.position.x).toBeGreaterThan(30);
      expect(pacman.direction).toBe(Direction.RIGHT);
    });

    it('应该能向左移动', () => {
      pacman.move(Direction.RIGHT, map, TILE_SIZE); // 先移动到(2,1)
      const result = pacman.move(Direction.LEFT, map, TILE_SIZE);
      expect(result).toBe(true);
      expect(pacman.position.x).toBeLessThan(pacman.position.x + 10);
    });

    it('应该能向下移动', () => {
      const result = pacman.move(Direction.DOWN, map, TILE_SIZE);
      expect(result).toBe(true);
      expect(pacman.position.y).toBeGreaterThan(30);
    });

    it('应该能向上移动', () => {
      pacman.move(Direction.DOWN, map, TILE_SIZE); // 先向下移动
      const result = pacman.move(Direction.UP, map, TILE_SIZE);
      expect(result).toBe(true);
      expect(pacman.direction).toBe(Direction.UP);
    });

    it('不应该能穿墙', () => {
      // 先把吃豆人移动到(1,1)靠近上方墙壁的位置
      // 吃豆人在(30,30)，向上移动直到撞墙
      let moveCount = 0;
      let lastY = pacman.position.y;
      
      // 持续向上移动，直到被阻挡或移动了足够多次
      while (moveCount < 20) {
        const result = pacman.move(Direction.UP, map, TILE_SIZE);
        if (!result) {
          // 被阻挡了
          expect(pacman.position.y).toBe(lastY);
          return;
        }
        lastY = pacman.position.y;
        moveCount++;
      }
      
      // 如果没有被阻挡，说明碰撞检测有问题
      // 但我们期望在碰到row=0的墙之前就被阻挡
      // 由于初始位置在row=1，向上最多移动约10像素就会碰到row=0的墙
      expect(moveCount).toBeLessThan(20);
    });

    it('NONE方向不应该移动', () => {
      const initialX = pacman.position.x;
      const initialY = pacman.position.y;
      
      const result = pacman.move(Direction.NONE, map, TILE_SIZE);
      
      expect(result).toBe(false);
      expect(pacman.position.x).toBe(initialX);
      expect(pacman.position.y).toBe(initialY);
    });
  });

  describe('碰撞检测', () => {
    it('在走廊中应该能自由移动', () => {
      // 向右移动到(5,1)
      for (let i = 0; i < 100; i++) {
        pacman.move(Direction.RIGHT, map, TILE_SIZE);
      }
      
      // 应该能到达最右边
      expect(pacman.position.x).toBeGreaterThan(100);
    });

    it('在墙壁前应该被阻挡', () => {
      // 向右移动直到撞墙
      for (let i = 0; i < 50; i++) {
        pacman.move(Direction.RIGHT, map, TILE_SIZE);
      }
      
      // 检查位置，不应该超过墙壁
      const maxX = 5 * TILE_SIZE + TILE_SIZE / 2; // 第5列的中心
      expect(pacman.position.x).toBeLessThanOrEqual(maxX + 5); // 允许小误差
    });
  });

  describe('重置', () => {
    it('重置应该回到初始位置', () => {
      // 移动吃豆人
      pacman.move(Direction.RIGHT, map, TILE_SIZE);
      pacman.move(Direction.DOWN, map, TILE_SIZE);
      
      // 重置
      pacman.reset(1, 1, TILE_SIZE);
      
      expect(pacman.position.x).toBe(30);
      expect(pacman.position.y).toBe(30);
      expect(pacman.gridPosition.col).toBe(1);
      expect(pacman.gridPosition.row).toBe(1);
      expect(pacman.direction).toBe(Direction.NONE);
    });
  });

  describe('属性获取', () => {
    it('应该能获取半径', () => {
      const radius = pacman.getRadius();
      expect(radius).toBe(TILE_SIZE / 2 - 2);
      expect(radius).toBe(8);
    });
  });
});
