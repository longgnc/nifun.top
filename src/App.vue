<script setup>
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import ServiceDirectory from "@/components/ServiceDirectory.vue";
import Glyph from "@/components/Glyph.vue";
import PersonalLibrary from "@/components/PersonalLibrary.vue";
import NeuralField from "@/components/NeuralField.vue";
import Weather from "@/components/Weather.vue";
import { mainStore } from "@/store";
import { getHitokoto } from "@/api";
import siteLinks from "@/assets/siteLinks.json";
const store = mainStore();
const neural = ref(null);
const hero = ref(null);
let scrollFrame = 0;
function documentScroll() {
  document.querySelector(".home-section-heading")?.scrollIntoView({
    behavior:
      motion.value && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "smooth"
        : "instant",
  });
}
function focusMain() {
  document.getElementById("page-heading")?.focus({ preventScroll: true });
}
function scrollHero() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    if (!hero.value) return;
    const r = hero.value.getBoundingClientRect();
    hero.value.style.setProperty("--scroll", String(Math.min(1, Math.max(0, -r.top / r.height))));
  });
}
const author = import.meta.env.VITE_SITE_AUTHOR || "青柠";
const siteName = import.meta.env.VITE_SITE_NAME || "青柠平台";
const icp = import.meta.env.VITE_SITE_ICP;
const songId = import.meta.env.VITE_SONG_ID || "";
const songServer = import.meta.env.VITE_SONG_SERVER || "netease";
const songType = import.meta.env.VITE_SONG_TYPE || "playlist";
const pages = [
  { id: "home", name: "首页", en: "Overview", icon: "compass", number: "01" },
  { id: "games", name: "游戏", en: "Playground", icon: "game", number: "02" },
  { id: "tools", name: "工具", en: "Utilities", icon: "terminal", number: "03" },
  { id: "music", name: "音乐", en: "Listening room", icon: "music", number: "04" },
  { id: "collection", name: "收藏", en: "Collection", icon: "book", number: "05" },
  { id: "services", name: "服务", en: "Services", icon: "compass", number: "06" },
  { id: "about", name: "关于", en: "About me", icon: "chat", number: "07" },
];
const games = [
  {
    id: "2048",
    name: "2048",
    kind: "数字 / 策略",
    description: "从 2 开始，看看能走多远。",
    art: "numbers",
    component: defineAsyncComponent(() => import("@/views/Box/sub/games/Game2048.vue")),
  },
  {
    id: "gomoku",
    name: "五子棋",
    kind: "棋类 / 对弈",
    description: "黑白之间，落子有声。",
    art: "board",
    component: defineAsyncComponent(() => import("@/views/Box/sub/games/Gomoku.vue")),
  },
  {
    id: "snake",
    name: "贪吃蛇",
    kind: "街机 / 反应",
    description: "熟悉的规则，再来一局。",
    art: "snake",
    component: defineAsyncComponent(() => import("@/views/Box/sub/games/Snake.vue")),
  },
  {
    id: "minesweeper",
    name: "扫雷",
    kind: "经典 / 推理",
    description: "每一步，都有迹可循。",
    art: "mines",
    component: defineAsyncComponent(() => import("@/views/Box/sub/games/Minesweeper.vue")),
  },
  {
    id: "card",
    name: "记忆配对",
    kind: "记忆配对 / 休闲",
    description: "翻开卡片，找到八组相同图案。",
    art: "cards",
    component: defineAsyncComponent(() => import("@/views/Box/sub/games/Card.vue")),
  },
];
const utilities = [
  {
    id: "calculator",
    name: "计算器",
    icon: "terminal",
    description: "日常运算，随手可得。",
    component: defineAsyncComponent(() => import("@/views/Box/sub/tools/Calculator.vue")),
  },
  {
    id: "converter",
    name: "单位换算",
    icon: "refresh",
    description: "长度、重量与温度的转换。",
    component: defineAsyncComponent(() => import("@/views/Box/sub/tools/UnitConverter.vue")),
  },
  {
    id: "worldtime",
    name: "世界时间",
    icon: "clock",
    description: "此时此刻，世界的另一端。",
    component: defineAsyncComponent(() => import("@/views/Box/sub/tools/WorldTime.vue")),
  },
  {
    id: "terminal",
    name: "终端命令",
    icon: "terminal",
    description: "常用 Linux 命令，一处查阅。",
    component: defineAsyncComponent(() => import("@/views/Box/sub/tools/TerminalCommands.vue")),
  },
];
const modules = {
  local: defineAsyncComponent(() => import("@/views/Box/sub/Music.vue")),
  online: defineAsyncComponent(() => import("@/components/Player.vue")),
  forum: defineAsyncComponent(() => import("@/views/Box/sub/Forum.vue")),
  time: defineAsyncComponent(() => import("@/components/TimeCapsule.vue")),
};
const collectionTabs = [
  { id: "web", name: "网址" },
  { id: "movies", name: "影视" },
  { id: "books", name: "书籍" },
  { id: "forum", name: "社区" },
];
const validPages = new Set([...pages.map((p) => p.id), "focus", "gallery", "time"]);
const route = ref({ page: "home", detail: "" });
const page = computed(() => route.value.page);
const detail = computed(() => route.value.detail);
const currentIndex = computed(() =>
  Math.max(
    0,
    pages.findIndex((p) => p.id === page.value),
  ),
);
const nextPage = computed(() => pages[(currentIndex.value + 1) % pages.length]);
const activeGame = computed(() => games.find((g) => g.id === detail.value));
const activeTool = computed(() => utilities.find((t) => t.id === detail.value));
const musicSource = computed(() => (detail.value === "online" ? "online" : "local"));
const collectionSource = computed(() =>
  collectionTabs.some((t) => t.id === detail.value) ? detail.value : "web",
);
const searchDialog = ref(null);
const search = ref("");
const settings = ref(false);
const light = ref(localStorage.getItem("nifun-theme") === "light");
const motion = ref(localStorage.getItem("nifun-motion") !== "off");
const now = ref(new Date());
const quote = ref("生活的意义，在于生活本身。");
const quoteFrom = ref("此刻");
const quoteLoading = ref(false);
const focusRemaining = ref(1500);
const focusRunning = ref(false);
let focusEnd = 0;
let timer;
const wall = computed(() => {
  const n = Number(detail.value);
  return n >= 1 && n <= 26 && Number.isInteger(n) ? n : 16;
});
const clock = computed(() =>
  now.value.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }),
);
const date = computed(() =>
  now.value.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" }),
);
const focusTime = computed(
  () =>
    `${String(Math.floor(focusRemaining.value / 60)).padStart(2, "0")}:${String(focusRemaining.value % 60).padStart(2, "0")}`,
);
const links = siteLinks.filter((item) => /^https?:\/\//.test(item.link));
const destinations = [
  ...pages.map((p) => ({ name: p.name, path: p.id, icon: p.icon })),
  ...games.map((g) => ({ name: g.name, path: `games/${g.id}`, icon: "game" })),
  ...utilities.map((t) => ({ name: t.name, path: `tools/${t.id}`, icon: t.icon })),
  { name: "专注计时", path: "focus", icon: "clock" },
  { name: "壁纸漫游", path: "gallery", icon: "image" },
  { name: "时光胶囊", path: "time", icon: "clock" },
];
const results = computed(() =>
  destinations.filter((d) => d.name.toLowerCase().includes(search.value.trim().toLowerCase())),
);
function readRoute() {
  const [requested, requestedDetail = ""] = location.hash.replace(/^#\/?/, "").split("/");
  const next = validPages.has(requested) ? requested : "home";
  route.value = { page: next, detail: requestedDetail };
  document.title = `${pages.find((p) => p.id === next)?.name || "个人空间"} · ${siteName}`;
  store.setInnerWidth(window.innerWidth);
  window.scrollTo({ top: 0, behavior: "instant" });
  nextTick(() => document.querySelector("#page-heading")?.focus({ preventScroll: true }));
}
function go(path) {
  if (searchDialog.value?.open) searchDialog.value.close();
  location.hash = `/${path}`;
}
function openSearch() {
  search.value = "";
  searchDialog.value.showModal();
  nextTick(() => searchDialog.value.querySelector("input")?.focus());
}
function toggleTheme() {
  light.value = !light.value;
  localStorage.setItem("nifun-theme", light.value ? "light" : "dark");
}
function toggleMotion() {
  motion.value = !motion.value;
  localStorage.setItem("nifun-motion", motion.value ? "on" : "off");
}
function toggleFocus() {
  if (!focusRemaining.value) focusRemaining.value = 1500;
  focusRunning.value = !focusRunning.value;
  if (focusRunning.value) focusEnd = Date.now() + focusRemaining.value * 1000;
}
async function refreshQuote() {
  if (quoteLoading.value) return;
  quoteLoading.value = true;
  try {
    const q = await getHitokoto();
    if (q.hitokoto) {
      quote.value = q.hitokoto;
      quoteFrom.value = q.from || "一言";
    }
  } catch {
    /* Keep offline text. */
  } finally {
    quoteLoading.value = false;
  }
}
function onKey(event) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch();
  }
}
function resize() {
  store.setInnerWidth(window.innerWidth);
}
onMounted(() => {
  readRoute();
  refreshQuote();
  window.addEventListener("scroll", scrollHero, { passive: true });
  window.addEventListener("hashchange", readRoute);
  window.addEventListener("keydown", onKey);
  window.addEventListener("resize", resize);
  timer = setInterval(() => {
    now.value = new Date();
    if (focusRunning.value) {
      focusRemaining.value = Math.max(0, Math.ceil((focusEnd - Date.now()) / 1000));
      if (!focusRemaining.value) focusRunning.value = false;
    }
  }, 1000);
});
onBeforeUnmount(() => {
  clearInterval(timer);
  cancelAnimationFrame(scrollFrame);
  window.removeEventListener("scroll", scrollHero);
  window.removeEventListener("hashchange", readRoute);
  window.removeEventListener("keydown", onKey);
  window.removeEventListener("resize", resize);
});
</script>

