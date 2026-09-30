const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Exercise each component's actual setup logic with deterministic lifecycle/timers.
function setup(file, names) {
  let code = fs.readFileSync(path.join(__dirname, '../src/views/Box/sub', file), 'utf8').match(/<script setup>([\s\S]*?)<\/script>/)[1];
  code = code.replace(/^import .*?;\s*$/gm, '');
  const timers = new Map(); let id=0; const storage=new Map();
  const factory = new Function('ref','computed','onMounted','onUnmounted','setTimeout','clearTimeout','setInterval','clearInterval','localStorage','window', code + `;return {${names}};`);
  const mounted=[];
  const result=factory(v=>({value:v}),f=>({get value(){return f();}}),f=>mounted.push(f),()=>{},f=>{timers.set(++id,f);return id;},n=>timers.delete(n),()=>++id,()=>{}, {getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,String(v))},{addEventListener(){},removeEventListener(){}});
  mounted.forEach(f=>f());
  return {...result, flush:()=>{for(const [id,f] of timers){timers.delete(id);f();}}, timers};
}
test('2048 merges each tile once, checks blocked board and win overlay',()=>{
  const g=setup('games/Game2048.vue','tiles,score,move,movesAvailable,gameWon,keepPlaying');
  g.tiles.value=[2,2,2,2].map((value,x)=>({id:100+x,x,y:0,value}));g.move(3);
  assert.equal(g.score.value,8);assert.equal(g.tiles.value.filter(t=>t.value===4).length,2);
  g.tiles.value=Array.from({length:16},(_,i)=>({x:i%4,y:Math.floor(i/4),value:(i%4+Math.floor(i/4))%2?4:2}));assert.equal(g.movesAvailable(),false);
  g.gameWon.value=true;const before=JSON.stringify(g.tiles.value);g.move(0);assert.equal(JSON.stringify(g.tiles.value),before);g.keepPlaying();assert.equal(g.gameWon.value,false);
});
test('Gomoku detects five, permits undo, resets winner',()=>{
  const g=setup('games/Gomoku.vue','makeMove,undo,initGame,history,winner,board');
  g.makeMove(0);g.undo();assert.equal(g.board.value[0],0);
  [0,15,1,16,2,17,3,18,4].forEach(g.makeMove);assert.equal(g.winner.value,1);g.initGame();assert.equal(g.winner.value,null);assert.equal(g.history.value.length,0);
});
test('Minesweeper first click is safe, flags prevent reveal and win terminates',()=>{
  const g=setup('games/Minesweeper.vue','reveal,toggleFlag,grid,gameOver,gameWon,initGame');
  g.toggleFlag(0);g.reveal(0);assert.equal(g.grid.value[0].revealed,false);g.toggleFlag(0);g.reveal(0);assert.equal(g.grid.value[0].isMine,false);assert.equal(g.gameOver.value,false);
  g.grid.value.forEach((cell,i)=>{if(!cell.isMine)g.reveal(i);});assert.equal(g.gameWon.value,true);g.initGame();assert.equal(g.gameOver.value,false);
});
test('Memory matching resets pending callbacks and solves all eight pairs',()=>{
  const g=setup('games/Card.vue','cards,flipCard,initGame,matches,gameOver,moves');
  g.flipCard(0);g.flipCard(1);g.initGame();g.flush();assert.equal(g.matches.value,0);assert.equal(g.moves.value,0);
  const pairs=new Map();g.cards.value.forEach((c,i)=>pairs.set(c.content,[...(pairs.get(c.content)||[]),i]));for(const [a,b] of pairs.values()){g.flipCard(a);g.flipCard(b);g.flush();}assert.equal(g.matches.value,8);assert.equal(g.gameOver.value,true);
});
test('Snake prevents two turns in one tick and handles a full board',()=>{
  const g=setup('games/Snake.vue','startGame,changeDirection,velocity,snake,spawnFood,togglePause,isPlaying');g.startGame();g.changeDirection('left');g.changeDirection('down');assert.deepEqual(g.velocity.value,{x:-1,y:0});g.togglePause();assert.equal(g.isPlaying.value,false);
  g.snake.value=Array.from({length:225},(_,i)=>({x:i%15,y:Math.floor(i/15)}));assert.equal(g.spawnFood(),null);
});
test('Calculator handles leading decimal, division by zero and recovery',()=>{
  const g=setup('tools/Calculator.vue','appendNumber,appendOperator,calculate,displayValue,clear');g.appendNumber('.');g.appendNumber('5');g.appendOperator('+');g.appendNumber('1');g.calculate();assert.equal(g.displayValue.value,'1.5');g.appendOperator('/');g.appendNumber('0');g.calculate();assert.equal(g.displayValue.value,'无法除以零');g.appendNumber('2');assert.equal(g.displayValue.value,'2');
});
