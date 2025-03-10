import React, { useState } from 'react';
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
  UncontrolledTooltip,
  Alert
} from 'reactstrap';
import { FaBookmark, FaArrowRight, FaEllipsisV, FaBan, FaThumbsDown, FaMicrophone, FaSyncAlt } from "react-icons/fa";
import { useAuth } from '../context/AuthContext';
import SourceService from '../services/sourceService';
import ArticleService from '../services/articleService';
import UserPreferenceService from '../services/userPreferenceService';

const ArticleActions = ({ article, source, sourceId, category, categoryId }) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, message: '', type: 'success' });

  const handleAction = async (action, target, targetId) => {
    // Reset feedback
    setFeedback({ show: false, message: '', type: 'success' });

    // Check authentication
    if (!isAuthenticated()) {
      setFeedback({
        show: true,
        message: 'Please log in to perform this action',
        type: 'warning'
      });
      return;
    }

    try {
      setIsLoading(true);

      if (action === 'Show less about') {
        // If we don't have a valid category ID but have a category name, try to use the name
        if (!targetId && target) {
          await UserPreferenceService.blacklistCategory(target);
        } else {
          // Use the ID if available
          const categoryIdNum = parseInt(targetId, 10);
          if (isNaN(categoryIdNum)) {
            throw new Error(`Category ID is not a valid number: ${targetId}`);
          }
          await UserPreferenceService.blacklistCategory(categoryIdNum);
        }

        setFeedback({
          show: true,
          message: `You'll see less content about ${target}`,
          type: 'success'
        });
      }
      else if (action === 'Block source') {
        await SourceService.addToBlacklist(targetId);

        setFeedback({
          show: true,
          message: `${target} has been added to your blacklist`,
          type: 'success'
        });
      }
      else if (action === 'Hide article') {
        const articleId = parseInt(targetId, 10) || targetId;
        await ArticleService.addToBlacklist(articleId);

        setFeedback({
          show: true,
          message: `Article has been hidden`,
          type: 'success'
        });
      }

      // Optionally refresh the page or update article list
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error(`Error ${action.toLowerCase()}:`, error);
      console.error('Error details:', error.response?.data || 'No response data');

      let errorMessage = `Failed to ${action.toLowerCase()}`;

      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }

      setFeedback({
        show: true,
        message: errorMessage,
        type: 'danger'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {feedback.show && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
          <Alert color={feedback.type} toggle={() => setFeedback({ ...feedback, show: false })}>
            {feedback.message}
          </Alert>
        </div>
      )}

      <UncontrolledDropdown>
        <DropdownToggle
          color="transparent"
          size="sm"
          className="bg-light bg-opacity-75 rounded-circle"
          disabled={isLoading}
        >
          <FaEllipsisV />
        </DropdownToggle>
        <DropdownMenu end>
          <DropdownItem onClick={() => handleAction('Show less about', category, categoryId)}>
            <FaThumbsDown className="me-2" /> Show less about: {category}
          </DropdownItem>
          <DropdownItem onClick={() => handleAction('Block source', source, sourceId)}>
            <FaBan className="me-2" /> Block source: {source}
          </DropdownItem>
          <DropdownItem onClick={() => handleAction('Hide article', article.title, article.id)}>
            <FaThumbsDown className="me-2" /> Hide article: {article.title.length > 30 ? `${article.title.substring(0, 30)}...` : article.title}
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </>
  );
};

