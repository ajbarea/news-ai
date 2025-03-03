import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { useAuth } from '../context/AuthContext';

const CategoryDropdown = () => (
  <UncontrolledDropdown nav inNavbar>
    <DropdownToggle nav caret>Categories</DropdownToggle>
    <DropdownMenu>
      {['Politics', 'Technology', 'Sports'].map(category => (
        <DropdownItem key={category} tag={Link} to={`/article/1`}>{category}</DropdownItem>
      ))}
      <DropdownItem divider />
      <DropdownItem tag={Link} to="/categories">All Categories</DropdownItem>
    </DropdownMenu>
  </UncontrolledDropdown>
);

const UserDropdown = ({ username, onLogout }) => (
  <UncontrolledDropdown nav inNavbar>
    <DropdownToggle nav caret>{username || 'User'}</DropdownToggle>
    <DropdownMenu end>
      <DropdownItem tag={Link} to="/profile">Profile</DropdownItem>
      <DropdownItem tag={Link} to="/settings">Settings</DropdownItem>
      <DropdownItem divider />
      <DropdownItem onClick={onLogout}>
        <span className="text-danger">Logout</span>
      </DropdownItem>
    </DropdownMenu>
  </UncontrolledDropdown>
);

function NavbarComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isUserAuthenticated = isAuthenticated();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
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
              <CategoryDropdown />
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
            />
          </Nav>
        )}
      </Collapse>
    </Navbar>
  );
}

export default NavbarComponent;
