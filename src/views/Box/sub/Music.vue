<template>
  <div class="music-page">
    <div class="header">
      <h2>音乐空间</h2>
      <span class="subtitle">聆听美好时光</span>
    </div>

    <!-- 网易云风格播放区 -->
    <div class="player-area">
      <!-- 黑胶唱机 -->
      <div class="disc-area">
        <div class="tonearm" :class="{ playing: isPlaying }">
          <div class="pivot" />
          <div class="arm" />
        </div>
        <div class="disc" :class="{ playing: isPlaying }">
          <div class="cover">
            <Icon size="52" color="#ffffffd9">
              <CompactDisc />
            </Icon>
          </div>
        </div>
      </div>

      <!-- 信息与控制 -->
      <div class="info-area">
        <div class="song-name">{{ currentSong.name || "暂无播放" }}</div>
        <div class="song-artist">{{ currentSong.artist || "未知艺术家" }}</div>

        <!-- 进度条 -->
        <div class="progress-row">
          <span class="time">{{ formatTime(currentTime) }}</span>
          <div class="progress" ref="progressRef" @click="onSeek">
            <div class="played" :style="{ width: progress + '%' }">
              <span class="dot" />
            </div>
          </div>
          <span class="time">{{ formatTime(duration) }}</span>
        </div>

        <!-- 控制按钮 -->
        <div class="controls">
          <button class="ctrl-btn" @click="prevSong">
            <Icon size="20"><StepBackward /></Icon>
          </button>
          <button class="ctrl-btn play" @click="togglePlay">
            <Icon v-if="!isPlaying" size="22"><Play /></Icon>
            <Icon v-else size="22"><Pause /></Icon>
          </button>
          <button class="ctrl-btn" @click="nextSong">
            <Icon size="20"><StepForward /></Icon>
          </button>
        </div>

        <!-- 音量 -->
        <div class="volume-control">
          <Icon size="16" color="#ffffffb3"><VolumeUp /></Icon>
          <input
            type="range"
            min="0"
            max="100"
            v-model="volume"
            @input="updateVolume"
            class="volume-slider"
          />
          <span>{{ volume }}%</span>
        </div>
      </div>
    </div>

    <!-- 歌单 -->
    <div class="playlist">
      <h3>本地音乐 ({{ musicList.length }})</h3>
      <div class="list-container">
        <div
          class="list-item"
          v-for="(item, index) in musicList"
          :key="index"
          @click="playMusic(item)"
          :class="{ active: currentSong.url === item.url }"
        >
          <span class="index">
            <span v-if="currentSong.url === item.url && isPlaying" class="playing-anim">♪</span>
            <span v-else>{{ String(index + 1).padStart(2, "0") }}</span>
          </span>
          <div class="info">
            <span class="name">{{ item.name }}</span>
            <span class="author">{{ item.artist }}</span>
          </div>
          <play-one theme="filled" size="18" fill="#ffffff80" v-if="currentSong.url !== item.url" />
          <pause-one theme="filled" size="18" fill="#ec4141" v-else-if="isPlaying" />
          <play-one theme="filled" size="18" fill="#ec4141" v-else />
        </div>
      </div>
    </div>

    <!-- Audio Element -->
    <audio
      ref="audioRef"
      :src="currentSong.url"
      @ended="nextSong"
      @error="handleError"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onTimeUpdate"
    ></audio>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { Icon } from "@vicons/utils";
import { CompactDisc, StepBackward, StepForward, Play, Pause, VolumeUp } from "@vicons/fa";
import { PlayOne, PauseOne } from "@icon-park/vue-next";
import musicData from "@/assets/musicList.json";

const musicList = ref(musicData);
const currentSong = ref({});
const isPlaying = ref(false);
const volume = ref(80); // Default volume 80%
const audioRef = ref(null);

// 播放进度
const currentTime = ref(0);
const duration = ref(0);
const progressRef = ref(null);

