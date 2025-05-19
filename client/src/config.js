const isLocalhost = window.location.hostname === 'localhost';
export const API_URL = isLocalhost 
  ? 'http://localhost:4000' 
  : 'https://blogsite-final-api.onrender.com';