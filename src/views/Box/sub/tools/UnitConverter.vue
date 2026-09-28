<template>
  <div class="unit-converter">
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.value"
        :class="{ active: currentTab === tab.value }"
        @click="currentTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="converter-body">
      <div class="input-group">
        <input type="number" v-model="value1" @input="convert(1)" />
        <select v-model="unit1" @change="convert(1)">
          <option v-for="u in currentUnits" :key="u.value" :value="u.value">{{ u.label }}</option>
        </select>
      </div>

      <div class="separator">=</div>

      <div class="input-group">
        <input type="number" v-model="value2" @input="convert(2)" />
        <select v-model="unit2" @change="convert(1)">
          <option v-for="u in currentUnits" :key="u.value" :value="u.value">{{ u.label }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const currentTab = ref('length');
const value1 = ref(1);
const value2 = ref(1);
const unit1 = ref('');
const unit2 = ref('');

const tabs = [
  { label: '长度', value: 'length' },
  { label: '重量', value: 'weight' },
  { label: '温度', value: 'temp' }
];

const units = {
  length: [
    { label: '米 (m)', value: 'm', rate: 1 },
    { label: '千米 (km)', value: 'km', rate: 1000 },
    { label: '厘米 (cm)', value: 'cm', rate: 0.01 },
    { label: '毫米 (mm)', value: 'mm', rate: 0.001 },
    { label: '英尺 (ft)', value: 'ft', rate: 0.3048 },
    { label: '英寸 (in)', value: 'in', rate: 0.0254 },
  ],
  weight: [
    { label: '千克 (kg)', value: 'kg', rate: 1 },
    { label: '克 (g)', value: 'g', rate: 0.001 },
    { label: '磅 (lb)', value: 'lb', rate: 0.453592 },
    { label: '盎司 (oz)', value: 'oz', rate: 0.0283495 },
  ],
  temp: [
    { label: '摄氏度 (°C)', value: 'c' },
    { label: '华氏度 (°F)', value: 'f' },
    { label: '开尔文 (K)', value: 'k' },
  ]
};

const currentUnits = computed(() => units[currentTab.value]);

const convert = (source) => {
  if (currentTab.value === 'temp') {
    convertTemp(source);
    return;
  }
  
  const rate1 = units[currentTab.value].find(u => u.value === unit1.value).rate;
  const rate2 = units[currentTab.value].find(u => u.value === unit2.value).rate;
  
  if (source === 1) {
    const base = value1.value * rate1;
    value2.value = parseFloat((base / rate2).toFixed(4));
  } else {
    const base = value2.value * rate2;
    value1.value = parseFloat((base / rate1).toFixed(4));
  }
};

const convertTemp = (source) => {
  let v1 = parseFloat(value1.value);
  let v2 = parseFloat(value2.value);
  
  if (source === 1) {
    // Convert v1 to Celsius first
    let c;
    if (unit1.value === 'c') c = v1;
    else if (unit1.value === 'f') c = (v1 - 32) * 5/9;
    else if (unit1.value === 'k') c = v1 - 273.15;
    
    // Convert Celsius to v2
    if (unit2.value === 'c') value2.value = parseFloat(c.toFixed(2));
    else if (unit2.value === 'f') value2.value = parseFloat((c * 9/5 + 32).toFixed(2));
    else if (unit2.value === 'k') value2.value = parseFloat((c + 273.15).toFixed(2));
  } else {
    // Convert v2 to Celsius first
    let c;
    if (unit2.value === 'c') c = v2;
    else if (unit2.value === 'f') c = (v2 - 32) * 5/9;
    else if (unit2.value === 'k') c = v2 - 273.15;
    
    // Convert Celsius to v1
    if (unit1.value === 'c') value1.value = parseFloat(c.toFixed(2));
    else if (unit1.value === 'f') value1.value = parseFloat((c * 9/5 + 32).toFixed(2));
    else if (unit1.value === 'k') value1.value = parseFloat((c + 273.15).toFixed(2));
  }
};

// Initialize defaults when tab changes
watch(currentTab, (newVal) => {
  unit1.value = units[newVal][0].value;
  unit2.value = units[newVal][1] ? units[newVal][1].value : units[newVal][0].value;
  value1.value = 1;
  convert(1);
}, { immediate: true });
</script>

<style lang="scss" scoped>
.unit-converter {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    justify-content: center;
    
    button {
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.05);
      color: #fff;
      cursor: pointer;
      transition: all 0.3s;
      
      &.active {
        background: #67c23a;
        border-color: #67c23a;
      }
    }
  }
  
  .converter-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    justify-content: center;
    
    .input-group {
      width: 100%;
      display: flex;
      gap: 10px;
      
      input {
        flex: 1;
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 8px;
        padding: 10px;
        color: #fff;
        font-size: 1.1rem;
        width: 50%;
        
        &:focus {
          outline: none;
          border-color: #67c23a;
        }
      }
      
      select {
        width: 100px;
        background: rgba(0,0,0,0.5);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 8px;
        color: #fff;
        padding: 0 5px;
      }
    }
    
    .separator {
      font-size: 1.5rem;
      opacity: 0.5;
    }
  }
}
</style>