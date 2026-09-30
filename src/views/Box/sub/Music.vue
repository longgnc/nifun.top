<template>
  <ListeningRoom
    :song="currentSong"
    :songs="musicList"
    :index="currentIndex"
    :playing="isPlaying"
    :time="currentTime"
    :duration="duration"
    :volume="volume"
    :mode="mode"
    :status="audioError ? '这首音乐暂时无法播放，请选择其他歌曲或切换在线音乐。' : ''"
    @toggle="togglePlay"
    @previous="stepSong(-1)"
    @next="stepSong(1)"
    @select="selectSong"
    @seek="seek"
    @volume="updateVolume"
    @mode="cycleMode"
  >
    <audio
      ref="audioRef"
      :src="currentSong.url"
      preload="metadata"
      @ended="onEnded"
      @error="handleError"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onTimeUpdate"
      @play="isPlaying = true"
      @pause="isPlaying = false"
    />
  </ListeningRoom>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import ListeningRoom from "@/components/ListeningRoom.vue";
import musicData from "@/assets/musicList.json";

const musicList = musicData;
const currentIndex = ref(0);
const currentSong = computed(() => musicList[currentIndex.value] || {});
const isPlaying = ref(false);
const audioError = ref(false);
const volume = ref(0.8);
const audioRef = ref(null);
const currentTime = ref(0);
const duration = ref(0);
const mode = ref("all");

onMounted(() => {
  if (audioRef.value) audioRef.value.volume = volume.value;
});
async function playAudio() {
  if (!audioRef.value || !musicList.length) return;
  audioError.value = false;
  audioRef.value.volume = volume.value;
  try {
    await audioRef.value.play();
  } catch (error) {
    if (error.name !== "AbortError") handleError();
  }
}
function togglePlay() {
  if (isPlaying.value) audioRef.value?.pause();
  else playAudio();
}
async function selectSong(index) {
  if (index === currentIndex.value) return togglePlay();
  currentTime.value = 0;
  duration.value = 0;
  audioError.value = false;
  currentIndex.value = index;
  await nextTick();
  playAudio();
}
async function stepSong(direction) {
  if (!musicList.length) return;
  const offset =
    mode.value === "random" && musicList.length > 1
      ? 1 + Math.floor(Math.random() * (musicList.length - 1))
      : direction;
  const index = (currentIndex.value + offset + musicList.length) % musicList.length;
  if (index === currentIndex.value) {
    audioRef.value.currentTime = 0;
    playAudio();
  } else await selectSong(index);
}
function onEnded() {
  if (mode.value === "one") {
    audioRef.value.currentTime = 0;
    playAudio();
  } else stepSong(1);
}
function cycleMode() {
  mode.value = { all: "one", one: "random", random: "all" }[mode.value];
}
function updateVolume(value) {
  volume.value = value;
  if (audioRef.value) audioRef.value.volume = value;
}
function seek(ratio) {
  if (audioRef.value && Number.isFinite(duration.value) && duration.value > 0)
    audioRef.value.currentTime = ratio * duration.value;
}
function onTimeUpdate() {
  if (!audioRef.value) return;
  currentTime.value = audioRef.value.currentTime;
  duration.value = Number.isFinite(audioRef.value.duration) ? audioRef.value.duration : 0;
}
function handleError() {
  audioError.value = true;
  isPlaying.value = false;
}
</script>
