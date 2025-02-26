import React from 'react';
import NavbarComponent from './Navbar';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <NavbarComponent />
      <main className="flex-shrink-0 flex-grow-1">
        <div className="pt-5 mt-3">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
