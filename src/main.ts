import { createApp } from 'vue'
import {  createPinia} from "pinia";
import App from './App.vue'

let app=createApp(App)
app.use(createPinia())
app.mount('#app')
