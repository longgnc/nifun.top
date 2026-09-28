<template>
  <div class="movies-container">
    <div class="header">
      <h2>影视中心</h2>
      <span class="subtitle">最近热门与经典收藏</span>
    </div>

    <div class="movie-grid">
      <div class="movie-card" v-for="(movie, index) in movies" :key="index">
        <div class="poster" :style="{ background: movie.color }">
          <span class="placeholder-icon">🎬</span>
        </div>
        <div class="info">
          <div class="title">{{ movie.name }}</div>
          <div class="meta">
            <span class="rating">⭐ {{ movie.rating }}</span>
            <span class="year">{{ movie.year }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const movies = [
  { name: "星际穿越", rating: 9.3, year: 2014, color: "#2c3e50" },
  { name: "盗梦空间", rating: 9.2, year: 2010, color: "#8e44ad" },
  { name: "千与千寻", rating: 9.4, year: 2001, color: "#e67e22" },
  { name: "阿甘正传", rating: 9.5, year: 1994, color: "#27ae60" },
  { name: "楚门的世界", rating: 9.3, year: 1998, color: "#2980b9" },
  { name: "泰坦尼克号", rating: 9.4, year: 1997, color: "#c0392b" },
];
</script>

<style lang="scss" scoped>
.movies-container {
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

  .movie-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;

    .movie-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: scale(1.05);
      }

      .poster {
        aspect-ratio: 2/3;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2rem;
      }

      .info {
        padding: 8px;
        
        .title {
          font-size: 0.9rem;
          font-weight: bold;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }

        .meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          opacity: 0.8;
          
          .rating { color: #f1c40f; }
        }
      }
    }
  }
}
</style>
