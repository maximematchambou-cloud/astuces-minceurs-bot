const axios = require('axios');

class HuggingFaceService {
  constructor() {
    this.apiKey = process.env.HF_TOKEN || 'VOTRE_CLE_HUGGING_FACE_ICI';
    this.apiUrl = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large';
  }

  // Thèmes pour articles minceur
  getRandomTopic() {
    const topics = [
      "astuces pour perdre du poids naturellement",
      "habitudes alimentaires pour personnes en surpoids",
      "exercices efficaces pour brûler les graisses",
      "aliments à éviter pour maigrir",
      "recettes minceur rapides et saines",
      "comment booster son métabolisme",
      "erreurs courantes dans les régimes",
      "conseils pour maintenir son poids idéal",
      "impact du sommeil sur la perte de poids",
      "boissons qui aident à maigrir"
    ];
    return topics[Math.floor(Math.random() * topics.length)];
  }

  // Sources de recherche simulées
  getResearchSources() {
    const sources = [
      "Étude de l'OMS sur la nutrition 2023",
      "Recherches de l'INSERM sur l'obésité",
      "Rapport de l'ANSES sur les régimes",
      "Étude Harvard sur la perte de poids durable",
      "Données de la Société Française de Nutrition"
    ];
    return sources.slice(0, 2);
  }

  async generateArticle() {
    const topic = this.getRandomTopic();
    const sources = this.getResearchSources();

    const prompt = `
    Rédige un article complet de 1500 mots sur: "${topic}"
    
    CONTEXTE:
    - Public: Adultes en surpoids cherchant à maigrir
    - Objectif: Donner des conseils pratiques et scientifiquement fondés
    - Style: Professionnel mais accessible, encourageant
    
    STRUCTURE EXIGÉE:
    1. Introduction captivante avec statistiques récentes
    2. 4-5 sections détaillées avec conseils concrets
    3. Exemples de menus ou exercices
    4. Réponses aux objections courantes
    5. Conclusion motivante avec étapes actionnables
    6. FAQ avec 3 questions-réponses
    
    INFORMATIONS À INTÉGRER:
    - Sources scientifiques: ${sources.join(', ')}
    - Données chiffrées récentes
    - Conseils adaptés au quotidien
    - Précautions importantes
    
    TON:
    - Professionnel et bienveillant
    - Pratique et applicable
    - Scientifiquement exact
    - Motivant et positif
    
    Auteur: MATCHAMBOU Messowè Maxime
    Spécialiste en nutrition et bien-être
    
    IMPORTANT: Génère un contenu original de 1500 mots minimum.
    `;

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          inputs: prompt,
          parameters: {
            max_length: 2048,
            temperature: 0.8,
            do_sample: true,
            top_p: 0.9
          },
          options: {
            wait_for_model: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      let content = response.data[0]?.generated_text || prompt;
      
      // Nettoyer et formater le contenu
      content = this.cleanContent(content);
      
      return {
        title: `Astuce Minceur: ${this.formatTitle(topic)}`,
        content: content,
        topic: topic,
        sources: sources,
        author: "MATCHAMBOU Messowè Maxime"
      };

    } catch (error) {
      console.error('Erreur Hugging Face:', error.response?.data || error.message);
      return this.generateFallbackArticle(topic, sources);
    }
  }

  cleanContent(content) {
    // Supprimer le prompt du contenu généré
    let cleaned = content.replace(/Rédige un article complet.*?Auteur:.*?IMPORTANT:/gs, '');
    
    // Ajouter les sources à la fin
    cleaned += '\n\n---\n\n';
    cleaned += '**Sources et références:**\n';
    cleaned += '- Études scientifiques récentes sur la nutrition\n';
    cleaned += '- Recommandations de l\'Organisation Mondiale de la Santé\n';
    cleaned += '- Données de la recherche en diététique 2023\n\n';
    cleaned += '**Auteur:** MATCHAMBOU Messowè Maxime\n';
    cleaned += '**Expert en:** Nutrition, Perte de poids, Bien-être\n';
    cleaned += '**Contact:** Votre spécialiste en perte de poids durable';
    
    return cleaned;
  }

  formatTitle(topic) {
    return topic.charAt(0).toUpperCase() + topic.slice(1);
  }

  generateFallbackArticle(topic, sources) {
    return {
      title: `Guide Complet: ${this.formatTitle(topic)}`,
      content: `
# ${this.formatTitle(topic)}

**Auteur:** MATCHAMBOU Messowè Maxime  
**Date:** ${new Date().toLocaleDateString('fr-FR')}

## Introduction
Découvrez des méthodes scientifiquement prouvées pour ${topic}. Basé sur les dernières recherches, ce guide vous offre des solutions pratiques.

## Conseils Éprouvés
- Adoptez une alimentation équilibrée riche en fruits et légumes
- Pratiquez une activité physique régulière adaptée à votre condition
- Maintenez une bonne hydratation tout au long de la journée
- Dormez 7-8 heures par nuit pour un métabolisme optimal

## Plan d'Action Concret
1. **Semaine 1:** Évaluation de vos habitudes actuelles
2. **Semaine 2:** Mise en place de changements progressifs
3. **Semaine 3:** Consolidation des nouvelles habitudes
4. **Semaine 4:** Adaptation et optimisation

## Résultats Attendus
- Perte de poids progressive et durable
- Meilleure condition physique
- Amélioration de l'énergie et du bien-être

## FAQ
**Q: Combien de temps pour voir les premiers résultats?**  
R: Généralement 2-3 semaines avec une application régulière.

**Q: Faut-il faire un régime strict?**  
R: Non, privilégiez des changements d'habitudes durables.

**Q: Quel sport est le plus efficace?**  
R: La combinaison cardio et renforcement musculaire.

---

**Sources:** ${sources.join(', ')}

**Auteur:** MATCHAMBOU Messowè Maxime  
**Expert en nutrition et perte de poids durable**
      `,
      topic: topic,
      sources: sources,
      author: "MATCHAMBOU Messowè Maxime"
    };
  }
}

module.exports = new HuggingFaceService();