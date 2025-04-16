import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../components/Header';

// Mock the Link component from react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ to, children }) => (
    <a href={to} data-testid={`link-${to}`}>
      {children}
    </a>
  )
}));

describe('Header Component', () => {
  test('renders the header component with title', () => {
    render(<Header />);
    expect(screen.getByRole('heading', { name: /news-ai/i })).toBeInTheDocument();
  });
  
  test('renders the navigation menu', () => {
    render(<Header />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBe(2);
  });
  
  test('contains link to home page', () => {
    render(<Header />);
    const homeLink = screen.getByText(/home/i);
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });
  
  test('contains link to about page', () => {
    render(<Header />);
    const aboutLink = screen.getByText(/about/i);
    expect(aboutLink).toBeInTheDocument();
    expect(aboutLink.closest('a')).toHaveAttribute('href', '/about');
  });
});
