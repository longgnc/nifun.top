<template>
  <div class="card-game">
    <div class="header">
      <div class="stats">
        <span>步数: {{ moves }}</span>
        <span>配对: {{ matches }}/{{ totalPairs }}</span>
        <span>时间: {{ time }}s</span>
      </div>
      <button class="restart-btn" @click="initGame">重新开始</button>
    </div>

    <div class="game-board" :class="{ 'game-over': gameOver }">
      <button
        v-for="(card, index) in cards"
        :key="card.id"
        class="card-container"
        :class="{ flipped: card.flipped || card.matched }"
        :aria-label="
          card.flipped || card.matched ? card.content : '翻开第 ' + (index + 1) + ' 张卡片'
        "
        :disabled="card.matched || isProcessing"
        @click="flipCard(index)"
      >
        <div class="card-inner">
          <div class="card-front">
            <span class="card-content">{{ card.content }}</span>
          </div>
          <div class="card-back">
            <span>✳</span>
          </div>
        </div>
      </button>
    </div>

    <div v-if="gameOver" class="overlay">
      <div class="message">
        <h2>恭喜完成! 🎉</h2>
        <p>用时: {{ time }}秒</p>
        <p>步数: {{ moves }}</p>
        <button class="start-btn" @click="initGame">再玩一次</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from "vue";

const emojis = ["◈", "✳", "◉", "✦", "⌘", "☾", "△", "∞"];
const cards = ref([]);
const moves = ref(0);
const matches = ref(0);
const time = ref(0);
const totalPairs = 8; // 4x4 grid
const timerInterval = ref(null);
const gameOver = ref(false);
const isProcessing = ref(false);

let flipTimeout;
const initGame = () => {
  clearTimeout(flipTimeout);
  // Stop timer
  if (timerInterval.value) clearInterval(timerInterval.value);

  // Reset state
  moves.value = 0;
  matches.value = 0;
  time.value = 0;
  gameOver.value = false;
  isProcessing.value = false;

  // Prepare cards
  const selectedEmojis = emojis.slice(0, totalPairs);
  const deck = [...selectedEmojis, ...selectedEmojis];

  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  cards.value = deck.map((emoji, index) => ({
    id: index,
    content: emoji,
    flipped: false,
    matched: false,
  }));

  timerInterval.value = null;
};

const flipCard = (index) => {
  const card = cards.value[index];

  if (gameOver.value || isProcessing.value || card.matched || card.flipped) return;

  if (!timerInterval.value) timerInterval.value = setInterval(() => time.value++, 1000);
  card.flipped = true;

  const flippedCards = cards.value.filter((c) => c.flipped && !c.matched);

  if (flippedCards.length === 2) {
    moves.value++;
    isProcessing.value = true;

    if (flippedCards[0].content === flippedCards[1].content) {
      // Match
      flipTimeout = setTimeout(() => {
        flippedCards.forEach((c) => (c.matched = true));
        matches.value++;
        checkWin();
        isProcessing.value = false;
      }, 500);
    } else {
      // No match
      flipTimeout = setTimeout(() => {
        flippedCards.forEach((c) => (c.flipped = false));
        isProcessing.value = false;
      }, 1000);
    }
  }
};

const checkWin = () => {
  if (matches.value === totalPairs) {
    gameOver.value = true;
    clearInterval(timerInterval.value);
  }
};

// Start game on mount
initGame();

onUnmounted(() => {
  clearTimeout(flipTimeout);
  if (timerInterval.value) clearInterval(timerInterval.value);
});
</script>

<style lang="scss" scoped>
.card-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  color: white;
  padding: 10px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 500px;
    margin-bottom: 20px;

    .stats {
      display: flex;
      gap: 15px;
      font-size: 1.1rem;
      font-weight: bold;
    }

    .restart-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      padding: 5px 15px;
      border-radius: 15px;
      color: white;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }

  .game-board {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    width: 100%;
    max-width: 400px;
    aspect-ratio: 1;
    perspective: 1000px;

    .card-container {
      position: relative;
      width: 100%;
      height: 100%;
      cursor: pointer;
      transform-style: preserve-3d;
      transition: transform 0.6s;

      &.flipped {
        transform: rotateY(180deg);
      }

      .card-inner {
        position: absolute;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
      }

      .card-front,
      .card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
        font-size: 2rem;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .card-back {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .card-front {
        background: white;
        transform: rotateY(180deg);
        .card-content {
          font-size: 2.5rem;
        }
      }
    }
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;

    .message {
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
      padding: 30px;
      border-radius: 15px;
      backdrop-filter: blur(10px);

      h2 {
        margin: 0 0 15px;
        font-size: 2rem;
      }
      p {
        margin: 5px 0;
        font-size: 1.2rem;
        opacity: 0.9;
      }

      .start-btn {
        margin-top: 20px;
        background: #409eff;
        border: none;
        padding: 10px 30px;
        border-radius: 25px;
        color: white;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.2s;

        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
}
</style>
