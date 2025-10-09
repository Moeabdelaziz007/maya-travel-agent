/**
 * Enhanced Knowledge Base Service
 * Handles semantic search, vector embeddings, and knowledge retrieval
 */

const { createClient } = require('@supabase/supabase-js');

class KnowledgeBaseService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  /**
   * Generate embedding vector for text using OpenAI
   * @param {string} text - Text to embed
   * @returns {Promise<number[]>} Embedding vector
   */
  async generateEmbedding(text) {
    if (!this.openaiApiKey) {
      console.warn('OpenAI API key not configured, using mock embedding');
      return this.generateMockEmbedding(text);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-ada-002'
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return this.generateMockEmbedding(text);
    }
  }

  /**
   * Generate mock embedding for development/testing
   * @param {string} text - Text to embed
   * @returns {number[]} Mock embedding vector
   */
  generateMockEmbedding(text) {
    const hash = this.simpleHash(text);
    const vector = [];
    for (let i = 0; i < 1536; i++) {
      vector.push((hash * i + i) % 1);
    }
    return vector;
  }

  /**
   * Simple hash function for mock embeddings
   * @param {string} str - String to hash
   * @returns {number} Hash value
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  /**
   * Search knowledge base using semantic similarity
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results with similarity scores
   */
  async semanticSearch(query, options = {}) {
    const {
      limit = 5,
      threshold = 0.7,
      categories = [],
      language = 'en'
    } = options;

    try {
      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);

      // Build the query for vector similarity search
      let dbQuery = this.supabase
        .from('knowledge_embeddings')
        .select(`
          embedding_vector,
          article_id,
          knowledge_articles!inner(
            id,
            title,
            content,
            summary,
            tags,
            language,
            country,
            city,
            category_id,
            knowledge_categories!inner(name)
          )
        `)
        .limit(limit * 2); // Get more results for filtering

      // Add category filter if specified
      if (categories.length > 0) {
        dbQuery = dbQuery.in('knowledge_articles.category_id', categories);
      }

      // Add language filter
      if (language) {
        dbQuery = dbQuery.eq('knowledge_articles.language', language);
      }

      const { data: embeddings, error } = await dbQuery;

      if (error) {
        console.error('Database error:', error);
        return [];
      }

      if (!embeddings || embeddings.length === 0) {
        return [];
      }

      // Calculate cosine similarity for each result
      const results = embeddings
        .map(item => {
          const similarity = this.cosineSimilarity(queryEmbedding, item.embedding_vector);
          return {
            ...item.knowledge_articles,
            similarity,
            category_name: item.knowledge_articles.knowledge_categories.name
          };
        })
        .filter(result => result.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return results;

    } catch (error) {
      console.error('Semantic search error:', error);
      return [];
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param {number[]} vectorA - First vector
   * @param {number[]} vectorB - Second vector
   * @returns {number} Similarity score (0-1)
   */
  cosineSimilarity(vectorA, vectorB) {
    if (!vectorA || !vectorB || vectorA.length !== vectorB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Add knowledge article to the database
   * @param {Object} article - Article data
   * @returns {Promise<Object>} Created article
   */
  async addKnowledgeArticle(article) {
    try {
      // Insert article
      const { data: articleData, error: articleError } = await this.supabase
        .from('knowledge_articles')
        .insert({
          category_id: article.category_id,
          title: article.title,
          content: article.content,
          summary: article.summary,
          tags: article.tags || [],
          language: article.language || 'en',
          country: article.country,
          city: article.city,
          metadata: article.metadata || {}
        })
        .select()
        .single();

      if (articleError) {
        throw articleError;
      }

      // Generate and store embedding
      const embedding = await this.generateEmbedding(article.content);
      const { error: embeddingError } = await this.supabase
        .from('knowledge_embeddings')
        .insert({
          article_id: articleData.id,
          embedding_vector: embedding
        });

      if (embeddingError) {
        console.error('Error storing embedding:', embeddingError);
      }

      return articleData;

    } catch (error) {
      console.error('Error adding knowledge article:', error);
      throw error;
    }
  }

  /**
   * Get knowledge articles by category
   * @param {string} categoryName - Category name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Articles in category
   */
  async getArticlesByCategory(categoryName, options = {}) {
    const { limit = 50, language = 'en' } = options;

    try {
      const { data, error } = await this.supabase
        .from('knowledge_articles')
        .select(`
          *,
          knowledge_categories!inner(name)
        `)
        .eq('knowledge_categories.name', categoryName)
        .eq('language', language)
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error getting articles by category:', error);
      return [];
    }
  }

  /**
   * Search articles using full-text search
   * @param {string} searchQuery - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Search results
   */
  async fullTextSearch(searchQuery, options = {}) {
    const { limit = 10, language = 'en' } = options;

    try {
      const { data, error } = await this.supabase
        .from('knowledge_articles')
        .select(`
          *,
          knowledge_categories!inner(name)
        `)
        .eq('language', language)
        .textSearch('content', searchQuery)
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error in full-text search:', error);
      return [];
    }
  }

  /**
   * Get all knowledge categories
   * @returns {Promise<Array>} Available categories
   */
  async getCategories() {
    try {
      const { data, error } = await this.supabase
        .from('knowledge_categories')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      return data || [];

    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  /**
   * Populate knowledge base with initial travel data
   * @returns {Promise<void>}
   */
  async populateInitialData() {
    try {
      console.log('Populating knowledge base with initial travel data...');

      // Sample knowledge articles
      const sampleArticles = [
        {
          category_id: await this.getCategoryId('destinations'),
          title: 'Tokyo Travel Guide',
          content: `Tokyo is Japan's bustling capital, mixing ultramodern and traditional elements.
          Best time to visit: March-May (cherry blossoms) or September-November (pleasant weather).
          Must-visit areas: Shibuya, Shinjuku, Akihabara, Asakusa.
          Transportation: Efficient subway system, JR trains.
          Food: Sushi, ramen, tempura, street food in Tsukiji.
          Culture: Respect for etiquette, remove shoes indoors, try local customs.`,
          summary: 'Comprehensive guide to Tokyo including best times to visit, attractions, and cultural tips.',
          tags: ['japan', 'city', 'culture', 'food', 'technology'],
          language: 'en',
          country: 'Japan',
          city: 'Tokyo'
        },
        {
          category_id: await this.getCategoryId('culture'),
          title: 'Japanese Etiquette Guide',
          content: `Japanese culture emphasizes respect, harmony, and attention to detail.
          Key customs: Remove shoes before entering homes/temples, bow when greeting, don't tip.
          Communication: Indirect communication style, saving face is important.
          Food culture: Slurping noodles shows appreciation, try everything with chopsticks.
          Onsen etiquette: Wash thoroughly before entering, no tattoos allowed in most places.`,
          summary: 'Essential Japanese etiquette and customs for respectful travel.',
          tags: ['japan', 'culture', 'etiquette', 'customs'],
          language: 'en',
          country: 'Japan'
        },
        {
          category_id: await this.getCategoryId('safety'),
          title: 'Japan Safety Information',
          content: `Japan is one of the safest countries for travelers.
          Low crime rate, but natural disasters require preparation.
          Earthquake preparedness: Know evacuation routes, have emergency kit.
          Transportation safety: Excellent safety record, but crowded trains during rush hour.
          Health: High-quality medical care, but get travel insurance.
          Emergency numbers: 110 (police), 119 (fire/ambulance).`,
          summary: 'Safety information and emergency preparedness for Japan travel.',
          tags: ['japan', 'safety', 'emergency', 'health'],
          language: 'en',
          country: 'Japan'
        }
      ];

      for (const article of sampleArticles) {
        if (article.category_id) {
          await this.addKnowledgeArticle(article);
        }
      }

      console.log('Knowledge base populated successfully');

    } catch (error) {
      console.error('Error populating knowledge base:', error);
    }
  }

  /**
   * Get category ID by name
   * @param {string} categoryName - Category name
   * @returns {Promise<string|null>} Category ID
   */
  async getCategoryId(categoryName) {
    try {
      const { data, error } = await this.supabase
        .from('knowledge_categories')
        .select('id')
        .eq('name', categoryName)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      return data?.id || null;

    } catch (error) {
      console.error('Error getting category ID:', error);
      return null;
    }
  }
}

module.exports = KnowledgeBaseService;