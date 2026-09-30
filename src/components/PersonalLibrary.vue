<script setup>
import { computed, ref } from "vue";
import definitions from "@/assets/publicCollections";
const props = defineProps({ kind: { type: String, required: true } });
const config = computed(() => definitions[props.kind]);
const query = ref("");
const selected = ref(null);
const items = computed(() =>
  config.value.seeds.map(([name, detail], id) => ({ id, name, detail })),
);
const results = computed(() =>
  items.value.filter((item) =>
    (item.name + " " + item.detail).toLowerCase().includes(query.value.trim().toLowerCase()),
  ),
);
const current = computed(() => items.value.find((item) => item.id === selected.value));
function safeURL(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
</script>
<template>
  <section class="personal-library">
    <div class="library-heading">
      <div>
        <h2>{{ config.title }}</h2>
        <p>
          {{
            kind === "web"
              ? "常用的网址与开发资源。"
              : kind === "books"
                ? "书籍收藏。"
                : "电影收藏。"
          }}
        </p>
      </div>
    </div>
    <div class="library-toolbar">
      <input
        v-model="query"
        type="search"
        :aria-label="'搜索' + config.title"
        placeholder="搜索名称或作者"
      />
    </div>
    <div class="shelf-layout" :class="{ 'has-detail': current }">
      <div class="shelf-grid">
        <button
          v-for="(item, index) in results"
          :key="item.id"
          class="shelf-card"
          :class="{ selected: selected === item.id }"
          @click="selected = item.id"
        >
          <div class="shelf-art" :class="kind" :style="{ '--shelf-hue': 80 + (index % 4) * 22 }">
            <span>{{ kind === "web" ? item.name.slice(0, 1) : item.name }}</span
            ><small>{{
              kind === "movies" ? "FILM COLLECTION" : kind === "books" ? "QINGNING LIBRARY" : "↗"
            }}</small>
          </div>
          <div class="shelf-meta">
            <h3>{{ item.name }}</h3>
            <p>{{ item.detail }}</p>
          </div>
        </button>
        <p v-if="!results.length" class="empty-state">
          {{ query ? "没有找到相关内容。" : "暂无公开收藏。" }}
        </p>
      </div>
      <aside v-if="current" class="shelf-detail">
        <button class="detail-close" aria-label="关闭详情" @click="selected = null">×</button>
        <h2>{{ current.name }}</h2>
        <p>{{ current.detail }}</p>
        <a
          v-if="kind === 'web' && safeURL(current.detail)"
          :href="safeURL(current.detail)"
          target="_blank"
          rel="noopener noreferrer"
          class="solid-button"
          >访问网站 ↗</a
        >
      </aside>
    </div>
  </section>
</template>
