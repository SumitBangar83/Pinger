import axios from 'axios';

// Axios ka ek instance banayein jismein backend ka base URL set ho
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
});

// Login API call ke liye function
export const loginUser = async (email, password) => {
  // try-catch block ka use controller mein karenge
  const response = await apiClient.post('/users/login', { email, password });
  return response.data;
};

// Register API call ke liye function (aage kaam aayega)
export const registerUser = async (username, email, password) => {
  const response = await apiClient.post('/users/register', { username, email, password });
  return response.data;
};