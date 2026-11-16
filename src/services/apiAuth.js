import { api, lire } from './apiClient'
import { normaliserUtilisateur } from './authMappers'

export const apiAuth = {
  connexion: async (identifiant, password, codeTotp) => {
    const corps = { identifiant, password }
    if (codeTotp) corps.codeTotp = codeTotp
    const { data } = await api.post('/auth/login', corps)
    return data
  },

  verifier2fa: async (challengeToken, codeTotp) => {
    const { data } = await api.post('/auth/2fa/verifier', { challengeToken, codeTotp })
    return data
  },

  profil: async () => normaliserUtilisateur(await lire('/auth/profil')),

  deconnexion: (refreshToken) => api.post('/auth/logout', { refreshToken }),

  preparer2FA: async (userId) => {
    const { data } = await api.post('/auth/2fa/setup', { userId })
    return data
  },

  activer2FA: async (userId, secret, code) => {
    const { data } = await api.post('/auth/2fa/enable', { userId, secret, code })
    return data
  },

  desactiver2FA: async (userId) => {
    const { data } = await api.post('/auth/2fa/disable', { userId })
    return data
  },
}
