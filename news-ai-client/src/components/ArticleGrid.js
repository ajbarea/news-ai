import React from 'react';
import { Row, Col } from 'reactstrap';
import ArticleCard from './ArticleCard';

/**
 * Displays a grid of article cards
 */
const ArticleGrid = ({ articles, favoriteArticles, onFavoriteChange }) => {
  return (
    <Row>
      {articles.map(article => (
        <Col key={article.id} md="6" lg="4" className="mb-4">
          <ArticleCard
            article={article}
            favoriteArticles={favoriteArticles}
            onFavoriteChange={onFavoriteChange}
          />
        </Col>
      ))}
    </Row>
  );
};

export default ArticleGrid;