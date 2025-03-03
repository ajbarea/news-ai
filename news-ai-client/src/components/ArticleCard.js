import React from 'react';
import {
  Card,
  CardBody,
  CardImg,
  CardTitle,
  CardText,
  CardFooter,
  Button,
  Badge,
  ButtonGroup,
  Row,
  Col,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import { FaRegShareSquare, FaBookmark, FaArrowRight, FaEllipsisV, FaBan, FaThumbsDown } from "react-icons/fa";

function ArticleCard({ article }) {
  const placeholderImage = `https://media.istockphoto.com/id/1369150014/vector/breaking-news-with-world-map-background-vector.jpg?s=612x612&w=0&k=20&c=9pR2-nDBhb7cOvvZU_VdgkMmPJXrBQ4rB1AkTXxRIKM=`;
  const category = article.category || "General";
  const source = article.source || "Unknown";
  const date = article.date || new Date().toLocaleDateString();

  const calculateTimeAgo = (dateString) => {
    const publishDate = new Date(dateString);
    const currentDate = new Date();

    // Handle invalid dates
    if (isNaN(publishDate.getTime())) {
      return "Recently";
    }

    const diffInMs = currentDate - publishDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInMonths / 12);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}hr`;
    } else if (diffInDays < 30) {
      return `${diffInDays}d`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths}mo`;
    } else {
      return `${diffInYears}yr`;
    }
  };

  const handleBlockSource = () => {
    console.log(`Blocking source: ${source}`);
    // Implement the functionality to block the source
  };

  const handleHideArticle = () => {
    console.log(`Hiding article: ${article.title}`);
    // Implement the functionality to hide the article
  };

  const handleNotInterestedCategory = () => {
    console.log(`Show less in category: ${category}`);
    // Implement the functionality to mark not interested in category
  };

  const renderMetadata = () => (
    <div className="d-flex flex-wrap mb-2">
      <div className="me-1">
        <Badge color="primary" pill>{category}</Badge>
      </div>
      <div className="me-2">
        <small className="text-muted">{calculateTimeAgo(date)}</small>
      </div>
      <div className="me-1">
        <Badge color="secondary" pill>{source}</Badge>
      </div>
      <div>
        <small className="text-muted">5 min read</small>
      </div>
    </div>
  );

  return (
    <Card className="h-100 shadow-sm position-relative">
      <div className="position-absolute top-0 end-0 mt-2 me-2 z-index-1">
        <UncontrolledDropdown>
          <DropdownToggle
            color="transparent"
            size="sm"
            className="bg-light bg-opacity-75 rounded-circle"
          >
            <FaEllipsisV />
          </DropdownToggle>
          <DropdownMenu end>
            <DropdownItem onClick={handleNotInterestedCategory}>
              <FaThumbsDown className="me-2" /> Show less about: {category}
            </DropdownItem>
            <DropdownItem onClick={handleBlockSource}>
              <FaBan className="me-2" /> Block source: {source}
            </DropdownItem>
            <DropdownItem onClick={handleHideArticle}>
              <FaThumbsDown className="me-2" /> Hide article: {article.title.length > 30 ? `${article.title.substring(0, 30)}...` : article.title}
            </DropdownItem>

          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
      <div className="p-1 pt-1">
        <CardImg
          src={article.imageUrl || placeholderImage}
          alt={article.title}
          top
          className="rounded"
        />
      </div>
      <CardBody>
        <CardTitle tag="h5" className="mb-3">{article.title}</CardTitle>
        {renderMetadata()}
        <CardText>{article.summary}</CardText>
      </CardBody>
      <CardFooter className="bg-white border-0">
        <Row className="align-items-center">
          <Col xs="auto">
            <ButtonGroup size="sm">
              <Button outline color="secondary" aria-label="Bookmark article">
                <FaBookmark />
              </Button>
              <Button outline color="secondary" aria-label="Share article">
                <FaRegShareSquare />
              </Button>
            </ButtonGroup>
          </Col>
          <Col className="text-end">
            <Button
              color="link"
              tag="a"
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-0 d-inline-flex align-items-center"
              aria-label={`Read more about ${article.title}`}
            >
              Read More <FaArrowRight className="ms-1" size="0.8em" />
            </Button>
          </Col>
        </Row>
      </CardFooter>
    </Card>
  );
}

export default ArticleCard;