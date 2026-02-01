/**
 * 幽灵实体
 * 敌人的AI行为和渲染
 */

import { Position, GridPosition, Direction, GhostType, GhostState, Entity } from '../types/index.js';
import { Map } from '../core/map.js';
import { DEFAULT_CONFIG, COLORS, GHOST_NAMES } from '../core/constants.js';

export class Ghost implements Entity {
  position: Position;
  gridPosition: GridPosition;
  direction: Direction = Direction.NONE;
  speed: number;
  
  private type: GhostType;
  private state: GhostState = GhostState.SCATTER;
  private homePosition: GridPosition;
  private scatterTarget: GridPosition;
  private color: string;
  private radius: number;
  private frightenedColor: string = COLORS.GHOST_FRIGHTENED;
  private frightenedTimer: number = 0;

  constructor(
    type: GhostType, 
    startCol: number, 
    startRow: number,
    scatterCol: number,
    scatterRow: number,
    tileSize: number = DEFAULT_CONFIG.tileSize
  ) {
    this.type = type;
    this.speed = DEFAULT_CONFIG.ghostSpeed;
    this.radius = tileSize / 2 - 1;
    this.homePosition = { col: startCol, row: startRow };
    this.scatterTarget = { col: scatterCol, row: scatterRow };
    
    // 设置幽灵颜色
    switch (type) {
      case GhostType.BLINKY:
        this.color = COLORS.BLINKY;
        break;
      case GhostType.PINKY:
        this.color = COLORS.PINKY;
        break;
      case GhostType.INKY:
        this.color = COLORS.INKY;
        break;
      case GhostType.CLYDE:
        this.color = COLORS.CLYDE;
        break;
    }

    // 设置初始位置
    this.gridPosition = { col: startCol, row: startRow };
    this.position = {
      x: startCol * tileSize + tileSize / 2,
      y: startRow * tileSize + tileSize / 2
    };
  }

  /**
   * 更新幽灵状态
   */
  update(deltaTime: number, map: Map, pacmanPos: Position, pacmanDir: Direction): void {
    // 更新被吃模式计时器
    if (this.state === GhostState.FRIGHTENED && this.frightenedTimer > 0) {
      this.frightenedTimer -= deltaTime;
      if (this.frightenedTimer <= 0) {
        this.state = GhostState.CHASE;
      }
    }

    // 如果幽灵在网格中心，选择新方向
    if (this.isAtGridCenter(map)) {
      const target = this.getTargetPosition(pacmanPos, pacmanDir);
      this.direction = this.chooseDirection(target, map);
    }

    // 移动幽灵
    this.move(deltaTime, map);
  }

  /**
   * 获取目标位置（根据AI类型）
   */
  private getTargetPosition(pacmanPos: Position, pacmanDir: Direction): GridPosition {
    const pacmanGrid = {
      col: Math.floor(pacmanPos.x / DEFAULT_CONFIG.tileSize),
      row: Math.floor(pacmanPos.y / DEFAULT_CONFIG.tileSize)
    };

    switch (this.state) {
      case GhostState.SCATTER:
        return this.scatterTarget;
      
      case GhostState.FRIGHTENED:
        // 随机选择目标（模拟恐慌逃跑）
        return {
          col: Math.floor(Math.random() * map.width),
          row: Math.floor(Math.random() * map.height)
        };
      
      case GhostState.EATEN:
        return this.homePosition;
      
      case GhostState.CHASE:
      default:
        return this.getChaseTarget(pacmanGrid, pacmanDir);
    }
  }

  /**
   * 获取追击目标（不同幽灵有不同的AI）
   */
  private getChaseTarget(pacmanGrid: GridPosition, pacmanDir: Direction): GridPosition {
    switch (this.type) {
      case GhostType.BLINKY:
        // Blinky: 直接追击吃豆人
        return pacmanGrid;
      
      case GhostType.PINKY:
        // Pinky: 埋伏在吃豆人前方4格
        let targetCol = pacmanGrid.col;
        let targetRow = pacmanGrid.row;
        
        switch (pacmanDir) {
          case Direction.UP:
            targetRow -= 4;
            break;
          case Direction.DOWN:
            targetRow += 4;
            break;
          case Direction.LEFT:
            targetCol -= 4;
            break;
          case Direction.RIGHT:
            targetCol += 4;
            break;
        }
        return { col: targetCol, row: targetRow };
      
      case GhostType.INKY:
        // Inky: 复杂的协作AI（简化版）
        return {
          col: pacmanGrid.col + (pacmanGrid.col - this.gridPosition.col),
          row: pacmanGrid.row + (pacmanGrid.row - this.gridPosition.row)
        };
      
      case GhostType.CLYDE:
        // Clyde: 距离远时追击，距离近时散开
        const distance = Math.sqrt(
          Math.pow(pacmanGrid.col - this.gridPosition.col, 2) +
          Math.pow(pacmanGrid.row - this.gridPosition.row, 2)
        );
        
        if (distance > 8) {
          return pacmanGrid;
        } else {
          return this.scatterTarget;
        }
      
      default:
        return pacmanGrid;
    }
  }

