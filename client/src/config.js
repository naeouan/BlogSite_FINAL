const isLocalhost = window.location.hostname === 'localhost';
export const API_URL = isLocalhost 
  ? 'http://localhost:4000' 
  : 'https://dota2blogsite-1.onrender.com';
