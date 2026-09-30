<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import {
  GoStart,
  GoEnd,
  PlayOne,
  Pause,
  PlayCycle,
  LoopOnce,
  ShuffleOne,
  MusicList,
  VolumeNotice,
  VolumeMute,
  Down,
  FullScreen,
  Refresh,
  Close,
} from "@icon-park/vue-next";

const props = defineProps({
  song: { type: Object, default: () => ({}) },
  songs: { type: Array, default: () => [] },
  index: { type: Number, default: 0 },
  playing: Boolean,
  time: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  volume: { type: Number, default: 0.7 },
  lyrics: { type: Array, default: () => [] },
  lyricIndex: { type: Number, default: 0 },
  status: { type: String, default: "" },
  mode: { type: String, default: "all" },
});
const emit = defineEmits(["toggle", "previous", "next", "seek", "volume", "select", "mode"]);
const expanded = ref(false);
const drawerOpen = ref(false);
const listButton = ref(null);
const closeButton = ref(null);
const failedCover = ref(false);
const palettes = [
  ["#963353", "#631e3b", "#2d0d23"],
  ["#466b83", "#294756", "#111f30"],
  ["#5d796b", "#324f48", "#142b28"],
  ["#77618a", "#4a375f", "#231b35"],
  ["#9a7052", "#654537", "#30201e"],
  ["#50698b", "#354264", "#181e34"],
];
const palette = ref(-1);
function randomize() {
  if (palette.value < 0) {
    palette.value = Math.floor(Math.random() * palettes.length);
    return;
  }
  palette.value =
    (palette.value + 1 + Math.floor(Math.random() * (palettes.length - 1))) % palettes.length;
}
watch(
  () => [props.song.url, props.song.name],
  () => {
    randomize();
    failedCover.value = false;
  },
  { immediate: true },
);
const background = computed(() => {
  const colors = palettes[palette.value];
  return {
    background: `linear-gradient(165deg, ${colors[0]} 0%, ${colors[1]} 48%, ${colors[2]} 100%)`,
  };
});
const cover = computed(() => !failedCover.value && (props.song.cover || props.song.pic));
const available = computed(() => props.songs.length > 0);
const progress = computed(() =>
  Number.isFinite(props.duration) && props.duration > 0
    ? Math.min(100, (props.time / props.duration) * 100)
    : 0,
);
const modeLabel = computed(
  () => ({ all: "列表循环", one: "单曲循环", random: "随机播放" })[props.mode],
);
function formatTime(value) {
  if (!Number.isFinite(value) || value < 0) return "00:00";
  return `${Math.floor(value / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(value % 60)
    .toString()
    .padStart(2, "0")}`;
}
async function toggleList() {
  drawerOpen.value = !drawerOpen.value;
  await nextTick();
  (drawerOpen.value ? closeButton.value : listButton.value)?.focus();
}
function closeOverlay(event) {
  if (event.key !== "Escape") return;
  if (drawerOpen.value) toggleList();
  else expanded.value = false;
}
let previousOverflow;
watch(expanded, (value) => {
  if (value) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  } else if (previousOverflow !== undefined) document.body.style.overflow = previousOverflow;
});
onBeforeUnmount(() => {
  if (expanded.value) document.body.style.overflow = previousOverflow ?? "";
});
defineExpose({ toggleList });
</script>

