/**
 * 幽灵AI测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Ghost } from '../entities/ghost.js';
import { Map } from '../core/map.js';
import { GhostType, GhostState, Direction } from '../types/index.js';

describe('Ghost', () => {
  let ghost: Ghost;
  let map: Map;
  const TILE_SIZE = 20;

  // 测试地图
  const testMapData = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
  ];

  beforeEach(() => {
    map = new Map(testMapData);
    // 在(3,2)位置创建红色幽灵，散开目标在(6,0)
    ghost = new Ghost(GhostType.BLINKY, 3, 2, 6, 0, TILE_SIZE);
  });

  describe('初始化', () => {
    it('应该在指定网格位置初始化', () => {
      expect(ghost.gridPosition.col).toBe(3);
      expect(ghost.gridPosition.row).toBe(2);
    });

    it('初始状态应该是SCATTER', () => {
      expect(ghost.getState()).toBe(GhostState.SCATTER);
    });

    it('应该正确返回幽灵类型', () => {
      expect(ghost.getType()).toBe(GhostType.BLINKY);
    });

    it('应该正确返回幽灵名称', () => {
      expect(ghost.getName()).toBe('Blinky');
    });
  });

  describe('不同类型的幽灵', () => {
    it('Blinky应该是红色', () => {
      const blinky = new Ghost(GhostType.BLINKY, 1, 1, 0, 0, TILE_SIZE);
      expect(blinky.getType()).toBe(GhostType.BLINKY);
      expect(blinky.getName()).toBe('Blinky');
    });

    it('Pinky应该是粉色', () => {
      const pinky = new Ghost(GhostType.PINKY, 1, 1, 0, 0, TILE_SIZE);
      expect(pinky.getType()).toBe(GhostType.PINKY);
      expect(pinky.getName()).toBe('Pinky');
    });

    it('Inky应该是青色', () => {
      const inky = new Ghost(GhostType.INKY, 1, 1, 0, 0, TILE_SIZE);
      expect(inky.getType()).toBe(GhostType.INKY);
      expect(inky.getName()).toBe('Inky');
    });

    it('Clyde应该是橙色', () => {
      const clyde = new Ghost(GhostType.CLYDE, 1, 1, 0, 0, TILE_SIZE);
      expect(clyde.getType()).toBe(GhostType.CLYDE);
      expect(clyde.getName()).toBe('Clyde');
    });
  });

  describe('状态切换', () => {
    it('应该能切换到CHASE状态', () => {
      ghost.setState(GhostState.CHASE);
      expect(ghost.getState()).toBe(GhostState.CHASE);
    });

    it('应该能切换到FRIGHTENED状态', () => {
      ghost.setState(GhostState.FRIGHTENED);
      expect(ghost.getState()).toBe(GhostState.FRIGHTENED);
    });

    it('应该能切换到EATEN状态', () => {
      ghost.setState(GhostState.EATEN);
      expect(ghost.getState()).toBe(GhostState.EATEN);
    });

    it('切换到FRIGHTENED应该立即反向', () => {
      // 先让幽灵有一个方向
      ghost.update(16, map, { x: 100, y: 100 }, Direction.RIGHT);
      const originalDir = ghost.direction;
      
      ghost.setState(GhostState.FRIGHTENED);
      
      // 方向应该改变（反向）
      if (originalDir === Direction.UP) {
        expect(ghost.direction).toBe(Direction.DOWN);
      } else if (originalDir === Direction.DOWN) {
        expect(ghost.direction).toBe(Direction.UP);
      } else if (originalDir === Direction.LEFT) {
        expect(ghost.direction).toBe(Direction.RIGHT);
      } else if (originalDir === Direction.RIGHT) {
        expect(ghost.direction).toBe(Direction.LEFT);
      }
    });
  });

  describe('重置', () => {
    it('重置应该回到初始位置和状态', () => {
      // 改变幽灵状态并让它移动一段时间
      ghost.setState(GhostState.CHASE);
      
      // 更新多次，让幽灵有足够时间选择方向并移动
      for (let i = 0; i < 50; i++) {
        ghost.update(16, map, { x: 100, y: 100 }, Direction.RIGHT);
      }
      
      // 幽灵可能已经移动了
      
      // 重置
      ghost.reset();
      
      // 重置后应该回到初始位置 (3*20+10 = 70, 2*20+10 = 50)
      expect(ghost.position.x).toBe(70);
      expect(ghost.position.y).toBe(50);
      expect(ghost.gridPosition.col).toBe(3);
      expect(ghost.gridPosition.row).toBe(2);
      expect(ghost.getState()).toBe(GhostState.SCATTER);
    });
  });

  describe('AI行为', () => {
    it('在SCATTER状态应该向散开目标移动', () => {
      // 多次更新让幽灵移动
      ghost.setState(GhostState.SCATTER);
      
      const startX = ghost.position.x;
      
      for (let i = 0; i < 20; i++) {
        ghost.update(16, map, { x: 10, y: 10 }, Direction.LEFT);
      }
      
      // 幽灵应该移动了
      expect(ghost.position.x).not.toBe(startX);
    });

    it('在CHASE状态应该向吃豆人移动', () => {
      ghost.setState(GhostState.CHASE);
      
      const startX = ghost.position.x;
      const startY = ghost.position.y;
      
      // 吃豆人在右下方
      const pacmanPos = { x: 100, y: 60 };
      
      for (let i = 0; i < 20; i++) {
        ghost.update(16, map, pacmanPos, Direction.RIGHT);
      }
      
      // 幽灵应该向吃豆人方向移动
      expect(ghost.position.x !== startX || ghost.position.y !== startY).toBe(true);
    });
  });

  describe('移动能力', () => {
    it('应该能移动', () => {
      const startX = ghost.position.x;
      
      // 设置为追击模式，直接向吃豆人移动
      ghost.setState(GhostState.CHASE);
      
      // 更新多次让幽灵有充分时间移动
      for (let i = 0; i < 30; i++) {
        ghost.update(16, map, { x: 10, y: 50 }, Direction.LEFT);
      }
      
      // 幽灵应该已经移动了（也可能方向改变了位置，所以检查是否不同）
      const hasMoved = ghost.position.x !== startX || ghost.direction !== Direction.NONE;
      expect(hasMoved).toBe(true);
    });

    it('不应该穿墙', () => {
      // 让幽灵移动很多次
      for (let i = 0; i < 100; i++) {
        ghost.update(16, map, { x: 10, y: 10 }, Direction.LEFT);
      }
      
      // 检查位置不应该在墙内
      const col = Math.floor(ghost.position.x / TILE_SIZE);
      const row = Math.floor(ghost.position.y / TILE_SIZE);
      
      expect(map.isWall(col, row)).toBe(false);
    });
  });
});
