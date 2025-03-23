import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardBody,
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
  Spinner
} from 'reactstrap';
import { FaBookmark, FaArrowRight, FaEllipsisV, FaBan, FaThumbsDown, FaMicrophone, FaSyncAlt, FaRegBookmark } from "react-icons/fa";
import { useAuth } from '../context/AuthContext';
import SourceService from '../services/sourceService';
import ArticleService from '../services/articleService';
import UserPreferenceService from '../services/userPreferenceService';
import FavoriteArticleService from '../services/favoriteArticleService';
import AlertMessage from '../components/AlertMessage';
import AudioService from '../services/audioService';

const ArticleActions = ({ article, source, sourceId, category, categoryId }) => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, message: '', type: 'success' });
  const feedbackTimeoutRef = useRef(null);

  // Clear feedback timeout on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const showFeedbackWithTimeout = (message, type) => {
    // Clear any existing timeout
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    // Show the feedback
    setFeedback({
      show: true,
      message,
      type
    });

    // Set timeout to hide the feedback after 4 seconds
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleAction = async (action, target, targetId) => {
    // Reset feedback
    setFeedback({ show: false, message: '', type: 'success' });

    // Check authentication
    if (!isAuthenticated()) {
      showFeedbackWithTimeout('Please log in to perform this action', 'warning');
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

        showFeedbackWithTimeout(`You'll see less content about ${target}`, 'success');
      }
      else if (action === 'Block source') {
        await SourceService.addToBlacklist(targetId);

        showFeedbackWithTimeout(`${target} has been added to your blacklist`, 'success');
      }
      else if (action === 'Hide article') {
        const articleId = parseInt(targetId, 10) || targetId;
        await ArticleService.addToBlacklist(articleId);

        showFeedbackWithTimeout(`Article has been hidden`, 'success');
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

      showFeedbackWithTimeout(errorMessage, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {feedback.show && (
        <div className="position-absolute start-50 translate-middle-x"
          style={{
            zIndex: 1050,
            width: '250px',
            top: '40px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
          <AlertMessage
            message={feedback.message}
            type={feedback.type}
            autoDismiss={true}
            onDismiss={() => setFeedback({ ...feedback, show: false })}
            style={{ marginBottom: 0 }}
          />
        </div>
      )}

      <UncontrolledDropdown>
        <DropdownToggle
          color="light"
          size="sm"
          className="rounded-circle shadow-sm"
          style={{ width: '32px', height: '32px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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

function ArticleCard({ article, favoriteArticles = [], onFavoriteChange = null }) {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, message: '', type: 'success' });
  const feedbackTimeoutRef = useRef(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const audioRef = useRef(null);

  const placeholderImage = `https://media.istockphoto.com/id/1369150014/vector/breaking-news-with-world-map-background-vector.jpg?s=612x612&w=0&k=20&c=9pR2-nDBhb7cOvvZU_VdgkMmPJXrBQ4rB1AkTXxRIKM=`;

  // Clear feedback timeout on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const showFeedbackWithTimeout = (message, type) => {
    // Clear any existing timeout
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    // Show the feedback
    setFeedback({
      show: true,
      message,
      type
    });

    // Set timeout to hide the feedback after 5 seconds
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Determine if article is in favorites
  useEffect(() => {
    if (article.id && favoriteArticles.length > 0) {
      setIsFavorited(FavoriteArticleService.isArticleFavorited(favoriteArticles, article.id));
    }
  }, [article.id, favoriteArticles]);

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

  const handleToggleFavorite = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      showFeedbackWithTimeout('Please log in to save articles to favorites', 'warning');
      return;
    }

    try {
      setIsLoading(true);

      if (isFavorited) {
        await FavoriteArticleService.removeFromFavorites(article.id);
        showFeedbackWithTimeout('Article removed from favorites', 'success');
      } else {
        await FavoriteArticleService.addToFavorites(article.id);
        showFeedbackWithTimeout('Article added to favorites', 'success');
      }

      setIsFavorited(!isFavorited);

      // Notify parent component if callback provided
      if (onFavoriteChange) {
        onFavoriteChange(article.id, !isFavorited);
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);

      let errorMessage = isFavorited
        ? 'Failed to remove from favorites'
        : 'Failed to add to favorites';

      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }

      showFeedbackWithTimeout(errorMessage, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle playing article audio
  const handleListenToSummary = async () => {
    if (isPlayingAudio) {
      // If already playing, stop the audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsPlayingAudio(false);
      }
      return;
    }
    
    try {
      setIsPlayingAudio(true);
      setAudioError(null);
      
      const audioBlob = await AudioService.getArticleAudio(article.id);
      audioRef.current = AudioService.playAudio(audioBlob);
      
      // Update state when audio finishes playing
      audioRef.current.addEventListener('ended', () => {
        setIsPlayingAudio(false);
        audioRef.current = null;
      });
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioError('Failed to load audio. Please try again.');
      setIsPlayingAudio(false);
    }
  };

  // Handle regenerating audio
  const handleRegenerateAudio = async () => {
    try {
      setIsPlayingAudio(true);
      setAudioError(null);
      
      await AudioService.generateArticleAudio(article.id);
      const audioBlob = await AudioService.getArticleAudio(article.id);
      audioRef.current = AudioService.playAudio(audioBlob);
      
      // Update state when audio finishes playing
      audioRef.current.addEventListener('ended', () => {
        setIsPlayingAudio(false);
        audioRef.current = null;
      });
      
      showFeedbackWithTimeout('Audio regenerated successfully', 'success');
    } catch (error) {
      console.error('Error regenerating audio:', error);
      setAudioError('Failed to regenerate audio. Please try again.');
      setIsPlayingAudio(false);
      showFeedbackWithTimeout('Failed to regenerate audio', 'danger');
    }
  };

  return (
    <Card className="h-100 shadow-sm position-relative">
      {feedback.show && (
        <div className="position-absolute start-50 translate-middle-x"
          style={{
            zIndex: 1050,
            width: '250px',
            top: '40px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
          <AlertMessage
            message={feedback.message}
            type={feedback.type}
            autoDismiss={true}
            onDismiss={() => setFeedback({ ...feedback, show: false })}
            style={{ marginBottom: 0 }}
          />
        </div>
      )}

      <div className="position-absolute top-0 end-0 mt-2 me-2" style={{ zIndex: 10 }}>
        <ArticleActions
          article={article}
          source={sourceName}
          sourceId={sourceId}
          category={categoryName}
          categoryId={categoryId}
        />
      </div>

      <div
        className="rounded overflow-hidden"
        style={{
          paddingBottom: "56.25%", // 16:9 aspect ratio
          position: "relative",
          height: 0,
          width: "100%"
        }}
      >
        <img
          src={imageUrl}
          alt={article.title}
          className="rounded"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
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
                aria-label={isFavorited ? "Remove from bookmarks" : "Bookmark article"}
                onClick={handleToggleFavorite}
                disabled={isLoading}
              >
                {isFavorited ?
                  <FaBookmark className="text-danger" /> :
                  <FaRegBookmark className="text-primary" />
                }
              </Button>
              <UncontrolledTooltip placement="top" target={`bookmark-${articleId}`}>
                {isFavorited ? "Remove from bookmarks" : "Save to bookmarks"}
              </UncontrolledTooltip>

              <Button
                id={`speak-${articleId}`}
                color="light"
                className="shadow-sm border border-light"
                aria-label="Listen to article summary"
                onClick={handleListenToSummary}
                disabled={isLoading}
              >
                {isPlayingAudio ? (
                  <Spinner size="sm" />
                ) : (
                  <FaMicrophone className="text-danger" />
                )}
              </Button>
              <UncontrolledTooltip placement="top" target={`speak-${articleId}`}>
                {isPlayingAudio ? 'Stop audio' : 'Listen to summary'}
              </UncontrolledTooltip>

              <Button
                id={`refresh-${articleId}`}
                color="light"
                className="rounded-end shadow-sm border border-light"
                aria-label="Regenerate summary"
                onClick={handleRegenerateAudio}
                disabled={isLoading || isPlayingAudio}
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