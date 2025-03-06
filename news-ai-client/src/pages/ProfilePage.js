import React, { useState, useEffect } from 'react';
import { Container } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '../components/ProfileModal';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is authenticated
        if (!isAuthenticated()) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
        if (!isModalOpen === false) {
            // Redirect to homepage when modal is closed
            navigate('/');
        }
    };

    return (
        <Container>
            <ProfileModal isOpen={isModalOpen} toggle={toggleModal} />
        </Container>
    );
}

export default ProfilePage;
