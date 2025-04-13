import React, { useState, useEffect } from 'react';
import newsService from '../services/newsService';
import SearchBar from '../components/SearchBar';

const Home = () => {
  const [articles, setArticles] = useState([]);
  
  useEffect(() => {
    const fetchArticles = async () => {
      const data = await newsService.fetchTopHeadlines();
      setArticles(data);
    };
    
    fetchArticles();
  }, []);

  const handleSearch = async (searchTerm) => {
    const results = await newsService.searchArticles(searchTerm);
    setArticles(results);
  };

  return (
    <div>
      <h1>Latest News</h1>
      <SearchBar onSearch={handleSearch} />
      <div>
        {articles.map(article => (
          <div key={article.id}>
            <h3>{article.title}</h3>
            <a href={article.url}>Read more</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
