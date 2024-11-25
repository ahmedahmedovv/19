import { createApp } from 'vue'
import FeedList from './components/FeedList.vue'

const app = createApp({})
app.component('feed-list', FeedList)
app.mount('#app') 