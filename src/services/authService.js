import axios from 'axios'

// URL de base de l'API backend (à configurer selon l'environnement)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Service d'authentification
export const authService = {
  // Connexion avec email ou matricule + mot de passe
  login: async (identifier, password) => {
    const response = await api.post('/auth/login', { identifier, password })
    return response.data
  },

  // Vérification du code 2FA
  verify2FA: async (userId, code) => {
    const response = await api.post('/auth/verify-2fa', { userId, code })
    return response.data
  },

  // Déconnexion
  logout: async () => {
    await api.post('/auth/logout')
    localStorage.removeItem('token')
  },
}

export default api
