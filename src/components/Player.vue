<template>
  <div class="netease-player">
    <!-- 隐藏的 APlayer（仅作为音频/歌词引擎） -->
    <APlayer
      v-if="playList[0]"
      ref="player"
      class="engine"
      :audio="playList"
      :autoplay="store.playerAutoplay"
      :theme="'#ec4141'"
      :autoSwitch="false"
      :loop="store.playerLoop"
      :order="store.playerOrder"
      :volume="volume"
      :showLrc="true"
      :listFolded="true"
      :noticeSwitch="false"
      @play="onPlay"
      @pause="onPause"
      @timeupdate="onTimeUp"
      @error="loadMusicError"
    />
    <!-- 模糊封面背景 -->
    <div class="bg" :style="bgStyle" />
    <div class="bg-mask" />
    <!-- 主体区域 -->
    <div class="main" v-if="playList[0]">
      <!-- 黑胶唱机 -->
      <div class="disc-area">
        <div class="tonearm" :class="{ playing: store.playerState }">
          <div class="pivot" />
          <div class="arm" />
        </div>
        <div class="disc" :class="{ playing: store.playerState }">
          <div class="cover">
            <img :src="currentCover" alt="cover" />
          </div>
        </div>
      </div>
      <!-- 歌曲信息与歌词 -->
      <div class="info-area">
        <div class="song-name">{{ currentSong.name || "未播放音乐" }}</div>
        <div class="song-artist">
          <span>{{ currentSong.artist || "未知歌手" }}</span>
        </div>
        <div class="lrc-box">
          <div class="lrc-list" :style="lrcStyle">
            <template v-if="currentLyrics.length">
              <p v-for="(line, i) in currentLyrics" :key="i" :class="{ on: i === lyricIndex }">
                {{ line[1] }}
              </p>
            </template>
            <p v-else class="on">纯音乐，请欣赏</p>
          </div>
        </div>
      </div>
    </div>
    <!-- 底部控制栏 -->
    <div class="footer">
      <div class="progress-row">
        <span class="time">{{ formatTime(currentTime) }}</span>
        <div class="progress" ref="progressRef" @click="onSeek">
          <div class="played" :style="{ width: progress + '%' }">
            <span class="dot" />
          </div>
        </div>
        <span class="time">{{ formatTime(duration) }}</span>
      </div>
      <div class="controls">
        <!-- 播放模式 -->
        <div class="btn mode" :title="playModeLabel" @click="cyclePlayMode">
          <play-cycle theme="outline" size="22" fill="#efefef" v-if="playMode === 'all'" />
          <loop-once theme="outline" size="22" fill="#efefef" v-else-if="playMode === 'one'" />
          <shuffle-one theme="outline" size="22" fill="#ec4141" v-else />
        </div>
        <!-- 上一曲 -->
        <div class="btn" @click="changeSong(0)">
          <go-start theme="filled" size="24" fill="#efefef" />
        </div>
        <!-- 播放 / 暂停 -->
        <div class="btn play-btn" @click="playToggle">
          <pause theme="filled" size="26" fill="#fff" v-if="store.playerState" />
          <play-one theme="filled" size="26" fill="#fff" v-else />
        </div>
        <!-- 下一曲 -->
        <div class="btn" @click="changeSong(1)">
          <go-end theme="filled" size="24" fill="#efefef" />
        </div>
        <!-- 音量 -->
        <div class="volume">
          <div class="btn">
            <volume-mute theme="filled" size="20" fill="#efefef" v-if="volumeNum == 0" />
            <volume-small
              theme="filled"
              size="20"
              fill="#efefef"
              v-else-if="volumeNum > 0 && volumeNum < 0.7"
            />
            <volume-notice theme="filled" size="20" fill="#efefef" v-else />
          </div>
          <el-slider v-model="volumeNum" :show-tooltip="false" :min="0" :max="1" :step="0.01" />
        </div>
        <!-- 播放列表 -->
        <div class="btn list-btn" :class="{ on: drawerOpen }" title="播放列表" @click="toggleList">
          <music-list theme="outline" size="22" :fill="drawerOpen ? '#ec4141' : '#efefef'" />
        </div>
      </div>
    </div>
    <!-- 播放列表抽屉 -->
    <Transition name="drawer">
      <div class="drawer" v-show="drawerOpen" @click.stop>
        <div class="drawer-header">
          <span class="title">播放列表</span>
          <span class="count">{{ playList.length }} 首</span>
        </div>
        <ul class="drawer-list">
          <li
            v-for="(song, i) in playList"
            :key="i"
            :class="{ on: i === currentIndex }"
            @click="switchSong(i)"
          >
            <play-one theme="filled" size="14" fill="#ec4141" v-if="i === currentIndex" class="playing-icon" />
            <span class="index" v-else>{{ String(i + 1).padStart(2, "0") }}</span>
            <span class="name">{{ song.name }}</span>
            <span class="artist">{{ song.artist }}</span>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import {
  MusicOne,
  PlayWrong,
  GoStart,
  GoEnd,
  PlayOne,
  Pause,
  PlayCycle,
  LoopOnce,
  ShuffleOne,
  MusicList,
  VolumeMute,
  VolumeSmall,
  VolumeNotice,
} from "@icon-park/vue-next";
import { getPlayerList } from "@/api";
import { mainStore } from "@/store";
import APlayer from "@worstone/vue-aplayer";

