<template>
  <div class="websites-page">
    <div class="header">
      <h2>网址集</h2>
      <span class="subtitle">发现互联网的宝藏</span>
    </div>

    <div class="category" v-for="(cat, index) in categories" :key="index">
      <div class="cat-title">
        <Icon size="20">
          <component :is="cat.icon" />
        </Icon>
        <span>{{ cat.name }}</span>
      </div>
      <div class="links-grid">
        <div class="link-card" v-for="(link, idx) in cat.links" :key="idx" @click="openLink(link.url)">
          <div class="link-icon">
            {{ link.name[0] }}
          </div>
          <div class="link-info">
            <span class="link-name">{{ link.name }}</span>
            <span class="link-desc">{{ link.desc }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon } from "@vicons/utils";
import { Globe, Video, Code } from "@vicons/fa";

const categories = [
  {
    name: "常用工具",
    icon: Globe,
    links: [
      { name: "Google", url: "https://google.com", desc: "全球最大的搜索引擎" },
      { name: "ChatGPT", url: "https://chat.openai.com", desc: "AI 智能助手" },
      { name: "GitHub", url: "https://github.com", desc: "代码托管平台" },
    ]
  },
  {
    name: "影音娱乐",
    icon: Video,
    links: [
      { name: "Bilibili", url: "https://bilibili.com", desc: "弹幕视频网站" },
      { name: "YouTube", url: "https://youtube.com", desc: "全球视频分享" },
      { name: "网易云音乐", url: "https://music.163.com", desc: "音乐的力量" },
    ]
  },
  {
    name: "开发资源",
    icon: Code,
    links: [
      { name: "MDN", url: "https://developer.mozilla.org", desc: "Web 开发文档" },
      { name: "Vue.js", url: "https://vuejs.org", desc: "渐进式框架" },
      { name: "Stack Overflow", url: "https://stackoverflow.com", desc: "开发者问答" },
    ]
  }
];

const openLink = (url) => {
  window.open(url, "_blank");
};
</script>

<style lang="scss" scoped>
.websites-page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 0 10px;

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

  .category {
    margin-bottom: 30px;

    .cat-title {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
      font-size: 1.2rem;
      font-weight: bold;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 8px;
    }

    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 15px;
    }

    .link-card {
      background: rgba(255, 255, 255, 0.1);
      padding: 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
      display: flex;
      align-items: center;
      gap: 10px;

      &:hover {
        transform: translateY(-3px);
        background: rgba(255, 255, 255, 0.2);
      }

      .link-icon {
        width: 32px;
        height: 32px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }

      .link-info {
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .link-name {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .link-desc {
          font-size: 0.7rem;
          opacity: 0.6;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>
