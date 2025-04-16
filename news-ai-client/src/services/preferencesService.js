// Service for managing user preferences

const savePreferences = (preferences) => {
  localStorage.setItem('user_preferences', JSON.stringify(preferences));
  return true;
};

const loadPreferences = () => {
  const defaultPreferences = {
    categories: ['Technology', 'Sports'],
    sources: ['CNN', 'BBC'],
    darkMode: true
  };
  
  try {
    const savedPreferences = JSON.parse(localStorage.getItem('user_preferences'));
    return savedPreferences || defaultPreferences;
  } catch (error) {
    return defaultPreferences;
  }
};

export default {
  savePreferences,
  loadPreferences
};
