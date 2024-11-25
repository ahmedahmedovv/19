<template>
  <div class="feed-container">
    <div class="test-banner" style="background: #e0e0e0; padding: 20px; margin: 20px; text-align: center; font-size: 24px;">
      Feed List is Working!
    </div>
    
    <div class="filters">
      <select v-model="selectedTimeFilter" @change="filterFeeds">
        <option v-for="filter in timeFilters" :value="filter.hours">
          {{ filter.label }}
        </option>
      </select>
      
      <div class="category-filters">
        <button 
          v-for="category in categories"
          :class="{ active: selectedCategory === category }"
          @click="filterByCategory(category)">
          {{ category }}
        </button>
      </div>
    </div>

    <div class="feeds">
      <article v-for="feed in filteredFeeds" 
               :key="feed.link"
               class="feed-card"
               @click="expandFeed(feed)">
        <h3>{{ feed.title }}</h3>
        <div class="meta">
          <span>{{ feed.source }}</span>
          <span>{{ formatDate(feed.published) }}</span>
        </div>
        <p v-if="expandedFeed === feed.link">{{ feed.description }}</p>
        <div class="keywords">
          <span v-for="keyword in feed.keywords" class="keyword-tag">
            {{ keyword }}
          </span>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      feeds: [],
      selectedTimeFilter: 24,
      selectedCategory: 'All',
      expandedFeed: null,
      searchQuery: '',
      bookmarks: JSON.parse(localStorage.getItem('bookmarks') || '[]'),
      timeFilters: [
        { hours: 24, label: 'Last 24 hours' },
        { hours: 48, label: 'Last 2 days' },
        { hours: 168, label: 'Last week' },
        { hours: 720, label: 'Last month' }
      ]
    }
  },
  
  computed: {
    filteredFeeds() {
      return this.feeds.filter(feed => {
        const matchesCategory = this.selectedCategory === 'All' || 
                              feed.category === this.selectedCategory;
        const age = this.getAgeHours(feed.published);
        const matchesSearch = this.searchQuery === '' || 
          feed.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          feed.description.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        return matchesCategory && age < this.selectedTimeFilter && matchesSearch;
      });
    }
  },
  
  methods: {
    async fetchFeeds() {
      const response = await fetch('/api/feeds');
      this.feeds = await response.json();
    },
    
    expandFeed(feed) {
      this.expandedFeed = this.expandedFeed === feed.link ? null : feed.link;
    },
    
    filterByCategory(category) {
      this.selectedCategory = category;
    },
    
    getAgeHours(dateStr) {
      const published = new Date(dateStr);
      const now = new Date();
      return (now - published) / (1000 * 60 * 60);
    },
    
    toggleBookmark(feed) {
      const index = this.bookmarks.findIndex(b => b.link === feed.link);
      if (index === -1) {
        this.bookmarks.push({
          link: feed.link,
          title: feed.title,
          timestamp: new Date().toISOString()
        });
      } else {
        this.bookmarks.splice(index, 1);
      }
      localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    },
    
    isBookmarked(feed) {
      return this.bookmarks.some(b => b.link === feed.link);
    },
    
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
  },
  
  mounted() {
    console.log('FeedList component mounted');
    this.fetchFeeds();
    setInterval(this.fetchFeeds, 300000);
  }
}
</script> 