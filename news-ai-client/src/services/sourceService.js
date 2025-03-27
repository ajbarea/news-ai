import { apiClient } from './authService';

const SourceService = {
    /**
     * Get all available news sources
     */
    getAllSources: async () => {
        const response = await apiClient.get('/sources');
        return response.data;
    },

    /**
     * Get all sources blacklisted by the current user
     */
    getBlacklistedSources: async () => {
        const response = await apiClient.get('/users/me/blacklisted-sources');
        return response.data;
    },

    /**
     * Add a source to the user's blacklist
     * @param {number} sourceId - The ID of the source to blacklist
     */
    addToBlacklist: async (sourceId) => {
        const response = await apiClient.post('/users/me/blacklisted-sources', {
            source_id: sourceId
        });
        return response.data;
    },

    /**
     * Remove a source from the user's blacklist
     * @param {number} sourceId - The ID of the source to remove from blacklist
     */
    removeFromBlacklist: async (sourceId) => {
        await apiClient.delete(`/users/me/blacklisted-sources/${sourceId}`);
        return true;
    }
};

export default SourceService;
