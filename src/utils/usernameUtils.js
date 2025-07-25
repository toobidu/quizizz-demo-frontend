/**
 * Username Utilities
 * 
 * This file contains utilities for getting username consistently
 * across the application with multiple fallback strategies.
 */

/**
 * Gets the current user's username with multiple fallback strategies
 * @returns {string} The username
 */
export const getUsername = () => {
  console.log('🔍 [USERNAME_UTILS] === GETTING USERNAME ===');
  
  // Strategy 1: Try localStorage directly
  let username = localStorage.getItem('username');
  console.log('🔍 [USERNAME_UTILS] localStorage username:', username);
  
  if (username) {
    console.log('🔍 [USERNAME_UTILS] ✅ Found username in localStorage');
    return username;
  }
  
  // Strategy 2: Try to extract from JWT token
  try {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      username = payload.username || payload.name || payload.sub || payload.userName;
      
      if (username) {
        console.log('🔍 [USERNAME_UTILS] ✅ Found username in JWT token:', username);
        // Save to localStorage for future use
        localStorage.setItem('username', username);
        return username;
      }
    }
  } catch (error) {
    console.warn('🔍 [USERNAME_UTILS] ❌ Could not extract username from token:', error);
  }
  
  // Strategy 3: Try to get from user object in localStorage
  try {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user = JSON.parse(userJson);
      username = user.username || user.name || user.userName;
      
      if (username) {
        console.log('🔍 [USERNAME_UTILS] ✅ Found username in user object:', username);
        localStorage.setItem('username', username);
        return username;
      }
    }
  } catch (error) {
    console.warn('🔍 [USERNAME_UTILS] ❌ Could not extract username from user object:', error);
  }
  
  // Strategy 4: Try to get from zustand store state
  try {
    const storeKeys = ['user-store', 'userStore', 'auth-store'];
    for (const key of storeKeys) {
      const storeJson = localStorage.getItem(key);
      if (storeJson) {
        const store = JSON.parse(storeJson);
        username = store?.state?.userName || store?.state?.username || store?.userName || store?.username;
        
        if (username) {
          console.log('🔍 [USERNAME_UTILS] ✅ Found username in store:', username);
          localStorage.setItem('username', username);
          return username;
        }
      }
    }
  } catch (error) {
    console.warn('🔍 [USERNAME_UTILS] ❌ Could not extract username from store:', error);
  }
  
  // Strategy 5: Generate fallback username
  const userId = localStorage.getItem('userId');
  if (userId) {
    username = `User_${userId}`;
    console.warn('🔍 [USERNAME_UTILS] ⚠️ Using generated username based on userId:', username);
  } else {
    username = `Guest_${Date.now()}`;
    console.warn('🔍 [USERNAME_UTILS] ⚠️ Using guest username:', username);
  }
  
  // Save generated username
  localStorage.setItem('username', username);
  return username;
};

/**
 * Ensures username is set and returns it
 * @returns {string} The username (guaranteed to be non-empty)
 */
export const ensureUsername = () => {
  const username = getUsername();
  
  if (!username || username.trim() === '') {
    const fallback = `Guest_${Date.now()}`;
    localStorage.setItem('username', fallback);
    console.warn('🔍 [USERNAME_UTILS] ⚠️ Username was empty, using fallback:', fallback);
    return fallback;
  }
  
  return username;
};

/**
 * Sets username in localStorage and validates it
 * @param {string} username - The username to set
 * @returns {boolean} True if successfully set
 */
export const setUsername = (username) => {
  if (!username || typeof username !== 'string' || username.trim() === '') {
    console.error('🔍 [USERNAME_UTILS] ❌ Invalid username provided:', username);
    return false;
  }
  
  const trimmedUsername = username.trim();
  localStorage.setItem('username', trimmedUsername);
  console.log('🔍 [USERNAME_UTILS] ✅ Username set successfully:', trimmedUsername);
  return true;
};

export default {
  getUsername,
  ensureUsername,
  setUsername
};
