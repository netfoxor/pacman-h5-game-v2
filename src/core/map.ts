/**
 * 游戏地图系统
 * 管理地图数据、碰撞检测和豆子收集
 */

import { CellType, GridPosition, GameMap } from '../types/index.js';
import { DEFAULT_MAP } from './constants.js';

export class Map implements GameMap {
  public readonly width: number;
  public readonly height: number;
  public tiles: CellType[][];
  private initialTiles: CellType[][];

  constructor(mapData: number[][] = DEFAULT_MAP) {
    this.height = mapData.length;
    this.width = mapData[0]?.length || 0;
    
    // 深拷贝地图数据
    this.tiles = mapData.map(row => [...row] as CellType[]);
    this.initialTiles = mapData.map(row => [...row] as CellType[]);
  }

  /**
   * 获取指定位置的单元格类型
   */
  getCell(col: number, row: number): CellType {
    if (!this.isValidPosition(col, row)) {
      return CellType.WALL;
    }
    return this.tiles[row][col];
  }

  /**
   * 检查指定位置是否是墙
   */
  isWall(col: number, row: number): boolean {
    return this.getCell(col, row) === CellType.WALL;
  }

  /**
   * 检查位置是否在地图范围内
   */
  isValidPosition(col: number, row: number): boolean {
    return col >= 0 && col < this.width && row >= 0 && row < this.height;
  }

  /**
   * 检查位置是否可以行走（不是墙）
   */
  canWalk(col: number, row: number): boolean {
    return this.isValidPosition(col, row) && !this.isWall(col, row);
  }

  /**
   * 吃豆子
   * @returns 是否成功吃到豆子
   */
  eatDot(col: number, row: number): boolean {
    if (this.getCell(col, row) === CellType.DOT) {
      this.tiles[row][col] = CellType.EMPTY;
      return true;
    }
    return false;
  }

  /**
   * 吃能量豆
   * @returns 是否成功吃到能量豆
   */
  eatPowerPellet(col: number, row: number): boolean {
    if (this.getCell(col, row) === CellType.POWER_PELLET) {
      this.tiles[row][col] = CellType.EMPTY;
      return true;
    }
    return false;
  }

  /**
   * 获取剩余豆子数量
   */
  getRemainingDots(): number {
    let count = 0;
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.tiles[row][col] === CellType.DOT || 
            this.tiles[row][col] === CellType.POWER_PELLET) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * 获取吃豆人起始位置
   */
  getPacmanStartPosition(): GridPosition {
    // 吃豆人起始位置（地图底部中央，第26行中间是通道）
    return { col: 13, row: 26 };
  }

  /**
   * 获取幽灵出生点位置
   */
  getGhostHousePositions(): GridPosition[] {
    const positions: GridPosition[] = [];
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.initialTiles[row][col] === CellType.GHOST_HOUSE) {
          positions.push({ col, row });
        }
      }
    }
    return positions;
  }

  /**
   * 重置地图
   */
  reset(): void {
    this.tiles = this.initialTiles.map(row => [...row]);
  }

  /**
   * 从世界坐标转换为网格坐标
   */
  worldToGrid(x: number, y: number, tileSize: number): GridPosition {
    return {
      col: Math.floor(x / tileSize),
      row: Math.floor(y / tileSize)
    };
  }

  /**
   * 从网格坐标转换为世界坐标（中心点）
   */
  gridToWorld(col: number, row: number, tileSize: number): { x: number; y: number } {
    return {
      x: col * tileSize + tileSize / 2,
      y: row * tileSize + tileSize / 2
    };
  }
}
