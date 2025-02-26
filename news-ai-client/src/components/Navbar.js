import React, { useState } from 'react';
import { Link } from "react-router-dom";
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
  DropdownItem
} from 'reactstrap';

function NavbarComponent() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <Navbar color="light" light expand="md" fixed="top" container>
      <NavbarBrand tag={Link} to="/">
        <span className="me-2" aria-label="News">📰</span>
        News-AI
      </NavbarBrand>
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="me-auto" navbar>
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
              <DropdownItem tag={Link} to="/category/politics">Politics</DropdownItem>
              <DropdownItem tag={Link} to="/category/technology">Technology</DropdownItem>
              <DropdownItem tag={Link} to="/category/sports">Sports</DropdownItem>
              <DropdownItem divider />
              <DropdownItem tag={Link} to="/categories">All Categories</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
          <NavItem>
            <NavLink tag={Link} to="/about">
              About
            </NavLink>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  );
}

export default NavbarComponent;
