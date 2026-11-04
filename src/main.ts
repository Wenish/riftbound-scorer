import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { requestPersistentStorage } from './platform/pwa'

const app = createApp(App)

app.use(createPinia())
app.mount('#app')

void requestPersistentStorage()
