import React, { useState, useEffect } from 'react';
import favoritesService from '../services/favoritesService';

const FavoritesList = () => {
  const [favorites, setFavorites] = useState([]);
  
  useEffect(() => {
    const loadFavorites = () => {
      const userFavorites = favoritesService.getFavorites();
      setFavorites(userFavorites);
    };
    
    loadFavorites();
  }, []);

  const handleRemove = (id) => {
    favoritesService.removeFavorite(id);
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  if (favorites.length === 0) {
    return <div>You have no favorite articles yet.</div>;
  }

  return (
    <div>
      <h2>Your Favorite Articles</h2>
      {favorites.map(article => (
        <div key={article.id}>
          <h3>{article.title}</h3>
          <p>{article.description}</p>
          <div>Source: {article.source.name}</div>
          <button onClick={() => handleRemove(article.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

export default FavoritesList;
