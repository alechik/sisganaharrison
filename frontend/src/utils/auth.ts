export const saveAuth = (token: string, user: any, permissions: string[] = []) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("permissions", JSON.stringify(permissions));
};

export const getUser = () => {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("permissions");
  localStorage.removeItem("notificaciones");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};