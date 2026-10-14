import { createApp } from 'vue'
import { inject } from '@vercel/analytics'
import App from './App.vue'
import i18n from './i18n'
import './assets/css/style.css'

document.documentElement.lang = i18n.global.locale.value
createApp(App).use(i18n).mount('#app')

// Framework-agnostic API: the /vue component imports vue-router, which this app doesn't use
inject()
