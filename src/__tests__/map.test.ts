/**
 * 地图系统测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Map } from '../core/map.js';
import { CellType } from '../types/index.js';

describe('Map', () => {
  let map: Map;

  // 测试用的小地图
  const testMapData = [
    [1, 1, 1, 1, 1],
    [1, 2, 0, 3, 1],
    [1, 0, 1, 0, 1],
    [1, 2, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ];

  beforeEach(() => {
    map = new Map(testMapData);
  });

  describe('地图初始化', () => {
    it('应该正确初始化地图尺寸', () => {
      expect(map.width).toBe(5);
      expect(map.height).toBe(5);
    });

    it('应该正确存储地图数据', () => {
      expect(map.getCell(0, 0)).toBe(CellType.WALL);
      expect(map.getCell(1, 1)).toBe(CellType.DOT);
      expect(map.getCell(2, 1)).toBe(CellType.EMPTY);
      expect(map.getCell(3, 1)).toBe(CellType.POWER_PELLET);
    });
  });

  describe('边界检查', () => {
    it('应该正确识别墙', () => {
      expect(map.isWall(0, 0)).toBe(true);
      expect(map.isWall(1, 1)).toBe(false);
      expect(map.isWall(2, 1)).toBe(false);
    });

    it('越界位置应该被视为墙', () => {
      expect(map.isWall(-1, 0)).toBe(true);
      expect(map.isWall(0, -1)).toBe(true);
      expect(map.isWall(5, 0)).toBe(true);
      expect(map.isWall(0, 5)).toBe(true);
    });

    it('应该正确验证位置有效性', () => {
      expect(map.isValidPosition(0, 0)).toBe(true);
      expect(map.isValidPosition(4, 4)).toBe(true);
      expect(map.isValidPosition(-1, 0)).toBe(false);
      expect(map.isValidPosition(5, 0)).toBe(false);
    });
  });

  describe('豆子操作', () => {
    it('应该能吃普通豆子', () => {
      expect(map.eatDot(1, 1)).toBe(true);
      expect(map.getCell(1, 1)).toBe(CellType.EMPTY);
    });

    it('吃空位置应该返回false', () => {
      expect(map.eatDot(2, 1)).toBe(false);
    });

    it('不能吃能量豆位置的普通豆子', () => {
      expect(map.eatDot(3, 1)).toBe(false);
    });

    it('应该能吃能量豆', () => {
      expect(map.eatPowerPellet(3, 1)).toBe(true);
      expect(map.getCell(3, 1)).toBe(CellType.EMPTY);
    });

    it('吃普通豆子位置的能量豆应该返回false', () => {
      expect(map.eatPowerPellet(1, 1)).toBe(false);
    });
  });

  describe('豆子计数', () => {
    it('应该正确计算剩余豆子数量', () => {
      // 测试地图中有3个豆子（2个普通 + 1个能量豆）
      expect(map.getRemainingDots()).toBe(3);
    });

    it('吃豆后应该减少计数', () => {
      map.eatDot(1, 1);
      expect(map.getRemainingDots()).toBe(2);
      
      map.eatPowerPellet(3, 1);
      expect(map.getRemainingDots()).toBe(1);
    });
  });

  describe('坐标转换', () => {
    it('应该正确转换世界坐标到网格坐标', () => {
      const pos = map.worldToGrid(25, 25, 20);
      expect(pos.col).toBe(1);
      expect(pos.row).toBe(1);
    });

    it('应该正确转换网格坐标到世界坐标', () => {
      const pos = map.gridToWorld(1, 1, 20);
      expect(pos.x).toBe(30);
      expect(pos.y).toBe(30);
    });
  });

  describe('地图重置', () => {
    it('应该能重置地图到初始状态', () => {
      map.eatDot(1, 1);
      map.eatPowerPellet(3, 1);
      
      map.reset();
      
      expect(map.getCell(1, 1)).toBe(CellType.DOT);
      expect(map.getCell(3, 1)).toBe(CellType.POWER_PELLET);
      expect(map.getRemainingDots()).toBe(3);
    });
  });
});
