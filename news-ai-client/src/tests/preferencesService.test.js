import '@testing-library/jest-dom';
import preferencesService from '../services/preferencesService';

describe('Preferences Service', () => {
  // Mock localStorage before each test
  let mockStorage = {};
  
  beforeEach(() => {
    mockStorage = {};
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(key => mockStorage[key] || null),
        setItem: jest.fn((key, value) => {
          mockStorage[key] = value.toString();
        }),
        removeItem: jest.fn(key => {
          delete mockStorage[key];
        }),
        clear: jest.fn(() => {
          mockStorage = {};
        })
      },
      writable: true
    });
  });
  
  test('savePreferences stores preferences in localStorage', () => {
    const testPreferences = {
      categories: ['Sports', 'Technology'],
      sources: ['ESPN', 'Wired'],
      darkMode: false
    };
    
    const result = preferencesService.savePreferences(testPreferences);
    
    expect(result).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'user_preferences', 
      JSON.stringify(testPreferences)
    );
  });
  
  test('loadPreferences returns saved preferences when they exist', () => {
    const testPreferences = {
      categories: ['Politics', 'Business'],
      sources: ['CNN', 'Bloomberg'],
      darkMode: true
    };
    mockStorage['user_preferences'] = JSON.stringify(testPreferences);
    
    const preferences = preferencesService.loadPreferences();
    
    expect(localStorage.getItem).toHaveBeenCalledWith('user_preferences');
    expect(preferences).toEqual(testPreferences);
  });
  
  test('loadPreferences returns default preferences when none are saved', () => {
    const preferences = preferencesService.loadPreferences();
    
    expect(localStorage.getItem).toHaveBeenCalledWith('user_preferences');
    expect(preferences).toEqual({
      categories: ['Technology', 'Sports'],
      sources: ['CNN', 'BBC'],
      darkMode: true
    });
  });
  
  test('loadPreferences handles invalid JSON in localStorage', () => {
    mockStorage['user_preferences'] = 'invalid-json';
    
    const preferences = preferencesService.loadPreferences();
    
    expect(localStorage.getItem).toHaveBeenCalledWith('user_preferences');
    expect(preferences).toEqual({
      categories: ['Technology', 'Sports'],
      sources: ['CNN', 'BBC'],
      darkMode: true
    });
  });
});