<template>
  <div
    class="studio"
    :class="{ 'day-mode': light, 'motion-off': !motion, 'home-page': page === 'home' }"
  >
    <a class="skip" href="#main-content" @click.prevent="focusMain()">跳至正文</a>
    <header class="studio-header">
      <a class="wordmark" href="#/home" aria-label="青柠首页"
        ><span class="lime-mark" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span
        ><strong>{{ siteName }}</strong
        ><span class="wordmark-note">NIFUN.TOP</span></a
      >
      <nav class="page-nav" aria-label="主导航">
        <a
          v-for="item in pages"
          :key="item.id"
          :href="`#/${item.id}`"
          :aria-current="page === item.id ? 'page' : undefined"
          ><span>{{ item.number }}</span
          >{{ item.name }}</a
        >
      </nav>
      <div class="header-controls">
        <button class="search-trigger" @click="openSearch" aria-label="搜索页面">
          <Glyph name="search" /><kbd>⌘ K</kbd></button
        ><span class="control-divider" /><button
          class="icon-button"
          @click="toggleTheme"
          :aria-label="light ? '切换深色' : '切换浅色'"
        >
          <Glyph :name="light ? 'moon' : 'sun'" /></button
        ><a
          class="icon-button"
          href="https://github.com/longgnc"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          ><Glyph name="github"
        /></a>
      </div>
    </header>
    <main id="main-content" class="studio-main">
      <Transition name="page" mode="out-in" @after-enter="focusMain"
        ><div :key="page" class="page-view" :class="{ 'inner-page': page !== 'home' }">
          <template v-if="page === 'home'">
            <section ref="hero" class="neural-hero">
              <div class="hero-topline">
                <span>青柠平台 · 个人主页</span><span><i class="status-dot" /> {{ date }}</span>
              </div>
              <div class="neural-visual">
                <NeuralField ref="neural" :motion="motion" :light="light" />
              </div>
              <div class="neural-copy">
                <span class="overline">{{ author }} · NIFUN.TOP</span>
                <h1 id="page-heading" tabindex="-1">你好，<br /><span>这里是青柠。</span></h1>
                <p>平时写代码，也听音乐、玩游戏。<br />常用的工具和喜欢的东西，都放在这里。</p>
                <div class="hero-buttons">
                  <a class="solid-button" href="#/games">探索空间 <Glyph name="arrow" /></a
                  ><a class="quiet-button" href="#/about">关于我 <Glyph name="external" /></a>
                </div>
              </div>
              <div class="neural-caption">
                <span class="neural-caption-line" /><span
                  >青柠 · 交互光场<br /><small>移动指针，唤起连接</small></span
                >
              </div>
              <div class="hero-baseline">
                <button class="scroll-cue" @click="documentScroll">
                  <span class="scroll-stem" /><span>向下探索</span></button
                ><span class="hero-coordinate">保持好奇，慢慢积累。</span
                ><button class="signal-button" @click="neural?.activate()" :disabled="!motion">
                  <span class="signal-indicator" /> 触发信号 <Glyph name="external" />
                </button>
              </div>
            </section>
            <section class="home-section-heading">
              <div>
                <span class="overline">日常入口</span>
                <h2>常用的，<span>喜欢的。</span></h2>
              </div>
              <a class="home-services-link" href="#/services"
                >青柠系列服务 <Glyph name="arrow"
              /></a>
            </section>
            <nav class="home-destinations" aria-label="空间入口">
              <a href="#/games"
                ><span class="destination-number">01</span
                ><span class="destination-name">玩一会儿<small>五款经典小游戏</small></span
                ><Glyph name="external" /></a
              ><a href="#/tools"
                ><span class="destination-number">02</span
                ><span class="destination-name">顺手的工具<small>处理日常的小问题</small></span
                ><Glyph name="external" /></a
              ><a href="#/music"
                ><span class="destination-number">03</span
                ><span class="destination-name">听点什么<small>打开我的音乐收藏</small></span
                ><Glyph name="external"
              /></a>
            </nav>
            <div class="home-footnote">
              <div class="quote-line">
                <span>一句话</span>
                <p :title="quoteFrom">{{ quote }}</p>
                <button
                  class="icon-button"
                  @click="refreshQuote"
                  :disabled="quoteLoading"
                  aria-label="换一句"
                >
                  <Glyph name="refresh" />
                </button>
              </div>
              <div class="local-clock">
                <span>{{ clock }}</span
                ><Weather />
              </div>
            </div>
          </template>

          <template v-else-if="page === 'games'">
            <header class="page-title-row">
              <div>
                <span class="overline">游戏</span>
                <h1 id="page-heading" tabindex="-1">
                  {{ activeGame ? activeGame.name : "游戏室" }}
                </h1>
              </div>
              <p v-if="!activeGame">五款经典游戏，随时开始。<br />支持键盘与触屏操作。</p>
              <a v-else class="outline-button" href="#/games">返回游戏室 <Glyph name="arrow" /></a>
            </header>
            <div v-if="activeGame" class="play-stage module-surface">
              <component :is="activeGame.component" :key="activeGame.id" />
            </div>
            <div v-else class="game-library">
              <a
                v-for="(game, index) in games"
                :key="game.id"
                :href="`#/games/${game.id}`"
                class="game-tile"
                :class="`tile-${game.art}`"
                ><div class="game-cover" aria-hidden="true">
                  <template v-if="game.art === 'numbers'"
                    ><span class="large-number">2048</span
                    ><span class="number-caption">2 → 4 → 8 → ∞</span></template
                  >
                  <div v-else-if="game.art === 'board'" class="go-board">
                    <i /><i /><i /><i /><i />
                  </div>
                  <div v-else-if="game.art === 'snake'" class="snake-graphic">
                    <i v-for="n in 8" :key="n" /><b />
                  </div>
                  <div v-else-if="game.art === 'mines'" class="mine-graphic">
                    <span v-for="n in 9" :key="n">{{
                      n === 5 ? "✳" : n % 3 === 0 ? "2" : n % 2 === 0 ? "1" : ""
                    }}</span>
                  </div>
                  <div v-else class="cards-graphic">
                    <span>♠<small>A</small></span
                    ><span>♥<small>A</small></span>
                  </div>
                  <span class="cover-corner">0{{ index + 1 }}</span>
                </div>
                <div class="game-tile-info">
                  <div>
                    <span class="game-kind">{{ game.kind }}</span>
                    <h2>{{ game.name }}</h2>
                    <p>{{ game.description }}</p>
                  </div>
                  <span class="round-arrow"><Glyph name="arrow" /></span></div></a
              ><a class="pause-tile" href="#/focus"
                ><Glyph name="clock" />
                <div>
                  <h2>也可以，专注一会儿。</h2>
                  <p>25 分钟，留给当下。</p>
                </div>
                <Glyph name="arrow"
              /></a>
            </div>
          </template>

          <template v-else-if="page === 'tools'">
            <header class="page-title-row">
              <div>
                <span class="overline">工具</span>
                <h1 id="page-heading" tabindex="-1">工具台</h1>
              </div>
              <p>简单的工具，解决具体的问题。<br />随时打开，用完即走。</p>
            </header>
            <div v-if="!activeTool" class="tool-library">
              <a
                v-for="(tool, index) in utilities"
                :key="tool.id"
                :href="`#/tools/${tool.id}`"
                class="utility-row"
                ><span class="utility-no">0{{ index + 1 }}</span
                ><Glyph :name="tool.icon" />
                <div>
                  <h2>{{ tool.name }}</h2>
                  <p>{{ tool.description }}</p>
                </div>
                <span class="utility-shortcut">打开工具</span><Glyph name="external" /></a
              ><a class="utility-row" href="#/focus"
                ><span class="utility-no">05</span><Glyph name="clock" />
                <div>
                  <h2>专注计时</h2>
                  <p>给一件事，完整的 25 分钟。</p>
                </div>
                <span class="utility-shortcut">开始专注</span><Glyph name="external"
              /></a>
            </div>
            <div v-else class="tool-workbench">
              <nav class="tool-sidebar" aria-label="工具切换">
                <a href="#/tools" class="all-tools">全部工具 <Glyph name="arrow" /></a
                ><a
                  v-for="tool in utilities"
                  :key="tool.id"
                  :href="`#/tools/${tool.id}`"
                  :aria-current="detail === tool.id ? 'page' : undefined"
                  ><Glyph :name="tool.icon" />{{ tool.name }}</a
                >
              </nav>
              <section class="tool-stage module-surface">
                <header>
                  <h2>{{ activeTool.name }}</h2>
                  <span>{{ activeTool.description }}</span>
                </header>
                <div class="tool-component">
                  <component :is="activeTool.component" :key="activeTool.id" />
                </div>
              </section>
            </div>
          </template>

          <template v-else-if="page === 'music'">
            <header class="page-title-row">
              <div>
                <span class="overline">音乐</span>
                <h1 id="page-heading" tabindex="-1">音乐</h1>
              </div>
              <p>有些时刻，适合交给音乐。<br />戴上耳机，慢一点。</p>
            </header>
            <nav class="section-tabs" aria-label="音乐来源">
              <a href="#/music/local" :aria-current="musicSource === 'local' ? 'page' : undefined"
                >本地收藏</a
              ><a
                href="#/music/online"
                :aria-current="musicSource === 'online' ? 'page' : undefined"
                >在线歌单</a
              ><span>选择歌单，点击播放。</span>
            </nav>
            <div class="music-workspace module-surface">
              <component
                :is="modules[musicSource]"
                :key="musicSource"
                :song-id="songId"
                :song-server="songServer"
                :song-type="songType"
              />
            </div>
          </template>

          <template v-else-if="page === 'collection'">
            <header class="page-title-row">
              <div>
                <span class="overline">收藏</span>
                <h1 id="page-heading" tabindex="-1">我的收藏</h1>
              </div>
              <p>一些网址，一些故事，<br />一些想再看一眼的东西。</p>
            </header>
            <nav class="section-tabs" aria-label="收藏分类">
              <a
                v-for="tab in collectionTabs"
                :key="tab.id"
                :href="`#/collection/${tab.id}`"
                :aria-current="collectionSource === tab.id ? 'page' : undefined"
                >{{ tab.name }}</a
              ><a href="#/gallery">壁纸 <Glyph name="external" /></a>
            </nav>
            <div class="collection-workspace module-surface">
              <PersonalLibrary
                v-if="collectionSource !== 'forum'"
                :key="collectionSource"
                :kind="collectionSource"
              /><component v-else :is="modules.forum" />
            </div>
          </template>

          <template v-else-if="page === 'services'"
            ><header class="page-title-row">
              <div><h1 id="page-heading" tabindex="-1">青柠服务</h1></div>
              <p>工作、存储、传输与记录，在这里找到入口。</p>
            </header>
            <ServiceDirectory
          /></template>
          <template v-else-if="page === 'about'">
            <header class="page-title-row">
              <div>
                <span class="overline">关于</span>
                <h1 id="page-heading" tabindex="-1">你好，我是 {{ author }}。</h1>
              </div>
              <span class="about-location">独立个人网站 / nifun.top</span>
            </header>
            <section class="about-layout">
              <div class="about-photo">
                <img src="/images/background26.jpg" alt="站点收藏的光影人物插画" />
              </div>
              <div class="about-prose">
                <span class="overline">保持一点自己的节奏。</span>
                <h2>在互联网里，<br />留一个自己的位置。</h2>
                <p>这个网站装着我日常会用的小工具、偶尔想玩的游戏，以及陪伴生活的音乐。</p>
                <p>它会随我的兴趣慢慢生长。你可以在这里停一会儿，也可以顺着一个链接，去往别处。</p>
                <div class="about-links">
                  <a href="https://github.com/longgnc" target="_blank" rel="noopener noreferrer"
                    >GitHub <Glyph name="external" /></a
                  ><a
                    v-for="link in links"
                    :key="link.name"
                    :href="link.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    >{{ link.name }} <Glyph name="external" /></a
                  ><a href="#/services">青柠服务 <Glyph name="external" /></a
                  ><a href="#/time">时光胶囊 <Glyph name="arrow" /></a>
                </div>
              </div>
            </section>
          </template>

          <template v-else-if="page === 'focus'">
            <header class="page-title-row">
              <div>
                <span class="overline">FOCUS / 25 MINUTES</span>
                <h1 id="page-heading" tabindex="-1">只做一件事。</h1>
              </div>
              <a class="outline-button" href="#/tools">回到工具台 <Glyph name="arrow" /></a>
            </header>
            <section class="focus-stage">
              <span class="overline">{{
                focusRemaining === 0
                  ? "这一轮完成，休息一下。"
                  : focusRunning
                    ? "专注进行中"
                    : "准备好，就开始。"
              }}</span
              ><strong>{{ focusTime }}</strong>
              <div class="focus-track"><i :style="{ width: `${focusRemaining / 15}%` }" /></div>
              <div class="focus-actions">
                <button class="solid-button" @click="toggleFocus">
                  {{
                    focusRunning ? "暂停" : focusRemaining === 0 ? "再来一轮" : "开始专注"
                  }}</button
                ><button
                  class="outline-button"
                  @click="
                    focusRunning = false;
                    focusRemaining = 1500;
                  "
                >
                  重置
                </button>
              </div>
              <p>离开这一页，计时仍会继续。</p>
            </section>
          </template>

          <template v-else-if="page === 'gallery'">
            <header class="page-title-row">
              <div>
                <span class="overline">VISUAL ARCHIVE / {{ String(wall).padStart(2, "0") }}</span>
                <h1 id="page-heading" tabindex="-1">换一个视角。</h1>
              </div>
              <div class="gallery-controls">
                <a
                  class="icon-button"
                  :href="`#/gallery/${wall === 1 ? 26 : wall - 1}`"
                  aria-label="上一张壁纸"
                  >←</a
                ><span>{{ wall }} / 26</span
                ><a
                  class="icon-button"
                  :href="`#/gallery/${(wall % 26) + 1}`"
                  aria-label="下一张壁纸"
                  >→</a
                >
              </div>
            </header>
            <div class="gallery-stage">
              <img :key="wall" :src="`/images/background${wall}.jpg`" :alt="`收藏壁纸 ${wall}`" />
            </div>
          </template>
          <template v-else-if="page === 'time'"
            ><header class="page-title-row">
              <div>
                <span class="overline">TIME / HERE AND NOW</span>
                <h1 id="page-heading" tabindex="-1">时间有迹。</h1>
              </div>
              <p>{{ date }}<br />{{ clock }}</p>
            </header>
            <div class="time-workspace module-surface"><component :is="modules.time" /></div
          ></template></div
      ></Transition>
      <footer class="studio-footer">
        <span
          >© {{ now.getFullYear() }} {{ author }}<span class="footer-slash">/</span>nifun.top</span
        >
        <div class="footer-pages" aria-label="页面分页">
          <a
            v-for="item in pages"
            :key="item.id"
            :href="`#/${item.id}`"
            :aria-label="`第 ${item.number} 页：${item.name}`"
            :aria-current="page === item.id ? 'page' : undefined"
            >{{ item.number }}</a
          ><a :href="`#/${nextPage.id}`" class="next-page"
            >{{ nextPage.name }} <Glyph name="arrow"
          /></a>
        </div>
        <div class="footer-actions">
          <a
            v-if="icp"
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            >{{ icp }}</a
          ><button @click="settings = !settings" :aria-expanded="settings">
            偏好 <Glyph name="settings" />
          </button>
        </div>
      </footer>
      <div v-if="settings" class="settings-panel">
        <div>
          <span>外观</span
          ><button @click="toggleTheme">
            {{ light ? "浅色" : "深色" }} <Glyph :name="light ? 'sun' : 'moon'" />
          </button>
        </div>
        <div>
          <span>页面动效</span
          ><button @click="toggleMotion" role="switch" :aria-checked="motion">
            {{ motion ? "开启" : "关闭" }}
          </button>
        </div>
        <button class="settings-close" @click="settings = false">
          收起 <Glyph name="close" />
        </button>
      </div>
    </main>
    <dialog
      ref="searchDialog"
      class="search-dialog"
      aria-label="搜索页面"
      @click="
        (event) => {
          if (event.target === searchDialog) searchDialog.close();
        }
      "
    >
      <header>
        <Glyph name="search" /><input
          v-model="search"
          placeholder="搜索页面、游戏或工具"
          aria-label="搜索内容"
        /><button class="icon-button" @click="searchDialog.close()" aria-label="关闭搜索">
          <Glyph name="close" />
        </button>
      </header>
      <div class="search-list">
        <button v-for="item in results" :key="item.path" @click="go(item.path)">
          <Glyph :name="item.icon" /><span>{{ item.name }}</span
          ><Glyph name="arrow" />
        </button>
        <p v-if="!results.length">没有找到，换个关键词试试。</p>
      </div>
    </dialog>
  </div>
</template>
