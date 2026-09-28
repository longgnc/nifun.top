<template>
  <div class="minesweeper">
    <div class="game-header">
      <div class="status-bar">
        <div class="counter">💣 {{ minesLeft }}</div>
        <button class="face-btn" @click="initGame">
          {{ gameOver ? (gameWon ? '😎' : '😵') : '🙂' }}
        </button>
        <div class="timer">⏱️ {{ time }}</div>
      </div>
    </div>

    <div class="grid" :style="{ gridTemplateColumns: `repeat(${cols}, 30px)` }" @contextmenu.prevent>
      <div
        v-for="(cell, index) in grid"
        :key="index"
        class="cell"
        :class="{
          revealed: cell.revealed,
          flagged: cell.flagged,
          mine: cell.revealed && cell.isMine,
          exploded: cell.exploded
        }"
        @click="reveal(index)"
        @contextmenu.prevent="toggleFlag(index)"
      >
        <template v-if="cell.revealed">
          <span v-if="cell.isMine">💣</span>
          <span v-else-if="cell.neighborMines > 0" :class="`num-${cell.neighborMines}`">
            {{ cell.neighborMines }}
          </span>
        </template>
        <span v-else-if="cell.flagged">🚩</span>
      </div>
    </div>
    
    <div class="controls">
      <div class="difficulty">
        <button :class="{ active: difficulty === 'easy' }" @click="setDifficulty('easy')">简单</button>
        <button :class="{ active: difficulty === 'medium' }" @click="setDifficulty('medium')">中等</button>
        <button :class="{ active: difficulty === 'hard' }" @click="setDifficulty('hard')">困难</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';

const difficulty = ref('easy');
const rows = ref(9);
const cols = ref(9);
const totalMines = ref(10);

const grid = ref([]);
const gameOver = ref(false);
const gameWon = ref(false);
const time = ref(0);
const timerInterval = ref(null);
const firstClick = ref(true);

const minesLeft = computed(() => {
  const flaggedCount = grid.value.filter(c => c.flagged).length;
  return totalMines.value - flaggedCount;
});

const setDifficulty = (level) => {
  difficulty.value = level;
  switch(level) {
    case 'easy':
      rows.value = 9;
      cols.value = 9;
      totalMines.value = 10;
      break;
    case 'medium':
      rows.value = 12;
      cols.value = 12;
      totalMines.value = 20;
      break;
    case 'hard':
      rows.value = 14;
      cols.value = 14;
      totalMines.value = 30; // Reduced for small screen
      break;
  }
  initGame();
};

const initGame = () => {
  clearInterval(timerInterval.value);
  time.value = 0;
  gameOver.value = false;
  gameWon.value = false;
  firstClick.value = true;
  
  grid.value = Array(rows.value * cols.value).fill(null).map((_, i) => ({
    id: i,
    isMine: false,
    revealed: false,
    flagged: false,
    neighborMines: 0,
    exploded: false
  }));
};

const placeMines = (excludeIndex) => {
  let minesPlaced = 0;
  while (minesPlaced < totalMines.value) {
    const idx = Math.floor(Math.random() * grid.value.length);
    if (!grid.value[idx].isMine && idx !== excludeIndex) {
      grid.value[idx].isMine = true;
      minesPlaced++;
    }
  }
  calculateNeighbors();
};

const calculateNeighbors = () => {
  for (let i = 0; i < grid.value.length; i++) {
    if (grid.value[i].isMine) continue;
    
    const neighbors = getNeighbors(i);
    grid.value[i].neighborMines = neighbors.filter(n => grid.value[n].isMine).length;
  }
};

const getNeighbors = (index) => {
  const neighbors = [];
  const r = Math.floor(index / cols.value);
  const c = index % cols.value;
  
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows.value && nc >= 0 && nc < cols.value) {
        neighbors.push(nr * cols.value + nc);
      }
    }
  }
  return neighbors;
};

const startTimer = () => {
  timerInterval.value = setInterval(() => {
    time.value++;
  }, 1000);
};

