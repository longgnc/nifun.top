<script setup>
import Glyph from "@/components/Glyph.vue";
import ServiceArtwork from "@/components/ServiceArtwork.vue";
import serviceData from "@/assets/qingningServices";
const services = serviceData.map((service) => ({ ...service, host: new URL(service.url).host }));
</script>
<template>
  <nav class="service-directory" aria-label="青柠系列服务">
    <a
      v-for="service in services"
      :key="service.id"
      class="service-card"
      :class="`service-card--${service.id}`"
      :href="service.url"
      target="_blank"
      rel="noopener noreferrer"
    >
      <ServiceArtwork :service="service.id" />
      <div class="service-card-top">
        <span class="service-symbol"><Glyph :name="service.icon" /></span
        ><span>{{ service.category }}</span
        ><Glyph name="external" />
      </div>
      <div class="service-card-copy">
        <h2>{{ service.name }}</h2>
        <p>{{ service.description }}</p>
      </div>
      <div class="service-card-bottom">
        <span>{{ service.host }}</span
        ><span>打开服务 <Glyph name="arrow" /></span>
      </div>
    </a>
  </nav>
</template>
