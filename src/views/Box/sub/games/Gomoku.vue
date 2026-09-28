<template>
  <div class="gomoku-game">
    <div class="header">
      <div class="status">
        当前执子: 
        <span class="stone-icon" :class="{ black: currentPlayer === 1, white: currentPlayer === 2 }"></span>
        {{ currentPlayer === 1 ? '黑方' : '白方' }}
      </div>
      <div class="actions">
        <button class="btn undo" @click="undo" :disabled="history.length === 0 || !!winner">悔棋</button>
        <button class="btn restart" @click="initGame">重置</button>
      </div>
    </div>

    <div class="board-container">
      <div class="board">
        <!-- Grid lines background -->
        <div class="grid-lines">
          <div v-for="i in 14" :key="`h-${i}`" class="line h-line" :style="{ top: i * cellPercent + '%' }"></div>
          <div v-for="i in 14" :key="`v-${i}`" class="line v-line" :style="{ left: i * cellPercent + '%' }"></div>
        </div>

        <!-- Clickable intersections -->
        <div class="intersections">
          <div
            v-for="(cell, index) in board"
            :key="index"
            class="intersection"
            @click="makeMove(index)"
          >
            <div
              v-if="cell !== 0"
              class="stone"
              :class="{ 
                black: cell === 1, 
                white: cell === 2,
                last: index === lastMoveIndex
              }"
            ></div>
          </div>
        </div>
      </div>

      <div v-if="winner" class="overlay">
        <div class="message">
          <h2>{{ winner === 1 ? '黑方' : '白方' }} 获胜! 🎉</h2>
          <button class="btn start" @click="initGame">再来一局</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const SIZE = 15;
const cellPercent = 100 / (SIZE - 1);

const board = ref(new Array(SIZE * SIZE).fill(0)); // 0: empty, 1: black, 2: white
const currentPlayer = ref(1);
const winner = ref(null);
const history = ref([]);
const lastMoveIndex = ref(-1);

const initGame = () => {
  board.value = new Array(SIZE * SIZE).fill(0);
  currentPlayer.value = 1;
  winner.value = null;
  history.value = [];
  lastMoveIndex.value = -1;
};

const makeMove = (index) => {
  if (winner.value || board.value[index] !== 0) return;

  board.value[index] = currentPlayer.value;
  history.value.push(index);
  lastMoveIndex.value = index;

  if (checkWin(index, currentPlayer.value)) {
    winner.value = currentPlayer.value;
  } else {
    currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;
  }
};

const undo = () => {
  if (history.value.length === 0 || winner.value) return;
  
  const lastIndex = history.value.pop();
  board.value[lastIndex] = 0;
  currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;
  
  if (history.value.length > 0) {
    lastMoveIndex.value = history.value[history.value.length - 1];
  } else {
    lastMoveIndex.value = -1;
  }
};

const checkWin = (index, player) => {
  const x = index % SIZE;
  const y = Math.floor(index / SIZE);
  const directions = [
    { dx: 1, dy: 0 },  // Horizontal
    { dx: 0, dy: 1 },  // Vertical
    { dx: 1, dy: 1 },  // Diagonal \
    { dx: 1, dy: -1 }  // Diagonal /
  ];

  for (const { dx, dy } of directions) {
    let count = 1;
    
    // Check forward
    let nx = x + dx;
    let ny = y + dy;
    while (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && board.value[ny * SIZE + nx] === player) {
      count++;
      nx += dx;
      ny += dy;
    }

    // Check backward
    nx = x - dx;
    ny = y - dy;
    while (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE && board.value[ny * SIZE + nx] === player) {
      count++;
      nx -= dx;
      ny -= dy;
    }

    if (count >= 5) return true;
  }
  return false;
};
</script>

<style lang="scss" scoped>
.gomoku-game {
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
    max-width: 400px;
    margin-bottom: 15px;

    .status {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.2rem;

      .stone-icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        &.black { background: black; border: 1px solid #444; }
        &.white { background: white; }
      }
    }

    .actions {
      display: flex;
      gap: 10px;
      
      .btn {
        padding: 5px 15px;
        border-radius: 15px;
        border: none;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        transition: background 0.2s;

        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }

  .board-container {
    position: relative;
    width: 90vw;
    height: 90vw;
    max-width: 400px;
    max-height: 400px;
    background: #e6a23c;
    border-radius: 4px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

    .board {
      position: relative;
      width: 100%;
      height: 100%;
      
      .grid-lines {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;

        .line {
          position: absolute;
          background: #333;
          
          &.h-line {
            left: 0;
            right: 0;
            height: 1px;
          }
          
          &.v-line {
            top: 0;
            bottom: 0;
            width: 1px;
          }
        }
      }

      .intersections {
        display: grid;
        grid-template-columns: repeat(15, 1fr);
        grid-template-rows: repeat(15, 1fr);
        width: 100%;
        height: 100%;
        position: relative;
        z-index: 1;

        .intersection {
          position: relative;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;

          /* Expand hit area */
          &::after {
            content: '';
            position: absolute;
            top: -20%;
            left: -20%;
            right: -20%;
            bottom: -20%;
          }

          .stone {
            width: 80%;
            height: 80%;
            border-radius: 50%;
            box-shadow: 2px 2px 2px rgba(0,0,0,0.3);
            position: relative;

            &.black {
              background: radial-gradient(circle at 30% 30%, #666, #000);
            }
            
            &.white {
              background: radial-gradient(circle at 30% 30%, #fff, #ddd);
            }
            
            &.last::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              width: 30%;
              height: 30%;
              transform: translate(-50%, -50%);
              border-radius: 50%;
              background: rgba(255, 0, 0, 0.6);
            }
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
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 4px;
      z-index: 10;

      .message {
        text-align: center;
        
        h2 {
          margin-bottom: 20px;
          font-size: 1.8rem;
        }

        .btn {
          background: #67c23a;
          border: none;
          padding: 10px 30px;
          border-radius: 20px;
          color: white;
          font-size: 1.1rem;
          cursor: pointer;
          
          &:hover {
            transform: scale(1.05);
          }
        }
      }
    }
  }
}
</style>
