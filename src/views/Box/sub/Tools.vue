<template>
  <div class="tools-container">
    <transition name="fade" mode="out-in">
      <!-- Tool List -->
      <div v-if="!currentTool" class="tools-home" key="list">
        <div class="header">
          <h2>实用工具</h2>
          <span class="subtitle">日常开发与生活助手</span>
        </div>

        <div class="tool-grid">
          <div
            class="tool-card"
            role="button"
            tabindex="0"
            @keydown.enter="openTool(tool)"
            @keydown.space.prevent="openTool(tool)"
            v-for="(tool, index) in tools"
            :key="index"
            @click="openTool(tool)"
          >
            <div class="icon-wrapper" :style="{ background: tool.color }">
              <Icon size="24" color="#fff">
                <component :is="tool.icon" />
              </Icon>
            </div>
            <div class="info">
              <h3>{{ tool.name }}</h3>
              <p>{{ tool.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tool Detail -->
      <div v-else class="tool-detail" key="detail">
        <div class="detail-header">
          <button class="back-btn" @click="currentTool = null">
            <Icon><ArrowLeft /></Icon> 返回
          </button>
          <h3>{{ currentTool.name }}</h3>
        </div>
        <div class="detail-content">
          <component :is="currentTool.component" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, markRaw } from "vue";
import { Icon } from "@vicons/utils";
import { Calculator, Clock, Ruler, Terminal, ArrowLeft } from "@vicons/fa";
import CalculatorTool from "./tools/Calculator.vue";
import UnitConverterTool from "./tools/UnitConverter.vue";
import WorldTimeTool from "./tools/WorldTime.vue";
import TerminalCommandsTool from "./tools/TerminalCommands.vue";

const currentTool = ref(null);

const tools = [
  {
    name: "计算器",
    desc: "简单的数值计算",
    icon: Calculator,
    color: "#409eff",
    component: markRaw(CalculatorTool),
  },
  {
    name: "单位换算",
    desc: "长度、重量、温度",
    icon: Ruler,
    color: "#67c23a",
    component: markRaw(UnitConverterTool),
  },
  {
    name: "世界时间",
    desc: "查看各地时间",
    icon: Clock,
    color: "#e6a23c",
    component: markRaw(WorldTimeTool),
  },
  {
    name: "终端命令",
    desc: "常用Linux命令速查",
    icon: Terminal,
    color: "#909399",
    component: markRaw(TerminalCommandsTool),
  },
];

const openTool = (tool) => {
  currentTool.value = tool;
};
</script>

<style lang="scss" scoped>
.tools-container {
  width: 100%;
  height: 100%;
  padding: 0 10px;
  overflow: hidden; /* Prevent outer scroll when internal components scroll */

  .tools-home {
    height: 100%;
    overflow-y: auto;
    &::-webkit-scrollbar {
      display: none;
    }
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

  .tool-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 15px;

    .tool-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 15px;
      display: flex;
      align-items: center;
      gap: 15px;
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .icon-wrapper {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .info {
        h3 {
          margin: 0 0 5px;
          font-size: 1.1rem;
        }
        p {
          margin: 0;
          font-size: 0.85rem;
          opacity: 0.7;
        }
      }
    }
  }

  .tool-detail {
    height: 100%;
    display: flex;
    flex-direction: column;

    .detail-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .back-btn {
        background: transparent;
        border: none;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        font-size: 1rem;
        padding: 5px 10px;
        border-radius: 4px;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }

      h3 {
        margin: 0;
        font-size: 1.2rem;
      }
    }

    .detail-content {
      flex: 1;
      overflow: hidden;
    }
  }
}
</style>