const ArticleMetadata = ({ category, date, source, sourceLogo, subscriptionRequired }) => {
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

  const badgeStyle = {
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 7px"
  };

  return (
    <div className="d-flex flex-nowrap align-items-center mb-2 overflow-hidden">
      {category &&
        <div className="me-1 flex-shrink-0">
          <Badge color="primary" pill style={badgeStyle}>{category}</Badge>
        </div>
      }

      {date &&
        <div className="me-2 flex-shrink-0">
          <small className="text-muted d-inline-block" style={{ lineHeight: "24px" }}>{calculateTimeAgo(date)}</small>
        </div>
      }

      {source && (
        <div className="me-1 flex-shrink-0">
          <Badge color="secondary" pill style={badgeStyle}>
            {sourceLogo && (
              <img
                src={sourceLogo}
                alt={`${source} logo`}
                height="16"
                width="16"
                className="me-1 rounded-circle"
                style={{
                  objectFit: 'contain',
                  marginRight: '4px',
                  display: 'inline-block',
                  verticalAlign: 'middle'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <span>{source}</span>
          </Badge>
        </div>
      )}

      {subscriptionRequired && (
        <div className="me-1 flex-shrink-0">
          <Badge color="warning" className="text-dark" pill style={badgeStyle}>Sub</Badge>
        </div>
      )}

      <div className="flex-shrink-0">
        <small className="text-muted d-inline-block" style={{ lineHeight: "24px" }}>5m read</small>
      </div>
    </div>
  );
};

function ArticleCard({ article }) {
  const { isAuthenticated } = useAuth();
  const placeholderImage = `https://media.istockphoto.com/id/1369150014/vector/breaking-news-with-world-map-background-vector.jpg?s=612x612&w=0&k=20&c=9pR2-nDBhb7cOvvZU_VdgkMmPJXrBQ4rB1AkTXxRIKM=`;

  // Extract source information
  let sourceName = "Unknown";
  let sourceLogo = null;
  let subscriptionRequired = false;
  let sourceId = null;

  if (article.source) {
    if (typeof article.source === 'object') {
      sourceName = article.source.name || "Unknown";
      sourceLogo = article.source.logo_url || null;
      subscriptionRequired = article.source.subscription_required || false;
      sourceId = article.source.id || null;
    } else {
      sourceName = article.source;
    }
  }

  // Extract category - check if it's an object or string
  let categoryName = "General";
  let categoryId = null;

  if (article.category) {
    if (typeof article.category === 'object') {
      categoryName = article.category.name || "General";
      // Try to get the category ID from multiple possible properties
      categoryId = article.category.id || article.category_id || null;
    } else {
      categoryName = article.category;
      // If category is a string, try to get ID from article.category_id
      categoryId = article.category_id || null;
    }
  } else if (article.category_id) {
    // If no category object but we have category_id, use that
    categoryId = article.category_id;
  }

  const imageUrl = article.image_url || article.imageUrl || placeholderImage;
  const date = article.date || article.published_at || new Date().toLocaleDateString();
  const articleId = article.id || Math.random().toString(36).substring(2, 11);

  const handleReadMore = async (e) => {
    e.preventDefault();
    if (isAuthenticated()) {
      try {
        await ArticleService.trackArticleRead(article.id);
      } catch (error) {
        console.error('Failed to track article read:', error);
      }
    }
    window.open(article.url, '_blank');
  };

  return (
    <Card className="h-100 shadow-sm position-relative">
      <div className="position-absolute top-0 end-0 mt-2 me-2 z-index-1">
        <ArticleActions
          article={article}
          source={sourceName}
          sourceId={sourceId}
          category={categoryName}
          categoryId={categoryId}
        />
      </div>

      <div className="p-1 pt-1">
        <CardImg
          src={imageUrl}
          alt={article.title}
          top
          className="rounded"
        />
      </div>

      <CardBody>
        <CardTitle tag="h5" className="mb-3">{article.title}</CardTitle>
        <ArticleMetadata
          category={categoryName}
          date={date}
          source={sourceName}
          sourceLogo={sourceLogo}
          subscriptionRequired={subscriptionRequired}
        />
        <CardText>{article.summary}</CardText>
      </CardBody>

      <CardFooter className="bg-white border-0">
        <Row>
          <Col xs="auto">
            <ButtonGroup size="sm">
              <Button
                id={`bookmark-${articleId}`}
                color="light"
                className="rounded-start shadow-sm border border-light"
                aria-label="Bookmark article"
              >
                <FaBookmark className="text-primary" />
              </Button>
              <UncontrolledTooltip placement="top" target={`bookmark-${articleId}`}>
                Save to bookmarks
              </UncontrolledTooltip>

              <Button
                id={`speak-${articleId}`}
                color="light"
                className="shadow-sm border border-light"
                aria-label="Listen to article summary"
              >
                <FaMicrophone className="text-danger" />
              </Button>
              <UncontrolledTooltip placement="top" target={`speak-${articleId}`}>
                Listen to summary
              </UncontrolledTooltip>

              <Button
                id={`refresh-${articleId}`}
                color="light"
                className="rounded-end shadow-sm border border-light"
                aria-label="Regenerate summary"
              >
                <FaSyncAlt className="text-success" />
              </Button>
              <UncontrolledTooltip placement="top" target={`refresh-${articleId}`}>
                Retry AI summary
              </UncontrolledTooltip>
            </ButtonGroup>
          </Col>
          <Col className="text-end">
            <Button
              color="link"
              onClick={handleReadMore}
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