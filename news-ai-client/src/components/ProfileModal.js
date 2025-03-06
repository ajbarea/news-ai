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
    Row,
    Col,
    Alert
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';

function ProfileModal({ isOpen, toggle }) {
    const { currentUser, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        username: currentUser?.username || '',
        email: currentUser?.email || '',
        name: currentUser?.name || '',
        preferences: currentUser?.preferences || []
    });
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'danger', text: 'Failed to update profile. Please try again.' });
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
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
                                required
                            />
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
                                required
                            />
                        </FormGroup>
                    </Form>
                )}
            </ModalBody>
            <ModalFooter>
                {!isEditing ? (
                    <>
                        <Button color="primary" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </Button>
                        <Button color="secondary" onClick={toggle}>
                            Close
                        </Button>
                    </>
                ) : (
                    <>
                        <Button color="primary" onClick={handleSubmit}>
                            Save Changes
                        </Button>
                        <Button color="secondary" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                    </>
                )}
            </ModalFooter>
        </Modal>
    );
}

export default ProfileModal;
