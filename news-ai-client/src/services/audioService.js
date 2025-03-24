import { apiClient } from './authService';

const AudioService = {
    /**
     * Get audio for an article
     * @param {number} articleId - The ID of the article to get audio for
     * @returns {Promise<Blob>} - Audio blob that can be played
     */
    getArticleAudio: async (articleId) => {
        const response = await apiClient.get(`/articles/${articleId}/audio`, {
            responseType: 'blob'
        });
        return response.data;
    },

    /**
     * Generate/regenerate audio for an article
     * @param {number} articleId - The ID of the article
     * @param {string} language - The language code (default: 'en')
     * @returns {Promise<Object>} - The audio metadata
     */
    generateArticleAudio: async (articleId, language = 'en') => {
        const response = await apiClient.post(`/articles/${articleId}/audio`, {}, {
            params: { language, force_regenerate: true }
        });
        return response.data;
    },

    /**
     * Play audio from a blob
     * @param {Blob} audioBlob - The audio blob to play
     * @returns {HTMLAudioElement} - The audio element that's playing
     */
    playAudio: (audioBlob) => {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Clean up object URL when done playing
        audio.addEventListener('ended', () => {
            URL.revokeObjectURL(audioUrl);
        });
        
        audio.play();
        return audio;
    }
};

export default AudioService;
