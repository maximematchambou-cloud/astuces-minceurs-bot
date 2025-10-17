const { google } = require('googleapis');
const axios = require('axios');

class BloggerService {
  constructor() {
    this.blogId = process.env.BLOGGER_BLOG_ID || 'VOTRE_ID_BLOG_ICI';
    this.clientId = process.env.BLOGGER_CLIENT_ID || 'VOTRE_CLIENT_ID_ICI';
    this.clientSecret = process.env.BLOGGER_CLIENT_SECRET || 'VOTRE_CLIENT_SECRET_ICI';
    this.refreshToken = process.env.BLOGGER_REFRESH_TOKEN || 'VOTRE_REFRESH_TOKEN_ICI';
  }

  async getAuthClient() {
    const oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: this.refreshToken
    });

    return oauth2Client;
  }

  formatContentToHtml(content, imageData, author) {
    let html = `
    <div style="text-align: center; margin: 30px 0;">
      <img src="${imageData.url}" alt="${imageData.alt}" style="max-width: 100%; height: auto; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <p style="font-style: italic; color: #666; font-size: 14px; margin-top: 10px;">
        Photo: <a href="${imageData.photographerUrl}" target="_blank">${imageData.photographer}</a>
      </p>
    </div>
    `;

    // Convertir le markdown simple en HTML
    const lines = content.split('\n');
    
    for (let line of lines) {
      line = line.trim();
      
      if (line.startsWith('# ')) {
        html += `<h1 style="color: #2c5530; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">${line.substring(2)}</h1>`;
      } else if (line.startsWith('## ')) {
        html += `<h2 style="color: #2c5530; margin-top: 30px;">${line.substring(3)}</h2>`;
      } else if (line.startsWith('### ')) {
        html += `<h3 style="color: #4CAF50;">${line.substring(4)}</h3>`;
      } else if (line.startsWith('- ')) {
        html += `<ul><li style="margin: 8px 0;">${line.substring(2)}</li></ul>`;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        html += `<p><strong>${line.substring(2, line.length - 2)}</strong></p>`;
      } else if (line.includes('**')) {
        // Gérer le gras à l'intérieur du texte
        html += `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
      } else if (line.trim() !== '') {
        html += `<p style="line-height: 1.6; margin: 15px 0;">${line}</p>`;
      }
    }

    // Ajouter la signature
    html += `
    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 15px; margin-top: 40px; border-left: 5px solid #4CAF50;">
      <h3 style="color: #2c5530; margin-top: 0;">À propos de l'auteur</h3>
      <p style="margin: 10px 0; font-size: 16px;">
        <strong>${author}</strong><br>
        Expert en nutrition et perte de poids durable
      </p>
      <p style="margin: 5px 0; color: #666;">
        Spécialiste des méthodes naturelles et scientifiquement validées pour une perte de poids saine et durable.
      </p>
    </div>
    `;

    return html;
  }

  async publishArticle(articleData) {
    try {
      const authClient = await this.getAuthClient();
      const blogger = google.blogger({ version: 'v3', auth: authClient });

      const htmlContent = this.formatContentToHtml(
        articleData.content, 
        articleData.image, 
        "MATCHAMBOU Messowè Maxime"
      );

      const post = {
        title: articleData.title,
        content: htmlContent,
        labels: ['astuces minceur', 'perte de poids', 'santé', 'nutrition', 'auto-généré']
      };

      const response = await blogger.posts.insert({
        blogId: this.blogId,
        resource: post
      });

      console.log('✅ Article publié:', response.data.url);
      
      return {
        success: true,
        url: response.data.url,
        title: response.data.title,
        published: response.data.published
      };

    } catch (error) {
      console.error('❌ Erreur publication Blogger:', error);
      
      // Simulation de publication pour le développement
      return {
        success: false,
        url: `https://blog-exemple.com/article-${Date.now()}`,
        title: articleData.title,
        published: new Date(),
        error: error.message
      };
    }
  }
}

module.exports = new BloggerService();