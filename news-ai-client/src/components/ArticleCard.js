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
  DropdownItem,
  UncontrolledTooltip
} from 'reactstrap';
import { FaBookmark, FaArrowRight, FaEllipsisV, FaBan, FaThumbsDown, FaMicrophone } from "react-icons/fa";

const ArticleActions = ({ article, source, category }) => {
  const handleAction = (action, target) => {
    console.log(`${action}: ${target}`);
    // Implementation to be added
  };

  return (
    <UncontrolledDropdown>
      <DropdownToggle
        color="transparent"
        size="sm"
        className="bg-light bg-opacity-75 rounded-circle"
      >
        <FaEllipsisV />
      </DropdownToggle>
      <DropdownMenu end>
        <DropdownItem onClick={() => handleAction('Show less about', category)}>
          <FaThumbsDown className="me-2" /> Show less about: {category}
        </DropdownItem>
        <DropdownItem onClick={() => handleAction('Block source', source)}>
          <FaBan className="me-2" /> Block source: {source}
        </DropdownItem>
        <DropdownItem onClick={() => handleAction('Hide article', article.title)}>
          <FaThumbsDown className="me-2" /> Hide article: {article.title.length > 30 ? `${article.title.substring(0, 30)}...` : article.title}
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

const ArticleMetadata = ({ category, date, source }) => {
  const calculateTimeAgo = (dateString) => {
    const publishDate = new Date(dateString);
    const currentDate = new Date();

    if (isNaN(publishDate.getTime())) return "Recently";

    const diffInMs = currentDate - publishDate;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}hr`;

    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInDays < 30) return `${diffInDays}d`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo`;

    return `${Math.floor(diffInMonths / 12)}yr`;
  };

  return (
    <div className="d-flex flex-wrap mb-2">
      {category && <div className="me-1"><Badge color="primary" pill>{category}</Badge></div>}
      {date && <div className="me-2"><small className="text-muted">{calculateTimeAgo(date)}</small></div>}
      {source && <div className="me-1"><Badge color="secondary" pill>{source}</Badge></div>}
      <div><small className="text-muted">5 min read</small></div>
    </div>
  );
};

function ArticleCard({ article }) {
  const placeholderImage = `https://media.istockphoto.com/id/1369150014/vector/breaking-news-with-world-map-background-vector.jpg?s=612x612&w=0&k=20&c=9pR2-nDBhb7cOvvZU_VdgkMmPJXrBQ4rB1AkTXxRIKM=`;
  const { category = "General", source = "Unknown", date = new Date().toLocaleDateString() } = article;

  return (
    <Card className="h-100 shadow-sm position-relative">
      <div className="position-absolute top-0 end-0 mt-2 me-2 z-index-1">
        <ArticleActions article={article} source={source} category={category} />
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
        <ArticleMetadata category={category} date={date} source={source} />
        <CardText>{article.summary}</CardText>
      </CardBody>

      <CardFooter className="bg-white border-0">
        <Row>
          <Col xs="auto">
            <ButtonGroup size="sm">
              <Button
                id={`bookmark-${article.id || Math.random().toString(36).substring(2, 11)}`}
                color="light"
                className="rounded-start shadow-sm border border-light"
                aria-label="Bookmark article"
              >
                <FaBookmark className="text-primary" />
              </Button>
              <UncontrolledTooltip placement="top" target={`bookmark-${article.id || Math.random().toString(36).substring(2, 11)}`}>
                Save to bookmarks
              </UncontrolledTooltip>

              <Button
                id={`speak-${article.id || Math.random().toString(36).substring(2, 11)}`}
                color="light"
                className="rounded-end shadow-sm border border-light"
                aria-label="Listen to article summary"
              >
                <FaMicrophone className="text-danger" />
              </Button>
              <UncontrolledTooltip placement="top" target={`speak-${article.id || Math.random().toString(36).substring(2, 11)}`}>
                Listen to article
              </UncontrolledTooltip>
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