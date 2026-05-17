export function isAuthenticated() {
  return !!getAccessToken();
}

export function getAccessToken() {
  return localStorage.getItem("access");
}

export function saveTokens(tokens) {
  if (tokens?.access) {
    localStorage.setItem("access", tokens.access);
  }

  if (tokens?.refresh) {
    localStorage.setItem("refresh", tokens.refresh);
  }
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}
