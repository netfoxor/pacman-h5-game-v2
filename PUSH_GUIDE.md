# 项目推送指南

## 项目已完成 ✅

项目 `pacman-h5-game-v2` 已开发完成，包含：
- ✅ 完整的吃豆人游戏（TypeScript + HTML5 Canvas）
- ✅ 4种AI幽灵（Blinky, Pinky, Inky, Clyde）
- ✅ 54个单元测试全部通过
- ✅ 构建系统配置完成（npm run build → dist/）
- ✅ 详细的 README.md 文档

## 本地验证

```bash
cd /home/ubuntu/.openclaw/workspace/pacman-h5-game-v2

# 运行测试
npm test

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 推送到GitHub

### 方法1：使用GitHub CLI（推荐）

```bash
# 1. 登录GitHub
gh auth login

# 2. 创建仓库（如果还没创建）
gh repo create pacman-h5-game-v2 --public --description "Pac-Man H5 Game - TypeScript + Canvas"

# 3. 添加远程仓库并推送
git remote add origin https://github.com/YOUR_USERNAME/pacman-h5-game-v2.git
git push -u origin main
```

### 方法2：使用Git HTTPS

```bash
# 1. 在GitHub网页上创建空仓库 https://github.com/new

# 2. 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/pacman-h5-game-v2.git

# 3. 推送
git push -u origin main
# 输入用户名和个人访问令牌(PAT)作为密码
```

### 方法3：使用SSH

```bash
# 1. 确保已配置SSH密钥
cat ~/.ssh/id_rsa.pub

# 2. 添加远程仓库
git remote add origin git@github.com:YOUR_USERNAME/pacman-h5-game-v2.git

# 3. 推送
git push -u origin main
```

## 项目文件清单

```
pacman-h5-game-v2/
├── dist/                      # 构建产物（npm run build生成）
│   ├── index.html
│   └── assets/
├── src/
│   ├── __tests__/             # 测试文件
│   │   ├── game.test.ts
│   │   ├── ghost.test.ts
│   │   ├── map.test.ts
│   │   └── pacman.test.ts
│   ├── core/                  # 核心系统
│   │   ├── constants.ts       # 游戏常量
│   │   ├── game.ts            # 游戏主控制器
│   │   ├── input.ts           # 输入处理
│   │   └── map.ts             # 地图系统
│   ├── entities/              # 游戏实体
│   │   ├── ghost.ts           # 幽灵AI
│   │   └── pacman.ts          # 吃豆人
│   ├── types/                 # TypeScript类型
│   │   └── index.ts
│   └── index.ts               # 入口文件
├── index.html                 # HTML入口
├── package.json               # 依赖配置
├── tsconfig.json              # TypeScript配置
├── vite.config.ts             # Vite配置
├── README.md                  # 项目文档
└── .gitignore                 # Git忽略文件
```

## 部署到静态托管

构建产物在 `dist/` 目录，可以部署到：
- GitHub Pages
- Vercel
- Netlify
- 任何静态文件服务器

### GitHub Pages部署

```bash
# 1. 安装gh-pages
npm install --save-dev gh-pages

# 2. 在package.json添加脚本
"scripts": {
  "deploy": "gh-pages -d dist"
}

# 3. 构建并部署
npm run build
npm run deploy
```

## 游戏特性

- 🎮 方向键/WASD控制
- 👻 4种不同AI的幽灵
- ⚡ 能量豆效果
- 📊 分数和生命系统
- 🔄 关卡系统
- ⏸️ 暂停功能

## 技术栈

- TypeScript 5.3
- Vite 5.0
- Vitest（测试）
- HTML5 Canvas
