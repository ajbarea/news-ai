// News service for fetching articles

const fetchTopHeadlines = async () => {
  // In a real implementation, this would fetch from an API
  return [
    { id: '1', title: 'Sample Article 1', url: 'http://example.com/1' },
    { id: '2', title: 'Sample Article 2', url: 'http://example.com/2' }
  ];
};

const searchArticles = async (query) => {
  // In a real implementation, this would search using an API
  return [
    { id: '1', title: `Article about ${query}`, url: 'http://example.com/search' }
  ];
};

const getArticleById = async (id) => {
  // In a real implementation, this would fetch a specific article
  return {
    id,
    title: 'Test Article',
    content: 'Article content here',
    publishedAt: '2023-11-20T12:00:00Z',
    source: { name: 'Test Source' }
  };
};

const getCategories = async () => {
  return ['Technology', 'Business', 'Health', 'Entertainment'];
};

export default {
  fetchTopHeadlines,
  searchArticles,
  getArticleById,
  getCategories
};
