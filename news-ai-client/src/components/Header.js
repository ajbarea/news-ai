import React from 'react';
import { Link } from 'react-router-dom';
import { fetchData } from 'HomePage.js';

const Header = () => {
  return (
    <header>
      <h1>News-AI</h1>
      <nav>
        <ul>
          <li><Link to="/" onClick={fetchData}>Home</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
