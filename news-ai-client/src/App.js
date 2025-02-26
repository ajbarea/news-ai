import React, { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy load components
const HomePage = lazy(() => import('./components/HomePage'));
const ArticlePage = lazy(() => import('./components/ArticlePage'));
const About = lazy(() => import('./components/About'));
const Categories = lazy(() => import('./components/Categories'));
const NotFound = lazy(() => import('./components/NotFound'));

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all duration-300">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;