const reveal = (index) => {
  if (gameOver.value || grid.value[index].flagged || grid.value[index].revealed) return;
  
  if (firstClick.value) {
    firstClick.value = false;
    placeMines(index);
    startTimer();
  }
  
  const cell = grid.value[index];
  
  if (cell.isMine) {
    gameOver.value = true;
    cell.exploded = true;
    revealAllMines();
    clearInterval(timerInterval.value);
    return;
  }
  
  cell.revealed = true;
  
  if (cell.neighborMines === 0) {
    const queue = [index];
    const visited = new Set([index]);
    
    while (queue.length > 0) {
      const curr = queue.shift();
      const neighbors = getNeighbors(curr);
      
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          const neighborCell = grid.value[n];
          if (!neighborCell.revealed && !neighborCell.flagged && !neighborCell.isMine) {
            neighborCell.revealed = true;
            if (neighborCell.neighborMines === 0) {
              queue.push(n);
            }
          }
        }
      }
    }
  }
  
  checkWin();
};

const toggleFlag = (index) => {
  if (gameOver.value || grid.value[index].revealed) return;
  grid.value[index].flagged = !grid.value[index].flagged;
};

const revealAllMines = () => {
  grid.value.forEach(cell => {
    if (cell.isMine) cell.revealed = true;
  });
};

const checkWin = () => {
  const revealedCount = grid.value.filter(c => c.revealed).length;
  if (revealedCount === grid.value.length - totalMines.value) {
    gameWon.value = true;
    gameOver.value = true;
    clearInterval(timerInterval.value);
    grid.value.forEach(cell => {
      if (cell.isMine) cell.flagged = true;
    });
  }
};

onMounted(() => {
  initGame();
});

onUnmounted(() => {
  clearInterval(timerInterval.value);
});
</script>

<style lang="scss" scoped>
.minesweeper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  user-select: none;
  
  .game-header {
    background: #c0c0c0;
    padding: 4px;
    border: 2px solid;
    border-color: #fff #808080 #808080 #fff;
    margin-bottom: 10px;
    width: fit-content;
    
    .status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #c0c0c0;
      border: 2px solid;
      border-color: #808080 #fff #fff #808080;
      padding: 4px 8px;
      gap: 15px;
      
      .counter, .timer {
        background: #000;
        color: #f00;
        font-family: monospace;
        font-size: 20px;
        padding: 2px 4px;
        min-width: 60px;
        text-align: center;
      }
      
      .face-btn {
        width: 32px;
        height: 32px;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid;
        border-color: #fff #808080 #808080 #fff;
        background: #c0c0c0;
        cursor: pointer;
        
        &:active {
          border-color: #808080 #fff #fff #808080;
          transform: translateY(1px);
        }
      }
    }
  }
  
  .grid {
    display: grid;
    background: #808080;
    padding: 3px;
    border: 3px solid;
    border-color: #fff #808080 #808080 #fff;
    gap: 1px;
    
    .cell {
      width: 30px;
      height: 30px;
      background: #c0c0c0;
      border: 2px solid;
      border-color: #fff #808080 #808080 #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
      cursor: pointer;
      
      &.revealed {
        border: 1px solid #808080;
        background: #c0c0c0;
      }
      
      &.exploded {
        background: #ff0000;
      }
      
      &:active:not(.revealed) {
        border: none;
        border-top: 1px solid #808080;
        border-left: 1px solid #808080;
      }
      
      .num-1 { color: blue; }
      .num-2 { color: green; }
      .num-3 { color: red; }
      .num-4 { color: darkblue; }
      .num-5 { color: darkred; }
      .num-6 { color: teal; }
      .num-7 { color: black; }
      .num-8 { color: gray; }
    }
  }
  
  .controls {
    margin-top: 20px;
    
    .difficulty {
      display: flex;
      gap: 10px;
      
      button {
        padding: 5px 10px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.3s;
        
        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        &.active {
          background: #409eff;
          border-color: #409eff;
        }
      }
    }
  }
}
</style>
