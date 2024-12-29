export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    const defaultHeaders = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
  
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('users');
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
  
    return response;
  };