const progress = computed(() => {
  if (!duration.value || isNaN(duration.value)) return 0;
  return Math.min((currentTime.value / duration.value) * 100, 100);
});

// Initialize
onMounted(() => {
  // Randomly pick a song
  if (musicList.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * musicList.value.length);
    currentSong.value = musicList.value[randomIndex];

    // Attempt auto-play (browser might block it without interaction)
    setTimeout(() => {
      if (audioRef.value) {
        audioRef.value.volume = volume.value / 100;
        playAudio();
      }
    }, 500);
  }
});

const playMusic = async (item) => {
  if (currentSong.value.url === item.url) {
    togglePlay();
  } else {
    currentSong.value = item;
    await nextTick();
    playAudio();
  }
};

const playAudio = () => {
  if (!audioRef.value) return;

  // Ensure volume is set
  audioRef.value.volume = volume.value / 100;

  audioRef.value
    .play()
    .then(() => {
      isPlaying.value = true;
    })
    .catch((err) => {
      console.error("Playback failed:", err);
      isPlaying.value = false;
    });
};

const pauseAudio = () => {
  if (!audioRef.value) return;
  audioRef.value.pause();
  isPlaying.value = false;
};

const togglePlay = () => {
  if (isPlaying.value) {
    pauseAudio();
  } else {
    playAudio();
  }
};

const updateVolume = () => {
  if (audioRef.value) {
    audioRef.value.volume = volume.value / 100;
  }
};

const prevSong = async () => {
  const currentIndex = musicList.value.findIndex((s) => s.url === currentSong.value.url);
  let nextIndex = currentIndex - 1;
  if (nextIndex < 0) nextIndex = musicList.value.length - 1;
  currentSong.value = musicList.value[nextIndex];
  await nextTick();
  playAudio();
};

const nextSong = async () => {
  const currentIndex = musicList.value.findIndex((s) => s.url === currentSong.value.url);
  let nextIndex = currentIndex + 1;
  if (nextIndex >= musicList.value.length) nextIndex = 0;
  currentSong.value = musicList.value[nextIndex];
  await nextTick();
  playAudio();
};

// 进度更新
const onTimeUpdate = () => {
  if (!audioRef.value) return;
  currentTime.value = audioRef.value.currentTime;
  duration.value = audioRef.value.duration;
};

// 进度条点击跳转
const onSeek = (e) => {
  if (!audioRef.value || !duration.value || isNaN(duration.value)) return;
  const rect = progressRef.value.getBoundingClientRect();
  const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
  audioRef.value.currentTime = ratio * duration.value;
};

