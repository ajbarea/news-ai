import React, { useState, useEffect } from 'react';
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
    Alert
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SettingsModal from './SettingsModal';

function ProfileModal({ isOpen, toggle }) {
    const { currentUser, updateProfile } = useAuth();
    const navigate = useNavigate();
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

    useEffect(() => {
        if (currentUser) {
            const userData = {
                username: currentUser.username || '',
                email: currentUser.email || '',
                name: currentUser.name || ''
            };
            setFormData(userData);
            setOriginalData(userData);
        }
    }, [currentUser, isOpen]);

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
                        <div className="text-center mb-4">
                            <div className="mb-3">
                                <div className="d-inline-block bg-light rounded-circle p-3 mb-2" style={{ width: '120px', height: '120px' }}>
                                    <span className="display-4">
                                        {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                            </div>
                            <h3>{currentUser?.name || currentUser?.username}</h3>
                            <p className="text-muted">{currentUser?.email}</p>

                            <Row className="mt-4">
                                <Col md="6" className="mb-3">
                                    <div className="border rounded p-3">
                                        <h5>Joined</h5>
                                        <p className="mb-0">{new Date().toLocaleDateString()}</p>
                                    </div>
                                </Col>
                                <Col md="6" className="mb-3">
                                    <div className="border rounded p-3">
                                        <h5>Reading Preferences</h5>
                                        <p className="mb-0">
                                            {currentUser?.preferences?.join(', ') || 'No preferences set'}
                                        </p>
                                    </div>
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
                            <Button color="info" onClick={toggleSettings}>
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
        </>
    );
}

export default ProfileModal;