const store = mainStore();

// 获取播放器 DOM
const player = ref(null);

// 歌曲播放列表
const playList = ref([]);

// 播放进度数据
const currentTime = ref(0);
const duration = ref(0);
const progressRef = ref(null);

// 播放列表抽屉
const drawerOpen = ref(false);

// 音量
const volumeNum = ref(store.musicVolume ? store.musicVolume : 0.7);

// 配置项
const props = defineProps({
  // 主题色
  theme: {
    type: String,
    default: "#efefef",
  },
  // 默认音量
  volume: {
    type: Number,
    default: 0.7,
    validator: (value) => {
      return value >= 0 && value <= 1;
    },
  },
  // 歌曲服务器 ( netease-网易云, tencent-qq音乐 )
  songServer: {
    type: String,
    default: "netease", //'netease' | 'tencent'
  },
  // 播放类型 ( song-歌曲, playlist-播放列表, album-专辑, search-搜索, artist-艺术家 )
  songType: {
    type: String,
    default: "playlist",
  },
  // id
  songId: {
    type: String,
    default: "7452421335",
  },
  // 列表是否默认折叠（网易云界面内置抽屉，恒折叠原生列表）
  listFolded: {
    type: Boolean,
    default: true,
  },
  // 列表最大高度
  listMaxHeight: {
    type: Number,
    default: 420,
  },
});

// 当前播放索引
const currentIndex = computed(() => {
  return player.value?.aplayer?.index ?? 0;
});

// 当前歌曲
const currentSong = computed(() => {
  return playList.value[currentIndex.value] || {};
});

// 当前封面
const currentCover = computed(() => {
  return currentSong.value.cover || "/images/icon/512.png";
});

// 模糊背景
const bgStyle = computed(() => {
  return { backgroundImage: `url(${currentCover.value})` };
});

// 当前歌词
const currentLyrics = computed(() => {
  const lyrics = player.value?.aplayer?.lyrics?.[currentIndex.value];
  if (!lyrics || !lyrics.length) return [];
  return lyrics.filter((line) => line[1] && line[1].trim() && line[1] !== "Loading");
});

// 当前歌词索引
const lyricIndex = computed(() => {
  return player.value?.aplayer?.lyricIndex ?? 0;
});

// 歌词滚动位移（行高 34px，容器中部对齐）
const lrcStyle = computed(() => {
  return { transform: `translateY(${140 - lyricIndex.value * 34}px)` };
});

// 播放进度百分比
const progress = computed(() => {
  if (!duration.value || isNaN(duration.value)) return 0;
  return Math.min((currentTime.value / duration.value) * 100, 100);
});

// 播放模式（结合循环与顺序）
const playMode = computed(() => {
  if (store.playerOrder === "random") return "random";
  return store.playerLoop === "one" ? "one" : "all";
});

