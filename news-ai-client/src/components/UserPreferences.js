import React, { useState, useEffect } from 'react';
import preferencesService from '../services/preferencesService';

const UserPreferences = () => {
  const [preferences, setPreferences] = useState({
    categories: [],
    sources: [],
    darkMode: false
  });
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const loadUserPreferences = () => {
      const userPreferences = preferencesService.loadPreferences();
      setPreferences(userPreferences);
    };
    
    loadUserPreferences();
  }, []);

  const handleAddCategory = () => {
    if (newCategory && !preferences.categories.includes(newCategory)) {
      const updatedPreferences = {
        ...preferences,
        categories: [...preferences.categories, newCategory]
      };
      setPreferences(updatedPreferences);
      setNewCategory('');
    }
  };

  const handleDarkModeToggle = () => {
    const updatedPreferences = {
      ...preferences,
      darkMode: !preferences.darkMode
    };
    setPreferences(updatedPreferences);
  };

  const handleSavePreferences = () => {
    preferencesService.savePreferences(preferences);
  };

  return (
    <div>
      <h2>Your Preferences</h2>
      
      <div>
        <h3>Categories</h3>
        <ul>
          {preferences.categories.map((category, index) => (
            <li key={index}>{category}</li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="Add category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button onClick={handleAddCategory}>Add</button>
      </div>
      
      <div>
        <h3>Sources</h3>
        <ul>
          {preferences.sources.map((source, index) => (
            <li key={index}>{source}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={preferences.darkMode}
            onChange={handleDarkModeToggle}
            aria-label="Dark Mode"
          />
          Dark Mode
        </label>
      </div>
      
      <button onClick={handleSavePreferences}>Save Preferences</button>
    </div>
  );
};

export default UserPreferences;
