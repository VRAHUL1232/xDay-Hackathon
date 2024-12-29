// This can be in a separate auth utility file (e.g., src/utils/auth.js)
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('users');
    window.location.href = '/login';
  };