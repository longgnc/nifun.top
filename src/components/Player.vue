<template>
  <ListeningRoom
    ref="room"
    :song="currentSong"
    :songs="playList"
    :index="currentIndex"
    :playing="store.playerState"
    :time="currentTime"
    :duration="duration"
    :volume="volumeNum"
    :lyrics="currentLyrics"
    :lyric-index="lyricIndex"
    :mode="playMode"
    :status="
      playlistState === 'loading'
        ? '正在连接在线歌单…'
        : playlistState === 'unconfigured'
          ? '尚未配置在线歌单，请先欣赏本地音乐。'
          : playlistState === 'error'
            ? '在线歌单暂不可用，请稍后重试或切换本地音乐。'
            : ''
    "
    @toggle="playToggle"
    @previous="changeSong(0)"
    @next="changeSong(1)"
    @seek="onSeek"
    @volume="volumeNum = $event"
    @select="switchSong"
    @mode="cyclePlayMode"
  >
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
      :volume="volumeNum"
      :showLrc="true"
      :listFolded="true"
      :noticeSwitch="false"
      @play="onPlay"
      @pause="onPause"
      @timeupdate="onTimeUp"
      @error="loadMusicError"
    />
  </ListeningRoom>
</template>
<script setup>
import { MusicOne, PlayWrong } from "@icon-park/vue-next";
import { getPlayerList } from "@/api";
import { mainStore } from "@/store";
import APlayer from "@worstone/vue-aplayer";

import ListeningRoom from "@/components/ListeningRoom.vue";
const room = ref(null);
const store = mainStore();
store.playerState = false;
onBeforeUnmount(() => {
  store.playerState = false;
});

// 获取播放器 DOM
const player = ref(null);

// 歌曲播放列表
const playList = ref([]);

// 播放进度数据
const currentTime = ref(0);
const duration = ref(0);

// 音量
const volumeNum = ref(store.musicVolume ?? 0.7);

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
watch(currentIndex, () => {
  currentTime.value = 0;
  duration.value = 0;
});

// Keep the highlighted index aligned with the filtered lyric rows.
const currentLyrics = computed(() => {
  const lyrics = player.value?.aplayer?.lyrics?.[currentIndex.value] || [];
  return lyrics.filter(
    (line) => line[1]?.trim() && !["Loading", "Not available"].includes(line[1]),
  );
});
const lyricIndex = computed(() => {
  const index = currentLyrics.value.findIndex((line) => Number(line[0]) > currentTime.value);
  return Math.max(0, index === -1 ? currentLyrics.value.length - 1 : index - 1);
});

// 播放模式（结合循环与顺序）
const playMode = computed(() => {
  if (store.playerOrder === "random") return "random";
  return store.playerLoop === "one" ? "one" : "all";
});

// 初始化播放器：明确显示未配置、加载中与失败状态。
const playlistState = ref("loading");
onMounted(async () => {
  if (!props.songId) {
    playlistState.value = "unconfigured";
    return;
  }
  try {
    const res = await getPlayerList(props.songServer, props.songType, props.songId);
    if (!Array.isArray(res) || !res.length) throw new Error("Empty playlist");
    playList.value = res;
    store.musicIsOk = true;
    playlistState.value = "ready";
  } catch (error) {
    store.musicIsOk = false;
    playlistState.value = "error";
  }
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
const onSeek = (ratio) => {
  if (!player.value?.audioRef || !Number.isFinite(duration.value) || duration.value <= 0) return;
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
  room.value?.toggleList();
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
