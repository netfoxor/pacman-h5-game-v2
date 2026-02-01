# Pac-Man H5 Game v2 🟡

一个基于 HTML5 Canvas 和 TypeScript 的经典吃豆人游戏实现。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| TypeScript | 5.3+ | 类型安全的游戏逻辑 |
| Vite | 5.0+ | 构建工具和开发服务器 |
| Vitest | 1.0+ | 单元测试框架 |
| HTML5 Canvas | - | 游戏渲染 |
| jsdom | 23.0+ | 测试环境DOM模拟 |

## 项目结构

```
pacman-h5-game-v2/
├── src/
│   ├── core/              # 核心游戏系统
│   │   ├── constants.ts   # 游戏常量和配置
│   │   ├── game.ts        # 游戏主控制器
│   │   ├── input.ts       # 输入处理系统
│   │   └── map.ts         # 地图系统
│   ├── entities/          # 游戏实体
│   │   ├── pacman.ts      # 吃豆人
│   │   └── ghost.ts       # 幽灵AI
│   ├── types/             # TypeScript类型定义
│   │   └── index.ts       # 所有接口和枚举
│   ├── __tests__/         # 测试文件
│   │   ├── map.test.ts    # 地图系统测试
│   │   ├── pacman.test.ts # 吃豆人测试
│   │   ├── ghost.test.ts  # 幽灵AI测试
│   │   └── game.test.ts   # 游戏逻辑测试
│   └── index.ts           # 入口文件
├── index.html             # HTML入口
├── package.json           # 依赖配置
├── tsconfig.json          # TypeScript配置
├── vite.config.ts         # Vite配置
└── README.md              # 本文件
```

## 游戏特性

### 核心玩法
- 经典吃豆人游戏体验
- 方向键/WASD 控制移动
- 吃豆子得分，能量豆可吃幽灵
- 4条生命，生命耗尽游戏结束
- 吃完所有豆子进入下一关

### AI系统
4种不同类型的幽灵，每种有独特的AI行为：

| 幽灵 | 颜色 | AI行为 |
|------|------|--------|
| Blinky | 🔴 红色 | 直接追击吃豆人 |
| Pinky | 🩷 粉色 | 埋伏在吃豆人前方4格 |
| Inky | 🩵 青色 | 协作型AI，根据Blinky位置计算目标 |
| Clyde | 🧡 橙色 | 距离远时追击，距离近时散开 |

### 游戏模式
1. **Scatter Mode（散开模式）** - 幽灵向各自角落移动
2. **Chase Mode（追击模式）** - 幽灵主动追击吃豆人
3. **Frightened Mode（恐惧模式）** - 吃能量豆后幽灵变蓝可被吃掉

## 开发指南

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
在浏览器中打开 `http://localhost:5173` 进行开发。

### 运行测试
```bash
# 运行所有测试
npm test

# 运行测试并显示UI
npm run test:ui

# 生成覆盖率报告
npm run test:coverage
```

### 生产构建
```bash
npm run build
```
构建产物输出到 `dist/` 目录。

### 预览生产构建
```bash
npm run preview
```

## 操作说明

| 按键 | 功能 |
|------|------|
| ↑ / W | 向上移动 |
| ↓ / S | 向下移动 |
| ← / A | 向左移动 |
| → / D | 向右移动 |
| P | 暂停/继续游戏 |

## 代码架构

### 游戏循环
```
Game Loop:
  ├── update(deltaTime)    # 更新游戏逻辑
  │   ├── updatePacman()   # 处理玩家输入和移动
  │   ├── updateGhosts()   # 更新幽灵AI
  │   ├── checkCollisions()# 碰撞检测
  │   └── checkGameState() # 检查游戏状态
  └── render()             # 渲染画面
      ├── renderMap()      # 绘制地图
      ├── renderDots()     # 绘制豆子
      ├── renderGhosts()   # 绘制幽灵
      └── renderPacman()   # 绘制吃豆人
```

### 关键类说明

#### Game (src/core/game.ts)
游戏主控制器，负责：
- 初始化所有游戏对象
- 管理游戏循环
- 处理游戏状态（得分、生命、关卡）
- 协调所有实体更新

#### Map (src/core/map.ts)
地图系统，负责：
- 地图数据管理
- 碰撞检测
- 豆子收集
- 坐标转换（世界坐标 ↔ 网格坐标）

#### Pacman (src/entities/pacman.ts)
吃豆人实体，负责：
- 玩家移动控制
- 动画效果（嘴巴张合）
- 碰撞检测

#### Ghost (src/entities/ghost.ts)
幽灵实体，负责：
- 4种AI行为实现
- 状态管理（Scatter/Chase/Frightened/Eaten）
- 寻路算法

#### InputHandler (src/core/input.ts)
输入处理系统，负责：
- 键盘事件监听
- 方向键缓冲区管理
- 支持方向键和WASD

### 类型系统
所有类型定义在 `src/types/index.ts`：

```typescript
// 方向枚举
enum Direction { UP, DOWN, LEFT, RIGHT, NONE }

// 幽灵类型
enum GhostType { BLINKY, PINKY, INKY, CLYDE }

// 幽灵状态
enum GhostState { CHASE, SCATTER, FRIGHTENED, EATEN }

// 地图单元格类型
enum CellType { EMPTY, WALL, DOT, POWER_PELLET, GHOST_HOUSE }
```

## 测试策略

### 单元测试覆盖
- **Map测试**：地图初始化、碰撞检测、豆子操作、坐标转换
- **Pacman测试**：移动、碰撞、重置、动画
- **Ghost测试**：AI行为、状态切换、寻路
- **Game测试**：分数计算、游戏状态、常量验证

### 运行单个测试文件
```bash
npx vitest run src/__tests__/map.test.ts
```

## 扩展指南

### 添加新关卡
编辑 `src/core/constants.ts` 中的 `DEFAULT_MAP`：
```typescript
// 0=空地, 1=墙, 2=豆子, 3=能量豆, 4=幽灵出生点
export const NEW_LEVEL_MAP = [
  [1,1,1,1,1],
  [1,2,0,2,1],
  // ...
];
```

### 修改游戏难度
调整 `DEFAULT_CONFIG` 中的参数：
```typescript
export const DEFAULT_CONFIG: GameConfig = {
  pacmanSpeed: 2,        // 增加吃豆人速度
  ghostSpeed: 2.5,       // 增加幽灵速度
  frightenedDuration: 4000,  // 减少能量豆效果时间
  // ...
};
```

### 添加新幽灵类型
1. 在 `GhostType` 枚举中添加新类型
2. 在 `GHOST_NAMES` 中添加名称
3. 在 `COLORS` 中添加颜色
4. 在 `Ghost.getChaseTarget()` 中实现新AI

### 修改幽灵AI
编辑 `src/entities/ghost.ts` 中的 `getChaseTarget()` 方法：
```typescript
private getChaseTarget(pacmanGrid: GridPosition, pacmanDir: Direction): GridPosition {
  switch (this.type) {
    case GhostType.MY_NEW_GHOST:
      // 实现你的AI逻辑
      return { col: targetCol, row: targetRow };
  }
}
```

## 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 性能优化

- 使用 `requestAnimationFrame` 实现流畅动画
- 网格系统优化碰撞检测
- 脏矩形渲染（未来可添加）
- 精灵对象池（未来可添加）

## 许可证

MIT License

## 作者

AI 开发助手
