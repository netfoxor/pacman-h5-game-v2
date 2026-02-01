/**
 * 游戏类型定义
 * 所有游戏实体的接口和类型定义
 */

// 方向枚举
export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  NONE = 'NONE'
}

// 幽灵类型
export enum GhostType {
  BLINKY = 'BLINKY',   // 红色 - 追击
  PINKY = 'PINKY',     // 粉色 - 埋伏
  INKY = 'INKY',       // 青色 - 协作
  CLYDE = 'CLYDE'      // 橙色 - 随机
}

// 幽灵状态
export enum GhostState {
  CHASE = 'CHASE',     // 追击模式
  SCATTER = 'SCATTER', // 散开模式
  FRIGHTENED = 'FRIGHTENED', // 被吃模式（蓝色）
  EATEN = 'EATEN'      // 已被吃掉，返回重生点
}

// 地图单元格类型
export enum CellType {
  EMPTY = 0,     // 空地
  WALL = 1,      // 墙
  DOT = 2,       // 普通豆子
  POWER_PELLET = 3, // 能量豆
  GHOST_HOUSE = 4   // 幽灵出生点
}

// 位置接口
export interface Position {
  x: number;
  y: number;
}

// 网格坐标
export interface GridPosition {
  col: number;
  row: number;
}

// 游戏配置
export interface GameConfig {
  tileSize: number;
  fps: number;
  pacmanSpeed: number;
  ghostSpeed: number;
  frightenedDuration: number;
  scatterDuration: number;
  chaseDuration: number;
}

// 游戏状态
export interface GameState {
  score: number;
  lives: number;
  level: number;
  dotsRemaining: number;
  isPaused: boolean;
  isGameOver: boolean;
  powerModeActive: boolean;
  powerModeTimer: number;
}

// 实体接口
export interface Entity {
  position: Position;
  gridPosition: GridPosition;
  direction: Direction;
  speed: number;
  update(deltaTime: number, map: GameMap, ...args: any[]): void;
  render(ctx: CanvasRenderingContext2D): void;
}

// 地图接口
export interface GameMap {
  width: number;
  height: number;
  tiles: CellType[][];
  getCell(col: number, row: number): CellType;
  isWall(col: number, row: number): boolean;
  isValidPosition(col: number, row: number): boolean;
  eatDot(col: number, row: number): boolean;
  eatPowerPellet(col: number, row: number): boolean;
  getRemainingDots(): number;
  reset(): void;
}

// 渲染器接口
export interface Renderer {
  render(ctx: CanvasRenderingContext2D): void;
}

// 碰撞检测结果
export interface CollisionResult {
  hasCollision: boolean;
  newPosition: Position;
  newGridPosition: GridPosition;
}
