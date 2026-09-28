<template>
  <div class="world-time">
    <div class="clock-grid">
      <div class="clock-card" v-for="city in cities" :key="city.name">
        <div class="city-name">{{ city.name }}</div>
        <div class="time">{{ city.time }}</div>
        <div class="date">{{ city.date }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const cities = ref([
  { name: '北京', zone: 'Asia/Shanghai', time: '', date: '' },
  { name: '伦敦', zone: 'Europe/London', time: '', date: '' },
  { name: '纽约', zone: 'America/New_York', time: '', date: '' },
  { name: '东京', zone: 'Asia/Tokyo', time: '', date: '' },
  { name: '悉尼', zone: 'Australia/Sydney', time: '', date: '' },
  { name: '巴黎', zone: 'Europe/Paris', time: '', date: '' },
  { name: '莫斯科', zone: 'Europe/Moscow', time: '', date: '' },
  { name: '迪拜', zone: 'Asia/Dubai', time: '', date: '' },
]);

let timer = null;

const updateTime = () => {
  const now = new Date();
  cities.value.forEach(city => {
    const options = { 
      timeZone: city.zone, 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    };
    const dateOptions = {
      timeZone: city.zone,
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    };
    
    try {
      city.time = new Intl.DateTimeFormat('zh-CN', options).format(now);
      city.date = new Intl.DateTimeFormat('zh-CN', dateOptions).format(now);
    } catch (e) {
      city.time = 'Error';
    }
  });
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.world-time {
  height: 100%;
  overflow-y: auto;
  padding: 10px 0;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.2);
    border-radius: 2px;
  }

  .clock-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
    
    .clock-card {
      background: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      transition: transform 0.3s;
      
      &:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.15);
      }
      
      .city-name {
        font-size: 0.9rem;
        opacity: 0.7;
        margin-bottom: 5px;
      }
      
      .time {
        font-size: 1.8rem;
        font-weight: bold;
        font-family: monospace;
        color: #e6a23c;
        margin-bottom: 5px;
      }
      
      .date {
        font-size: 0.8rem;
        opacity: 0.5;
      }
    }
  }
}
</style>