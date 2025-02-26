import React from 'react';
import { Link } from 'react-router-dom';

function ArticleCard({ article }) {
  const placeholderImage = `https://media.istockphoto.com/id/1369150014/vector/breaking-news-with-world-map-background-vector.jpg?s=612x612&w=0&k=20&c=9pR2-nDBhb7cOvvZU_VdgkMmPJXrBQ4rB1AkTXxRIKM=`;
  const category = article.category || "General";
  const date = article.date || new Date().toLocaleDateString();

  return (
    <div style={{ maxWidth: '992px' }}>
      <h4>{article.title}</h4>

      <img
        src={article.imageUrl || placeholderImage}
        alt={article.title}
        style={{ maxWidth: '100%', height: 'auto' }}
      />

      <div style={{ margin: '10px 0' }}>
        <span>📅 {date} • {category} • 5 min read</span>
      </div>

      <p>{article.summary}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <Link to={`${article.url}`}>
          Read More →
        </Link>

        <div>
          <button style={{ marginRight: '10px' }}>🔖 Bookmark</button>
          <button>📤 Share</button>
        </div>
      </div>
    </div>
  );
}

export default ArticleCard;