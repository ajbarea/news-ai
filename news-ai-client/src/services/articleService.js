import { apiClient } from './authService';

const ArticleService = {
    /**
     * Get all articles with optional filters
     */
    getArticles: async (params = {}) => {
        const response = await apiClient.get('/articles', { params });
        return response.data;
    },

    /**
     * Get a specific article by ID
     * @param {number} articleId - The ID of the article to retrieve
     */
    getArticleById: async (articleId) => {
        const response = await apiClient.get(`/articles/${articleId}`);
        return response.data;
    },

    /**
     * Add an article to the user's blacklist
     * @param {number} articleId - The ID of the article to blacklist
     */
    addToBlacklist: async (articleId) => {
        const response = await apiClient.post('/users/me/blacklisted-articles', {
            article_id: articleId
        });
        return response.data;
    },

    /**
     * Remove an article from the user's blacklist
     * @param {number} articleId - The ID of the article to remove from blacklist
     */
    removeFromBlacklist: async (articleId) => {
        await apiClient.delete(`/users/me/blacklisted-articles/${articleId}`);
        return true;
    },

    /**
     * Get all articles that the current user has blacklisted
     */
    getBlacklistedArticles: async () => {
        const response = await apiClient.get('/users/me/blacklisted-articles');
        return response.data;
    },

    /**
     * Track when a user reads an article to update preference score
     * @param {number} articleId - The ID of the article being read
     */
    trackArticleRead: async (articleId) => {
        const response = await apiClient.post(`/articles/${articleId}/read`);
        // Dispatch custom event to notify components that user preferences have changed
        window.dispatchEvent(new CustomEvent('userPreferencesChanged'));
        return response.data;
    }
};

export default ArticleService;
