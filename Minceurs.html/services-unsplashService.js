const axios = require('axios');

class UnsplashService {
  constructor() {
    this.accessKey = process.env.UNSPLASH_KEY || 'VOTRE_CLE_UNSPLASH_ICI';
    this.apiUrl = 'https://api.unsplash.com';
  }

  // Mots-clés pour images santé/minceur
  getHealthKeywords() {
    const keywords = [
      'fitness', 'healthy food', 'weight loss', 'exercise', 
      'nutrition', 'wellness', 'healthy lifestyle', 'workout',
      'healthy breakfast', 'gym', 'yoga', 'meditation',
      'fresh fruits', 'vegetables', 'smoothie', 'salad'
    ];
    return keywords[Math.floor(Math.random() * keywords.length)];
  }

  async getHealthImage() {
    try {
      const keyword = this.getHealthKeywords();
      const response = await axios.get(`${this.apiUrl}/photos/random`, {
        params: {
          query: keyword,
          client_id: this.accessKey,
          orientation: 'landscape',
          content_filter: 'high'
        },
        timeout: 10000
      });

      const photo = response.data;
      
      return {
        url: photo.urls.regular,
        alt: photo.alt_description || `Image ${keyword}`,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        keyword: keyword
      };

    } catch (error) {
      console.error('Erreur Unsplash:', error.response?.data || error.message);
      return this.getDefaultImage();
    }
  }

  getDefaultImage() {
    // Images par défaut si Unsplash échoue
    const defaultImages = [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'
    ];
    
    return {
      url: defaultImages[Math.floor(Math.random() * defaultImages.length)],
      alt: 'Santé et bien-être',
      photographer: 'Unsplash',
      photographerUrl: 'https://unsplash.com',
      keyword: 'health'
    };
  }
}

module.exports = new UnsplashService();