<template>
  <section
    class="listening-room"
    :class="{ expanded }"
    :style="background"
    aria-label="音乐播放器"
    @keydown="closeOverlay"
  >
    <div class="room-topbar">
      <button
        class="room-icon"
        :aria-label="expanded ? '收起播放器' : '展开播放器'"
        :title="expanded ? '收起播放器' : '沉浸播放'"
        @click="expanded = !expanded"
      >
        <Down v-if="expanded" :size="22" /><FullScreen v-else :size="20" />
      </button>
      <span class="room-caption">{{ expanded ? "沉浸聆听" : "LISTENING ROOM" }}</span>
      <button class="room-icon" aria-label="随机切换背景" title="换个背景" @click="randomize">
        <Refresh :size="18" />
      </button>
    </div>

    <div class="room-stage">
      <div class="record" :class="{ spinning: playing }" aria-hidden="true">
        <div class="record-label">
          <img v-if="cover" :src="cover" alt="" @error="failedCover = true" />
          <div v-else class="record-art">
            <span>QINGNING</span><strong>♪</strong><small>私人音乐收藏 · 33⅓ RPM</small>
          </div>
        </div>
      </div>
      <div class="track-story">
        <h2>{{ song.name || "静候一首好歌" }}</h2>
        <p class="track-artist">{{ song.artist || "音乐空间" }}</p>
        <div v-if="lyrics.length" class="lyrics-window">
          <div
            class="lyrics-lines"
            :style="{ transform: `translateY(${102 - lyricIndex * 40}px)` }"
          >
            <p v-for="(line, i) in lyrics" :key="i" :class="{ current: i === lyricIndex }">
              {{ line[1] }}
            </p>
          </div>
        </div>
        <div v-else class="lyrics-empty">
          <span class="empty-line" />
          <p>{{ status || (available ? "让旋律，填满这一刻。" : "还没有可播放的音乐") }}</p>
          <small v-if="available && !status">暂无歌词 · 静静聆听</small>
        </div>
        <p v-if="status && lyrics.length" class="room-status" role="status">{{ status }}</p>
        <span v-else-if="status" class="sr-only" role="status">{{ status }}</span>
      </div>
    </div>

    <footer class="room-footer">
      <input
        class="room-progress"
        aria-label="播放进度"
        type="range"
        min="0"
        max="100"
        step="0.1"
        :value="progress"
        :disabled="!Number.isFinite(duration) || duration <= 0"
        :style="{ '--progress': progress + '%' }"
        @input="emit('seek', Number($event.target.value) / 100)"
      />
      <div class="footer-track">
        <strong>{{ song.name || "尚未选择音乐" }}</strong
        ><span>{{ song.artist || "从歌单开始聆听" }}</span>
      </div>
      <div class="transport">
        <button
          class="room-icon mode-button"
          :title="modeLabel"
          :aria-label="modeLabel"
          :disabled="!available"
          @click="emit('mode')"
        >
          <LoopOnce v-if="mode === 'one'" :size="20" /><ShuffleOne
            v-else-if="mode === 'random'"
            :size="20"
          /><PlayCycle v-else :size="20" />
        </button>
        <button
          class="room-icon"
          aria-label="上一首"
          :disabled="!available"
          @click="emit('previous')"
        >
          <GoStart theme="filled" :size="20" />
        </button>
        <button
          class="room-play"
          :aria-label="playing ? '暂停' : '播放'"
          :disabled="!available"
          @click="emit('toggle')"
        >
          <Pause v-if="playing" theme="filled" :size="24" /><PlayOne
            v-else
            theme="filled"
            :size="24"
          />
        </button>
        <button class="room-icon" aria-label="下一首" :disabled="!available" @click="emit('next')">
          <GoEnd theme="filled" :size="20" />
        </button>
        <span class="transport-spacer" />
      </div>
      <div class="footer-tools">
        <span class="room-time">{{ formatTime(time) }} / {{ formatTime(duration) }}</span>
        <button
          ref="listButton"
          class="room-icon"
          aria-label="播放列表"
          :aria-expanded="drawerOpen"
          @click="toggleList"
        >
          <MusicList :size="21" />
        </button>
        <div class="room-volume">
          <VolumeMute v-if="volume === 0" :size="18" /><VolumeNotice v-else :size="18" /><input
            aria-label="音量"
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="volume"
            @input="emit('volume', Number($event.target.value))"
          />
        </div>
      </div>
    </footer>
    <Transition name="queue">
      <aside v-if="drawerOpen" class="room-queue" aria-label="播放列表">
        <header>
          <div>
            <strong>播放列表</strong><span>{{ songs.length }} 首音乐</span>
          </div>
          <button ref="closeButton" class="room-icon" aria-label="关闭播放列表" @click="toggleList">
            <Close :size="20" />
          </button>
        </header>
        <div class="queue-list">
          <button
            v-for="(track, i) in songs"
            :key="i"
            class="queue-track"
            :class="{ selected: i === index }"
            :aria-current="i === index ? 'true' : undefined"
            @click="emit('select', i)"
          >
            <span>{{ i === index && playing ? "♫" : String(i + 1).padStart(2, "0") }}</span>
            <div>
              <strong>{{ track.name }}</strong
              ><small>{{ track.artist }}</small>
            </div>
            <PlayOne :size="16" />
          </button>
          <p v-if="!songs.length" class="queue-empty">{{ status || "暂无歌曲" }}</p>
        </div>
      </aside>
    </Transition>
    <div class="room-engine"><slot /></div>
  </section>
</template>

