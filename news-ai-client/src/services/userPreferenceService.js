import { apiClient } from './authService';

const UserPreferenceService = {
    /**
     * Get all preferences for the current user
     * @returns {Promise<Array>} - Array of user preferences
     */
    getUserPreferences: async () => {
        try {
            // First get the current user to retrieve their ID
            const currentUserResponse = await apiClient.get('/users/me');
            const userId = currentUserResponse.data.id;

            if (!userId) {
                throw new Error('Could not determine user ID');
            }

            // Then get the user's preferences using their numeric ID
            const response = await apiClient.get(`/users/${userId}/preferences`);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                throw new Error('Authentication required to access preferences');
            }
            throw error;
        }
    },

    /**
     * Update a category preference for the current user
     * @param {number} categoryId - The ID of the category to update
     * @param {Object} data - The preference data to update (score and/or blacklisted status)
     * @returns {Promise<Object>} - The updated preference
     */
    updateCategoryPreference: async (categoryId, data) => {
        const response = await apiClient.put(`/users/me/preferences/${categoryId}`, data);
        return response.data;
    },

    /**
     * Get all available categories
     * @returns {Promise<Array>} - Array of categories
     */
    getAllCategories: async () => {
        const response = await apiClient.get('/categories');
        return response.data;
    },

    /**
     * Blacklist a category by ID or name
     * @param {number|string} categoryIdOrName - The ID or name of the category to blacklist
     * @returns {Promise<Object>} - The updated preference
     */
    blacklistCategory: async (categoryIdOrName) => {
        let categoryId;

        // Check if this is a string that's not a number (likely a category name)
        if (typeof categoryIdOrName === 'string' && isNaN(parseInt(categoryIdOrName))) {
            try {
                // Look up the category ID by name
                const categories = await UserPreferenceService.getAllCategories();
                const category = categories.find(
                    cat => cat.name.toLowerCase() === categoryIdOrName.toLowerCase()
                );

                if (!category) {
                    throw new Error(`Category not found: ${categoryIdOrName}`);
                }

                categoryId = category.id;
                console.log(`Resolved category name "${categoryIdOrName}" to ID: ${categoryId}`);
            } catch (error) {
                console.error(`Failed to find category ID for "${categoryIdOrName}":`, error);
                throw new Error(`Couldn't blacklist category: ${categoryIdOrName}. ${error.message}`);
            }
        } else {
            // It's already a number or numeric string
            categoryId = parseInt(categoryIdOrName);
            if (isNaN(categoryId)) {
                throw new Error(`Invalid category ID: ${categoryIdOrName}`);
            }
        }

        return await UserPreferenceService.updateCategoryPreference(categoryId, { blacklisted: true });
    },

    /**
     * Remove a category from the blacklist
     * @param {number} categoryId - The ID of the category to unblacklist
     * @returns {Promise<Object>} - The updated preference
     */
    removeFromBlacklist: async (categoryId) => {
        return await UserPreferenceService.updateCategoryPreference(categoryId, { blacklisted: false });
    }
};

export default UserPreferenceService;
