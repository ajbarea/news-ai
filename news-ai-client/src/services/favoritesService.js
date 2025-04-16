// Service for managing user favorites

const getFavorites = () => {
  // In a real implementation, this would fetch from localStorage or an API
  return JSON.parse(localStorage.getItem('favorites') || '[]');
};

const addFavorite = (article) => {
  const favorites = getFavorites();
  if (!favorites.find(fav => fav.id === article.id)) {
    favorites.push(article);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
};

const removeFavorite = (id) => {
  const favorites = getFavorites();
  const updatedFavorites = favorites.filter(fav => fav.id !== id);
  localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
};

export default {
  getFavorites,
  addFavorite,
  removeFavorite
};
