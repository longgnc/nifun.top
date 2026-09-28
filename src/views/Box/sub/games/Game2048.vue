<template>
  <div class="game-2048">
    <div class="game-header">
      <div class="scores">
        <div class="score-box">
          <span class="label">SCORE</span>
          <span class="value">{{ score }}</span>
        </div>
        <div class="score-box">
          <span class="label">BEST</span>
          <span class="value">{{ bestScore }}</span>
        </div>
      </div>
      <button class="restart-btn" @click="initGame">New Game</button>
    </div>

    <div class="game-container" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
      <div class="grid-container">
        <div v-for="i in 16" :key="`grid-${i}`" class="grid-cell"></div>
      </div>
      <div class="tile-container">
        <div
          v-for="tile in tiles"
          :key="tile.id"
          :class="['tile', `tile-${tile.value}`, `position-${tile.x}-${tile.y}`, { 'tile-new': tile.isNew, 'tile-merged': tile.isMerged }]"
        >
          <div class="tile-inner">{{ tile.value }}</div>
        </div>
      </div>
      <div v-if="gameOver" class="game-message game-over">
        <p>Game Over!</p>
        <button @click="initGame">Try Again</button>
      </div>
      <div v-if="gameWon" class="game-message game-won">
        <p>You Win!</p>
        <button @click="keepPlaying">Keep Going</button>
      </div>
    </div>
    <div class="instructions">
      使用方向键或滑动屏幕移动方块
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const score = ref(0);
const bestScore = ref(0);
const tiles = ref([]);
const gameOver = ref(false);
const gameWon = ref(false);
const hasWon = ref(false); // To track if user has already won and chose to continue

let startX = 0;
let startY = 0;
let tileIdCounter = 0;

const initGame = () => {
  score.value = 0;
  tiles.value = [];
  gameOver.value = false;
  gameWon.value = false;
  hasWon.value = false;
  addRandomTile();
  addRandomTile();
  
  // Load best score
  const savedBest = localStorage.getItem('2048-best');
  if (savedBest) bestScore.value = parseInt(savedBest);
};

const addRandomTile = () => {
  const emptyCells = [];
  for (let x = 0; x < 4; x++) {
    for (let y = 0; y < 4; y++) {
      if (!tiles.value.find(t => t.x === x && t.y === y)) {
        emptyCells.push({ x, y });
      }
    }
  }

  if (emptyCells.length > 0) {
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    tiles.value.push({
      id: tileIdCounter++,
      x: randomCell.x,
      y: randomCell.y,
      value: Math.random() < 0.9 ? 2 : 4,
      isNew: true,
      isMerged: false
    });
  }
};

const getTileAt = (x, y) => tiles.value.find(t => t.x === x && t.y === y);

const move = (direction) => {
  if (gameOver.value) return;

  let moved = false;
  const vector = getVector(direction);
  const traversals = buildTraversals(vector);
  
  // Reset merge flags
  tiles.value.forEach(t => t.isMerged = false);
  tiles.value.forEach(t => t.isNew = false);

  traversals.x.forEach(x => {
    traversals.y.forEach(y => {
      const tile = getTileAt(x, y);
      if (tile) {
        const positions = findFarthestPosition({ x, y }, vector);
        const next = getTileAt(positions.next.x, positions.next.y);

        if (next && next.value === tile.value && !next.isMerged) {
          // Merge
          const mergedValue = tile.value * 2;
          
          // Remove old tiles
          tiles.value = tiles.value.filter(t => t.id !== tile.id && t.id !== next.id);
          
          // Add merged tile
          tiles.value.push({
            id: tileIdCounter++,
            x: positions.next.x,
            y: positions.next.y,
            value: mergedValue,
            isNew: false,
            isMerged: true
          });

          score.value += mergedValue;
          if (score.value > bestScore.value) {
            bestScore.value = score.value;
            localStorage.setItem('2048-best', bestScore.value);
          }

          if (mergedValue === 2048 && !hasWon.value) {
            gameWon.value = true;
          }
          moved = true;
        } else {
          // Move
          if (positions.farthest.x !== x || positions.farthest.y !== y) {
            tile.x = positions.farthest.x;
            tile.y = positions.farthest.y;
            moved = true;
          }
        }
      }
    });
  });

  if (moved) {
    addRandomTile();
    if (!movesAvailable()) {
      gameOver.value = true;
    }
  }
};

const getVector = (direction) => {
  const map = {
    0: { x: 0, y: -1 }, // Up
    1: { x: 1, y: 0 },  // Right
    2: { x: 0, y: 1 },  // Down
    3: { x: -1, y: 0 }  // Left
  };
  return map[direction];
};

