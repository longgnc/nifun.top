<template>
  <div v-if="siteLinks[0]" class="links">
    <div class="line">
      <Icon size="20">
        <Link />
      </Icon>
      <span class="title">网站列表</span>
    </div>
    <!-- 网站列表 -->
    <Swiper v-if="siteLinks[0]" :modules="[Pagination, Mousewheel]" :slides-per-view="1" :space-between="40"
      :pagination="{
        el: '.swiper-pagination',
        clickable: true,
        bulletElement: 'div',
      }" :mousewheel="true">
      <SwiperSlide v-for="site in siteLinksList" :key="site">
        <el-row class="link-all" :gutter="20">
          <el-col v-for="(item, index) in site" :span="8" :key="item">
            <div class="item cards" :style="index < 3 ? 'margin-bottom: 20px' : null" @click="jumpLink(item)">
              <Icon size="26">
                <component :is="siteIcon[item.icon]" />
              </Icon>
              <span class="name text-hidden">{{ item.name }}</span>
            </div>
          </el-col>
        </el-row>
      </SwiperSlide>
      <div class="swiper-pagination" />
    </Swiper>

    <!-- Focus Modal -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="showFocus" class="focus-overlay">
          <div class="close-btn" @click="closeFocus">
            <Icon size="30" color="#fff">
              <Times />
            </Icon>
          </div>
          <div class="clock-container">
            <div class="time">{{ currentTime }}</div>
            <div class="date">{{ currentDate }}</div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { Icon } from "@vicons/utils";
// 可前往 https://www.xicons.org 自行挑选并在此处引入
import { Link, Blog, CompactDisc, Cloud, Compass, Book, Fire, LaptopCode, Tools, Film, BookOpen, Clock, Times } from "@vicons/fa"; // 注意使用正确的类别
import { mainStore } from "@/store";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Mousewheel } from "swiper/modules";
import siteLinks from "@/assets/siteLinks.json";

const store = mainStore();

// Focus Mode Logic
const showFocus = ref(false);
const currentTime = ref("");
const currentDate = ref("");
let timer = null;

const updateTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  currentTime.value = `${hours}:${minutes}:${seconds}`;

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const weekDays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const week = weekDays[now.getDay()];
  currentDate.value = `${year}-${month}-${day} ${week}`;
};

const openFocus = () => {
  showFocus.value = true;
  updateTime();
  timer = setInterval(updateTime, 1000);
};

const closeFocus = () => {
  showFocus.value = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

// 计算网站链接
const siteLinksList = computed(() => {
  const result = [];
  for (let i = 0; i < siteLinks.length; i += 6) {
    const subArr = siteLinks.slice(i, i + 6);
    result.push(subArr);
  }
  return result;
});

// 网站链接图标
const siteIcon = {
  Blog,
  Cloud,
  CompactDisc,
  Compass,
  Book,
  Fire,
  LaptopCode,
  Tools,
  Film,
  BookOpen,
  Clock,
  Times
};

// 链接跳转
const jumpLink = (data) => {
  const name = data.name;

  if (name === "专注") {
    openFocus();
    return;
  }

  // Map names to box types
  const internalPages = {
    "论坛": "forum",
    "音乐": "music",
    "起始页": "start",
    "网址集": "web",
    "游戏": "game",
    "工具": "tools",
    "影视": "movies",
    "阅读": "books"
  };

  if (internalPages[name]) {
    store.boxType = internalPages[name];
    store.boxOpenState = true;
  } else {
    window.open(data.link, "_blank");
  }
};

onMounted(() => {
  console.log(siteLinks);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.links {
  .line {
    margin: 2rem 0.25rem 1rem;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    animation: fade 0.5s;

    .title {
      margin-left: 8px;
      font-size: 1.15rem;
      text-shadow: 0 0 5px #00000050;
    }
  }

  .swiper {
    left: -10px;
    width: calc(100% + 20px);
    padding: 5px 10px 0;
    z-index: 0;

    .swiper-slide {
      height: 100%;
    }

    .swiper-pagination {
      margin-top: 12px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;

      :deep(.swiper-pagination-bullet) {
        background-color: #fff;
        width: 20px;
        height: 4px;
        margin: 0 4px;
        border-radius: 4px;
        opacity: 0.2;
        transition: opacity 0.3s;

        &.swiper-pagination-bullet-active {
          opacity: 1;
        }

        &:hover {
          opacity: 1;
        }
      }
    }
  }

  .link-all {
    height: 220px;

    .item {
      height: 100px;
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: center;
      padding: 0 10px;
      animation: fade 0.5s;

      &:hover {
        transform: scale(1.02);
        background: rgb(0 0 0 / 40%);
        transition: 0.3s;
      }

      &:active {
        transform: scale(1);
      }

      .name {
        font-size: 1.1rem;
        margin-left: 8px;
      }

      @media (min-width: 720px) and (max-width: 820px) {
        .name {
          display: none;
        }
      }

      @media (max-width: 720px) {
        height: 80px;
      }

      @media (max-width: 460px) {
        flex-direction: column;

        .name {
          font-size: 1rem;
          margin-left: 0;
          margin-top: 8px;
        }
      }
    }

    @media (max-width: 720px) {
      height: 180px;
    }
  }
}

.focus-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  animation: fade 0.3s;

  .close-btn {
    position: absolute;
    top: 30px;
    right: 30px;
    cursor: pointer;
    opacity: 0.6;
    transition: all 0.3s;
    padding: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(90deg);
    }
  }

  .clock-container {
    text-align: center;
    color: #fff;
    user-select: none;

    .time {
      font-size: 12vw;
      font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
      font-weight: bold;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
      line-height: 1;
      letter-spacing: 5px;

      @media (max-width: 720px) {
        font-size: 18vw;
      }
    }

    .date {
      font-size: 2vw;
      margin-top: 30px;
      opacity: 0.8;
      font-weight: 300;
      letter-spacing: 2px;

      @media (max-width: 720px) {
        font-size: 5vw;
        margin-top: 20px;
      }
    }
  }
}
</style>