import React from 'react';
import { Card, CardBody, CardImg, CardTitle, CardText, Button, Badge, ButtonGroup } from 'reactstrap';
import { FaRegShareSquare, FaBookmark, FaArrowRight } from "react-icons/fa";

function ArticleCard({ article }) {
  const placeholderImage = `https://media.istockphoto.com/id/1369150014/vector/breaking-news-with-world-map-background-vector.jpg?s=612x612&w=0&k=20&c=9pR2-nDBhb7cOvvZU_VdgkMmPJXrBQ4rB1AkTXxRIKM=`;
  const category = article.category || "General";
  const date = article.date || new Date().toLocaleDateString();

  return (
    <Card className="h-100">
      <CardImg
        src={article.imageUrl || placeholderImage}
        alt={article.title}
        top
        width="100%"
      />
      <CardBody>
        <CardTitle tag="h5">{article.title}</CardTitle>

        <div className="d-flex align-items-center mb-2">
          <small className="text-muted me-2">📅 {date}</small>
          <Badge color="primary" pill className="me-2">{category}</Badge>
          <small className="text-muted">5 min read</small>
        </div>

        <CardText>{article.summary}</CardText>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <ButtonGroup size="sm">
            <Button outline color="secondary" className="me-1">
              <FaBookmark aria-label="Bookmark" />
            </Button>
            <Button outline color="secondary">
              <FaRegShareSquare aria-label="Share" />
            </Button>
          </ButtonGroup>
          <Button
            color="link"
            tag="a"
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ps-0 d-flex align-items-center"
          >
            Read More <FaArrowRight className="ms-1" size="0.8em" />
          </Button>


        </div>
      </CardBody>
    </Card>
  );
}

export default ArticleCard;