const buildTraversals = (vector) => {
  const traversals = { x: [], y: [] };
  for (let pos = 0; pos < 4; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

const findFarthestPosition = (cell, vector) => {
  let previous;
  do {
    previous = cell;
    cell = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (withinBounds(cell) && !getTileAt(cell.x, cell.y));

  return {
    farthest: previous,
    next: cell
  };
};

const withinBounds = (position) => {
  return position.x >= 0 && position.x < 4 && position.y >= 0 && position.y < 4;
};

const movesAvailable = () => {
  return !!tiles.value.find(t => { // empty cell check is implicit if we can find a null spot, but tiles list only has tiles. 
    // Wait, simpler: check if board is full
    if (tiles.value.length < 16) return true;
    
    // Check matches
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        const tile = getTileAt(x, y);
        if (tile) {
          for (let direction = 0; direction < 4; direction++) {
            const vector = getVector(direction);
            const cell = { x: x + vector.x, y: y + vector.y };
            const other = getTileAt(cell.x, cell.y);
            if (other && other.value === tile.value) {
              return true;
            }
          }
        }
      }
    }
    return false;
  });
};

const keepPlaying = () => {
  gameWon.value = false;
  hasWon.value = true;
};

// Input handling
const handleKeydown = (e) => {
  const map = {
    38: 0, // Up
    39: 1, // Right
    40: 2, // Down
    37: 3, // Left
    87: 0, // W
    68: 1, // D
    83: 2, // S
    65: 3  // A
  };
  
  if (map[e.keyCode] !== undefined) {
    e.preventDefault();
    move(map[e.keyCode]);
  }
};

const handleTouchStart = (e) => {
  if (e.touches.length > 1) return;
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
};

const handleTouchEnd = (e) => {
  if (e.changedTouches.length > 0) {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    const diffX = endX - startX;
    const diffY = endY - startY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 30) {
        move(diffX > 0 ? 1 : 3);
      }
    } else {
      if (Math.abs(diffY) > 30) {
        move(diffY > 0 ? 2 : 0);
      }
    }
  }
};

onMounted(() => {
  initGame();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style lang="scss" scoped>
.game-2048 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-family: "Clear Sans", "Helvetica Neue", Arial, sans-serif;
  
  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 280px;
    margin-bottom: 20px;
    
    .scores {
      display: flex;
      gap: 10px;
      
      .score-box {
        background: #bbada0;
        padding: 5px 15px;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        align-items: center;
        color: white;
        min-width: 60px;
        
        .label {
          font-size: 10px;
          color: #eee4da;
          font-weight: bold;
        }
        
        .value {
          font-size: 18px;
          font-weight: bold;
        }
      }
    }
    
    .restart-btn {
      background: #8f7a66;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      outline: none;
      
      &:hover {
        background: #7f6a56;
      }
    }
  }
  
  .game-container {
    position: relative;
    width: 280px;
    height: 280px;
    background: #bbada0;
    border-radius: 6px;
    padding: 10px;
    box-sizing: border-box;
    touch-action: none;
    
    .grid-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(4, 1fr);
      gap: 10px;
      width: 100%;
      height: 100%;
      
      .grid-cell {
        background: rgba(238, 228, 218, 0.35);
        border-radius: 3px;
        width: 100%;
        height: 100%;
      }
    }
    
    .tile-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 10px;
      z-index: 2;
      
      .tile {
        position: absolute;
        width: 57.5px; // (280 - 20 - 30) / 4
        height: 57.5px;
        border-radius: 3px;
        transition: transform 0.1s ease-in-out;
        
        .tile-inner {
          width: 100%;
          height: 100%;
          background: #eee4da;
          text-align: center;
          line-height: 57.5px;
          font-weight: bold;
          font-size: 30px;
          color: #776e65;
          border-radius: 3px;
        }
        
        &.tile-new {
          animation: appear 0.2s ease;
        }
        
        &.tile-merged {
          animation: pop 0.2s ease;
        }
        
        // Tile colors
        &.tile-2 .tile-inner { background: #eee4da; }
        &.tile-4 .tile-inner { background: #ede0c8; }
        &.tile-8 .tile-inner { background: #f2b179; color: #f9f6f2; }
        &.tile-16 .tile-inner { background: #f59563; color: #f9f6f2; }
        &.tile-32 .tile-inner { background: #f67c5f; color: #f9f6f2; }
        &.tile-64 .tile-inner { background: #f65e3b; color: #f9f6f2; }
        &.tile-128 .tile-inner { background: #edcf72; color: #f9f6f2; font-size: 24px; }
        &.tile-256 .tile-inner { background: #edcc61; color: #f9f6f2; font-size: 24px; }
        &.tile-512 .tile-inner { background: #edc850; color: #f9f6f2; font-size: 24px; }
        &.tile-1024 .tile-inner { background: #edc53f; color: #f9f6f2; font-size: 18px; }
        &.tile-2048 .tile-inner { background: #edc22e; color: #f9f6f2; font-size: 18px; }
      }
    }
    
    .game-message {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(238, 228, 218, 0.73);
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      animation: fade-in 0.8s;
      
      p {
        font-size: 40px;
        font-weight: bold;
        color: #776e65;
        margin-bottom: 20px;
      }
      
      button {
        background: #8f7a66;
        color: white;
        border: none;
        padding: 10px 20px;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
      }
    }
  }
  
  .instructions {
    margin-top: 20px;
    color: #ffffffaa;
    font-size: 14px;
  }
}

// Position classes generation
@for $x from 0 through 3 {
  @for $y from 0 through 3 {
    .position-#{$x}-#{$y} {
      transform: translate($x * 67.5px, $y * 67.5px);
    }
  }
}

@keyframes appear {
  0% { opacity: 0; transform: scale(0); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>
