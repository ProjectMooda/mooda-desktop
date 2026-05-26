import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

// 전역 CSS
import './assets/styles/global.css'

//지금 유틸리티랑 variable은 gloabl에서 가져오는중

// 🔥 핵심
const app = createApp(App)
app.use(createPinia())

app.mount('#app')
