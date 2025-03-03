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

function NavbarComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current page is login or register
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  const toggle = () => setIsOpen(!isOpen);

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
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="me-auto" navbar>
          {/* Only show Home and Categories when not on login/register pages */}
          {!isAuthPage && (
            <>
              <NavItem>
                <NavLink tag={Link} to="/">
                  Home
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Categories
                </DropdownToggle>
                <DropdownMenu end>
                  <DropdownItem tag={Link} to="/article/1">Politics</DropdownItem>
                  <DropdownItem tag={Link} to="/article/1">Technology</DropdownItem>
                  <DropdownItem tag={Link} to="/article/1">Sports</DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem tag={Link} to="/categories">All Categories</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </>
          )}

          {/* Always show About link */}
          <NavItem>
            <NavLink tag={Link} to="/about">
              About
            </NavLink>
          </NavItem>
        </Nav>

        {/* Only show user dropdown when authenticated */}
        {isAuthenticated() && (
          <Nav navbar className="ms-auto">
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                {currentUser?.username || 'User'}
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem tag={Link} to="/profile">Profile</DropdownItem>
                <DropdownItem tag={Link} to="/settings">Settings</DropdownItem>
                <DropdownItem divider />
                <DropdownItem onClick={handleLogout}>
                  <span className="text-danger">Logout</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        )}
      </Collapse>
    </Navbar>
  );
}

export default NavbarComponent;