  /**
   * 选择最佳方向
   */
  private chooseDirection(target: GridPosition, map: Map): Direction {
    const possibleDirections = this.getPossibleDirections(map);
    
    if (possibleDirections.length === 0) {
      return Direction.NONE;
    }

    // 如果是被吃状态或恐惧状态，随机选择（但避免180度转弯）
    if (this.state === GhostState.FRIGHTENED) {
      return possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
    }

    // 计算每个方向到目标的距离
    let bestDirection = possibleDirections[0];
    let minDistance = Infinity;

    for (const dir of possibleDirections) {
      let nextCol = this.gridPosition.col;
      let nextRow = this.gridPosition.row;

      switch (dir) {
        case Direction.UP:
          nextRow--;
          break;
        case Direction.DOWN:
          nextRow++;
          break;
        case Direction.LEFT:
          nextCol--;
          break;
        case Direction.RIGHT:
          nextCol++;
          break;
      }

      const distance = Math.sqrt(
        Math.pow(target.col - nextCol, 2) +
        Math.pow(target.row - nextRow, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        bestDirection = dir;
      }
    }

    return bestDirection;
  }

  /**
   * 获取可能的移动方向
   */
  private getPossibleDirections(map: Map): Direction[] {
    const directions: Direction[] = [];
    const oppositeDir = this.getOppositeDirection();

    // 检查四个方向
    const checks = [
      { dir: Direction.UP, col: this.gridPosition.col, row: this.gridPosition.row - 1 },
      { dir: Direction.DOWN, col: this.gridPosition.col, row: this.gridPosition.row + 1 },
      { dir: Direction.LEFT, col: this.gridPosition.col - 1, row: this.gridPosition.row },
      { dir: Direction.RIGHT, col: this.gridPosition.col + 1, row: this.gridPosition.row }
    ];

    for (const check of checks) {
      // 避免180度转弯（除非没有其他选择）
      if (check.dir === oppositeDir) continue;
      
      if (map.canWalk(check.col, check.row)) {
        directions.push(check.dir);
      }
    }

    // 如果没有其他选择，允许180度转弯
    if (directions.length === 0 && oppositeDir !== Direction.NONE) {
      const oppCheck = checks.find(c => c.dir === oppositeDir);
      if (oppCheck && map.canWalk(oppCheck.col, oppCheck.row)) {
        directions.push(oppositeDir);
      }
    }

    return directions;
  }

  /**
   * 获取当前方向的反方向
   */
  private getOppositeDirection(): Direction {
    switch (this.direction) {
      case Direction.UP:
        return Direction.DOWN;
      case Direction.DOWN:
        return Direction.UP;
      case Direction.LEFT:
        return Direction.RIGHT;
      case Direction.RIGHT:
        return Direction.LEFT;
      default:
        return Direction.NONE;
    }
  }

  /**
   * 检查是否在网格中心
   */
  private isAtGridCenter(_map: Map): boolean {
    const tileSize = DEFAULT_CONFIG.tileSize;
    const centerX = this.gridPosition.col * tileSize + tileSize / 2;
    const centerY = this.gridPosition.row * tileSize + tileSize / 2;
    
    const tolerance = this.speed;
    return (
      Math.abs(this.position.x - centerX) < tolerance &&
      Math.abs(this.position.y - centerY) < tolerance
    );
  }

  /**
   * 移动幽灵
   */
  private move(deltaTime: number, map: Map): void {
    const moveDistance = this.speed * (deltaTime / 16); // 基于60fps归一化

    switch (this.direction) {
      case Direction.UP:
        this.position.y -= moveDistance;
        break;
      case Direction.DOWN:
        this.position.y += moveDistance;
        break;
      case Direction.LEFT:
        this.position.x -= moveDistance;
        break;
      case Direction.RIGHT:
        this.position.x += moveDistance;
        break;
    }

    // 更新网格位置
    this.gridPosition = map.worldToGrid(this.position.x, this.position.y, DEFAULT_CONFIG.tileSize);

    // 处理隧道穿越
    this.handleTunnelTeleport(map);
  }

  /**
   * 处理隧道传送
   */
  private handleTunnelTeleport(map: Map): void {
    const tileSize = DEFAULT_CONFIG.tileSize;
    
    if (this.position.x < -this.radius) {
      this.position.x = map.width * tileSize + this.radius;
    } else if (this.position.x > map.width * tileSize + this.radius) {
      this.position.x = -this.radius;
    }
  }

  /**
   * 渲染幽灵
   */
  render(ctx: CanvasRenderingContext2D): void {
    const color = this.state === GhostState.FRIGHTENED 
      ? this.frightenedColor 
      : this.color;

    ctx.fillStyle = color;
    
    // 绘制幽灵身体（半圆形头部 + 波浪形底部）
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y - this.radius * 0.2, this.radius, Math.PI, 0);
    
    // 底部波浪
    const waveCount = 3;
    const waveWidth = (this.radius * 2) / waveCount;
    
    for (let i = 0; i < waveCount; i++) {
      const x = this.position.x + this.radius - (i * waveWidth);
      ctx.lineTo(x - waveWidth / 2, this.position.y + this.radius);
      ctx.lineTo(x - waveWidth, this.position.y + this.radius * 0.7);
    }
    
    ctx.closePath();
    ctx.fill();

    // 绘制眼睛
    this.renderEyes(ctx);
  }

