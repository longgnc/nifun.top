<template>
  <div class="box cards" @mouseenter="closeShow = true" @mouseleave="closeShow = false">
    <transition name="el-fade-in-linear">
      <close-one class="close" theme="filled" size="28" fill="#ffffff60" v-show="closeShow || store.innerWidth < 721"
        @click="store.boxOpenState = false" />
    </transition>
    <transition name="el-fade-in-linear">
      <setting-two class="setting" theme="filled" size="28" fill="#ffffff60"
        v-show="closeShow || store.innerWidth < 721" @click="store.setOpenState = true" />
    </transition>
    <div class="content">
      <transition name="fade" mode="out-in">
        <component :is="currentComponent" />
      </transition>
    </div>
  </div>
</template>

<script setup>
import { CloseOne, SettingTwo } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import { computed, ref } from "vue";
import StartPage from "@/views/Box/sub/Start.vue";
import ForumPage from "@/views/Box/sub/Forum.vue";
import MusicPage from "@/views/Box/sub/Music.vue";
import WebsitePage from "@/views/Box/sub/Websites.vue";
import GamePage from "@/views/Box/sub/Games.vue";
import ToolsPage from "@/views/Box/sub/Tools.vue";
import MoviesPage from "@/views/Box/sub/Movies.vue";
import BooksPage from "@/views/Box/sub/Books.vue";

const store = mainStore();
const closeShow = ref(false);

const currentComponent = computed(() => {
  switch (store.boxType) {
    case 'forum':
      return ForumPage;
    case 'music':
      return MusicPage;
    case 'web':
      return WebsitePage;
    case 'game':
      return GamePage;
    case 'tools':
      return ToolsPage;
    case 'movies':
      return MoviesPage;
    case 'books':
      return BooksPage;
    case 'start':
    default:
      return StartPage;
  }
});
</script>

<style lang="scss" scoped>
.box {
  flex: 1 0 0%;
  margin-left: 0.75rem;
  height: 80%;
  max-width: 50%;
  position: relative;
  animation: fade 0.5s;

  &:hover {
    transform: scale(1);
  }

  .close,
  .setting {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 28px;
    height: 28px;
    transition:
      transform 0.3s,
      opacity 0.3s;
    z-index: 10;

    &:hover {
      transform: scale(1.2);
    }

    &:active {
      transform: scale(1);
    }
  }

  .setting {
    right: 56px;
  }

  .content {
    display: flex;
    flex-direction: column;
    padding: 30px;
    width: 100%;
    height: 100%;
  }

  @media (max-width: 720px) {
    max-width: 100%;
    margin-left: 0;
    width: 100%;
  }
}
</style>
