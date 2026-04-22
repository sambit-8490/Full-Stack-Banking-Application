/**
 * JWT Utility Functions
 * 
 * This file contains utility functions for handling JWT tokens on the frontend:
 * - Decoding JWT tokens to extract payload information
 * - Checking token expiration
 * - Extracting user information from tokens
 */

/**
 * Decodes a JWT token to extract its payload
 * @param {string} token - The JWT token to decode
 * @returns {Object|null} The decoded payload or null if invalid
 */
export const decodeJWT = (token) => {
     try {
          if (!token) return null;

          // JWT has three parts separated by dots: header.payload.signature
          const parts = token.split('.');
          if (parts.length !== 3) return null;

          // Decode the payload (second part)
          const payload = parts[1];

          // Add padding if needed for proper base64 decoding
          const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);

          // Decode from base64 and parse JSON
          const decoded = JSON.parse(atob(paddedPayload));
          return decoded;
     } catch (error) {
          console.error('Error decoding JWT token:', error);
          return null;
     }
};

/**
 * Checks if a JWT token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} True if token is expired, false otherwise
 */
export const isTokenExpired = (token) => {
     const decoded = decodeJWT(token);
     if (!decoded || !decoded.exp) return true;

     // exp is in seconds, Date.now() is in milliseconds
     const currentTime = Date.now() / 1000;
     return decoded.exp < currentTime;
};

/**
 * Gets the username from a JWT token
 * @param {string} token - The JWT token
 * @returns {string|null} The username or null if not found
 */
export const getUsernameFromToken = (token) => {
     const decoded = decodeJWT(token);
     return decoded?.sub || null;
};

/**
 * Gets the expiration time of a JWT token
 * @param {string} token - The JWT token
 * @returns {Date|null} The expiration date or null if not found
 */
export const getTokenExpiration = (token) => {
     const decoded = decodeJWT(token);
     if (!decoded?.exp) return null;

     // Convert from seconds to milliseconds
     return new Date(decoded.exp * 1000);
};

/**
 * Gets the time remaining until token expiration
 * @param {string} token - The JWT token
 * @returns {number} Time remaining in milliseconds, or 0 if expired
 */
export const getTimeUntilExpiration = (token) => {
     const expiration = getTokenExpiration(token);
     if (!expiration) return 0;

     const timeRemaining = expiration.getTime() - Date.now();
     return Math.max(0, timeRemaining);
};

/**
 * Checks if a token will expire within a specified time
 * @param {string} token - The JWT token
 * @param {number} minutes - Minutes to check ahead
 * @returns {boolean} True if token expires within the specified time
 */
export const willTokenExpireSoon = (token, minutes = 5) => {
     const timeRemaining = getTimeUntilExpiration(token);
     const minutesInMs = minutes * 60 * 1000;
     return timeRemaining <= minutesInMs;
};
