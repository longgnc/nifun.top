<template>
  <div class="calculator">
    <div class="display">{{ displayValue }}</div>
    <div class="keypad">
      <button class="btn clear" @click="clear">AC</button>
      <button class="btn" @click="appendOperator('/')">÷</button>
      <button class="btn" @click="appendOperator('*')">×</button>
      <button class="btn delete" @click="backspace">⌫</button>

      <button class="btn" @click="appendNumber('7')">7</button>
      <button class="btn" @click="appendNumber('8')">8</button>
      <button class="btn" @click="appendNumber('9')">9</button>
      <button class="btn" @click="appendOperator('-')">-</button>

      <button class="btn" @click="appendNumber('4')">4</button>
      <button class="btn" @click="appendNumber('5')">5</button>
      <button class="btn" @click="appendNumber('6')">6</button>
      <button class="btn" @click="appendOperator('+')">+</button>

      <button class="btn" @click="appendNumber('1')">1</button>
      <button class="btn" @click="appendNumber('2')">2</button>
      <button class="btn" @click="appendNumber('3')">3</button>
      <button class="btn equal" @click="calculate">=</button>

      <button class="btn zero" @click="appendNumber('0')">0</button>
      <button class="btn" @click="appendNumber('.')">.</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const displayValue = ref("0");
const previousValue = ref(null);
const operator = ref(null);
const newNumber = ref(true);

const appendNumber = (num) => {
  if (newNumber.value) {
    displayValue.value = num === "." ? "0." : num;
    newNumber.value = false;
  } else {
    if (num === "." && displayValue.value.includes(".")) return;
    displayValue.value += num;
  }
};

const appendOperator = (op) => {
  if (operator.value && !newNumber.value) {
    calculate();
  }
  if (!Number.isFinite(Number(displayValue.value))) return;
  previousValue.value = displayValue.value;
  operator.value = op;
  newNumber.value = true;
};

const calculate = () => {
  if (!operator.value || newNumber.value) return;

  const prev = parseFloat(previousValue.value);
  const current = parseFloat(displayValue.value);
  let result = 0;

  switch (operator.value) {
    case "+":
      result = prev + current;
      break;
    case "-":
      result = prev - current;
      break;
    case "*":
      result = prev * current;
      break;
    case "/":
      result = prev / current;
      break;
  }

  displayValue.value = Number.isFinite(result)
    ? String(parseFloat(result.toPrecision(12)))
    : "无法除以零"; // Avoid floating point errors
  operator.value = null;
  newNumber.value = true;
};

const clear = () => {
  displayValue.value = "0";
  previousValue.value = null;
  operator.value = null;
  newNumber.value = true;
};

const backspace = () => {
  if (newNumber.value || displayValue.value.length === 1) {
    displayValue.value = "0";
    newNumber.value = true;
  } else {
    displayValue.value = displayValue.value.slice(0, -1);
  }
};
const keyboard = (e) => {
  if (e.target.closest("input,textarea,dialog") || e.ctrlKey || e.metaKey) return;
  if (/^[0-9.]$/.test(e.key)) {
    e.preventDefault();
    appendNumber(e.key);
  } else if (["+", "-", "*", "/"].includes(e.key)) {
    e.preventDefault();
    appendOperator(e.key);
  } else if (e.key === "=" || (e.key === "Enter" && e.target.tagName !== "BUTTON")) {
    e.preventDefault();
    calculate();
  } else if (e.key === "Escape") clear();
  else if (e.key === "Backspace") {
    e.preventDefault();
    backspace();
  }
};
onMounted(() => window.addEventListener("keydown", keyboard));
onUnmounted(() => window.removeEventListener("keydown", keyboard));
</script>

<style lang="scss" scoped>
.calculator {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;

  .display {
    background: rgba(0, 0, 0, 0.3);
    color: #fff;
    font-size: 2rem;
    text-align: right;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
    font-family: monospace;
    overflow: hidden;
  }

  .keypad {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    flex: 1;

    .btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-size: 1.2rem;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      &:active {
        background: rgba(255, 255, 255, 0.05);
      }

      &.clear {
        color: #ff6b6b;
      }
      &.delete {
        color: #e6a23c;
      }
      &.equal {
        grid-row: span 2;
        background: #409eff;
        &:hover {
          background: #66b1ff;
        }
      }
      &.zero {
        grid-column: span 2;
      }
    }
  }
}
</style>
