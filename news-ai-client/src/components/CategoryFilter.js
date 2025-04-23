import React from 'react';
import { ButtonGroup, Button } from 'reactstrap';

/**
 * Reusable category filter component
 */
const CategoryFilter = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <ButtonGroup className="flex-wrap">
      {categories.map(category => (
        <Button
          key={category}
          color={activeCategory === category ? "primary" : "secondary"}
          outline={activeCategory !== category}
          onClick={() => setActiveCategory(category)}
          className="me-2 mb-2"
        >
          {category}
        </Button>
      ))}
    </ButtonGroup>
  );
};

export default CategoryFilter;