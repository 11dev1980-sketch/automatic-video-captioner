/**
 * RemoteContentService
 * Fetches and manages pre-processed video content from remote JSON files
 * Supports loading from GitHub raw URLs or any public JSON endpoint
 */

class RemoteContentService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 1000 * 60 * 30; // 30 minutes
  }

  /**
   * Fetch processed videos from a remote JSON URL
   * @param {string} url - Raw GitHub URL or any public JSON endpoint
   * @returns {Promise<Object>} Parsed JSON data with videos
   */
  async fetchProcessedVideos(url) {
    try {
      // Check cache first
      const cached = this.getCachedData(url);
      if (cached) {
        return cached;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate data structure
      this.validateDataStructure(data);
      
      // Cache the data
      this.setCachedData(url, data);
      
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch content: ${error.message}`);
    }
  }

  /**
   * Validate the structure of fetched data
   */
  validateDataStructure(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data structure: expected object');
    }
    
    if (!Array.isArray(data.videos)) {
      throw new Error('Invalid data structure: videos array not found');
    }
    
    return true;
  }

  /**
   * Get cached data if available and not expired
   */
  getCachedData(url) {
    const cached = this.cache.get(url);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(url);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Cache data with timestamp
   */
  setCachedData(url, data) {
    this.cache.set(url, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get a single video by ID
   */
  async getVideoById(url, videoId) {
    const data = await this.fetchProcessedVideos(url);
    return data.videos.find(video => video.id === videoId);
  }

  /**
   * Search videos by title or description
   */
  async searchVideos(url, query) {
    const data = await this.fetchProcessedVideos(url);
    const lowerQuery = query.toLowerCase();
    
    return data.videos.filter(video => 
      video.title.toLowerCase().includes(lowerQuery) ||
      video.description.toLowerCase().includes(lowerQuery) ||
      video.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Filter videos by tags
   */
  async filterByTags(url, tags) {
    const data = await this.fetchProcessedVideos(url);
    const tagSet = new Set(tags.map(t => t.toLowerCase()));
    
    return data.videos.filter(video =>
      video.tags?.some(tag => tagSet.has(tag.toLowerCase()))
    );
  }

  /**
   * Get all duas from all videos
   */
  async getAllDuas(url) {
    const data = await this.fetchProcessedVideos(url);
    const allDuas = [];
    
    data.videos.forEach(video => {
      if (video.duas && Array.isArray(video.duas)) {
        video.duas.forEach(dua => {
          allDuas.push({
            ...dua,
            videoId: video.id,
            videoTitle: video.title
          });
        });
      }
    });
    
    return allDuas;
  }

  /**
   * Filter duas by category
   */
  async getDuasByCategory(url, category) {
    const allDuas = await this.getAllDuas(url);
    return allDuas.filter(dua => 
      dua.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get video statistics
   */
  async getStatistics(url) {
    const data = await this.fetchProcessedVideos(url);
    
    const totalViews = data.videos.reduce((sum, v) => sum + (v.views || 0), 0);
    const totalLikes = data.videos.reduce((sum, v) => sum + (v.likes || 0), 0);
    const totalDuas = data.videos.reduce((sum, v) => sum + (v.duas?.length || 0), 0);
    
    const categories = new Set();
    data.videos.forEach(video => {
      video.duas?.forEach(dua => categories.add(dua.category));
    });
    
    return {
      totalVideos: data.videos.length,
      totalViews,
      totalLikes,
      totalDuas,
      categories: Array.from(categories),
      averageConfidence: this.calculateAverageConfidence(data.videos)
    };
  }

  /**
   * Calculate average confidence across all videos
   */
  calculateAverageConfidence(videos) {
    if (videos.length === 0) return 0;
    
    const totalConfidence = videos.reduce((sum, video) => {
      const transcriptionConf = video.transcription?.confidence || 0;
      const translationConf = video.translation?.confidence || 0;
      return sum + (transcriptionConf + translationConf) / 2;
    }, 0);
    
    return (totalConfidence / videos.length).toFixed(2);
  }
}

// Export singleton instance
export default new RemoteContentService();
