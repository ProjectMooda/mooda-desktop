import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

// 전역 CSS
import './assets/styles/global.css'

// 🔥 핵심
const app = createApp(App);
app.use(createPinia());

app.mount('#app');