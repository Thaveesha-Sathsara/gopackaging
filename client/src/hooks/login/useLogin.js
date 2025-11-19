import { useState } from 'react';
import axios from 'axios';

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post('/api/auth/login', {
        username,
        password,
      });

      // Login success
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      
      window.location.href = '/'; 

      return true;

    } catch (err) {
      const message =
        err.response && err.response.data.message
          ? err.response.data.message
          : 'An unexpected error occurred';
      setError(message);
      setLoading(false);
      return false;
    }
  };

  return { login, loading, error };
};

export default useLogin;