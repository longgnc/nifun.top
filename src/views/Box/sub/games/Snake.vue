<template>
  <div class="snake-game">
    <div class="game-header">
      <div class="score-board">
        <div class="score">得分: {{ score }}</div>
        <div class="best">最高: {{ bestScore }}</div>
      </div>
      <button class="restart-btn" @click="initGame">重新开始</button>
    </div>

    <div class="game-container" ref="gameContainer">
      <div class="grid-board">
        <!-- Snake -->
        <div
          v-for="(segment, index) in snake"
          :key="index"
          class="snake-segment"
          :class="{ head: index === 0 }"
          :style="getSegmentStyle(segment)"
        ></div>

        <!-- Food -->
        <div class="food" :style="getSegmentStyle(food)">●</div>
      </div>

      <div v-if="gameOver || !isPlaying" class="overlay">
        <div class="message">
          <h2 v-if="gameOver">游戏结束!</h2>
          <h2 v-else>{{ gameLoop ? "已暂停" : "贪吃蛇" }}</h2>
          <p v-if="gameOver">最终得分: {{ score }}</p>
          <button class="start-btn" @click="gameLoop && !gameOver ? togglePause() : startGame()">
            {{ gameOver ? "再玩一次" : gameLoop ? "继续游戏" : "开始游戏" }}
          </button>
        </div>
      </div>
    </div>

    <div class="controls">
      <button class="restart-btn" @click="togglePause" :disabled="gameOver || !gameLoop">
        {{ isPlaying ? "暂停" : "继续" }}
      </button>
      <div class="d-pad">
        <div class="row">
          <button class="ctrl-btn up" @click="changeDirection('up')">↑</button>
        </div>
        <div class="row">
          <button class="ctrl-btn left" @click="changeDirection('left')">←</button>
          <button class="ctrl-btn down" @click="changeDirection('down')">↓</button>
          <button class="ctrl-btn right" @click="changeDirection('right')">→</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const tileCount = 15; // Number of tiles per row/col

const snake = ref([]);
const food = ref({ x: 10, y: 10 });
const velocity = ref({ x: 0, y: 0 });
const score = ref(0);
const bestScore = ref(parseInt(localStorage.getItem("snake-best") || 0));
const isPlaying = ref(false);
const gameOver = ref(false);
const gameLoop = ref(null);

// Initial setup
const initGame = () => {
  snake.value = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ];
  food.value = spawnFood();
  score.value = 0;
  velocity.value = { x: 0, y: -1 };
  gameOver.value = false;
  isPlaying.value = false;
  turned = false;
  if (gameLoop.value) clearInterval(gameLoop.value);
  gameLoop.value = null;
};

let turned = false;
const spawnFood = () => {
  const empty = [];
  for (let y = 0; y < tileCount; y++)
    for (let x = 0; x < tileCount; x++)
      if (!snake.value.some((s) => s.x === x && s.y === y)) empty.push({ x, y });
  return empty.length ? empty[Math.floor(Math.random() * empty.length)] : null;
};

const startGame = () => {
  initGame();
  isPlaying.value = true;
  velocity.value = { x: 0, y: -1 }; // Start moving up
  gameLoop.value = setInterval(update, 150);
};

const update = () => {
  if (!isPlaying.value || gameOver.value) return;

  turned = false;
  const head = { ...snake.value[0] };
  head.x += velocity.value.x;
  head.y += velocity.value.y;

  // Wall collision
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    endGame();
    return;
  }

  // Self collision
  if (
    (head.x === food.value.x && head.y === food.value.y
      ? snake.value
      : snake.value.slice(0, -1)
    ).some((s) => s.x === head.x && s.y === head.y)
  ) {
    endGame();
    return;
  }

  snake.value.unshift(head);

  // Check food
  if (head.x === food.value.x && head.y === food.value.y) {
    score.value += 10;
    if (score.value > bestScore.value) {
      bestScore.value = score.value;
      localStorage.setItem("snake-best", bestScore.value);
    }
    const next = spawnFood();
    if (!next) {
      endGame();
      return;
    }
    food.value = next;
    // Optional: Speed up
  } else {
    snake.value.pop();
  }
};

const endGame = () => {
  gameOver.value = true;
  isPlaying.value = false;
  clearInterval(gameLoop.value);
};

const togglePause = () => {
  if (!gameOver.value && gameLoop.value) isPlaying.value = !isPlaying.value;
};
const changeDirection = (dir) => {
  if (!isPlaying.value || turned) return;
  turned = true;

  switch (dir) {
    case "up":
      if (velocity.value.y === 1) return;
      velocity.value = { x: 0, y: -1 };
      break;
    case "down":
      if (velocity.value.y === -1) return;
      velocity.value = { x: 0, y: 1 };
      break;
    case "left":
      if (velocity.value.x === 1) return;
      velocity.value = { x: -1, y: 0 };
      break;
    case "right":
      if (velocity.value.x === -1) return;
      velocity.value = { x: 1, y: 0 };
      break;
  }
};

const handleKeydown = (e) => {
  if (e.target.closest("input,textarea,dialog")) return;
  if (e.key.startsWith("Arrow")) e.preventDefault();
  if (e.code === "Space") {
    e.preventDefault();
    togglePause();
  }
  switch (e.key) {
    case "ArrowUp":
      changeDirection("up");
      break;
    case "ArrowDown":
      changeDirection("down");
      break;
    case "ArrowLeft":
      changeDirection("left");
      break;
    case "ArrowRight":
      changeDirection("right");
      break;
  }
};

const getSegmentStyle = (segment) => {
  return {
    left: (segment.x / tileCount) * 100 + "%",
    top: (segment.y / tileCount) * 100 + "%",
    width: "6%",
    height: "6%",
  };
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  initGame();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (gameLoop.value) clearInterval(gameLoop.value);
});
</script>

<style lang="scss" scoped>
.snake-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  color: white;
  padding-top: 10px;

  .game-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding: 0 20px;

    .score-board {
      display: flex;
      gap: 15px;
      font-size: 1.2rem;
      font-weight: bold;
    }

    .restart-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      padding: 5px 15px;
      border-radius: 20px;
      color: white;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  .game-container {
    position: relative;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    padding: 10px;
    border: 2px solid rgba(255, 255, 255, 0.1);

    .grid-board {
      position: relative;
      background: rgba(255, 255, 255, 0.05);

      .snake-segment {
        position: absolute;
        background: #67c23a;
        border-radius: 4px;
        transition: all 0.1s linear;

        &.head {
          background: #85ce61;
          z-index: 10;
        }
      }

      .food {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 14px;
      }
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 20;

      .message {
        text-align: center;
        h2 {
          margin: 0 0 10px;
          font-size: 2rem;
        }
        p {
          margin: 0 0 20px;
          font-size: 1.2rem;
        }

        .start-btn {
          background: #67c23a;
          border: none;
          padding: 10px 30px;
          border-radius: 25px;
          color: white;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.1s;

          &:hover {
            transform: scale(1.05);
          }

          &:active {
            transform: scale(0.95);
          }
        }
      }
    }
  }

  .controls {
    margin-top: 20px;

    .d-pad {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;

      .row {
        display: flex;
        gap: 5px;
      }

      .ctrl-btn {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.15);
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;

        &:active {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }
}
</style>
