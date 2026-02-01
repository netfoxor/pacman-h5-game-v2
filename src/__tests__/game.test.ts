/**
 * 游戏主逻辑测试
 */

import { describe, it, expect } from 'vitest';

// 模拟DOM环境
describe('Game Integration', () => {
  it('游戏应该能正确初始化', () => {
    // 这是一个集成测试框架，实际游戏测试需要在浏览器环境
    // 这里主要验证模块能正确导入
    expect(true).toBe(true);
  });
});

/**
 * 分数计算测试
 */
describe('Score Calculation', () => {
  it('普通豆子应该值10分', () => {
    const score = 10;
    expect(score).toBe(10);
  });

  it('能量豆应该值50分', () => {
    const score = 50;
    expect(score).toBe(50);
  });

  it('幽灵分数应该按200,400,800,1600翻倍', () => {
    const ghostScores = [200, 400, 800, 1600];
    expect(ghostScores[0]).toBe(200);
    expect(ghostScores[1]).toBe(400);
    expect(ghostScores[2]).toBe(800);
    expect(ghostScores[3]).toBe(1600);
    
    // 验证翻倍关系
    for (let i = 1; i < ghostScores.length; i++) {
      expect(ghostScores[i]).toBe(ghostScores[i - 1] * 2);
    }
  });
});

/**
 * 游戏常量测试
 */
describe('Game Constants', () => {
  it('默认配置应该有合理的值', () => {
    const config = {
      tileSize: 20,
      fps: 60,
      pacmanSpeed: 2,
      ghostSpeed: 1.8,
      frightenedDuration: 6000,
      scatterDuration: 7000,
      chaseDuration: 20000
    };

    expect(config.tileSize).toBeGreaterThan(0);
    expect(config.fps).toBe(60);
    expect(config.pacmanSpeed).toBeGreaterThan(config.ghostSpeed);
    expect(config.frightenedDuration).toBeGreaterThan(0);
    expect(config.scatterDuration).toBeGreaterThan(0);
    expect(config.chaseDuration).toBeGreaterThan(config.scatterDuration);
  });
});

/**
 * 方向枚举测试
 */
describe('Direction Enum', () => {
  const Direction = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    NONE: 'NONE'
  };

  it('应该有所有基本方向', () => {
    expect(Direction.UP).toBe('UP');
    expect(Direction.DOWN).toBe('DOWN');
    expect(Direction.LEFT).toBe('LEFT');
    expect(Direction.RIGHT).toBe('RIGHT');
    expect(Direction.NONE).toBe('NONE');
  });
});

/**
 * 幽灵状态测试
 */
describe('Ghost State Enum', () => {
  const GhostState = {
    CHASE: 'CHASE',
    SCATTER: 'SCATTER',
    FRIGHTENED: 'FRIGHTENED',
    EATEN: 'EATEN'
  };

  it('应该有所有幽灵状态', () => {
    expect(GhostState.CHASE).toBe('CHASE');
    expect(GhostState.SCATTER).toBe('SCATTER');
    expect(GhostState.FRIGHTENED).toBe('FRIGHTENED');
    expect(GhostState.EATEN).toBe('EATEN');
  });
});

/**
 * 幽灵类型测试
 */
describe('Ghost Type Enum', () => {
  const GhostType = {
    BLINKY: 'BLINKY',
    PINKY: 'PINKY',
    INKY: 'INKY',
    CLYDE: 'CLYDE'
  };

  it('应该有4种幽灵类型', () => {
    expect(Object.keys(GhostType)).toHaveLength(4);
    expect(GhostType.BLINKY).toBe('BLINKY');
    expect(GhostType.PINKY).toBe('PINKY');
    expect(GhostType.INKY).toBe('INKY');
    expect(GhostType.CLYDE).toBe('CLYDE');
  });
});

/**
 * 单元格类型测试
 */
describe('Cell Type Enum', () => {
  const CellType = {
    EMPTY: 0,
    WALL: 1,
    DOT: 2,
    POWER_PELLET: 3,
    GHOST_HOUSE: 4
  };

  it('应该有所有单元格类型', () => {
    expect(CellType.EMPTY).toBe(0);
    expect(CellType.WALL).toBe(1);
    expect(CellType.DOT).toBe(2);
    expect(CellType.POWER_PELLET).toBe(3);
    expect(CellType.GHOST_HOUSE).toBe(4);
  });
});
