/**
 * 吃豆人实体
 * 玩家控制的角色
 */

import { Position, GridPosition, Direction, Entity } from '../types/index.js';
import { Map } from '../core/map.js';
import { DEFAULT_CONFIG, COLORS } from '../core/constants.js';

export class Pacman implements Entity {
  position: Position;
  gridPosition: GridPosition;
  direction: Direction = Direction.NONE;
  speed: number;
  
  private mouthAngle: number = 0.2;  // 嘴巴张开角度
  private mouthOpen: boolean = true; // 嘴巴开合状态
  private mouthSpeed: number = 0.15; // 嘴巴动画速度
  private radius: number;

  constructor(startCol: number, startRow: number, tileSize: number = DEFAULT_CONFIG.tileSize) {
    this.speed = DEFAULT_CONFIG.pacmanSpeed;
    this.radius = tileSize / 2 - 2;
    
    // 设置初始位置（网格中心）
    this.gridPosition = { col: startCol, row: startRow };
    this.position = {
      x: startCol * tileSize + tileSize / 2,
      y: startRow * tileSize + tileSize / 2
    };
  }

  /**
   * 更新吃豆人状态
   */
  update(_deltaTime: number, _map: Map): void {
    // 更新嘴巴动画
    this.updateMouthAnimation();
  }

  /**
   * 更新嘴巴动画
   */
  private updateMouthAnimation(): void {
    if (this.mouthOpen) {
      this.mouthAngle += this.mouthSpeed;
      if (this.mouthAngle >= 0.25) {
        this.mouthOpen = false;
      }
    } else {
      this.mouthAngle -= this.mouthSpeed;
      if (this.mouthAngle <= 0.05) {
        this.mouthOpen = true;
      }
    }
  }

  /**
   * 尝试移动吃豆人
   */
  move(direction: Direction, map: Map, tileSize: number): boolean {
    if (direction === Direction.NONE) return false;

    const moveDistance = this.speed;
    let newX = this.position.x;
    let newY = this.position.y;

    // 根据方向计算新位置
    switch (direction) {
      case Direction.UP:
        newY -= moveDistance;
        break;
      case Direction.DOWN:
        newY += moveDistance;
        break;
      case Direction.LEFT:
        newX -= moveDistance;
        break;
      case Direction.RIGHT:
        newX += moveDistance;
        break;
    }

    // 检查碰撞
    if (this.canMoveTo(newX, newY, map, tileSize)) {
      this.position.x = newX;
      this.position.y = newY;
      this.direction = direction;
      
      // 更新网格位置
      this.gridPosition = map.worldToGrid(this.position.x, this.position.y, tileSize);
      
      // 处理隧道穿越（左右两侧传送）
      this.handleTunnelTeleport(map, tileSize);
      
      return true;
    }

    return false;
  }

  /**
   * 检查是否可以移动到指定位置
   */
  private canMoveTo(x: number, y: number, map: Map, tileSize: number): boolean {
    // 使用更小的碰撞框，给吃豆人更多活动空间
    const collisionRadius = this.radius * 0.8;
    
    // 计算吃豆人的碰撞框（稍微缩小一点）
    const leftCol = Math.floor((x - collisionRadius) / tileSize);
    const rightCol = Math.floor((x + collisionRadius) / tileSize);
    const topRow = Math.floor((y - collisionRadius) / tileSize);
    const bottomRow = Math.floor((y + collisionRadius) / tileSize);

    // 检查四个角的碰撞
    const corners = [
      { col: leftCol, row: topRow },
      { col: rightCol, row: topRow },
      { col: leftCol, row: bottomRow },
      { col: rightCol, row: bottomRow }
    ];

    for (const corner of corners) {
      if (map.isWall(corner.col, corner.row)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 处理隧道传送
   */
  private handleTunnelTeleport(map: Map, tileSize: number): void {
    // 从左侧出，从右侧进
    if (this.position.x < -this.radius) {
      this.position.x = map.width * tileSize + this.radius;
    }
    // 从右侧出，从左侧进
    else if (this.position.x > map.width * tileSize + this.radius) {
      this.position.x = -this.radius;
    }
  }

  /**
   * 渲染吃豆人
   */
  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    // 根据方向旋转
    let rotation = 0;
    switch (this.direction) {
      case Direction.RIGHT:
        rotation = 0;
        break;
      case Direction.DOWN:
        rotation = Math.PI / 2;
        break;
      case Direction.LEFT:
        rotation = Math.PI;
        break;
      case Direction.UP:
        rotation = -Math.PI / 2;
        break;
    }
    ctx.rotate(rotation);

    // 绘制吃豆人
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, this.mouthAngle * Math.PI, (2 - this.mouthAngle) * Math.PI);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fillStyle = COLORS.PACMAN;
    ctx.fill();

    ctx.restore();
  }

  /**
   * 重置位置
   */
  reset(col: number, row: number, tileSize: number): void {
    this.position.x = col * tileSize + tileSize / 2;
    this.position.y = row * tileSize + tileSize / 2;
    this.gridPosition = { col, row };
    this.direction = Direction.NONE;
  }

  /**
   * 获取吃豆人的碰撞半径
   */
  getRadius(): number {
    return this.radius;
  }
}
