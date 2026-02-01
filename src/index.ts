/**
 * 吃豆人游戏入口
 * 初始化并启动游戏
 */

import { Game } from './core/game.js';

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
  // 创建游戏实例
  const game = new Game('gameCanvas');
  
  // 设置事件回调
  game.onScoreChange = (score: number) => {
    console.log(`Score: ${score}`);
  };
  
  game.onLivesChange = (lives: number) => {
    console.log(`Lives: ${lives}`);
  };
  
  game.onGameOver = () => {
    console.log('Game Over!');
  };
  
  game.onLevelComplete = () => {
    console.log('Level Complete!');
  };

  // 开始游戏
  game.start();

  // 暂停功能（按P键）
  document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
      game.togglePause();
    }
  });

  // 页面卸载时清理
  window.addEventListener('beforeunload', () => {
    game.destroy();
  });
});
