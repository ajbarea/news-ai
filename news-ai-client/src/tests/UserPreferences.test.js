import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserPreferences from '../components/UserPreferences';

// Mock preference storage
const mockSavePreferences = jest.fn();
const mockLoadPreferences = jest.fn();

jest.mock('../services/preferencesService', () => ({
  savePreferences: (...args) => mockSavePreferences(...args),
  loadPreferences: () => mockLoadPreferences()
}));

describe('UserPreferences Component', () => {
  beforeEach(() => {
    mockSavePreferences.mockReset();
    mockLoadPreferences.mockReset();
    mockLoadPreferences.mockReturnValue({
      categories: ['Technology', 'Sports'],
      sources: ['CNN', 'BBC'],
      darkMode: true
    });
  });

  test('loads and displays user preferences', () => {
    render(<UserPreferences />);
    
    // Check that preferences are loaded and displayed
    expect(screen.getByText(/Technology/i)).toBeInTheDocument();
    expect(screen.getByText(/Sports/i)).toBeInTheDocument();
    expect(screen.getByText(/CNN/i)).toBeInTheDocument();
    expect(screen.getByText(/BBC/i)).toBeInTheDocument();
  });

  test('allows adding new category preference', () => {
    render(<UserPreferences />);
    
    const categoryInput = screen.getByPlaceholderText(/add category/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    fireEvent.change(categoryInput, { target: { value: 'Business' } });
    fireEvent.click(addButton);
    
    expect(screen.getByText(/Business/i)).toBeInTheDocument();
  });

  test('allows toggling dark mode preference', () => {
    render(<UserPreferences />);
    
    const darkModeToggle = screen.getByRole('checkbox', { name: /dark mode/i });
    
    // Initially should be checked based on our mock
    expect(darkModeToggle).toBeChecked();
    
    // Toggle it off
    fireEvent.click(darkModeToggle);
    expect(darkModeToggle).not.toBeChecked();
  });

  test('saves preferences when form is submitted', () => {
    render(<UserPreferences />);
    
    const saveButton = screen.getByRole('button', { name: /save preferences/i });
    fireEvent.click(saveButton);
    
    expect(mockSavePreferences).toHaveBeenCalled();
    // Note: The exact value passed would depend on component implementation
  });
});