// 时间格式化 m:ss
const formatTime = (val) => {
  if (!val || isNaN(val)) return "00:00";
  const m = Math.floor(val / 60);
  const s = Math.floor(val % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const handleError = (e) => {
  console.error("Audio error:", e);
};
</script>

<style lang="scss" scoped>
.music-page {
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  padding: 0 10px;
  display: flex;
  flex-direction: column;

  .header {
    margin-bottom: 15px;
    flex-shrink: 0;

    h2 {
      margin: 0;
      font-size: 1.8rem;
    }

    .subtitle {
      font-size: 0.9rem;
      opacity: 0.8;
    }
  }

  // 网易云风格播放区
  .player-area {
    display: flex;
    align-items: center;
    gap: 26px;
    padding: 22px 24px;
    background: linear-gradient(145deg, rgba(20, 20, 24, 0.55), rgba(20, 20, 24, 0.3));
    border-radius: 16px;
    flex-shrink: 0;

    @media (max-width: 560px) {
      flex-direction: column;
      gap: 16px;
    }
  }

  // 黑胶唱机
  .disc-area {
    position: relative;
    width: 168px;
    height: 168px;
    flex-shrink: 0;
    margin-top: 14px;

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
        #161616 2px,
        #0a0a0a 4px
      );
      border: 5px solid #1e1e22;
      box-shadow:
        0 0 0 2px #000,
        0 10px 30px rgba(0, 0, 0, 0.6);
      animation: rotate 16s linear infinite;
      animation-play-state: paused;

      &.playing {
        animation-play-state: running;
      }

      .cover {
        width: 62%;
        height: 62%;
        border-radius: 50%;
        background: radial-gradient(circle at 40% 35%, #3a3a40, #17171a 70%);
        border: 3px solid #0a0a0a;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    // 唱针臂
    .tonearm {
      position: absolute;
      top: -18px;
      right: 2px;
      width: 60px;
      height: 84px;
      z-index: 2;
      transform-origin: 50px 10px;
      transform: rotate(-26deg);
      transition: transform 0.8s ease;

      &.playing {
        transform: rotate(0deg);
      }

      .pivot {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, #d9d9d9, #8a8a8a 60%, #4d4d4d);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.6);
      }

      .arm {
        position: absolute;
        top: 9px;
        right: 8px;
        width: 4px;
        height: 68px;
        border-radius: 2px;
        background: linear-gradient(90deg, #cfcfcf, #9a9a9a);
        transform-origin: top center;
        transform: rotate(24deg);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);

        &::after {
          content: "";
          position: absolute;
          bottom: -9px;
          left: -3px;
          width: 10px;
          height: 14px;
          border-radius: 2px;
          background: linear-gradient(180deg, #e8e8e8, #a5a5a5);
        }
      }

      @media (max-width: 560px) {
        display: none;
      }
    }
  }

  // 信息与控制
  .info-area {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    .song-name {
      font-size: 20px;
      font-weight: bold;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .song-artist {
      margin-top: 6px;
      font-size: 13px;
      color: #ffffff99;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .progress-row {
      width: 100%;
      margin-top: 18px;
      display: flex;
      align-items: center;
      gap: 10px;

      .time {
        font-size: 11px;
        color: #ffffff80;
        width: 36px;
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
      margin-top: 14px;
      display: flex;
      gap: 24px;
      align-items: center;

      .ctrl-btn {
        background: transparent;
        border: none;
        color: #efefef;
        cursor: pointer;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        transition: background 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        &:active {
          transform: scale(0.92);
        }

        &.play {
          width: 48px;
          height: 48px;
          color: #fff;
          background: #ec4141;
          box-shadow: 0 4px 14px rgba(236, 65, 65, 0.45);

          &:hover {
            background: #f25050;
          }
        }
      }
    }

    .volume-control {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      margin-top: 14px;

      .volume-slider {
        flex: 1;
        height: 4px;
        -webkit-appearance: none;
        appearance: none;
        background: rgba(255, 255, 255, 0.18);
        border-radius: 2px;
        outline: none;

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ec4141;
          cursor: pointer;
        }

        &::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border: none;
          border-radius: 50%;
          background: #ec4141;
          cursor: pointer;
        }
      }

      span {
        font-size: 0.8rem;
        width: 38px;
        text-align: right;
        color: #ffffff99;
      }
    }
  }

  // 歌单
  .playlist {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-top: 16px;

    h3 {
      margin-bottom: 10px;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .list-container {
      flex: 1;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
      }
    }

    .list-item {
      display: flex;
      align-items: center;
      padding: 11px 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 8px;
      margin-bottom: 4px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      // 当前播放：网易云红高亮
      &.active {
        background: rgba(236, 65, 65, 0.12);
        border-left: 3px solid #ec4141;

        .name {
          color: #ec4141;
        }

        .index {
          color: #ec4141;
          opacity: 1;
        }
      }

      .index {
        width: 34px;
        opacity: 0.5;
        font-size: 0.85rem;
        text-align: center;
        flex-shrink: 0;

        .playing-anim {
          color: #ec4141;
          font-style: normal;
          animation: note-bounce 1s ease-in-out infinite;
          display: inline-block;
        }
      }

      .info {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .name {
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .author {
          font-size: 0.8rem;
          opacity: 0.6;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes note-bounce {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }
}
</style>