<style scoped lang="scss">
.listening-room {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 540px;
  overflow: hidden;
  color: #fff3f5;
  border-radius: 12px;
  color-scheme: dark;
}
.listening-room.expanded {
  position: fixed;
  inset: 0;
  z-index: 1000;
  height: 100dvh;
  border-radius: 0;
}
.room-topbar {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 22px 28px;
}
.room-caption {
  font-size: 10px;
  letter-spacing: 3px;
  opacity: 0.5;
  flex: 1;
}
.room-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #ffffffad;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background 0.2s,
    color 0.2s;
}
.room-icon:hover {
  background: #ffffff10;
  color: white;
}
button:focus-visible,
input:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 5px;
}
button:disabled {
  opacity: 0.35;
  cursor: default;
}
.room-stage {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(65px, 10vw, 170px);
  padding: 30px 7% 70px;
}
.record {
  width: clamp(230px, 25vw, 330px);
  aspect-ratio: 1;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 9px solid #ffffff12;
  background:
    conic-gradient(
      from 35deg,
      #ffffff08,
      #0007 17%,
      #ffffff13 29%,
      #0005 45%,
      #ffffff0d 65%,
      #0005 85%,
      #ffffff08
    ),
    repeating-radial-gradient(circle, #21191d 0, #21191d 1px, #160f14 2px, #160f14 3px);
  background-clip: padding-box;
  box-shadow: 0 20px 55px #16051320;
  animation: record-spin 28s linear infinite paused;
}
.record.spinning {
  animation-play-state: running;
}
.record-label {
  width: 57%;
  height: 57%;
  border-radius: 50%;
  overflow: hidden;
  border: 5px solid #100c11;
  box-shadow: 0 0 0 2px #ffffff05;
}
.record-label img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.record-art {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse at 20% 15%, #e9c6a0, transparent 65%),
    linear-gradient(135deg, #728d80, #293f40);
  color: #fff7e2;
}
.record-art span {
  font-size: 8px;
  letter-spacing: 3px;
}
.record-art strong {
  font-size: 58px;
  line-height: 1.25;
  font-weight: 400;
}
.record-art small {
  font-size: 7px;
  letter-spacing: 1px;
}
.track-story {
  width: 330px;
  min-width: 0;
}
.track-story h2 {
  font-size: 25px;
  line-height: 1.5;
  font-weight: 600;
  margin: 0;
  overflow-wrap: anywhere;
}
.track-artist {
  margin: 8px 0 0;
  font-size: 13px;
  color: #ffffff9c;
}
.lyrics-window {
  height: 250px;
  overflow: hidden;
  margin-top: 24px;
  mask-image: linear-gradient(transparent, #000 16%, #000 82%, transparent);
}
.lyrics-lines {
  transition: transform 0.45s ease;
}
.lyrics-lines p {
  height: 40px;
  line-height: 40px;
  margin: 0;
  font-size: 15px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #ffffff66;
}
.lyrics-lines .current {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}
.lyrics-empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 240px;
  gap: 15px;
}
.empty-line {
  width: 28px;
  height: 1px;
  background: #ffffff45;
}
.lyrics-empty p {
  font-size: 16px;
  line-height: 1.9;
  color: #ffffffb5;
  margin: 0;
}
.lyrics-empty small {
  font-size: 12px;
  color: #ffffff60;
}
.room-status {
  font-size: 12px;
  color: #ffd6de;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
.room-footer {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
  min-height: 84px;
  padding: 16px 32px;
  background: #190b1720;
  border-top: 1px solid #ffffff0c;
}
.room-progress {
  position: absolute;
  top: -7px;
  left: 0;
  width: 100%;
  height: 12px;
  margin: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
  --progress: 0%;
}
.room-progress::-webkit-slider-runnable-track {
  height: 2px;
  background: linear-gradient(to right, #f3c6d8 var(--progress), #ffffff12 var(--progress));
}
.room-progress::-moz-range-track {
  height: 2px;
  background: #ffffff12;
}
.room-progress::-moz-range-progress {
  background: #f3c6d8;
  height: 2px;
}
.room-progress::-webkit-slider-thumb {
  appearance: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  margin-top: -3px;
  opacity: 0;
}
.room-progress:hover::-webkit-slider-thumb,
.room-progress:focus-visible::-webkit-slider-thumb {
  opacity: 1;
}
.room-progress::-moz-range-thumb {
  width: 8px;
  height: 8px;
  border: 0;
  background: #fff;
}
.footer-track {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.footer-track strong {
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.footer-track span {
  font-size: 10px;
  color: #ffffff70;
}
.transport {
  display: flex;
  align-items: center;
  gap: 13px;
}
.transport-spacer {
  width: 36px;
}
.room-play {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #fff5f8;
  color: #48243c;
  display: grid;
  place-items: center;
  border: none;
  cursor: pointer;
}
.room-play:hover {
  background: #fff;
  transform: scale(1.04);
}
.footer-tools {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
.room-time {
  font-size: 10px;
  color: #ffffff6e;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.room-volume {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff8a;
}
.room-volume input {
  width: 65px;
  height: 3px;
  accent-color: #d7bac9;
}
.room-queue {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 85px;
  width: min(370px, 100%);
  z-index: 4;
  display: flex;
  flex-direction: column;
  background: #281b2bf2;
  backdrop-filter: blur(24px);
  box-shadow: -20px 0 70px #170f2526;
}
.room-queue header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 20px;
  border-bottom: 1px solid #ffffff10;
}
.room-queue header strong {
  font-size: 16px;
}
.room-queue header span {
  display: block;
  margin-top: 7px;
  font-size: 11px;
  color: #ffffff70;
}
.queue-list {
  overflow-y: auto;
  flex: 1;
  padding: 12px;
}
.queue-track {
  width: 100%;
  display: flex;
  gap: 15px;
  align-items: center;
  text-align: left;
  padding: 13px 10px;
  border: 0;
  background: transparent;
  color: #ffffffa8;
  border-radius: 6px;
  cursor: pointer;
}
.queue-track:hover,
.queue-track.selected {
  background: #ffffff0b;
  color: #fff;
}
.queue-track > span {
  width: 20px;
  font-size: 11px;
  opacity: 0.5;
}
.queue-track div {
  flex: 1;
  min-width: 0;
}
.queue-track strong,
.queue-track small {
  display: block;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.queue-track strong {
  font-size: 13px;
  font-weight: 500;
}
.queue-track small {
  font-size: 11px;
  opacity: 0.55;
  margin-top: 5px;
}
.queue-empty {
  padding: 20px;
  font-size: 13px;
  line-height: 1.8;
  color: #ffffff90;
}
.queue-enter-active,
.queue-leave-active {
  transition: transform 0.25s ease;
}
.queue-enter-from,
.queue-leave-to {
  transform: translateX(100%);
}
.room-engine {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  visibility: hidden;
}
@keyframes record-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 1100px) {
  .room-time {
    display: none;
  }
  .room-stage {
    gap: 65px;
  }
  .room-footer {
    padding: 16px 22px;
    gap: 12px;
  }
  .transport {
    gap: 6px;
  }
  .room-volume input {
    width: 45px;
  }
}
@media (max-width: 650px) {
  .listening-room {
    min-height: 660px;
  }
  .room-topbar {
    padding: 15px 18px;
  }
  .room-stage {
    flex-direction: column;
    gap: 28px;
    padding: 15px 25px 25px;
  }
  .record {
    width: 210px;
  }
  .record-art span {
    font-size: 6px;
    letter-spacing: 2px;
  }
  .record-art strong {
    font-size: 42px;
  }
  .record-art small {
    font-size: 5px;
    letter-spacing: 0;
  }
  .track-story {
    width: 100%;
    text-align: center;
  }
  .track-story h2 {
    font-size: 20px;
  }
  .track-artist {
    font-size: 12px;
  }
  .lyrics-empty {
    min-height: 110px;
    align-items: center;
    gap: 10px;
  }
  .lyrics-empty p {
    font-size: 14px;
  }
  .lyrics-window {
    height: 145px;
    margin-top: 10px;
  }
  .lyrics-lines {
    position: relative;
    top: -40px;
  }
  .room-footer {
    grid-template-columns: 1fr auto;
    min-height: 115px;
    padding: 13px 20px;
    gap: 10px;
  }
  .footer-track {
    grid-column: 1;
    grid-row: 1;
    max-width: 180px;
  }
  .footer-tools {
    grid-column: 2;
    grid-row: 1;
  }
  .transport {
    grid-column: 1 / -1;
    justify-content: center;
    gap: 16px;
  }
  .room-volume {
    display: none;
  }
  .room-queue {
    bottom: 120px;
  }
  .expanded .room-stage {
    justify-content: center;
  }
  .expanded {
    min-height: 0;
  }
}
@media (max-height: 700px) and (max-width: 650px) {
  .expanded .record {
    width: 160px;
  }
  .expanded .room-stage {
    gap: 12px;
    padding-top: 0;
  }
  .expanded .lyrics-empty {
    min-height: 75px;
  }
  .expanded .lyrics-window {
    height: 90px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .record {
    animation: none;
  }
  .lyrics-lines,
  .queue-enter-active,
  .queue-leave-active {
    transition: none;
  }
}
:global(.motion-off) .record {
  animation: none;
}
</style>
