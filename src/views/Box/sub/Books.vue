<template>
  <div class="books-container">
    <div class="header">
      <h2>阅读空间</h2>
      <span class="subtitle">知识与灵感的源泉</span>
    </div>

    <div class="book-list">
      <div class="book-item" v-for="(book, index) in books" :key="index">
        <div class="cover" :style="{ background: book.color }">
          <span>{{ book.name[0] }}</span>
        </div>
        <div class="details">
          <h3>{{ book.name }}</h3>
          <p class="author">{{ book.author }}</p>
          <div class="progress-bar">
            <div class="progress" :style="{ width: book.progress + '%' }"></div>
          </div>
          <span class="percent">{{ book.progress }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const books = [
  { name: "三体", author: "刘慈欣", progress: 85, color: "#34495e" },
  { name: "百年孤独", author: "加西亚·马尔克斯", progress: 30, color: "#d35400" },
  { name: "人类简史", author: "尤瓦尔·赫拉利", progress: 60, color: "#27ae60" },
  { name: "平凡的世界", author: "路遥", progress: 100, color: "#8e44ad" },
];
</script>

<style lang="scss" scoped>
.books-container {
  width: 100%;
  height: 100%;
  padding: 0 10px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  .header {
    margin-bottom: 20px;
    h2 { margin: 0; font-size: 1.8rem; }
    .subtitle { font-size: 0.9rem; opacity: 0.8; }
  }

  .book-list {
    display: flex;
    flex-direction: column;
    gap: 15px;

    .book-item {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      gap: 15px;
      align-items: center;
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
      }

      .cover {
        width: 50px;
        height: 70px;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
        font-size: 1.5rem;
        box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
      }

      .details {
        flex: 1;
        
        h3 { margin: 0 0 5px; font-size: 1.1rem; }
        .author { margin: 0 0 10px; font-size: 0.85rem; opacity: 0.7; }
        
        .progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 4px;
          
          .progress {
            height: 100%;
            background: #409eff;
          }
        }

        .percent {
          font-size: 0.75rem;
          opacity: 0.6;
          float: right;
        }
      }
    }
  }
}
</style>
