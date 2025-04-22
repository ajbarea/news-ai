import { apiClient } from '../services/authService';

/**
 * Handles article search functionality
 * @param {string} query - Search query
 * @param {Function} setIsSearching - Function to set loading state 
 * @param {Function} setSearchError - Function to set error state
 * @param {Function} setSearchResults - Function to set results
 * @param {Function} setShowNoResultsMessage - Function to show no results message
 * @param {Function} setLastSearchQuery - Function to store last query
 * @param {Function} setSearchQuery - Function to reset search input
 * @param {Object} noResultsTimeoutRef - Ref for timeout to clear no results message
 * @returns {Promise<boolean>} - Whether the search was successful
 */
export const performSearch = async (
  query,
  setIsSearching,
  setSearchError,
  setSearchResults,
  setShowNoResultsMessage,
  setLastSearchQuery,
  setSearchQuery,
  noResultsTimeoutRef
) => {
  if (!query.trim() || query.trim().length < 2) {
    setSearchError('Please enter at least 2 characters to search');
    return false;
  }

  // Clear any existing timeout
  if (noResultsTimeoutRef.current) {
    clearTimeout(noResultsTimeoutRef.current);
    noResultsTimeoutRef.current = null;
  }

  try {
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setLastSearchQuery(query.trim());
    setShowNoResultsMessage(false);

    const response = await apiClient.get('/search', {
      params: { query: query.trim() },
      timeout: 10000
    });

    setSearchResults(response.data);
    setIsSearching(false);
    setSearchQuery('');

    // If no results were found, show the temporary message
    if (response.data.length === 0) {
      setShowNoResultsMessage(true);
      // Hide the message after 5 seconds
      noResultsTimeoutRef.current = setTimeout(() => {
        setShowNoResultsMessage(false);
      }, 5000);
    }
    
    return true;
  } catch (err) {
    console.error('Error searching articles:', err);
    if (err.code === 'ECONNABORTED') {
      setSearchError('Search request timed out. Please try again.');
    } else if (err.response) {
      setSearchError(`Server error: ${err.response.status} - ${err.response.data.detail || err.response.statusText}`);
    } else if (err.request) {
      setSearchError('No response from server. Please check if the API server is running.');
    } else {
      setSearchError('An unexpected error occurred. Please try again later.');
    }
    setIsSearching(false);
    setSearchQuery('');
    return false;
  }
};

/**
 * Format article data for consistent display
 * @param {Object} article - Article data from API
 * @returns {Object} - Formatted article data
 */
export const formatArticle = (article) => ({
  id: article.id,
  title: article.title,
  summary: article.summary || 'No summary available for this article.',
  source: article.source,
  category: article.category?.name,
  date: article.published_at,
  imageUrl: article.image_url,
  url: article.url,
  subscription_required: article.subscription_required
});

/**
 * Sort articles by date
 * @param {Array} articles - Articles to sort
 * @param {string} sortOrder - Sort order ('newest' or 'oldest')
 * @returns {Array} - Sorted articles
 */
export const sortArticlesByDate = (articles, sortOrder) => {
  return [...articles].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });
};