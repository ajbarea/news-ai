import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    Row,
    Col,
    Alert,
    Badge,
    Spinner,
    Card,
    CardBody,
    CardTitle
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import SettingsModal from './SettingsModal';
import SourceService from '../services/sourceService';
import UserPreferenceService from '../services/userPreferenceService';
import FavoriteArticleService from '../services/favoriteArticleService';
import ArticleService from '../services/articleService';
import { FaBookmark, FaTrash, FaBan, FaNewspaper, FaShieldAlt } from 'react-icons/fa';

function ProfileModal({ isOpen, toggle }) {
    const navigate = useNavigate();
    const { currentUser, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        name: ''
    });
    const [originalData, setOriginalData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [showSettings, setShowSettings] = useState(false);
    const [blacklistedSources, setBlacklistedSources] = useState([]);
    const [loadingSources, setLoadingSources] = useState(false);
    const [unblockModal, setUnblockModal] = useState(false);
    const [selectedSource, setSelectedSource] = useState(null);
    const [unblockLoading, setUnblockLoading] = useState(false);
    const [blacklistedCategories, setBlacklistedCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [unblockCategoryModal, setUnblockCategoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [unblockCategoryLoading, setUnblockCategoryLoading] = useState(false);
    const [favoriteArticles, setFavoriteArticles] = useState([]);
    const [loadingFavorites, setLoadingFavorites] = useState(false);
    const [removingArticleId, setRemovingArticleId] = useState(null);
    const [blacklistedArticles, setBlacklistedArticles] = useState([]);
    const [loadingBlacklistedArticles, setLoadingBlacklistedArticles] = useState(false);
    const [removingBlacklistedArticleId, setRemovingBlacklistedArticleId] = useState(null);

    useEffect(() => {
        if (currentUser) {
            const userData = {
                username: currentUser.username || '',
                email: currentUser.email || '',
                name: currentUser.name || ''
            };
            setFormData(userData);
            setOriginalData(userData);

            // Fetch blacklisted sources and categories when modal opens and user is authenticated
            if (isOpen) {
                fetchBlacklistedSources();
                fetchBlacklistedCategories();
                fetchFavoriteArticles();
                fetchBlacklistedArticles(); // Add this line to fetch blacklisted articles
            }
        }
    }, [currentUser, isOpen]);

    const fetchBlacklistedSources = async () => {
        try {
            setLoadingSources(true);
            const sources = await SourceService.getBlacklistedSources();
            setBlacklistedSources(sources);
        } catch (error) {
            console.error('Error fetching blacklisted sources:', error);
        } finally {
            setLoadingSources(false);
        }
    };

    const fetchBlacklistedCategories = async () => {
        try {
            setLoadingCategories(true);
            setMessage(null); // Clear any previous messages

            const preferences = await UserPreferenceService.getUserPreferences();

            if (!Array.isArray(preferences)) {
                console.error("API did not return an array of preferences");
                setBlacklistedCategories([]);
                setMessage({
                    type: 'warning',
                    text: 'Could not load category preferences in the expected format'
                });
                return;
            }

            // Filter only blacklisted preferences that have valid category data
            const blacklisted = preferences.filter(pref => {
                const isBlacklisted = Boolean(pref.blacklisted);
                const hasValidCategory = Boolean(pref.category?.name);

                if (isBlacklisted && !hasValidCategory) {
                    console.warn(`Found blacklisted preference without valid category:`, pref);
                }

                return isBlacklisted && hasValidCategory;
            });

            setBlacklistedCategories(blacklisted);
        } catch (error) {
            console.error('Error fetching blacklisted categories:', error);

            // Extract and log detailed error information
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
                console.error('Error headers:', error.response.headers);

                // Make sure we only set a string as the error message
                let errorMessage = 'Failed to load blocked categories. Please try again.';

                if (error.response.data?.detail) {
                    // Ensure errorMessage is a string, not an object
                    errorMessage = typeof error.response.data.detail === 'string'
                        ? error.response.data.detail
                        : JSON.stringify(error.response.data.detail);
                }

                setMessage({
                    type: 'danger',
                    text: errorMessage
                });
            } else if (error.request) {
                // Request was made but no response received
                console.error('Error request:', error.request);
                setMessage({
                    type: 'danger',
                    text: 'No response received when loading categories. Please check your connection.'
                });
            } else {
                // Error setting up the request
                console.error('Error message:', error.message);
                // Ensure error.message is converted to string
                setMessage({
                    type: 'danger',
                    text: `Error: ${error.message ? String(error.message) : 'Failed to load blocked categories'}`
                });
            }
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchFavoriteArticles = async () => {
        try {
            setLoadingFavorites(true);
            const articles = await FavoriteArticleService.getFavoriteArticles();
            setFavoriteArticles(articles);
        } catch (error) {
            console.error('Error fetching favorite articles:', error);
            setMessage({
                type: 'danger',
                text: 'Failed to load favorite articles. Please try again.'
            });
        } finally {
            setLoadingFavorites(false);
        }
    };

    const fetchBlacklistedArticles = async () => {
        try {
            setLoadingBlacklistedArticles(true);
            const articles = await ArticleService.getBlacklistedArticles();
            setBlacklistedArticles(articles);
        } catch (error) {
            console.error('Error fetching blacklisted articles:', error);
            setMessage({
                type: 'danger',
                text: 'Failed to load blacklisted articles. Please try again.'
            });
        } finally {
            setLoadingBlacklistedArticles(false);
        }
    };

    const handleStartEditing = () => {
        if (currentUser) {
            setFormData({
                username: currentUser.username || '',
                email: currentUser.email || '',
                name: currentUser.name || ''
            });
        }
        setIsEditing(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear errors for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Basic validation before submitting
    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            // Only send fields that have been changed
            const updateData = {};

            if (formData.username !== originalData.username) {
                updateData.username = formData.username;
            }

            if (formData.email !== originalData.email) {
                updateData.email = formData.email;
            }

            if (formData.name !== originalData.name) {
                updateData.name = formData.name;
            }

            // Only proceed if there are changes to update
            if (Object.keys(updateData).length > 0) {
                const result = await updateProfile(updateData);

                // If username was changed, redirect to login
                if (result === "USERNAME_CHANGED") {
                    setMessage({
                        type: 'warning',
                        text: 'Username changed. You will be redirected to log in again.'
                    });

                    // Wait 2 seconds before redirecting to login
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                    return;
                }

                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                // Update original data to match current form data
                setOriginalData({ ...formData });
            } else {
                setMessage({ type: 'info', text: 'No changes to update' });
            }

            setIsEditing(false);
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Profile update error:', error);
            if (error.response?.status === 400) {
                // Handle validation errors from server
                if (error.response.data.detail === "Username already registered") {
                    setErrors(prev => ({ ...prev, username: 'Username already taken' }));
                } else if (error.response.data.detail === "Email already registered") {
                    setErrors(prev => ({ ...prev, email: 'Email already in use' }));
                } else {
                    setMessage({ type: 'danger', text: error.response.data.detail || 'Failed to update profile' });
                }
            } else {
                setMessage({ type: 'danger', text: 'Failed to update profile. Please try again.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleSettings = () => {
        setShowSettings(!showSettings);
    };

    // Handler for when a user clicks on a blacklisted source badge
    const handleUnblockSource = (source) => {
        setSelectedSource(source);
        setUnblockModal(true);
    };

    // Unblock the selected source
    const confirmUnblock = async () => {
        if (!selectedSource) return;

        try {
            setUnblockLoading(true);
            await SourceService.removeFromBlacklist(selectedSource.id);

            // Show success message
            setMessage({
                type: 'success',
                text: `Successfully unblocked ${selectedSource.name}`
            });

            // Refresh the list of blacklisted sources
            await fetchBlacklistedSources();

            // Close the modal
            setUnblockModal(false);
            setSelectedSource(null);

            // Clear message after delay
            setTimeout(() => setMessage(null), 3000);

        } catch (error) {
            console.error('Error unblocking source:', error);
            setMessage({
                type: 'danger',
                text: `Failed to unblock ${selectedSource.name}. Please try again.`
            });
        } finally {
            setUnblockLoading(false);
        }
    };

    // Cancel the unblock action
    const cancelUnblock = () => {
        setUnblockModal(false);
        setSelectedSource(null);
    };

    // Render a list item for each blacklisted source
    const renderBlacklistedSources = () => {
        if (loadingSources) {
            return <Spinner size="sm" color="primary" className="me-2" />;
        }

        if (blacklistedSources.length === 0) {
            return <p className="mb-0 text-muted">No sources blocked</p>;
        }

        return (
            <div className="blacklisted-sources">
                {blacklistedSources.map(source => (
                    <Badge
                        key={source.id}
                        color="danger"
                        className="me-1 mb-1"
                        style={{
                            padding: "5px 8px",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                        }}
                        onClick={() => handleUnblockSource(source)}
                        title={`Click to unblock ${source.name}`}
                    >
                        {source.name} ×
                    </Badge>
                ))}
            </div>
        );
    };

    // Handler for when a user clicks on a blacklisted category badge
    const handleUnblockCategory = (category) => {
        setSelectedCategory(category);
        setUnblockCategoryModal(true);
    };

    // Unblock the selected category
    const confirmUnblockCategory = async () => {
        if (!selectedCategory) return;

        try {
            setUnblockCategoryLoading(true);

            const categoryName = selectedCategory.category?.name || "category";

            await UserPreferenceService.updateCategoryPreference(
                selectedCategory.category_id,
                { blacklisted: false }
            );

            setUnblockCategoryModal(false);
            setSelectedCategory(null);

            await fetchBlacklistedCategories();

            setMessage({
                type: 'success',
                text: `Successfully unblocked ${categoryName}`
            });

            setTimeout(() => setMessage(null), 3000);

        } catch (error) {
            console.error('Error unblocking category:', error);

            const categoryName = selectedCategory.category?.name || "selected category";

            setMessage({
                type: 'danger',
                text: `Failed to unblock ${categoryName}. Please try again.`
            });

            setUnblockCategoryModal(false);
            setSelectedCategory(null);
        } finally {
            setUnblockCategoryLoading(false);
        }
    };

    // Cancel the unblock category action
    const cancelUnblockCategory = () => {
        setUnblockCategoryModal(false);
        setSelectedCategory(null);
    };

    // Render a list item for each blacklisted category
    const renderBlacklistedCategories = () => {
        if (loadingCategories) {
            return <Spinner size="sm" color="primary" className="me-2" />;
        }

        if (!Array.isArray(blacklistedCategories) || blacklistedCategories.length === 0) {
            return <p className="mb-0 text-muted">No categories blocked</p>;
        }

        return (
            <div className="blacklisted-categories">
                {blacklistedCategories.map(pref => {
                    // Extra safety check to make sure we have valid data
                    if (!pref || !pref.category || !pref.category.name) {
                        return null;
                    }

                    // Make sure category name is a string
                    const categoryName = typeof pref.category.name === 'string'
                        ? pref.category.name
                        : String(pref.category.name);

                    return (
                        <Badge
                            key={pref.id || `pref-${pref.category_id}`}
                            color="danger"
                            className="me-1 mb-1"
                            style={{
                                padding: "5px 8px",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                            onClick={() => handleUnblockCategory(pref)}
                            title={`Click to unblock ${categoryName}`}
                        >
                            {categoryName} ×
                        </Badge>
                    );
                })}
            </div>
        );
    };

    const handleRemoveFavorite = async (articleId) => {
        try {
            setRemovingArticleId(articleId);
            await FavoriteArticleService.removeFromFavorites(articleId);

            // Update the favorites list
            setFavoriteArticles(current =>
                current.filter(article => article.id !== articleId)
            );

            setMessage({
                type: 'success',
                text: 'Article removed from favorites'
            });

            // Clear the message after a delay
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error removing favorite:', error);
            setMessage({
                type: 'danger',
                text: 'Failed to remove article from favorites'
            });
        } finally {
            setRemovingArticleId(null);
        }
    };

    const handleRemoveBlacklistedArticle = async (articleId) => {
        try {
            setRemovingBlacklistedArticleId(articleId);
            await ArticleService.removeFromBlacklist(articleId);

            // Update the blacklisted articles list
            setBlacklistedArticles(current =>
                current.filter(article => article.id !== articleId)
            );

            setMessage({
                type: 'success',
                text: 'Article removed from blacklist'
            });

            // Clear the message after a delay
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error removing from blacklist:', error);
            setMessage({
                type: 'danger',
                text: 'Failed to remove article from blacklist'
            });
        } finally {
            setRemovingBlacklistedArticleId(null);
        }
    };

    const handleArticleClick = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Render favorite articles
    const renderFavoriteArticles = () => {
        if (loadingFavorites) {
            return <Spinner size="sm" color="primary" />;
        }

        if (favoriteArticles.length === 0) {
            return <p className="text-muted mb-0">No favorite articles saved</p>;
        }

        return (
            <div className="favorite-articles">
                {favoriteArticles.map(article => (
                    <Card key={article.id} className="mb-2" style={{ borderLeft: '3px solid #007bff' }}>
                        <CardBody className="p-2">
                            <div className="d-flex justify-content-between align-items-start">
                                <div className="favorite-article-title"
                                    onClick={() => handleArticleClick(article.url)}
                                    style={{ cursor: 'pointer', flex: 1 }}>
                                    <span className="fw-bold">{article.title}</span>
                                    <div className="d-flex mt-1">
                                        <Badge color="primary" pill className="me-1">
                                            {article.category ? article.category.name : 'Uncategorized'}
                                        </Badge>
                                        <Badge color="secondary" pill>
                                            {article.source ? article.source.name : 'Unknown source'}
                                        </Badge>
                                    </div>
                                </div>
                                <Button
                                    color="link"
                                    className="p-0 ms-2 text-danger"
                                    onClick={() => handleRemoveFavorite(article.id)}
                                    disabled={removingArticleId === article.id}>
                                    {removingArticleId === article.id ?
                                        <Spinner size="sm" /> :
                                        <FaTrash size="0.8em" />}
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        );
    };

    // Render blacklisted articles
    const renderBlacklistedArticles = () => {
        if (loadingBlacklistedArticles) {
            return <Spinner size="sm" color="primary" />;
        }

        if (blacklistedArticles.length === 0) {
            return <p className="text-muted mb-0">No blacklisted articles</p>;
        }

        return (
            <div className="blacklisted-articles">
                {blacklistedArticles.map(article => {
                    return (
                        <Card key={article.id} className="mb-2" style={{ borderLeft: '3px solid #dc3545' }}>
                            <CardBody className="p-2">
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="blacklisted-article-title"
                                        onClick={() => handleArticleClick(article.url)}
                                        style={{ cursor: 'pointer', flex: 1 }}>
                                        <span className="fw-bold">{article.title}</span>
                                        <div className="d-flex mt-1">
                                            <Badge color="primary" pill className="me-1">
                                                {article.category ? article.category.name : 'Uncategorized'}
                                            </Badge>
                                            <Badge color="secondary" pill>
                                                {article.source ? article.source.name : 'Unknown source'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        color="link"
                                        className="p-0 ms-2 text-primary"
                                        onClick={() => handleRemoveBlacklistedArticle(article.id)}
                                        disabled={removingBlacklistedArticleId === article.id}>
                                        {removingBlacklistedArticleId === article.id ?
                                            <Spinner size="sm" /> :
                                            <FaTrash size="0.8em" />}
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    );
                })}
            </div>
        );
    };

    // Function to get a profile picture based on user ID
    const getProfilePicture = () => {
        if (!currentUser || !currentUser.id) {
            // Default image if no user ID available
            return 'https://randomuser.me/api/portraits/lego/1.jpg';
        }

        // Use the user's ID as a seed for a consistent picture
        // Modulo 99 to keep within the available range (0-99)
        const pictureId = currentUser.id % 99;

        return `https://randomuser.me/api/portraits/men/${pictureId}.jpg`;
    };

    return (
        <>
            <Modal isOpen={isOpen && !showSettings} toggle={toggle} size="lg">
                <ModalHeader toggle={toggle}>
                    User Profile
                </ModalHeader>
                <ModalBody>
                    {message && (
                        <Alert color={message.type} className="mb-3">
                            {message.text}
                        </Alert>
                    )}

                    {!isEditing ? (
                        <div className="mb-4">
                            <div className="text-center mb-4">
                                <div className="mb-3">
                                    {/* Replace letter placeholder with actual profile picture */}
                                    <img
                                        src={getProfilePicture()}
                                        alt={`${currentUser?.username || 'User'}'s profile`}
                                        className="rounded-circle mb-2"
                                        style={{ width: '120px', height: '120px', objectFit: 'cover', border: '3px solid #f8f9fa' }}
                                        onError={(e) => {
                                            // Fallback in case image fails to load
                                            e.target.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                                        }}
                                    />
                                </div>
                                <h3>{currentUser?.name || currentUser?.username}</h3>
                                <p className="text-muted">{currentUser?.email}</p>
                            </div>

                            <Row className="mt-4">
                                <Col md="6" className="mb-3">
                                    <Card className="h-100">
                                        <CardBody>
                                            <CardTitle tag="h5" className="d-flex align-items-center mb-3">
                                                <FaShieldAlt className="me-2 text-danger" /> Blocked Sources
                                            </CardTitle>
                                            {renderBlacklistedSources()}
                                        </CardBody>
                                    </Card>
                                </Col>
                                <Col md="6" className="mb-3">
                                    <Card className="h-100">
                                        <CardBody>
                                            <CardTitle tag="h5" className="d-flex align-items-center mb-3">
                                                <FaNewspaper className="me-2 text-danger" /> Blocked Categories
                                            </CardTitle>
                                            {renderBlacklistedCategories()}
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                            <Row>
                                <Col md="6" className="mb-3">
                                    <Card className="h-100">
                                        <CardBody>
                                            <CardTitle tag="h5" className="d-flex align-items-center mb-3">
                                                <FaBookmark className="me-2 text-primary" /> Favorite Articles
                                            </CardTitle>
                                            {renderFavoriteArticles()}
                                        </CardBody>
                                    </Card>
                                </Col>
                                <Col md="6" className="mb-3">
                                    <Card className="h-100">
                                        <CardBody>
                                            <CardTitle tag="h5" className="d-flex align-items-center mb-3">
                                                <FaBan className="me-2 text-danger" /> Hidden Articles
                                            </CardTitle>
                                            {renderBlacklistedArticles()}
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <FormGroup>
                                <Label for="username">Username</Label>
                                <Input
                                    type="text"
                                    name="username"
                                    id="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    invalid={!!errors.username}
                                    required
                                />
                                {errors.username && (
                                    <div className="text-danger mt-1">{errors.username}</div>
                                )}
                            </FormGroup>
                            <FormGroup>
                                <Label for="name">Name</Label>
                                <Input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="email">Email</Label>
                                <Input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    invalid={!!errors.email}
                                    required
                                />
                                {errors.email && (
                                    <div className="text-danger mt-1">{errors.email}</div>
                                )}
                            </FormGroup>
                        </Form>
                    )}
                </ModalBody>
                <ModalFooter>
                    {!isEditing ? (
                        <>
                            <Button color="primary" onClick={handleStartEditing}>
                                Edit Profile
                            </Button>
                            <Button color="danger" onClick={toggleSettings}>
                                Account Settings
                            </Button>
                            <Button color="secondary" onClick={toggle}>
                                Close
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button color="primary" onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button color="secondary" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                        </>
                    )}
                </ModalFooter>
            </Modal>

            {showSettings && (
                <SettingsModal
                    isOpen={showSettings}
                    toggle={() => {
                        toggleSettings();
                        // Don't close the profile modal when settings closes
                    }}
                />
            )}

            {/* Unblock Source Confirmation Modal */}
            <Modal isOpen={unblockModal} toggle={cancelUnblock} size="sm">
                <ModalHeader toggle={cancelUnblock}>
                    Unblock Source
                </ModalHeader>
                <ModalBody>
                    Are you sure you want to unblock <strong>{selectedSource?.name}</strong>?
                    Articles from this source will appear in your feed again.
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onClick={confirmUnblock}
                        disabled={unblockLoading}
                    >
                        {unblockLoading ? <Spinner size="sm" /> : 'Yes, Unblock'}
                    </Button>
                    <Button
                        color="secondary"
                        onClick={cancelUnblock}
                        disabled={unblockLoading}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Unblock Category Confirmation Modal */}
            <Modal isOpen={unblockCategoryModal} toggle={cancelUnblockCategory} size="sm">
                <ModalHeader toggle={cancelUnblockCategory}>
                    Unblock Category
                </ModalHeader>
                <ModalBody>
                    Are you sure you want to unblock <strong>{selectedCategory?.category?.name}</strong>?
                    Articles from this category will appear in your feed again.
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onClick={confirmUnblockCategory}
                        disabled={unblockCategoryLoading}
                    >
                        {unblockCategoryLoading ? <Spinner size="sm" /> : 'Yes, Unblock'}
                    </Button>
                    <Button
                        color="secondary"
                        onClick={cancelUnblockCategory}
                        disabled={unblockCategoryLoading}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
}

export default ProfileModal;
