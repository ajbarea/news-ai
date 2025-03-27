import { apiClient } from './authService';

const FavoriteArticleService = {
    /**
     * Get all favorited articles for the current user
     */
    getFavoriteArticles: async () => {
        const response = await apiClient.get('/users/me/favorite-articles');
        return response.data;
    },

    /**
     * Add an article to favorites
     * @param {number} articleId - The ID of the article to add to favorites
     */
    addToFavorites: async (articleId) => {
        const response = await apiClient.post('/users/me/favorite-articles', {
            article_id: articleId
        });
        return response.data;
    },

    /**
     * Remove an article from favorites
     * @param {number} articleId - The ID of the article to remove from favorites
     */
    removeFromFavorites: async (articleId) => {
        await apiClient.delete(`/users/me/favorite-articles/${articleId}`);
        return true;
    },

    /**
     * Check if an article is in the user's favorites
     * @param {Array} favoriteArticles - Array of favorite articles to check against
     * @param {number} articleId - The ID of the article to check
     */
    isArticleFavorited: (favoriteArticles, articleId) => {
        return favoriteArticles.some(article => article.id === articleId);
    }
};

export default FavoriteArticleService;
