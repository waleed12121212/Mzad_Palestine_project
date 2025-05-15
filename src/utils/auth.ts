export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': token } : {};
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token: string) => {
  const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
  localStorage.setItem('token', cleanToken);
};

export const removeToken = () => {
  localStorage.removeItem('token');
}; 