const playModeLabel = computed(() => {
  return { all: "列表循环", one: "单曲循环", random: "随机播放" }[playMode.value];
});

// 初始化播放器
onMounted(() => {
  nextTick(() => {
    try {
      getPlayerList(props.songServer, props.songType, props.songId).then((res) => {
        // 更改播放器加载状态
        store.musicIsOk = true;
        // 生成歌单
        playList.value = res;
        console.log("音乐加载完成");
      });
    } catch (err) {
      console.error(err);
      store.musicIsOk = false;
      ElMessage({
        message: "播放器加载失败",
        grouping: true,
        icon: h(PlayWrong, {
          theme: "filled",
          fill: "#efefef",
        }),
      });
    }
  });
});

// 播放
const onPlay = () => {
  const index = player.value.aplayer.index;
  // 播放状态
  store.setPlayerState(player.value.audioRef.paused);
  // 储存播放器信息
  store.setPlayerData(playList.value[index].name, playList.value[index].artist);
  ElMessage({
    message: store.getPlayerData.name + " - " + store.getPlayerData.artist,
    grouping: true,
    icon: h(MusicOne, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
};

// 暂停
const onPause = () => {
  store.setPlayerState(player.value.audioRef.paused);
};

// 音频时间更新事件
const onTimeUp = () => {
  const audio = player.value.audioRef;
  currentTime.value = audio.currentTime;
  duration.value = audio.duration;
  // 同步底栏歌词
  let lyrics = player.value.aplayer.lyrics[currentIndex.value];
  let index = player.value.aplayer.lyricIndex;
  if (!lyrics || !lyrics[index]) {
    return;
  }
  let lrc = lyrics[index][1];
  if (lrc === "Loading") {
    lrc = "歌词加载中";
  } else if (lrc === "Not available") {
    lrc = "歌词加载失败";
  }
  store.setPlayerLrc(lrc);
};

// 切换播放暂停事件
const playToggle = () => {
  player.value.toggle();
};

// 切换音量事件
const changeVolume = (value) => {
  player.value.setVolume(value, false);
};

// 切换上下曲
const changeSong = (type) => {
  type === 0 ? player.value.skipBack() : player.value.skipForward();
  nextTick(() => {
    player.value.play();
  });
};

// 指定切歌（播放列表点击）
const switchSong = (index) => {
  if (index === currentIndex.value) {
    playToggle();
    return;
  }
  player.value.switchList(index);
  nextTick(() => {
    player.value.play();
  });
};

// 进度条点击跳转
const onSeek = (e) => {
  if (!duration.value || isNaN(duration.value)) return;
  const rect = progressRef.value.getBoundingClientRect();
  const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
  player.value.audioRef.currentTime = ratio * duration.value;
};

// 循环切换播放模式：列表循环 → 单曲循环 → 随机播放
const cyclePlayMode = () => {
  const next = { all: "one", one: "random", random: "all" }[playMode.value];
  if (next === "random") {
    store.playerOrder = "random";
    store.playerLoop = "all";
  } else {
    store.playerOrder = "list";
    store.playerLoop = next;
  }
  nextTick(() => {
    const ap = player.value?.aplayer;
    if (ap) {
      ap.order = store.playerOrder;
      ap.loop = store.playerLoop;
    }
    player.value?.setOrder?.(store.playerOrder);
    player.value?.setLoop?.(store.playerLoop);
  });
  ElMessage({
    message: { all: "列表循环", one: "单曲循环", random: "随机播放" }[next],
    grouping: true,
    icon: h(MusicOne, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
};

// 切换播放列表抽屉
const toggleList = () => {
  drawerOpen.value = !drawerOpen.value;
};

// 时间格式化 m:ss
const formatTime = (val) => {
  if (!val || isNaN(val)) return "00:00";
  const m = Math.floor(val / 60);
  const s = Math.floor(val % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// 加载音频错误
const loadMusicError = () => {
  let notice = "";
  if (playList.value.length > 1) {
    notice = "播放歌曲出现错误，播放器将在 2s 后进行下一首";
  } else {
    notice = "播放歌曲出现错误";
  }
  ElMessage({
    message: notice,
    grouping: true,
    icon: h(PlayWrong, {
      theme: "filled",
      fill: "#EFEFEF",
      duration: 2000,
    }),
  });
  console.error(
    "播放歌曲: " + player.value.aplayer.audio[player.value.aplayer.index].name + " 出现错误",
  );
};

// 监听音量变化（本组件滑条）
watch(volumeNum, (value) => {
  store.musicVolume = value;
  if (player.value) {
    player.value.setVolume(value, false);
  }
});

// 外部（Music 面板）音量变化同步
watch(
  () => store.musicVolume,
  (value) => {
    if (Math.abs(value - volumeNum.value) > 0.001) {
      volumeNum.value = value;
    }
  },
);

// 暴露子组件方法（保持与 Music.vue 的既有调用约定）
defineExpose({ playToggle, changeVolume, changeSong, toggleList });
</script>

<style lang="scss" scoped>
.netease-player {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: "HarmonyOS_Regular", sans-serif;
  color: #efefef;
  background-color: #1b1b1f;

  // 隐藏的音频引擎
  .engine {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
  }

  // 模糊封面背景
  .bg {
    position: absolute;
    inset: -40px;
    background-size: cover;
    background-position: center;
    filter: blur(45px) brightness(0.55);
    transform: scale(1.2);
    z-index: 0;
  }

  .bg-mask {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(20, 20, 24, 0.35), rgba(20, 20, 24, 0.75));
    z-index: 0;
  }

  // 主体
  .main {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 30px 40px 0;
    min-height: 0;

    @media (max-width: 720px) {
      flex-direction: column;
      justify-content: flex-start;
      padding: 20px 20px 0;
    }
  }

  // 黑胶唱机
  .disc-area {
    position: relative;
    width: 300px;
    height: 300px;
    flex-shrink: 0;
    margin-top: 30px;

    @media (max-width: 720px) {
      width: 220px;
      height: 220px;
      margin-top: 20px;
    }

    .disc {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: repeating-radial-gradient(
        circle at center,
        #0a0a0a 0px,
        #141414 2px,
        #0a0a0a 4px
      );
      border: 6px solid #1e1e22;
      box-shadow:
        0 0 0 2px #000,
        0 12px 40px rgba(0, 0, 0, 0.65);
      animation: disc-spin 20s linear infinite;
      animation-play-state: paused;

      &.playing {
        animation-play-state: running;
      }

      .cover {
        width: 64%;
        height: 64%;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid #0a0a0a;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
      }
    }

    // 唱针臂
    .tonearm {
      position: absolute;
      top: -34px;
      right: 6px;
      width: 90px;
      height: 130px;
      z-index: 2;
      transform-origin: 78px 14px;
      transform: rotate(-28deg);
      transition: transform 0.8s ease;

      &.playing {
        transform: rotate(0deg);
      }

      .pivot {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, #d9d9d9, #8a8a8a 60%, #4d4d4d);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
      }

      .arm {
        position: absolute;
        top: 14px;
        right: 13px;
        width: 5px;
        height: 105px;
        border-radius: 3px;
        background: linear-gradient(90deg, #cfcfcf, #9a9a9a);
        transform-origin: top center;
        transform: rotate(24deg);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);

        &::after {
          content: "";
          position: absolute;
          bottom: -12px;
          left: -4px;
          width: 13px;
          height: 18px;
          border-radius: 3px;
          background: linear-gradient(180deg, #e8e8e8, #a5a5a5);
        }
      }

      @media (max-width: 720px) {
        display: none;
      }
    }
  }

  // 歌曲信息
  .info-area {
    flex: 1;
    max-width: 420px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0 0;
    min-height: 0;

    @media (max-width: 720px) {
      max-width: 100%;
      width: 100%;
    }

    .song-name {
      font-size: 24px;
      font-weight: bold;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      @media (max-width: 720px) {
        font-size: 18px;
      }
    }

    .song-artist {
      margin-top: 8px;
      font-size: 14px;
      color: #ffffff99;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .lrc-box {
      position: relative;
      width: 100%;
      flex: 1;
      margin-top: 18px;
      overflow: hidden;
      mask: linear-gradient(180deg, transparent, #fff 18%, #fff 82%, transparent);
      -webkit-mask: linear-gradient(180deg, transparent, #fff 18%, #fff 82%, transparent);

      .lrc-list {
        transition: transform 0.45s ease;

        p {
          height: 34px;
          line-height: 34px;
          margin: 0;
          text-align: center;
          font-size: 14px;
          color: #ffffff66;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition:
            color 0.3s,
            font-size 0.3s;

          &.on {
            color: #fff;
            font-size: 16px;
            font-weight: bold;
          }
        }
      }
    }
  }

  // 底部控制
  .footer {
    position: relative;
    z-index: 1;
    padding: 10px 34px 22px;

    @media (max-width: 720px) {
      padding: 8px 18px 16px;
    }

    .progress-row {
      display: flex;
      align-items: center;
      gap: 12px;

      .time {
        font-size: 12px;
        color: #ffffff80;
        width: 40px;
        text-align: center;
        flex-shrink: 0;
      }

      .progress {
        position: relative;
        flex: 1;
        height: 14px;
        display: flex;
        align-items: center;
        cursor: pointer;

        &::before {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          height: 4px;
          border-radius: 2px;
          background: #ffffff2e;
        }

        .played {
          position: relative;
          height: 4px;
          border-radius: 2px;
          background: #ec4141;
          display: flex;
          align-items: center;
          justify-content: flex-end;

          .dot {
            width: 12px;
            height: 12px;
            margin-right: -6px;
            border-radius: 50%;
            background: #fff;
            border: 3px solid #ec4141;
            box-sizing: border-box;
            opacity: 0;
            transition: opacity 0.2s;
          }
        }

        &:hover .dot {
          opacity: 1;
        }
      }
    }

    .controls {
      margin-top: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 26px;

      @media (max-width: 720px) {
        gap: 16px;
      }

      .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: #ffffff22;
        }

        &:active {
          transform: scale(0.92);
        }
      }

      .play-btn {
        width: 46px;
        height: 46px;
        background: #ec4141;
        box-shadow: 0 4px 14px rgba(236, 65, 65, 0.45);

        &:hover {
          background: #f25050;
        }
      }

      .volume {
        display: flex;
        align-items: center;
        width: 130px;

        @media (max-width: 720px) {
          width: 90px;
        }

        .el-slider {
          flex: 1;
          --el-slider-main-bg-color: #ec4141;
          --el-slider-runway-bg-color: #ffffff2e;
          --el-slider-button-size: 10px;
        }
      }
    }
  }

  // 播放列表抽屉
  .drawer {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 320px;
    max-width: 85%;
    background: rgba(24, 24, 28, 0.92);
    backdrop-filter: blur(16px);
    z-index: 3;
    display: flex;
    flex-direction: column;
    box-shadow: -8px 0 30px rgba(0, 0, 0, 0.4);

    .drawer-header {
      display: flex;
      align-items: baseline;
      gap: 10px;
      padding: 18px 20px 12px;
      border-bottom: 1px solid #ffffff14;

      .title {
        font-size: 16px;
        font-weight: bold;
      }

      .count {
        font-size: 12px;
        color: #ffffff66;
      }
    }

    .drawer-list {
      flex: 1;
      margin: 0;
      padding: 6px 0;
      list-style: none;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: #ffffff26;
        border-radius: 3px;
      }

      li {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 20px;
        font-size: 13px;
        cursor: pointer;
        color: #ffffffb3;

        &:hover {
          background: #ffffff12;
        }

        &.on {
          color: #ec4141;
          background: #ec414114;
        }

        .index {
          width: 20px;
          text-align: center;
          color: #ffffff4d;
          font-size: 12px;
          flex-shrink: 0;
        }

        .playing-icon {
          width: 20px;
          flex-shrink: 0;
          display: flex;
          justify-content: center;
        }

        .name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .artist {
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #ffffff59;
          font-size: 12px;
          flex-shrink: 0;
        }
      }
    }
  }
}

// 抽屉动画
.drawer-enter-active,
.drawer-leave-active {
  transition:
    transform 0.35s ease,
    opacity 0.35s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@keyframes disc-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
