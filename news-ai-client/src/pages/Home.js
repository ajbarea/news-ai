import React, { useState, useEffect } from 'react';
import newsService from '../services/newsService';
import SearchBar from '../components/SearchBar';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await newsService.fetchTopHeadlines();
        setArticles(data);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError("Failed to load articles");
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, []);

  const handleSearch = async (searchTerm) => {
    try {
      setLoading(true);
      const results = await newsService.searchArticles(searchTerm);
      setArticles(results);
    } catch (err) {
      console.error("Error searching articles:", err);
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Latest News</h1>
      <SearchBar onSearch={handleSearch} />
      
      {loading && <p>Loading articles...</p>}
      {error && <p>Error: {error}</p>}
      
      <div>
        {articles && articles.length > 0 ? (
          articles.map(article => (
            <div key={article.id}>
              <h3>{article.title}</h3>
              <a href={article.url}>Read more</a>
            </div>
          ))
        ) : !loading && !error && (
          <p>No articles found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
