import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/authService';
import SettingsModal from './SettingsModal';
import ProfileModal from './ProfileModal';

const CategoryDropdown = ({ categories = [] }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleRef = useRef(null);
  const navigate = useNavigate();

  const toggle = () => setDropdownOpen(prevState => !prevState);

  const handleMenuClose = (action) => {
    setDropdownOpen(false);
    // Return focus to toggle button when menu closes
    if (toggleRef.current) {
      toggleRef.current.focus();
    }
    // Execute action if provided
    if (action) {
      action();
    }
  };

  // Handle category selection
  const handleCategoryClick = (categoryId, event) => {
    event.preventDefault();
    navigate(`/categories?category=${categoryId}`);
    handleMenuClose();
  };

  // Handle "All Categories" click
  const handleAllCategoriesClick = (event) => {
    event.preventDefault();

    // Navigate to categories page with replace:true (replaces current history entry)
    navigate('/categories', { replace: true });

    // Dispatch a custom event that Categories.js can listen for to reset its state
    window.dispatchEvent(new CustomEvent('categoriesReset'));

    handleMenuClose();
  };

  // Fallback to default categories if none are provided or fewer than 3
  const displayCategories = categories.length > 0 ? categories : [
    { id: 7, name: 'Politics', icon: '🏛️', color: 'secondary' },
    { id: 4, name: 'Sports', icon: '🏈', color: 'danger' },
    { id: 5, name: 'Entertainment', icon: '🎭', color: 'warning' }
  ];

  return (
    <Dropdown nav isOpen={dropdownOpen} toggle={toggle}>
      <DropdownToggle nav caret innerRef={toggleRef}>
        {categories.length > 0 ? 'Your Categories' : 'Categories'}
      </DropdownToggle>
      <DropdownMenu>
        {displayCategories.map(category => (
          <DropdownItem
            key={category.id}
            tag="a"
            href={`/categories?category=${category.id}`}
            onClick={(e) => handleCategoryClick(category.id, e)}
          >
            {category.icon && <span className="me-2">{category.icon}</span>}
            {category.name}
          </DropdownItem>
        ))}
        <DropdownItem divider />
        <DropdownItem
          tag="a"
          href="/categories"
          onClick={handleAllCategoriesClick}
        >
          All Categories
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

const UserDropdown = ({ username, onLogout, onOpenSettings, onOpenProfile }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleRef = useRef(null);

  const toggle = () => setDropdownOpen(prevState => !prevState);

  const handleMenuClose = (action) => {
    setDropdownOpen(false);
    if (toggleRef.current) {
      toggleRef.current.focus();
    }
    if (action) {
      action();
    }
  };

  return (
    <Dropdown nav isOpen={dropdownOpen} toggle={toggle}>
      <DropdownToggle nav caret innerRef={toggleRef}>{username || 'User'}</DropdownToggle>
      <DropdownMenu end>
        <DropdownItem onClick={() => handleMenuClose(onOpenProfile)}>Profile</DropdownItem>
        <DropdownItem onClick={() => handleMenuClose(onOpenSettings)}>Settings</DropdownItem>
        <DropdownItem divider />
        <DropdownItem onClick={() => handleMenuClose(onLogout)}>
          <span className="text-danger">Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

function NavbarComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [topCategories, setTopCategories] = useState([]);
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isUserAuthenticated = isAuthenticated();

  // Memoize fetchTopCategories function with useCallback
  const fetchTopCategories = useCallback(async () => {
    try {
      if (isUserAuthenticated && currentUser?.id) {
        const response = await apiClient.get(`/users/${currentUser.id}/preferences`);

        if (Array.isArray(response.data)) {
          // Sort preferences by score (highest first) and take top 3
          const sortedPreferences = [...response.data]
            .sort((a, b) => b.score - a.score)
            .filter(pref => pref.category && !pref.blacklisted && pref.score > 0) // Only include categories with positive score
            .slice(0, 3);

          // Extract just the category objects from preferences
          const topCats = sortedPreferences.map(pref => pref.category);

          console.log("User's top categories:", topCats);
          setTopCategories(topCats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user preferences:", err);
    }
  }, [isUserAuthenticated, currentUser]);

  // Fetch top categories on component mount or when auth status changes
  useEffect(() => {
    fetchTopCategories();
  }, [fetchTopCategories]);

  // Listen for the userPreferencesChanged event
  useEffect(() => {
    const handlePreferencesChanged = () => {
      console.log("Preferences changed event detected, refreshing top categories");
      fetchTopCategories();
    };

    // Add event listener
    window.addEventListener('userPreferencesChanged', handlePreferencesChanged);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('userPreferencesChanged', handlePreferencesChanged);
    };
  }, [fetchTopCategories]); // Add fetchTopCategories to dependencies array

  // Listen for the openProfileModal event (triggered when someone navigates to /profile)
  useEffect(() => {
    const handleOpenProfileModal = () => {
      setShowProfileModal(true);
    };

    // Add event listener
    window.addEventListener('openProfileModal', handleOpenProfileModal);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('openProfileModal', handleOpenProfileModal);
    };
  }, []); // Empty dependency array ensures this only runs once at component mount

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSettingsModal = () => {
    setShowSettingsModal(!showSettingsModal);
  };

  const toggleProfileModal = () => {
    setShowProfileModal(!showProfileModal);
  };

  return (
    <>
      <Navbar color="light" light expand="md" fixed="top" container>
        <NavbarBrand tag={Link} to="/">
          <span className="me-2" aria-label="News">📰</span>
          News-AI
        </NavbarBrand>
        <NavbarToggler onClick={() => setIsOpen(!isOpen)} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="me-auto" navbar>
            {!isAuthPage && (
              <>
                <NavItem>
                  <NavLink tag={Link} to="/">Home</NavLink>
                </NavItem>
                <CategoryDropdown categories={topCategories} />
              </>
            )}
            <NavItem>
              <NavLink tag={Link} to="/about">About</NavLink>
            </NavItem>
          </Nav>

          {isUserAuthenticated && (
            <Nav navbar className="ms-auto">
              <UserDropdown
                username={currentUser?.username}
                onLogout={handleLogout}
                onOpenSettings={toggleSettingsModal}
                onOpenProfile={toggleProfileModal}
              />
            </Nav>
          )}
        </Collapse>
      </Navbar>

      <SettingsModal
        isOpen={showSettingsModal}
        toggle={toggleSettingsModal}
      />

      <ProfileModal
        isOpen={showProfileModal}
        toggle={toggleProfileModal}
      />
    </>
  );
}

export default NavbarComponent;
