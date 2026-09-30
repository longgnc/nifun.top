<template>
  <div class="games-page">
    <div v-if="!activeGame" class="game-menu">
      <div class="header">
        <h2>游戏中心</h2>
        <span class="subtitle">放松心情，享受乐趣</span>
      </div>

      <div class="game-showcase">
        <div
          class="featured-game"
          role="button"
          tabindex="0"
          aria-label="开始 2048"
          @keydown.enter="playGame('2048')"
          @keydown.space.prevent="playGame('2048')"
          @click="playGame('2048')"
        >
          <div class="game-banner">2048</div>
          <div class="game-info">
            <h3>2048</h3>
            <p>经典的数字合成游戏，挑战你的逻辑极限。</p>
          </div>
        </div>
      </div>

      <div class="game-list">
        <div
          class="game-card"
          role="button"
          tabindex="0"
          @keydown.enter="playGame(game.id)"
          @keydown.space.prevent="playGame(game.id)"
          v-for="(game, index) in games"
          :key="index"
          @click="playGame(game.id)"
        >
          <div class="card-bg" :style="{ background: game.color }">
            <Icon size="32" color="#fff">
              <component :is="game.icon" />
            </Icon>
          </div>
          <div class="card-title">{{ game.name }}</div>
        </div>
      </div>
    </div>

    <div v-else class="active-game-container">
      <div class="game-nav">
        <button class="back-btn" @click="activeGame = null">
          <Icon><ArrowLeft /></Icon> 返回大厅
        </button>
        <span class="current-game-title">{{ getGameName(activeGame) }}</span>
      </div>
      <div class="game-content">
        <component :is="gameComponents[activeGame]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Icon } from "@vicons/utils";
import { Gamepad, Dice, Chess, Trophy, ArrowLeft } from "@vicons/fa";
import Game2048 from "./games/Game2048.vue";
import Minesweeper from "./games/Minesweeper.vue";
import Snake from "./games/Snake.vue";
import Gomoku from "./games/Gomoku.vue";
import Card from "./games/Card.vue";

const activeGame = ref(null);

const gameComponents = {
  2048: Game2048,
  minesweeper: Minesweeper,
  snake: Snake,
  gomoku: Gomoku,
  card: Card,
};

const games = [
  { id: "minesweeper", name: "扫雷", icon: Trophy, color: "#f56c6c" },
  { id: "snake", name: "贪吃蛇", icon: Gamepad, color: "#67c23a" },
  { id: "card", name: "纸牌", icon: Dice, color: "#409eff" },
  { id: "gomoku", name: "五子棋", icon: Chess, color: "#e6a23c" },
];

const playGame = (id) => {
  activeGame.value = id;
};

const getGameName = (id) => {
  if (id === "2048") return "2048";
  const game = games.find((g) => g.id === id);
  return game ? game.name : "";
};
</script>

<style lang="scss" scoped>
.games-page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 0 10px;

  /* Hide scrollbar for cleaner look */
  &::-webkit-scrollbar {
    display: none;
  }

  .game-menu {
    animation: fadeIn 0.3s ease;
  }

  .header {
    margin-bottom: 20px;
    h2 {
      margin: 0;
      font-size: 1.8rem;
    }
    .subtitle {
      font-size: 0.9rem;
      opacity: 0.8;
    }
  }

  .game-showcase {
    margin-bottom: 30px;
    .featured-game {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: scale(1.02);
      }

      .game-banner {
        height: 120px;
        background: linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        font-weight: bold;
        color: white;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .game-info {
        padding: 15px;
        h3 {
          margin: 0 0 5px;
        }
        p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.7;
        }
      }
    }
  }

  .game-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    padding-bottom: 20px;

    .game-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .card-bg {
        width: 50px;
        height: 50px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
      }

      .card-title {
        font-size: 1rem;
        font-weight: 500;
      }
    }
  }

  .active-game-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.3s ease;

    .game-nav {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 10px;

      .back-btn {
        background: transparent;
        border: none;
        color: white;
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 1rem;
        cursor: pointer;
        opacity: 0.8;
        transition: opacity 0.2s;

        &:hover {
          opacity: 1;
        }
      }

      .current-game-title {
        margin-left: auto;
        font-weight: bold;
        opacity: 0.8;
      }
    }

    .game-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      justify-content: center;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
