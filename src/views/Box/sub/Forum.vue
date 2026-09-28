<template>
  <div class="forum-page">
    <div class="header">
      <h2>社区论坛</h2>
      <span class="subtitle">分享与交流</span>
    </div>
    <div class="topic-list">
      <div v-for="(topic, index) in topics" :key="index" class="topic-item" @click="openTopic(topic)">
        <div class="topic-avatar">
          {{ topic.author[0] }}
        </div>
        <div class="topic-content">
          <div class="topic-title">{{ topic.title }}</div>
          <div class="topic-meta">
            <span class="author">{{ topic.author }}</span>
            <span class="time">{{ topic.time }}</span>
            <span class="tag" :style="{ backgroundColor: topic.color }">{{ topic.tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const topics = ref([
  { title: "欢迎来到树莓派爱好者社区！", author: "Admin", time: "1小时前", tag: "公告", color: "#f56c6c" },
  { title: "如何优化 Home Assistant 的运行速度？", author: "PiUser", time: "2小时前", tag: "求助", color: "#e6a23c" },
  { title: "分享我的 Docker 容器配置清单", author: "GeekBoy", time: "5小时前", tag: "分享", color: "#67c23a" },
  { title: "树莓派 5 散热方案讨论", author: "CoolPi", time: "1天前", tag: "硬件", color: "#409eff" },
  { title: "关于 IPv6 内网穿透的教程", author: "NetMaster", time: "2天前", tag: "网络", color: "#909399" },
]);

const openTopic = (topic) => {
  ElMessage.success(`打开帖子: ${topic.title}`);
};
</script>

<style lang="scss" scoped>
.forum-page {
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

  .topic-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .topic-item {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    padding: 15px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateX(5px);
    }

    .topic-avatar {
      width: 40px;
      height: 40px;
      background: #409eff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: white;
      margin-right: 15px;
    }

    .topic-content {
      flex: 1;
      
      .topic-title {
        font-size: 1.1rem;
        margin-bottom: 5px;
        font-weight: 500;
      }

      .topic-meta {
        font-size: 0.85rem;
        opacity: 0.8;
        display: flex;
        align-items: center;
        gap: 10px;

        .tag {
          padding: 2px 8px;
          border-radius: 4px;
          color: white;
          font-size: 0.75rem;
        }
      }
    }
  }
}
</style>
