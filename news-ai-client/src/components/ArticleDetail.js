import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import newsService from '../services/newsService';

const ArticleDetail = () => {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await newsService.getArticleById(id);
        setArticle(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load article');
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{article.title}</h1>
      <div>Source: {article.source.name}</div>
      <img src={article.urlToImage} alt={article.title} />
      <p>{article.content}</p>
    </div>
  );
};

export default ArticleDetail;
