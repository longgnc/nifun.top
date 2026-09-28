<template>
  <div class="start-page">
    <TimeCapsule />
    <MoreContent />
  </div>
</template>

<script setup>
import TimeCapsule from "@/components/TimeCapsule.vue";
import MoreContent from "@/components/MoreContent.vue";
</script>

<style lang="scss" scoped>
.start-page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
</style>
