/**
 * 游戏主控制器
 * 管理游戏状态、游戏循环和所有实体
 */

import { Map } from './map.js';
import { Pacman } from '../entities/pacman.js';
import { Ghost, setGhostMap } from '../entities/ghost.js';
import { InputHandler } from './input.js';
import { 
  Direction, 
  GameState, 
  GhostType, 
  GhostState,
  CellType 
} from '../types/index.js';
import { DEFAULT_CONFIG, SCORES } from './constants.js';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private map: Map;
  private pacman: Pacman;
  private ghosts: Ghost[] = [];
  private input: InputHandler;
  private gameState: GameState;
  
  private lastTime: number = 0;
  private animationId: number | null = null;
  private modeTimer: number = 0;
  private isScatterMode: boolean = true;

  // 游戏事件回调
  public onScoreChange?: (score: number) => void;
  public onLivesChange?: (lives: number) => void;
  public onGameOver?: () => void;
  public onLevelComplete?: () => void;

  constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas element with id '${canvasId}' not found`);
    }
    
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;

    // 初始化地图
    this.map = new Map();
    setGhostMap(this.map);

    // 设置画布大小
    this.canvas.width = this.map.width * DEFAULT_CONFIG.tileSize;
    this.canvas.height = this.map.height * DEFAULT_CONFIG.tileSize;

    // 初始化吃豆人
    const pacmanStart = this.map.getPacmanStartPosition();
    this.pacman = new Pacman(pacmanStart.col, pacmanStart.row);

    // 初始化幽灵
    this.initGhosts();

    // 初始化输入
    this.input = new InputHandler();

    // 初始化游戏状态
    this.gameState = {
      score: 0,
      lives: 3,
      level: 1,
      dotsRemaining: this.map.getRemainingDots(),
      isPaused: false,
      isGameOver: false,
      powerModeActive: false,
      powerModeTimer: 0
    };
  }

  /**
   * 初始化幽灵
   */
  private initGhosts(): void {
    // Blinky (红色) - 右上
    this.ghosts.push(new Ghost(
      GhostType.BLINKY, 
      13, 11, 
      25, 0, 
      DEFAULT_CONFIG.tileSize
    ));

    // Pinky (粉色) - 左上
    this.ghosts.push(new Ghost(
      GhostType.PINKY, 
      14, 11, 
      2, 0, 
      DEFAULT_CONFIG.tileSize
    ));

    // Inky (青色) - 右下
    this.ghosts.push(new Ghost(
      GhostType.INKY, 
      12, 14, 
      27, 30, 
      DEFAULT_CONFIG.tileSize
    ));

    // Clyde (橙色) - 左下
    this.ghosts.push(new Ghost(
      GhostType.CLYDE, 
      15, 14, 
      0, 30, 
      DEFAULT_CONFIG.tileSize
    ));
  }

  /**
   * 开始游戏
   */
  start(): void {
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  /**
   * 暂停/继续游戏
   */
  togglePause(): void {
    this.gameState.isPaused = !this.gameState.isPaused;
  }

  /**
   * 游戏主循环
   */
  private gameLoop(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (!this.gameState.isPaused && !this.gameState.isGameOver) {
      this.update(deltaTime);
    }
    
    this.render();

    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  /**
   * 更新游戏逻辑
   */
  private update(deltaTime: number): void {
    // 处理吃豆人移动
    this.updatePacman();

    // 更新幽灵
    this.updateGhosts(deltaTime);

    // 检查吃豆
    this.checkDotEating();

    // 检查碰撞
    this.checkCollisions();

    // 更新游戏模式（scatter/chase）
    this.updateGameMode(deltaTime);

    // 更新能量豆效果
    this.updatePowerMode(deltaTime);

    // 检查关卡完成
    this.checkLevelComplete();
  }

  /**
   * 更新吃豆人
   */
  private updatePacman(): void {
    // 尝试改变方向
    const nextDir = this.input.getNextDirection();
    
    if (nextDir !== Direction.NONE && nextDir !== this.pacman.direction) {
      // 尝试新方向
      if (this.pacman.move(nextDir, this.map, DEFAULT_CONFIG.tileSize)) {
        this.input.confirmDirectionChange();
      } else {
        // 新方向被阻挡，继续当前方向
        this.pacman.move(this.pacman.direction, this.map, DEFAULT_CONFIG.tileSize);
      }
    } else {
      // 继续当前方向
      this.pacman.move(this.pacman.direction, this.map, DEFAULT_CONFIG.tileSize);
    }

    // 更新动画
    this.pacman.update(16, this.map);
  }

  /**
   * 更新幽灵
   */
  private updateGhosts(deltaTime: number): void {
    for (const ghost of this.ghosts) {
      ghost.update(deltaTime, this.map, this.pacman.position, this.pacman.direction);
    }
  }

  /**
   * 检查吃豆
   */
  private checkDotEating(): void {
    const { col, row } = this.pacman.gridPosition;
    
    // 检查普通豆子
    if (this.map.eatDot(col, row)) {
      this.addScore(SCORES.DOT);
      this.gameState.dotsRemaining--;
    }
    
    // 检查能量豆
    if (this.map.eatPowerPellet(col, row)) {
      this.addScore(SCORES.POWER_PELLET);
      this.gameState.dotsRemaining--;
      this.activatePowerMode();
    }
  }

  /**
   * 激活能量豆效果
   */
  private activatePowerMode(): void {
    this.gameState.powerModeActive = true;
    this.gameState.powerModeTimer = DEFAULT_CONFIG.frightenedDuration;
    
    // 让所有幽灵进入恐惧状态
    for (const ghost of this.ghosts) {
      if (ghost.getState() !== GhostState.EATEN) {
        ghost.setState(GhostState.FRIGHTENED);
      }
    }
  }

  /**
   * 更新能量豆效果
   */
  private updatePowerMode(deltaTime: number): void {
    if (this.gameState.powerModeActive) {
      this.gameState.powerModeTimer -= deltaTime;
      
      if (this.gameState.powerModeTimer <= 0) {
        this.gameState.powerModeActive = false;
        
        // 恢复幽灵状态
        for (const ghost of this.ghosts) {
          if (ghost.getState() === GhostState.FRIGHTENED) {
            ghost.setState(this.isScatterMode ? GhostState.SCATTER : GhostState.CHASE);
          }
        }
      }
    }
  }

  /**
   * 检查碰撞
   */
  private checkCollisions(): void {
    const pacmanRadius = this.pacman.getRadius();

    for (const ghost of this.ghosts) {
      const dx = this.pacman.position.x - ghost.position.x;
      const dy = this.pacman.position.y - ghost.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < pacmanRadius + ghost.getRadius()) {
        if (ghost.getState() === GhostState.FRIGHTENED) {
          // 吃掉幽灵
          this.eatGhost(ghost);
        } else if (ghost.getState() !== GhostState.EATEN) {
          // 吃豆人死亡
          this.pacmanDies();
        }
      }
    }
  }

  /**
   * 吃掉幽灵
   */
  private eatGhost(ghost: Ghost): void {
    ghost.setState(GhostState.EATEN);
    
    // 计算分数（连续吃掉多个幽灵分数翻倍）
    const ghostsEaten = this.ghosts.filter(g => g.getState() === GhostState.EATEN).length;
    let score = SCORES.GHOST_1;
    for (let i = 1; i < ghostsEaten; i++) {
      score *= 2;
    }
    
    this.addScore(score);
  }

  /**
   * 吃豆人死亡
   */
  private pacmanDies(): void {
    this.gameState.lives--;
    this.onLivesChange?.(this.gameState.lives);

    if (this.gameState.lives <= 0) {
      this.gameOver();
    } else {
      this.resetPositions();
    }
  }

  /**
   * 重置所有位置
   */
  private resetPositions(): void {
    // 重置吃豆人
    const pacmanStart = this.map.getPacmanStartPosition();
    this.pacman.reset(pacmanStart.col, pacmanStart.row, DEFAULT_CONFIG.tileSize);
    this.input.reset();

    // 重置幽灵
    for (const ghost of this.ghosts) {
      ghost.reset();
    }

    this.isScatterMode = true;
    this.modeTimer = 0;
  }

  /**
   * 更新游戏模式（scatter/chase切换）
   */
  private updateGameMode(deltaTime: number): void {
    if (this.gameState.powerModeActive) return;

    this.modeTimer += deltaTime;
    const modeDuration = this.isScatterMode 
      ? DEFAULT_CONFIG.scatterDuration 
      : DEFAULT_CONFIG.chaseDuration;

    if (this.modeTimer >= modeDuration) {
      this.isScatterMode = !this.isScatterMode;
      this.modeTimer = 0;

      // 切换幽灵状态
      const newState = this.isScatterMode ? GhostState.SCATTER : GhostState.CHASE;
      for (const ghost of this.ghosts) {
        if (ghost.getState() !== GhostState.EATEN && ghost.getState() !== GhostState.FRIGHTENED) {
          ghost.setState(newState);
        }
      }
    }
  }

  /**
   * 检查关卡完成
   */
  private checkLevelComplete(): void {
    if (this.gameState.dotsRemaining <= 0) {
      this.levelComplete();
    }
  }

  /**
   * 关卡完成
   */
  private levelComplete(): void {
    this.gameState.level++;
    this.onLevelComplete?.();
    
    // 重置地图和位置
    this.map.reset();
    this.gameState.dotsRemaining = this.map.getRemainingDots();
    this.resetPositions();
  }

  /**
   * 游戏结束
   */
  private gameOver(): void {
    this.gameState.isGameOver = true;
    this.onGameOver?.();
  }

  /**
   * 增加分数
   */
  private addScore(points: number): void {
    this.gameState.score += points;
    this.onScoreChange?.(this.gameState.score);
  }

  /**
   * 渲染游戏画面
   */
  private render(): void {
    // 清空画布
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制地图
    this.renderMap();

    // 绘制豆子
    this.renderDots();

    // 绘制幽灵
    for (const ghost of this.ghosts) {
      ghost.render(this.ctx);
    }

    // 绘制吃豆人
    this.pacman.render(this.ctx);

    // 绘制UI
    this.renderUI();
  }

  /**
   * 绘制地图
   */
  private renderMap(): void {
    const tileSize = DEFAULT_CONFIG.tileSize;
    this.ctx.fillStyle = '#2121DE';

    for (let row = 0; row < this.map.height; row++) {
      for (let col = 0; col < this.map.width; col++) {
        if (this.map.isWall(col, row)) {
          // 绘制墙壁（带圆角）
          const x = col * tileSize;
          const y = row * tileSize;
          this.ctx.fillRect(x, y, tileSize, tileSize);
        }
      }
    }
  }

  /**
   * 绘制豆子
   */
  private renderDots(): void {
    const tileSize = DEFAULT_CONFIG.tileSize;
    this.ctx.fillStyle = '#FFB8AE';

    for (let row = 0; row < this.map.height; row++) {
      for (let col = 0; col < this.map.width; col++) {
        const cell = this.map.getCell(col, row);
        const centerX = col * tileSize + tileSize / 2;
        const centerY = row * tileSize + tileSize / 2;

        if (cell === CellType.DOT) {
          // 普通豆子
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (cell === CellType.POWER_PELLET) {
          // 能量豆（闪烁效果）
          const pulse = Math.sin(Date.now() / 100) * 2;
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, 6 + pulse, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }
  }

  /**
   * 绘制UI
   */
  private renderUI(): void {
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    
    // 分数
    this.ctx.fillText(`SCORE: ${this.gameState.score}`, 10, 20);
    
    // 生命
    this.ctx.fillText(`LIVES: ${this.gameState.lives}`, 10, 40);
    
    // 关卡
    this.ctx.fillText(`LEVEL: ${this.gameState.level}`, 10, 60);

    // 游戏结束提示
    if (this.gameState.isGameOver) {
      this.ctx.fillStyle = '#FFFF00';
      this.ctx.font = 'bold 32px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
      
      this.ctx.font = '16px Arial';
      this.ctx.fillText('Press F5 to restart', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }

    // 暂停提示
    if (this.gameState.isPaused && !this.gameState.isGameOver) {
      this.ctx.fillStyle = '#FFFF00';
      this.ctx.font = 'bold 32px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  /**
   * 获取当前分数
   */
  getScore(): number {
    return this.gameState.score;
  }

  /**
   * 获取剩余生命
   */
  getLives(): number {
    return this.gameState.lives;
  }

  /**
   * 获取当前关卡
   */
  getLevel(): number {
    return this.gameState.level;
  }

  /**
   * 检查游戏是否结束
   */
  isGameOver(): boolean {
    return this.gameState.isGameOver;
  }

  /**
   * 销毁游戏
   */
  destroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
