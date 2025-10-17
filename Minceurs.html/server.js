const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connexion base de données
require('./config/database');

// Routes
app.use('/api/articles', require('./routes/articles'));

// Services
const huggingFaceService = require('./services/huggingFaceService');
const unsplashService = require('./services/unsplashService');
const bloggerService = require('./services/bloggerService');
const Article = require('./models/Article');

// Tâche automatisée toutes les 4 heures
cron.schedule('0 */4 * * *', async () => {
  console.log('🕐 Début de la génération automatique...');
  try {
    await generateAndPublishArticle();
    console.log('✅ Génération automatique terminée avec succès');
  } catch (error) {
    console.error('❌ Erreur génération automatique:', error);
  }
});

// Fonction principale de génération
async function generateAndPublishArticle() {
  try {
    // 1. Génération du contenu
    const articleContent = await huggingFaceService.generateArticle();
    
    // 2. Récupération d'image
    const imageData = await unsplashService.getHealthImage();
    
    // 3. Publication sur Blogger
    const publicationResult = await bloggerService.publishArticle({
      title: articleContent.title,
      content: articleContent.content,
      image: imageData
    });
    
    // 4. Sauvegarde en base de données
    const article = new Article({
      title: articleContent.title,
      content: articleContent.content,
      imageUrl: imageData.url,
      published: true,
      publishedUrl: publicationResult.url,
      publishedAt: new Date()
    });
    
    await article.save();
    
    return {
      success: true,
      article: articleContent.title,
      url: publicationResult.url
    };
    
  } catch (error) {
    console.error('Erreur lors de la génération:', error);
    throw error;
  }
}

// Route pour déclencher manuellement
app.post('/api/generate-article', async (req, res) => {
  try {
    const result = await generateAndPublishArticle();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Route pour voir les articles générés
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Page d'accueil
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📝 Système d'automatisation actif - Génération toutes les 4h`);
});