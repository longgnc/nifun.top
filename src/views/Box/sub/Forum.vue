<script setup>
import Glyph from "@/components/Glyph.vue";
const configured = import.meta.env.VITE_WORKBENCH_URL || "http://nifun.top:32016";
let base = "";
try {
  const url = new URL(configured);
  if (["http:", "https:"].includes(url.protocol)) base = url.origin;
} catch {
  /* Invalid overrides leave the destination unavailable. */
}
const destinations = [
  {
    path: "/moments",
    icon: "chat",
    name: "动态",
    description: "分享近况，看看大家最近在做什么。",
    action: "查看动态",
  },
  {
    path: "/friends",
    icon: "compass",
    name: "好友与聊天",
    description: "找到熟悉的人，继续上一次的交流。",
    action: "打开好友",
  },
];
</script>
<template>
  <section class="community-hub">
    <div class="community-intro">
      <span class="lime-mark" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
      <h2>青柠社区</h2>
      <p>与青柠工作台相连。</p>
      <p class="community-note">动态、好友和聊天在工作台中打开，使用同一个工作台账号。</p>
    </div>
    <div class="community-links">
      <article v-for="item in destinations" :key="item.path">
        <Glyph :name="item.icon" />
        <h3>{{ item.name }}</h3>
        <p>{{ item.description }}</p>
        <a
          v-if="base"
          :href="base + item.path"
          target="_blank"
          rel="noopener noreferrer"
          class="outline-button"
          >{{ item.action }} <Glyph name="external"
        /></a>
        <p v-else>工作台入口尚未配置。</p>
      </article>
    </div>
  </section>
</template>