  /**
   * 绘制眼睛
   */
  private renderEyes(ctx: CanvasRenderingContext2D): void {
    const eyeRadius = this.radius * 0.25;
    const pupilRadius = eyeRadius * 0.5;
    const eyeOffsetX = this.radius * 0.3;
    const eyeOffsetY = -this.radius * 0.2;

    // 眼白
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(this.position.x - eyeOffsetX, this.position.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.arc(this.position.x + eyeOffsetX, this.position.y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // 瞳孔（看向移动方向）
    ctx.fillStyle = '#0000FF';
    let pupilOffsetX = 0;
    let pupilOffsetY = 0;

    switch (this.direction) {
      case Direction.UP:
        pupilOffsetY = -eyeRadius * 0.3;
        break;
      case Direction.DOWN:
        pupilOffsetY = eyeRadius * 0.3;
        break;
      case Direction.LEFT:
        pupilOffsetX = -eyeRadius * 0.3;
        break;
      case Direction.RIGHT:
        pupilOffsetX = eyeRadius * 0.3;
        break;
    }

    ctx.beginPath();
    ctx.arc(
      this.position.x - eyeOffsetX + pupilOffsetX, 
      this.position.y + eyeOffsetY + pupilOffsetY, 
      pupilRadius, 0, Math.PI * 2
    );
    ctx.arc(
      this.position.x + eyeOffsetX + pupilOffsetX, 
      this.position.y + eyeOffsetY + pupilOffsetY, 
      pupilRadius, 0, Math.PI * 2
    );
    ctx.fill();
  }

  /**
   * 设置状态
   */
  setState(state: GhostState): void {
    this.state = state;
    if (state === GhostState.FRIGHTENED) {
      this.frightenedTimer = DEFAULT_CONFIG.frightenedDuration;
      // 立即反向
      this.direction = this.getOppositeDirection();
    }
  }

  /**
   * 获取当前状态
   */
  getState(): GhostState {
    return this.state;
  }

  /**
   * 获取幽灵类型
   */
  getType(): GhostType {
    return this.type;
  }

  /**
   * 重置位置
   */
  reset(): void {
    this.position.x = this.homePosition.col * DEFAULT_CONFIG.tileSize + DEFAULT_CONFIG.tileSize / 2;
    this.position.y = this.homePosition.row * DEFAULT_CONFIG.tileSize + DEFAULT_CONFIG.tileSize / 2;
    this.gridPosition = { ...this.homePosition };
    this.direction = Direction.NONE;
    this.state = GhostState.SCATTER;
    this.frightenedTimer = 0;
  }

  /**
   * 获取幽灵名称
   */
  getName(): string {
    return GHOST_NAMES[this.type];
  }

  /**
   * 获取幽灵半径
   */
  getRadius(): number {
    return this.radius;
  }
}

// 导入map用于AI计算
let map: Map;
export function setGhostMap(gameMap: Map): void {
  map = gameMap;
}
