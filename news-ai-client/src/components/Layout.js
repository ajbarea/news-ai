import React from 'react';
import NavbarComponent from './Navbar';
import Footer from './Footer';
import { Container } from 'reactstrap';

function Layout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavbarComponent />
      <main className="flex-grow-1">
        <Container className="py-5 mt-3">
          {children}
        </Container>
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
