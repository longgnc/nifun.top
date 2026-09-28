import { createApp } from "vue";
import "@/style/style.scss";
import App from "@/App.vue";
// 引入 pinia
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
// swiper
import "swiper/css";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.mount("#app");

// PWA
if (navigator.serviceWorker) {
  if (import.meta.env.DEV) {
    // 开发模式：注销残留的 Service Worker 并清理缓存，避免旧构建干扰热更新
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
    if (window.caches) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
  } else {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      // 弹出更新提醒
      console.log("站点已更新，刷新后生效");
      ElMessage("站点已更新，刷新后生效");
    });
  }
}
