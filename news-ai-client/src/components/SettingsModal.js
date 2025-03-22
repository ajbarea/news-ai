import React, { useState } from 'react';
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
    Card,
    CardBody,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/authService';
import AlertMessage from '../components/AlertMessage';

function SettingsModal({ isOpen, toggle }) {
    // State for the different operations
    const [activeTab, setActiveTab] = useState('password'); // 'password' or 'delete'
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    // UI state
    const [message, setMessage] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'current_password' || name === 'new_password' || name === 'confirm_password') {
            setPasswordData(prev => ({ ...prev, [name]: value }));
            // Clear errors for this field
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: null }));
            }
        } else if (name === 'delete_confirmation') {
            setDeleteConfirmation(value);
            if (errors.delete) {
                setErrors(prev => ({ ...prev, delete: null }));
            }
        }
    };

    // Handle password change
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        // Validate password inputs
        const newErrors = {};
        if (!passwordData.current_password) {
            newErrors.current_password = 'Current password is required';
        }
        if (!passwordData.new_password) {
            newErrors.new_password = 'New password is required';
        }
        if (passwordData.new_password && passwordData.new_password.length < 6) {
            newErrors.new_password = 'Password must be at least 6 characters long';
        }
        if (passwordData.new_password !== passwordData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Submit password change request
        setIsSubmitting(true);
        try {
            await apiClient.post('/users/me/change-password', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });

            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Password change error:', error);
            if (error.response?.status === 400) {
                setMessage({
                    type: 'danger',
                    text: error.response?.data?.detail || 'Failed to change password'
                });
            } else {
                setMessage({ type: 'danger', text: 'Server error. Please try again later.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle account deletion
    const handleAccountDelete = async () => {
        if (deleteConfirmation !== currentUser.username) {
            setErrors({
                delete: 'Please type your username to confirm deletion'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await apiClient.delete('/users/me');

            // Log the user out and redirect to home
            logout();
            setMessage({ type: 'success', text: 'Your account has been deleted successfully.' });

            // Wait a bit before redirecting
            setTimeout(() => {
                toggle(); // Close the modal
                navigate('/'); // Redirect to home
            }, 2000);
        } catch (error) {
            console.error('Account deletion error:', error);
            setMessage({ type: 'danger', text: 'Failed to delete your account. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                Account Settings
            </ModalHeader>
            <ModalBody>
                <AlertMessage
                    message={message?.text}
                    type={message?.type}
                    autoDismiss={message?.type === 'success'}
                    onDismiss={() => setMessage(null)}
                />

                <Nav tabs className="mb-4">
                    <NavItem>
                        <NavLink
                            className={activeTab === 'password' ? 'active' : ''}
                            onClick={() => setActiveTab('password')}
                            style={{ cursor: 'pointer' }}
                        >
                            Change Password
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={activeTab === 'delete' ? 'active' : ''}
                            onClick={() => setActiveTab('delete')}
                            style={{ cursor: 'pointer', color: '#dc3545' }}
                        >
                            Delete Account
                        </NavLink>
                    </NavItem>
                </Nav>

                <TabContent activeTab={activeTab}>
                    <TabPane tabId="password">
                        <Form onSubmit={handlePasswordChange}>
                            <FormGroup>
                                <Label for="current_password">Current Password</Label>
                                <Input
                                    type="password"
                                    name="current_password"
                                    id="current_password"
                                    value={passwordData.current_password}
                                    onChange={handleInputChange}
                                    invalid={!!errors.current_password}
                                />
                                {errors.current_password && (
                                    <div className="text-danger mt-1">{errors.current_password}</div>
                                )}
                            </FormGroup>
                            <FormGroup>
                                <Label for="new_password">New Password</Label>
                                <Input
                                    type="password"
                                    name="new_password"
                                    id="new_password"
                                    value={passwordData.new_password}
                                    onChange={handleInputChange}
                                    invalid={!!errors.new_password}
                                />
                                {errors.new_password && (
                                    <div className="text-danger mt-1">{errors.new_password}</div>
                                )}
                            </FormGroup>
                            <FormGroup>
                                <Label for="confirm_password">Confirm New Password</Label>
                                <Input
                                    type="password"
                                    name="confirm_password"
                                    id="confirm_password"
                                    value={passwordData.confirm_password}
                                    onChange={handleInputChange}
                                    invalid={!!errors.confirm_password}
                                />
                                {errors.confirm_password && (
                                    <div className="text-danger mt-1">{errors.confirm_password}</div>
                                )}
                            </FormGroup>
                            <Button
                                color="primary"
                                type="submit"
                                disabled={isSubmitting}
                                block
                            >
                                {isSubmitting ? 'Updating...' : 'Update Password'}
                            </Button>
                        </Form>
                    </TabPane>
                    <TabPane tabId="delete">
                        <Card className="border-danger mb-3">
                            <CardBody>
                                <h5 className="text-danger">Warning: This action is permanent</h5>
                                <p>Deleting your account will:</p>
                                <ul>
                                    <li>Permanently remove your profile</li>
                                    <li>Delete all your saved preferences</li>
                                    <li>Remove all your data from our servers</li>
                                </ul>
                                <p>This action <strong>cannot be reversed</strong>.</p>
                            </CardBody>
                        </Card>

                        <FormGroup>
                            <Label for="delete_confirmation">
                                To confirm deletion, please type your username: <strong>{currentUser?.username}</strong>
                            </Label>
                            <Input
                                type="text"
                                name="delete_confirmation"
                                id="delete_confirmation"
                                value={deleteConfirmation}
                                onChange={handleInputChange}
                                invalid={!!errors.delete}
                            />
                            {errors.delete && (
                                <div className="text-danger mt-1">{errors.delete}</div>
                            )}
                        </FormGroup>
                        <Button
                            color="danger"
                            onClick={handleAccountDelete}
                            disabled={isSubmitting || deleteConfirmation !== currentUser?.username}
                            block
                        >
                            {isSubmitting ? 'Processing...' : 'Permanently Delete My Account'}
                        </Button>
                    </TabPane>
                </TabContent>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
}

export default SettingsModal;
