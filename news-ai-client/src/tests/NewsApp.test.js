import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewsApp from '../components/NewsApp';

// Mock react-router
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ path, element }) => <div data-testid={`route-${path}`}>{element}</div>
}));

// Mock child components
jest.mock('../components/Header', () => () => <div data-testid="header">Header Component</div>);
jest.mock('../pages/Home', () => () => <div data-testid="home">Home Page</div>);
jest.mock('../pages/About', () => () => <div data-testid="about">About Page</div>);
jest.mock('../pages/NotFound', () => () => <div data-testid="not-found">Not Found Page</div>);

describe('NewsApp Component', () => {
  test('renders the app structure with router', () => {
    render(<NewsApp />);
    
    expect(screen.getByTestId('router')).toBeInTheDocument();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  test('includes route for home page', () => {
    render(<NewsApp />);
    
    expect(screen.getByTestId('route-/')).toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  test('includes route for about page', () => {
    render(<NewsApp />);
    
    expect(screen.getByTestId('route-/about')).toBeInTheDocument();
    expect(screen.getByText('About Page')).toBeInTheDocument();
  });

  test('includes catch-all route for not found page', () => {
    render(<NewsApp />);
    
    expect(screen.getByTestId('route-*')).toBeInTheDocument();
    expect(screen.getByText('Not Found Page')).toBeInTheDocument();
  });
});
